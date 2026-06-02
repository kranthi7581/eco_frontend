import axios from "axios";

// Determine base URL, using vite env or fallback to local
const baseURL = import.meta.env?.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL,
  withCredentials: true,
});

// Request Interceptor: Automatically inject Authorization token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Queue and flag to handle concurrent unauthorized requests gracefully
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// Response Interceptor: Automatically handle token refresh on 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Detect if error is unauthorized and we haven't already retried this request
    const isAuthError =
      error.response?.status === 401 ||
      (error.response?.status === 400 &&
        (error.response?.data?.message?.toLowerCase().includes("token") ||
         error.response?.data?.message?.toLowerCase().includes("expired")));

    if (isAuthError && !originalRequest._retry) {
      if (isRefreshing) {
        // If refresh is already in progress, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers["Authorization"] = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const storedRefreshToken = localStorage.getItem("refreshToken");

      if (storedRefreshToken) {
        try {
          // Call refresh-token using global axios to avoid interceptor recursion
          const response = await axios.post(
            `${baseURL}/auth/refresh-token`,
            { refreshToken: storedRefreshToken },
            { withCredentials: true }
          );

          if (response.status === 200 && response.data.token) {
            const newAccessToken = response.data.token;
            const newRefreshToken = response.data.refreshToken;

            localStorage.setItem("token", newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem("refreshToken", newRefreshToken);
            }

            processQueue(null, newAccessToken);
            
            // Retry the original request
            originalRequest.headers["Authorization"] = `Bearer ${newAccessToken}`;
            return api(originalRequest);
          }
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          console.error("Token refresh failed:", refreshErr);
          
          handleLogoutAndRedirect();

          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      } else {
        handleLogoutAndRedirect();
      }
    }

    return Promise.reject(error);
  }
);

// Helper function to handle logout state sync and route-aware redirection
const handleLogoutAndRedirect = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("user");

  // Sync state with React contexts
  window.dispatchEvent(new Event("auth-logout"));

  const currentPath = window.location.pathname;
  const isLoginPage = currentPath === "/login" || currentPath === "/admin/login";

  if (!isLoginPage) {
    if (currentPath.startsWith("/admin")) {
      window.location.href = "/admin/login";
    } else {
      window.location.href = "/login";
    }
  }
};

export default api;

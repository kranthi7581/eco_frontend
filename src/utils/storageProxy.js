// Proxy localStorage actions to isolate session data between administrator and customer routes.
// - Admin routes (/admin/*): Keys map to admin_token, admin_refreshToken, admin_user
// - Customer routes (/*): Keys map to token, refreshToken, user

const targetKeys = ["token", "refreshToken", "user"];

const getNamespacedKey = (key) => {
  if (targetKeys.includes(key)) {
    const isAdmin = window.location.pathname.startsWith("/admin");
    if (isAdmin) {
      return `admin_${key}`;
    }
  }
  return key;
};

// Store original methods
const originalGetItem = localStorage.getItem.bind(localStorage);
const originalSetItem = localStorage.setItem.bind(localStorage);
const originalRemoveItem = localStorage.removeItem.bind(localStorage);

// Override localStorage methods
localStorage.getItem = (key) => {
  return originalGetItem(getNamespacedKey(key));
};

localStorage.setItem = (key, value) => {
  return originalSetItem(getNamespacedKey(key), value);
};

localStorage.removeItem = (key) => {
  return originalRemoveItem(getNamespacedKey(key));
};

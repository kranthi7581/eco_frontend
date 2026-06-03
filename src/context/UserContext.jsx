/* eslint-disable react-refresh/only-export-components, react-hooks/set-state-in-effect */
import { createContext, useState, useEffect, useContext } from "react";
import api from "../services/api";
import { AUTH_API, CATEGORY_API } from "../repo/Apis";

const UserContext = createContext();

export const useUser = () => useContext(UserContext);

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken") || null);
  const [cart, setCart] = useState(() => {
    const savedToken = localStorage.getItem("token");
    if (savedToken) return [];
    const savedGuestCart = localStorage.getItem("guest_cart");
    return savedGuestCart ? JSON.parse(savedGuestCart) : [];
  });
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Auth Modal States
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalCallback, setAuthModalCallback] = useState(null);
  const [authModalMessage, setAuthModalMessage] = useState("");

  const triggerAuthModal = (callback, message = "") => {
    setAuthModalCallback(() => callback);
    setAuthModalMessage(message);
    setIsAuthModalOpen(true);
  };

  // Sync token and user states when changes happen elsewhere (e.g. in the axios interceptor)
  useEffect(() => {
    const handleLogout = () => {
      logout();
    };
    window.addEventListener("auth-logout", handleLogout);

    // Watch localStorage for token changes done by the interceptor to sync React state
    const syncTokenInterval = setInterval(() => {
      const storedToken = localStorage.getItem("token");
      const storedRefreshToken = localStorage.getItem("refreshToken");
      if (storedToken !== token) {
        setToken(storedToken);
      }
      if (storedRefreshToken !== refreshToken) {
        setRefreshToken(storedRefreshToken);
      }
    }, 1000);

    return () => {
      window.removeEventListener("auth-logout", handleLogout);
      clearInterval(syncTokenInterval);
    };
  }, [token, refreshToken]);

  // Fetch Cart
  async function fetchCart() {
    if (!token) return;
    setCartLoading(true);
    try {
      const response = await api.get(`${CATEGORY_API}/cart`);
      if (response.data && response.data.cart) {
        setCart(response.data.cart.CartItems || response.data.cart.cartItems || []);
      }
    } catch (error) {
      console.error("Error fetching cart:", error);
      if (error.response?.status === 401) {
        logout();
      }
    } finally {
      setCartLoading(false);
    }
  };

  // Fetch Wishlist
  async function fetchWishlist() {
    if (!token) return;
    setWishlistLoading(true);
    try {
      const response = await api.get(`${CATEGORY_API}/wishlist`);
      if (response.data && Array.isArray(response.data.wishlist)) {
        setWishlist(response.data.wishlist);
      }
    } catch (error) {
      console.error("Error fetching wishlist:", error);
    } finally {
      setWishlistLoading(false);
    }
  };

  // Merge local guest cart to backend database session
  async function mergeCart() {
    const guestCartStr = localStorage.getItem("guest_cart");
    if (!guestCartStr) return;
    const guestCart = JSON.parse(guestCartStr);
    if (guestCart.length === 0) return;

    // Fetch user's existing DB cart items to avoid overriding/duplicates
    let dbCartItems = [];
    try {
      const response = await api.get(`${CATEGORY_API}/cart`);
      if (response.data && response.data.cart) {
        dbCartItems = response.data.cart.CartItems || response.data.cart.cartItems || [];
      }
    } catch (e) {
      console.error("Error fetching db cart before merge:", e);
    }

    // Merge guest cart items sequentially
    for (const item of guestCart) {
      try {
        const existing = dbCartItems.find(
          (dbItem) => Number(dbItem.productId) === Number(item.productId)
        );
        if (existing) {
          const newQty = existing.quantity + item.quantity;
          await api.put(`${CATEGORY_API}/cart/update/${item.productId}`, { quantity: newQty });
        } else {
          await api.post(`${CATEGORY_API}/cart/add/${item.productId}`, { productId: item.productId });
          if (item.quantity > 1) {
            await api.put(`${CATEGORY_API}/cart/update/${item.productId}`, { quantity: item.quantity });
          }
        }
      } catch (err) {
        console.error("Error merging guest cart item:", item.productId, err);
      }
    }

    localStorage.removeItem("guest_cart");
  }

  // Fetch everything when token changes
  useEffect(() => {
    if (token) {
      fetchCart();
      fetchWishlist();
    } else {
      const savedGuestCart = localStorage.getItem("guest_cart");
      setCart(savedGuestCart ? JSON.parse(savedGuestCart) : []);
      setWishlist([]);
    }
  }, [token]);

  // Login
  const login = async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post(`${AUTH_API}/login`, { email, password });
      const { token: userToken, refreshToken: userRefreshToken, user: userData } = response.data;
      
      localStorage.setItem("token", userToken);
      localStorage.setItem("refreshToken", userRefreshToken);
      localStorage.setItem("user", JSON.stringify(userData));
      
      setToken(userToken);
      setRefreshToken(userRefreshToken);
      setUser(userData);

      // Perform cart merging upon successful login
      await mergeCart();

      // Refresh consolidated cart from backend database
      await fetchCart();

      // Execute pending action after successful login
      setIsAuthModalOpen(false);
      setAuthModalMessage("");
      if (authModalCallback) {
        authModalCallback();
        setAuthModalCallback(null);
      }

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Invalid email or password" 
      };
    } finally {
      setLoading(false);
    }
  };

  // Signup
  const signup = async (username, email, password) => {
    setLoading(true);
    try {
      const response = await api.post(`${AUTH_API}/register`, { 
        username, 
        email, 
        password,
        role: "user" 
      });
      return { success: true, message: response.data.message || "Registration successful" };
    } catch (error) {
      console.error("Signup error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Registration failed. Try again." 
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("user");
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setCart([]);
    setWishlist([]);
  };

  // Update Profile
  const updateProfile = async (formData) => {
    if (!user) return { success: false, message: "Not logged in" };
    setLoading(true);
    try {
      // API expects PUT /auth/user/:id
      const response = await api.put(`${AUTH_API}/user/${user.id}`, formData, {
        headers: {
          "Content-Type": formData instanceof FormData ? "multipart/form-data" : "application/json"
        }
      });
      
      const updatedUser = response.data.user;
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setUser(updatedUser);
      return { success: true, message: "Profile updated successfully" };
    } catch (error) {
      console.error("Profile update error:", error);
      return { 
        success: false, 
        message: error.response?.data?.message || "Failed to update profile" 
      };
    } finally {
      setLoading(false);
    }
  };

  // Add to Cart
  const addToCart = async (productId, quantity = 1) => {
    if (!localStorage.getItem("token")) {
      try {
        // Retrieve product details dynamically to store in the guest cart
        const res = await api.get(`${CATEGORY_API}/products/${productId}`);
        if (res.data && res.data.product) {
          const productObj = res.data.product;
          let guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
          const existingIdx = guestCart.findIndex(item => Number(item.productId) === Number(productId));
          if (existingIdx > -1) {
            guestCart[existingIdx].quantity += quantity;
          } else {
            guestCart.push({
              id: `guest-${productId}`,
              productId: productId,
              quantity: quantity,
              Product: productObj
            });
          }
          localStorage.setItem("guest_cart", JSON.stringify(guestCart));
          setCart(guestCart);
          return { success: true, message: "Added to cart successfully!" };
        } else {
          return { success: false, message: "Product not found" };
        }
      } catch (err) {
        console.error("Guest add to cart error:", err);
        return { success: false, message: "Failed to add item to cart." };
      }
    }

    try {
      const response = await api.post(`${CATEGORY_API}/cart/add/${productId}`, { productId });
      await fetchCart();
      return { success: true, message: response.data.message || "Added to cart" };
    } catch (error) {
      console.error("Add to cart error:", error);
      return { success: false, message: error.response?.data?.message || "Failed to add to cart" };
    }
  };

  // Remove from Cart
  const removeFromCart = async (productId) => {
    if (!localStorage.getItem("token")) {
      let guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      guestCart = guestCart.filter(item => Number(item.productId) !== Number(productId));
      localStorage.setItem("guest_cart", JSON.stringify(guestCart));
      setCart(guestCart);
      return;
    }
    try {
      await api.delete(`${CATEGORY_API}/cart/remove/${productId}`);
      await fetchCart();
    } catch (error) {
      console.error("Remove from cart error:", error);
    }
  };

  // Update Cart Quantity
  const updateCartQuantity = async (productId, newQuantity) => {
    if (!localStorage.getItem("token")) {
      if (newQuantity < 1) {
        await removeFromCart(productId);
        return;
      }
      let guestCart = JSON.parse(localStorage.getItem("guest_cart") || "[]");
      const idx = guestCart.findIndex(item => Number(item.productId) === Number(productId));
      if (idx > -1) {
        guestCart[idx].quantity = newQuantity;
        localStorage.setItem("guest_cart", JSON.stringify(guestCart));
        setCart(guestCart);
      }
      return;
    }
    if (newQuantity < 1) {
      await removeFromCart(productId);
      return;
    }
    try {
      await api.put(`${CATEGORY_API}/cart/update/${productId}`, { quantity: newQuantity });
      await fetchCart();
    } catch (error) {
      console.error("Update cart error:", error);
    }
  };

  // Add to Wishlist
  const addToWishlist = async (productId) => {
    if (!localStorage.getItem("token")) return { success: false, message: "Please log in to save items to wishlist" };
    try {
      const response = await api.post(`${CATEGORY_API}/wishlist/add/${productId}`, { productId });
      await fetchWishlist();
      return { success: true, message: response.data.message || "Added to wishlist" };
    } catch (error) {
      console.error("Add to wishlist error:", error);
      return { success: false, message: error.response?.data?.message || "Failed to add to wishlist" };
    }
  };

  // Remove from Wishlist
  const removeFromWishlist = async (productId) => {
    if (!localStorage.getItem("token")) return;
    try {
      await api.delete(`${CATEGORY_API}/wishlist/remove/${productId}`);
      await fetchWishlist();
    } catch (error) {
      console.error("Remove from wishlist error:", error);
    }
  };

  // Helper to clear local cart state on successful checkout
  const clearCartLocal = () => {
    setCart([]);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        token,
        cart,
        wishlist,
        loading,
        cartLoading,
        wishlistLoading,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMessage,
        setAuthModalMessage,
        triggerAuthModal,
        login,
        signup,
        logout,
        updateProfile,
        fetchCart,
        addToCart,
        removeFromCart,
        updateCartQuantity,
        fetchWishlist,
        addToWishlist,
        removeFromWishlist,
        clearCartLocal,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

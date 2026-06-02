import { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
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
  const [cart, setCart] = useState([]);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [cartLoading, setCartLoading] = useState(false);
  const [wishlistLoading, setWishlistLoading] = useState(false);

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
  const fetchCart = async () => {
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
  const fetchWishlist = async () => {
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

  // Fetch everything when token changes
  useEffect(() => {
    if (token) {
      fetchCart();
      fetchWishlist();
    } else {
      setCart([]);
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
  const logout = () => {
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
    if (!token) return { success: false, message: "Please log in to add items to cart" };
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
    if (!token) return;
    try {
      await api.delete(`${CATEGORY_API}/cart/remove/${productId}`);
      await fetchCart();
    } catch (error) {
      console.error("Remove from cart error:", error);
    }
  };

  // Update Cart Quantity
  const updateCartQuantity = async (productId, newQuantity) => {
    if (!token) return;
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
    if (!token) return { success: false, message: "Please log in to save items to wishlist" };
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
    if (!token) return;
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

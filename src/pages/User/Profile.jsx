import { useState, useEffect } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import api from "../../services/api";
import { CATEGORY_API } from "../../repo/Apis";
import { 
  Package, 
  Heart, 
  MapPin, 
  Settings, 
  LogOut, 
  ChevronRight, 
  ShoppingCart, 
  Trash2, 
  User as UserIcon, 
  Plus, 
  Phone, 
  Mail,
  Camera,
  ChevronDown,
  ChevronUp,
  ClipboardList,
  Truck,
  CheckCircle,
  XCircle
} from "lucide-react";

const Profile = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, wishlist, removeFromWishlist, addToCart, logout, updateProfile, token } = useUser();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!token) {
      navigate("/login?redirect=/profile");
    }
  }, [token, navigate]);

  // Tab State
  const activeTab = searchParams.get("tab") || "orders";

  // Data States
  const [ordersList, setOrdersList] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState(null);

  // Address Form States
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [label, setLabel] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [country, setCountry] = useState("");
  const [addressError, setAddressError] = useState("");

  // Profile Settings Form States
  const [username, setUsername] = useState(user?.username || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [password, setPassword] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [profilePreview, setProfilePreview] = useState(user?.image ? `${CATEGORY_API}${user.image}` : "");
  const [profileUpdateMsg, setProfileUpdateMsg] = useState("");
  const [profileUpdateErr, setProfileUpdateErr] = useState("");
  const [updatingProfileState, setUpdatingProfileState] = useState(false);

  // Fetch Orders
  const fetchOrders = async () => {
    if (!token) return;
    setLoadingOrders(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await api.get(`${CATEGORY_API}/orders`, { headers });
      if (res.data && Array.isArray(res.data.orders)) {
        // Sort orders by id descending
        setOrdersList(res.data.orders.sort((a, b) => b.id - a.id));
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
    } finally {
      setLoadingOrders(false);
    }
  };

  // Fetch Addresses
  const fetchAddresses = async () => {
    if (!token) return;
    setLoadingAddresses(true);
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const res = await api.get(`${CATEGORY_API}/address`, { headers });
      if (res.data && Array.isArray(res.data.addresses)) {
        setAddresses(res.data.addresses);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setLoadingAddresses(false);
    }
  };

  useEffect(() => {
    if (token) {
      if (activeTab === "orders") fetchOrders();
      if (activeTab === "addresses") fetchAddresses();
    }
  }, [activeTab, token]);

  // Synchronize state when user details update
  useEffect(() => {
    if (user) {
      setUsername(user.username || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setProfilePreview(user.image ? `${CATEGORY_API}${user.image}` : "");
    }
  }, [user]);

  const handleTabChange = (tabName) => {
    setSearchParams({ tab: tabName });
    setShowAddressForm(false);
    setProfileUpdateMsg("");
    setProfileUpdateErr("");
  };

  // Add Address Action
  const handleAddAddress = async (e) => {
    e.preventDefault();
    setAddressError("");
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const finalLabel = label.trim() || "home";
      const finalCountry = country.trim() || "India";
      
      const res = await api.post(
        `${CATEGORY_API}/address`,
        { 
          label: finalLabel, 
          line1: line1.trim(), 
          line2: line2.trim() || null, 
          city: city.trim(), 
          state: state.trim(), 
          pincode: pincode.trim(), 
          country: finalCountry 
        },
        { headers }
      );
      if (res.data && res.data.address) {
        setAddresses((prev) => [...prev, res.data.address]);
        setShowAddressForm(false);
        setLabel("");
        setLine1("");
        setLine2("");
        setCity("");
        setState("");
        setPincode("");
        setCountry("");
      }
    } catch (err) {
      setAddressError(err.response?.data?.message || "Failed to add address.");
    }
  };

  // Delete Address Action
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      await api.delete(`${CATEGORY_API}/address/${addressId}`, { headers });
      setAddresses((prev) => prev.filter((a) => a.id !== addressId));
    } catch (err) {
      console.error("Failed to delete address:", err);
    }
  };

  // Handle Profile Photo selection
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfileImage(file);
      setProfilePreview(URL.createObjectURL(file));
    }
  };

  // Submit Profile update
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setProfileUpdateMsg("");
    setProfileUpdateErr("");
    setUpdatingProfileState(true);

    const formData = new FormData();
    formData.append("username", username);
    formData.append("email", email);
    formData.append("phone", phone || "");
    if (password) {
      formData.append("password", password);
    }
    if (profileImage) {
      formData.append("image", profileImage);
    }

    const res = await updateProfile(formData);
    if (res.success) {
      setProfileUpdateMsg(res.message);
      setPassword(""); // Clear password field on success
    } else {
      setProfileUpdateErr(res.message);
    }
    setUpdatingProfileState(false);
  };

  const handleLogoutClick = () => {
    logout();
    navigate("/login");
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Profile Shell */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Left: Quick Actions Profile Summary Card */}
          <div className="md:col-span-1 space-y-6">
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm text-center">
              
              {/* Profile Pic */}
              <div className="relative w-24 h-24 mx-auto mb-4 group">
                <img
                  src={profilePreview || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"}
                  alt={user.username}
                  className="w-full h-full rounded-full object-cover border-2 border-blue-600 shadow-md bg-gray-50"
                />
              </div>

              <h2 className="text-base font-extrabold text-slate-900 truncate">{user.username}</h2>
              <p className="text-xs text-gray-400 mt-1 truncate">{user.email}</p>
              
              {/* Tabs Navigation */}
              <div className="mt-8 flex flex-col gap-1 text-left">
                <button
                  onClick={() => handleTabChange("orders")}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                    activeTab === "orders"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Package className="w-4.5 h-4.5" />
                  My Orders
                </button>

                <button
                  onClick={() => handleTabChange("wishlist")}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                    activeTab === "wishlist"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Heart className="w-4.5 h-4.5" />
                  Wishlist ({wishlist.length})
                </button>

                <button
                  onClick={() => handleTabChange("addresses")}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                    activeTab === "addresses"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <MapPin className="w-4.5 h-4.5" />
                  Saved Addresses
                </button>

                <button
                  onClick={() => handleTabChange("settings")}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 transition-all ${
                    activeTab === "settings"
                      ? "bg-blue-600 text-white shadow-md shadow-blue-600/10"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  <Settings className="w-4.5 h-4.5" />
                  Account Settings
                </button>

                <button
                  onClick={handleLogoutClick}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-bold flex items-center gap-2.5 text-red-600 hover:bg-red-50 transition-colors mt-4 border-t border-gray-100 pt-4"
                >
                  <LogOut className="w-4.5 h-4.5" />
                  Sign Out
                </button>
              </div>

            </div>
          </div>

          {/* Right: Tab Contents (3 Cols) */}
          <div className="md:col-span-3">
            
            {/* TAB: My Orders */}
            {activeTab === "orders" && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">My Orders</h3>
                  <p className="text-xs text-gray-400 mt-1">Track and manage past purchases.</p>
                </div>

                {loadingOrders ? (
                  <div className="py-12 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                  </div>
                ) : ordersList.length > 0 ? (
                  <div className="space-y-4">
                    {ordersList.map((order) => (
                      <div key={order.id} className="border border-gray-150 rounded-2xl overflow-hidden shadow-sm bg-white">
                        
                        {/* Order Header bar */}
                        <div 
                          onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                          className="bg-gray-50 px-5 py-3 border-b border-gray-150 flex flex-wrap justify-between items-center gap-2 text-xs font-semibold text-gray-500 cursor-pointer select-none hover:bg-gray-100/70 transition-colors"
                        >
                          <div>
                            Order ID: <span className="font-extrabold text-slate-800">#{order.id}</span>
                          </div>
                          <div>
                            Date: <span className="text-gray-800">{new Date(order.createdAt).toLocaleDateString("en-IN")}</span>
                          </div>
                          <div>
                            Total Price: <span className="font-extrabold text-slate-800">₹{order.totalPrice.toLocaleString("en-IN")}</span>
                          </div>
                          <div className="flex items-center gap-2 ml-auto sm:ml-0">
                            Status:{" "}
                            <span className={`px-2.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                              order.status === "delivered" || order.status === "completed"
                                ? "bg-green-150 text-green-700" 
                                : order.status === "cancelled" 
                                ? "bg-red-150 text-red-700"
                                : order.status === "packing"
                                ? "bg-purple-150 text-purple-700"
                                : order.status === "shipping"
                                ? "bg-blue-150 text-blue-700"
                                : "bg-yellow-150 text-yellow-700"
                            }`}>
                              {order.status || "pending"}
                            </span>
                            {expandedOrderId === order.id ? (
                              <ChevronUp className="w-4 h-4 text-gray-400" />
                            ) : (
                              <ChevronDown className="w-4 h-4 text-gray-400" />
                            )}
                          </div>
                        </div>

                        {/* Order Items list */}
                        <div className="divide-y divide-gray-100 px-5 py-3">
                          {order.OrderItems?.map((item) => {
                            const prod = item.Product || item.product || item.products || {};
                            return (
                              <div key={item.id} className="flex items-center gap-4 py-3 first:pt-1 last:pb-1 text-xs">
                                <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center shrink-0">
                                  <img 
                                    src={prod.image ? `${CATEGORY_API}${prod.image}` : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=100"} 
                                    alt={prod.name} 
                                    className="w-full h-full object-contain p-1" 
                                  />
                                </div>
                                <div className="flex-1">
                                  <Link to={`/product/${item.productId}`} className="font-bold text-gray-800 hover:text-blue-600 line-clamp-1">
                                    {prod.name || "Product Item"}
                                  </Link>
                                  <p className="text-gray-400 mt-0.5 font-semibold">Qty: {item.quantity} | Price: ₹{item.unitPrice || prod.price}</p>
                                </div>
                                <div className="shrink-0 font-extrabold text-slate-800">
                                  ₹{(item.totalPrice || (item.quantity * (item.unitPrice || prod.price))).toLocaleString("en-IN")}
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Order Tracking Stepper */}
                        {expandedOrderId === order.id && (
                          <div className="bg-gray-50/50 px-5 py-6 border-t border-gray-150">
                            <div className="max-w-xl mx-auto">
                              <h4 className="text-xs font-bold text-gray-700 mb-6 text-center uppercase tracking-wider">Order Tracking Status</h4>
                              
                              {order.status === "cancelled" ? (
                                <div className="flex flex-col items-center justify-center py-2 text-center">
                                  <XCircle className="w-12 h-12 text-red-500 mb-2 animate-pulse" />
                                  <p className="text-sm font-bold text-red-600">Order Cancelled</p>
                                  <p className="text-xs text-gray-400 mt-1">This order has been cancelled and cannot be tracked further.</p>
                                </div>
                              ) : (
                                <div className="relative flex items-center justify-between px-2 sm:px-6">
                                  {/* Line Background */}
                                  <div className="absolute left-[35px] right-[35px] top-[20px] h-1 bg-gray-200 z-0 rounded-full" />
                                  
                                  {/* Line Highlight Progress */}
                                  <div 
                                    className="absolute left-[35px] top-[20px] h-1 bg-blue-600 z-0 transition-all duration-500 rounded-full" 
                                    style={{ 
                                      width: 
                                        order.status === "pending" ? "0%" :
                                        order.status === "packing" ? "33%" :
                                        order.status === "shipping" ? "66%" :
                                        order.status === "delivered" || order.status === "completed" ? "100%" : "0%"
                                    }}
                                  />
                                  
                                  {/* Steps */}
                                  {[
                                    { label: "Placed", statusKey: "pending", icon: ClipboardList },
                                    { label: "Packing", statusKey: "packing", icon: Package },
                                    { label: "Shipping", statusKey: "shipping", icon: Truck },
                                    { label: "Delivered", statusKey: "delivered", icon: CheckCircle }
                                  ].map((step, index) => {
                                    const StepIcon = step.icon;
                                    
                                    // Determine step state
                                    const isCompleted = 
                                      (order.status === "pending" && index <= 0) ||
                                      (order.status === "packing" && index <= 1) ||
                                      (order.status === "shipping" && index <= 2) ||
                                      ((order.status === "delivered" || order.status === "completed") && index <= 3);
                                      
                                    const isActive = 
                                      (order.status === "pending" && index === 0) ||
                                      (order.status === "packing" && index === 1) ||
                                      (order.status === "shipping" && index === 2) ||
                                      ((order.status === "delivered" || order.status === "completed") && index === 3);

                                    return (
                                      <div key={index} className="flex flex-col items-center relative z-10 w-16 sm:w-20">
                                        <div 
                                          className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                            isCompleted 
                                              ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-500/20" 
                                              : "bg-white border-gray-300 text-gray-400"
                                          } ${isActive ? "ring-4 ring-blue-100 scale-110" : ""}`}
                                        >
                                          <StepIcon className="w-5 h-5" />
                                        </div>
                                        <span className={`text-[10px] font-bold mt-2 text-center block w-full ${isCompleted ? "text-blue-600" : "text-gray-400"}`}>
                                          {step.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 text-xs font-semibold">
                    You haven't placed any orders yet. Go buy items from the store!
                  </div>
                )}
              </div>
            )}

            {/* TAB: Wishlist */}
            {activeTab === "wishlist" && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">My Wishlist</h3>
                  <p className="text-xs text-gray-400 mt-1">Products you saved for later.</p>
                </div>

                {wishlist.length > 0 ? (
                  <div className="space-y-4">
                    {wishlist.map((item) => {
                      const prod = item.Product || item.product || item.products || {};
                      const imageUrl = prod.image
                        ? `${CATEGORY_API}${prod.image}`
                        : "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=150";

                      return (
                        <div 
                          key={item.id}
                          className="flex items-center gap-4 p-4 border border-gray-150 rounded-2xl hover:shadow-sm transition-shadow bg-white text-xs"
                        >
                          <div className="w-16 h-16 bg-gray-50 border rounded-xl overflow-hidden flex items-center justify-center p-1 shrink-0">
                            <img src={imageUrl} alt={prod.name} className="w-full h-full object-contain" />
                          </div>
                          
                          <div className="flex-1">
                            <Link to={`/product/${item.productId}`} className="font-bold text-gray-800 hover:text-blue-600 line-clamp-1">
                              {prod.name}
                            </Link>
                            <p className="text-gray-900 font-extrabold mt-1">₹{Number(prod.price || 0).toLocaleString("en-IN")}</p>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => addToCart(item.productId)}
                              className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              Add
                            </button>
                            <button
                              onClick={() => removeFromWishlist(item.productId)}
                              className="p-2 border border-gray-200 hover:bg-red-50 hover:text-red-500 rounded-xl transition-all"
                              title="Delete from Wishlist"
                            >
                              <Trash2 className="w-4 h-4 text-gray-400 hover:text-red-500" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 text-xs font-semibold">
                    Your wishlist is currently empty. Start liking items!
                  </div>
                )}
              </div>
            )}

            {/* TAB: Saved Addresses */}
            {activeTab === "addresses" && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between border-b border-gray-50 pb-4">
                  <div>
                    <h3 className="text-lg font-extrabold text-slate-900">Saved Addresses</h3>
                    <p className="text-xs text-gray-400 mt-1">Manage delivery locations.</p>
                  </div>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-all flex items-center gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    {showAddressForm ? "View All" : "Add New Address"}
                  </button>
                </div>

                {showAddressForm ? (
                  <form onSubmit={handleAddAddress} className="space-y-4 bg-gray-50 p-5 border border-gray-200 rounded-2xl max-w-xl">
                    <h4 className="text-xs font-bold text-gray-800">Add shipping details</h4>
                    {addressError && (
                      <div className="text-xs font-semibold text-red-600 bg-red-50 p-2.5 rounded-lg">
                        {addressError}
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Label (Optional - defaults to 'home')</label>
                        <input
                          type="text"
                          placeholder="e.g. home, work"
                          value={label}
                          onChange={(e) => setLabel(e.target.value)}
                          className="w-full bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Pincode (Required)</label>
                        <input
                          type="text"
                          required
                          placeholder="Pincode"
                          value={pincode}
                          onChange={(e) => setPincode(e.target.value)}
                          className="w-full bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Street address details (Required)</label>
                      <input
                        type="text"
                        required
                        placeholder="Street address details"
                        value={line1}
                        onChange={(e) => setLine1(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Local landmark or secondary address line (Optional)</label>
                      <input
                        type="text"
                        placeholder="Local landmark or secondary address line"
                        value={line2}
                        onChange={(e) => setLine2(e.target.value)}
                        className="w-full bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">City (Required)</label>
                        <input
                          type="text"
                          required
                          placeholder="City"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">State (Required)</label>
                        <input
                          type="text"
                          required
                          placeholder="State"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className="w-full bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Country (Optional - defaults to 'India')</label>
                        <input
                          type="text"
                          placeholder="India"
                          value={country}
                          onChange={(e) => setCountry(e.target.value)}
                          className="w-full bg-white border border-gray-200 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-5 py-2.5 rounded-lg transition-colors shadow"
                    >
                      Save Address
                    </button>
                  </form>
                ) : loadingAddresses ? (
                  <div className="py-8 flex justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
                  </div>
                ) : addresses.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {addresses.map((addr) => (
                      <div key={addr.id} className="border border-gray-150 rounded-2xl p-4 flex justify-between bg-white relative">
                        <div className="text-xs">
                          <span className="font-bold text-gray-800 uppercase text-[9px] bg-slate-100 px-2 py-0.5 rounded">
                            {addr.label}
                          </span>
                          <p className="font-bold text-gray-800 mt-2">{addr.line1}</p>
                          {addr.line2 && <p className="text-gray-500 mt-0.5">{addr.line2}</p>}
                          <p className="text-gray-400 font-semibold mt-1">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="p-1.5 hover:bg-red-50 rounded-lg hover:text-red-500 shrink-0 self-start text-gray-400 transition-colors"
                          title="Delete address"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500 text-xs font-semibold">
                    No shipping addresses saved. Click 'Add New Address' to create one.
                  </div>
                )}
              </div>
            )}

            {/* TAB: Account Settings */}
            {activeTab === "settings" && (
              <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-extrabold text-slate-900">Account Settings</h3>
                  <p className="text-xs text-gray-400 mt-1">Modify your profile details.</p>
                </div>

                {profileUpdateMsg && (
                  <div className="p-3 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-100 text-center">
                    {profileUpdateMsg}
                  </div>
                )}
                {profileUpdateErr && (
                  <div className="p-3 bg-rose-50 text-rose-700 text-xs font-bold rounded-xl border border-rose-100 text-center">
                    {profileUpdateErr}
                  </div>
                )}

                <form onSubmit={handleProfileUpdate} className="space-y-5 max-w-xl">
                  
                  {/* Photo picker with preview */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-full overflow-hidden border border-gray-300">
                      <img src={profilePreview || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=150"} alt="Preview" className="w-full h-full object-cover" />
                      <label className="absolute inset-0 bg-black/40 text-white flex items-center justify-center cursor-pointer opacity-0 hover:opacity-100 transition-opacity">
                        <Camera className="w-4.5 h-4.5" />
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      </label>
                    </div>
                    <div>
                      <span className="text-xs font-bold text-gray-700 block">Change Avatar picture</span>
                      <span className="text-[10px] text-gray-400 block mt-0.5">Click photo to upload PNG or JPG</span>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Username / Name</label>
                      <input
                        type="text"
                        required
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Phone Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="Phone Number"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">New Password (Optional)</label>
                      <input
                        type="password"
                        placeholder="Leave blank to keep current password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={updatingProfileState}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-md transition-colors disabled:opacity-50"
                  >
                    {updatingProfileState ? "Saving Changes..." : "Save Changes"}
                  </button>

                </form>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
};

export default Profile;

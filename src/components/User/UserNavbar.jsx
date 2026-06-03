import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useUser } from "../../context/UserContext";
import api from "../../services/api";
import { 
  Search, 
  Heart, 
  ShoppingCart, 
  Menu, 
  X, 
  LogOut, 
  ShoppingBag, 
  ChevronDown, 
  Tag, 
  Layers,
  Sparkles,
  ClipboardCheck
} from "lucide-react";
import { CATEGORY_API } from "../../repo/Apis";

const UserNavbar = () => {
  const { user, cart, wishlist, logout, token } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  // Dynamic menu states
  const [dbCategories, setDbCategories] = useState([]);
  const [dbSubcategories, setDbSubcategories] = useState([]);
  const [dbCoupons, setDbCoupons] = useState([]);
  const [copiedCoupon, setCopiedCoupon] = useState("");

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  // Fetch Category/Subcategory and Coupons list for Navbar dropdowns
  useEffect(() => {
    const fetchMenuData = async () => {
      try {
        const tokenVal = localStorage.getItem("token") || token;
        const headers = tokenVal ? { Authorization: `Bearer ${tokenVal}` } : {};
        
        const catRes = await api.get(`${CATEGORY_API}/categories`, { headers }).catch(() => null);
        if (catRes && catRes.data) {
          const list = catRes.data.categories || catRes.data;
          if (Array.isArray(list)) setDbCategories(list);
        }
        
        const subRes = await api.get(`${CATEGORY_API}/subcategories`, { headers }).catch(() => null);
        if (subRes && subRes.data) {
          const list = subRes.data.subcategories || subRes.data;
          if (Array.isArray(list)) setDbSubcategories(list);
        }

        const couponRes = await api.get(`${CATEGORY_API}/coupon`, { headers }).catch(() => null);
        if (couponRes && couponRes.data) {
          const list = Array.isArray(couponRes.data) ? couponRes.data : [];
          setDbCoupons(list.filter(c => c.isActive));
        }
      } catch (err) {
        console.error("Error fetching menu items for dropdowns:", err);
      }
    };

    fetchMenuData();
  }, [token]);

  // Fallback defaults
  const categoriesList = dbCategories.length > 0 ? dbCategories : [
    { id: "electronics", name: "Electronics" },
    { id: "fashion", name: "Fashion" },
    { id: "grocery", name: "Grocery" },
    { id: "beauty", name: "Beauty" },
    { id: "home-kitchen", name: "Home & Kitchen" }
  ];

  const subcategoriesList = dbSubcategories.length > 0 ? dbSubcategories : [
    { id: "mobiles", name: "Mobiles", categoryId: "electronics" },
    { id: "laptops", name: "Laptops", categoryId: "electronics" },
    { id: "headphones", name: "Headphones", categoryId: "electronics" },
    { id: "men-wear", name: "Men Wear", categoryId: "fashion" },
    { id: "women-wear", name: "Women Wear", categoryId: "fashion" },
    { id: "footwear", name: "Footwear", categoryId: "fashion" }
  ];

  const couponsToRender = dbCoupons.length > 0 ? dbCoupons : [
    { code: "WELCOME10", discountType: "percentage", discountValue: 10, minOrderAmount: 0 },
    { code: "SUPER20", discountType: "percentage", discountValue: 20, minOrderAmount: 1500 }
  ];

  const getCouponDesc = (coupon) => {
    if (coupon.desc) return coupon.desc;
    const discValueStr = coupon.discountType === "percentage" 
      ? `${coupon.discountValue}%` 
      : `₹${coupon.discountValue}`;
    
    let desc = `Get ${discValueStr} discount on all purchases`;
    if (coupon.minOrderAmount > 0) {
      desc = `Save ${discValueStr} on orders above ₹${coupon.minOrderAmount.toLocaleString("en-IN")}`;
    }
    if (coupon.discountType === "percentage" && coupon.maxDiscount) {
      desc += ` (Up to ₹${coupon.maxDiscount})`;
    }
    return desc;
  };

  const handleCopyCoupon = (code) => {
    navigator.clipboard.writeText(code);
    setCopiedCoupon(code);
    setTimeout(() => setCopiedCoupon(""), 2000);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate("/products");
    }
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const handleLogout = () => {
    logout();
    setIsProfileOpen(false);
    navigate("/login");
  };

  const navigateToCategory = (cat) => {
    if (cat.id && !isNaN(cat.id)) {
      navigate(`/category/${cat.id}`);
    } else {
      navigate(`/products?category=${encodeURIComponent(cat.name)}`);
    }
  };

  const navigateToSubcategory = (sub) => {
    if (sub.id && !isNaN(sub.id)) {
      navigate(`/subcategory/${sub.id}`);
    } else {
      navigate(`/products?subcategory=${encodeURIComponent(sub.name)}`);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-gray-200 shadow-sm backdrop-blur-md bg-white/95">
      
      {/* Primary Top Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Website Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-blue-600 text-white p-2 rounded-lg group-hover:bg-blue-700 transition-colors shadow-md">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                Ecom<span className="text-blue-600">Blue</span>
              </span>
            </Link>
          </div>

          {/* Center: Large Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xl">
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                type="text"
                placeholder="Search for electronics, fashion, beauty..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-300 focus:border-blue-500 rounded-full py-2 pl-4 pr-12 text-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all text-gray-800"
              />
              <button 
                type="submit" 
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
              >
                <Search className="h-5 w-5" />
              </button>
            </form>
          </div>

          {/* Right: Actions */}
          <div className="hidden md:flex items-center gap-4">
            
            {/* Wishlist Icon */}
            <Link 
              to="/profile?tab=wishlist" 
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors hover:bg-gray-50 rounded-full"
              title="Wishlist"
            >
              <Heart className="h-6 w-6" />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white animate-pulse">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart Icon */}
            <Link 
              to="/cart" 
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors hover:bg-gray-50 rounded-full"
              title="Cart"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* User Profile / Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={handleProfileClick}
                  className="flex items-center gap-1.5 p-1 rounded-full hover:bg-gray-100 transition-colors border border-gray-200"
                >
                  <img
                    src={user.image ? `${CATEGORY_API}${user.image}` : "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=100"}
                    alt={user.username}
                    className="w-8 h-8 rounded-full object-cover border border-gray-300"
                  />
                  <ChevronDown className="h-4 w-4 text-gray-500 mr-1" />
                </button>

                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-xl shadow-lg py-1 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-4 py-2 border-b border-gray-100">
                      <p className="text-sm font-semibold text-gray-800 truncate">{user.username}</p>
                      <p className="text-xs text-gray-500 truncate">{user.email}</p>
                    </div>
                    <Link
                      to="/profile?tab=settings"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    >
                      My Profile
                    </Link>
                    <Link
                      to="/profile?tab=orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    >
                      My Orders
                    </Link>
                    <Link
                      to="/profile?tab=wishlist"
                      onClick={() => setIsProfileOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-blue-600 transition-colors"
                    >
                      My Wishlist
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 border-t border-gray-100"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-sm font-medium text-gray-700 hover:text-blue-600 px-3 py-2 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="text-sm font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full shadow hover:shadow-md transition-all active:scale-[0.98]"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Hamburger Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            {/* Cart Icon Mobile */}
            <Link 
              to="/cart" 
              className="relative p-2 text-gray-600 hover:text-blue-600 transition-colors"
            >
              <ShoppingCart className="h-6 w-6" />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 bg-blue-600 text-white text-[10px] font-bold rounded-full h-4 w-4 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-gray-100 rounded-full"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* 2. Amazon-style Dark-blue Secondary Sub-Navbar */}
      <div className="bg-slate-900 text-slate-200 py-2 border-t border-slate-800 shadow-inner hidden md:block">
        <div className="max-w-7xl mx-auto px-8 flex items-center gap-6 text-xs font-bold tracking-wide select-none">
          
          {/* All hamburgers indicator (mock link to full catalog) */}
          <Link to="/products" className="flex items-center gap-1.5 hover:text-white transition-colors py-1 px-2 hover:bg-slate-800 rounded-md">
            <Menu className="w-4 h-4" />
            <span>All Catalog</span>
          </Link>

          {/* CATEGORIES HOVER DROPDOWN */}
          <div className="group relative">
            <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-1 px-2 hover:bg-slate-800 rounded-md">
              <Layers className="w-3.5 h-3.5 text-blue-400" />
              <span>Shop by Categories</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Box */}
            <div className="absolute left-0 mt-1 w-52 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 hidden group-hover:block py-2 animate-in fade-in duration-200 z-50">
              <span className="text-[10px] uppercase font-extrabold text-blue-600 px-4 py-1.5 block tracking-wider border-b border-gray-50">
                Categories
              </span>
              {categoriesList.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigateToCategory(cat)}
                  className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors text-xs font-bold flex items-center justify-between"
                >
                  <span>{cat.name}</span>
                  <ChevronDown className="w-3 h-3 -rotate-90 text-gray-300" />
                </button>
              ))}
            </div>
          </div>

          {/* SUBCATEGORIES HOVER DROPDOWN */}
          <div className="group relative">
            <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-1 px-2 hover:bg-slate-800 rounded-md">
              <Sparkles className="w-3.5 h-3.5 text-blue-400" />
              <span>Browse Subcategories</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Box */}
            <div className="absolute left-0 mt-1 w-56 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 hidden group-hover:block py-2 animate-in fade-in duration-200 z-50">
              <span className="text-[10px] uppercase font-extrabold text-blue-600 px-4 py-1.5 block tracking-wider border-b border-gray-50">
                Subcategories
              </span>
              <div className="max-h-60 overflow-y-auto">
                {subcategoriesList.map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => navigateToSubcategory(sub)}
                    className="w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-600 transition-colors text-xs font-bold flex items-center justify-between"
                  >
                    <span>{sub.name}</span>
                    <ChevronDown className="w-3 h-3 -rotate-90 text-gray-300" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* ALL PRODUCTS LINK */}
          <Link 
            to="/products" 
            className="hover:text-white transition-colors py-1 px-2 hover:bg-slate-800 rounded-md"
          >
            All Products
          </Link>

          {/* OFFER COUPONS HOVER DROPDOWN */}
          <div className="group relative">
            <button className="flex items-center gap-1 hover:text-white transition-colors cursor-pointer py-1 px-2 hover:bg-slate-800 rounded-md">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              <span>Offers & Coupons</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {/* Dropdown Box */}
            <div className="absolute left-0 mt-1 w-72 bg-white text-gray-800 rounded-xl shadow-xl border border-gray-100 hidden group-hover:block py-3 px-4 animate-in fade-in duration-200 z-50">
              <span className="text-[10px] uppercase font-extrabold text-blue-600 block tracking-wider mb-2 border-b border-gray-50 pb-1.5">
                Active Store Promo Codes
              </span>
              
              <div className="space-y-3">
                {couponsToRender.map((coupon) => (
                  <div key={coupon.code} className="p-2.5 bg-gray-50 hover:bg-blue-50/30 border border-gray-200 rounded-xl flex items-center justify-between gap-3 text-xs">
                    <div>
                      <span className="font-extrabold text-slate-900 block">{coupon.code}</span>
                      <span className="text-[10px] text-gray-500 font-semibold block mt-0.5">{getCouponDesc(coupon)}</span>
                    </div>
                    <button
                      onClick={() => handleCopyCoupon(coupon.code)}
                      className="bg-slate-900 hover:bg-slate-950 text-white font-bold px-2.5 py-1.5 rounded-lg transition-colors text-[10px] shrink-0"
                    >
                      {copiedCoupon === coupon.code ? (
                        <span className="flex items-center gap-1 text-emerald-400">
                          <ClipboardCheck className="w-3.5 h-3.5" /> Copied
                        </span>
                      ) : (
                        "Copy Code"
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white py-4 px-4 space-y-4 shadow-inner animate-in slide-in-from-top duration-200">
          
          {/* Search bar inside Mobile Menu */}
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-50 border border-gray-300 focus:border-blue-500 rounded-full py-2 pl-4 pr-12 text-sm focus:outline-none"
            />
            <button type="submit" className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400">
              <Search className="h-5 w-5" />
            </button>
          </form>

          {/* Links and Navigation */}
          <div className="flex flex-col gap-2">
            <Link
              to="/products"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-base font-semibold text-gray-700 hover:text-blue-600 py-2 border-b border-gray-50"
            >
              All Products
            </Link>

            {/* Mobile Categories navigation */}
            <div className="py-2 border-b border-gray-50">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Categories</span>
              <div className="grid grid-cols-2 gap-2">
                {categoriesList.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      navigateToCategory(cat);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left text-xs font-bold text-gray-600 hover:text-blue-600 bg-gray-50 p-2 rounded-lg"
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Subcategories navigation */}
            <div className="py-2 border-b border-gray-50">
              <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Subcategories</span>
              <div className="grid grid-cols-2 gap-2">
                {subcategoriesList.slice(0, 6).map((sub) => (
                  <button
                    key={sub.id}
                    onClick={() => {
                      navigateToSubcategory(sub);
                      setIsMobileMenuOpen(false);
                    }}
                    className="text-left text-xs font-bold text-gray-600 hover:text-blue-600 bg-gray-50 p-2 rounded-lg"
                  >
                    {sub.name}
                  </button>
                ))}
              </div>
            </div>

            <Link
              to="/profile?tab=wishlist"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex items-center justify-between text-base font-semibold text-gray-700 hover:text-blue-600 py-2 border-b border-gray-50"
            >
              <span>Wishlist</span>
              {wishlistCount > 0 && <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full">{wishlistCount}</span>}
            </Link>
            
            {user ? (
              <>
                <Link
                  to="/profile?tab=settings"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-semibold text-gray-700 hover:text-blue-600 py-2 border-b border-gray-50"
                >
                  My Profile
                </Link>
                <Link
                  to="/profile?tab=orders"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-base font-semibold text-gray-700 hover:text-blue-600 py-2 border-b border-gray-50"
                >
                  My Orders
                </Link>
                <button
                  onClick={handleLogout}
                  className="w-full text-left text-base font-semibold text-red-600 hover:bg-red-50 py-2 flex items-center gap-2"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out ({user.username})
                </button>
              </>
            ) : (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 border border-gray-300 rounded-full font-medium text-gray-700 hover:bg-gray-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 bg-blue-600 text-white rounded-full font-medium shadow hover:bg-blue-700"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default UserNavbar;

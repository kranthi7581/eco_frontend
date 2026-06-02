import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { CATEGORY_API } from "../../repo/Apis";
import { ArrowRight, ChevronLeft, ChevronRight, Sparkles, AlertCircle } from "lucide-react";
import ProductCard from "../../components/User/ProductCard";
import QuickViewModal from "../../components/User/QuickViewModal";

const Home = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  // Hero Slider State
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const slides = [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=1200",
      tag: "Limited Time Offer",
      title: "Latest Tech Marvels",
      subtitle: "Explore high-end laptops, mobile devices & noise-cancelling headphones.",
      action: "Shop Electronics",
      link: "/products"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=1200",
      tag: "Summer Collection",
      title: "Elevate Your Style",
      subtitle: "Get up to 40% off on men's wear, women's wear, and trendy sneakers.",
      action: "Explore Fashion",
      link: "/products"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&q=80&w=1200",
      tag: "Organic & Healthy",
      title: "Fresh Groceries Daily",
      subtitle: "Sourced directly from local farms. Delivered fresh at your doorstep.",
      action: "Order Groceries",
      link: "/products"
    }
  ];

  // Default Categories if API has none or fails (matches requested categories)
  const defaultCategories = [
    { id: "electronics", name: "Electronics", image: "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=300" },
    { id: "fashion", name: "Fashion", image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&q=80&w=300" },
    { id: "grocery", name: "Grocery", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300" },
    { id: "beauty", name: "Beauty", image: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?auto=format&fit=crop&q=80&w=300" },
    { id: "home-kitchen", name: "Home & Kitchen", image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=300" }
  ];

  const nextSlide = () => {
    setActiveSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto slide effect
  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, []);

  // Fetch Homepage Data
  useEffect(() => {
    const fetchHomeData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        // Skip fetching if no token is available to prevent API spamming with 401s
        if (!token) {
          setCategories(defaultCategories);
          setLoading(false);
          return;
        }

        const headers = { Authorization: `Bearer ${token}` };
        
        // Fetch Categories
        const catRes = await api.get(`${CATEGORY_API}/categories`, { headers }).catch(() => null);
        if (catRes && catRes.data) {
          const list = catRes.data.categories || catRes.data;
          setCategories(Array.isArray(list) && list.length > 0 ? list : defaultCategories);
        } else {
          setCategories(defaultCategories);
        }

        // Fetch Featured Products
        const prodRes = await api.get(`${CATEGORY_API}/products`, { headers }).catch(() => null);
        if (prodRes && prodRes.data) {
          const list = prodRes.data.products || prodRes.data;
          setFeaturedProducts(Array.isArray(list) ? list.slice(0, 8) : []);
        }

      } catch (err) {
        console.error("Home API fetch error:", err);
        setCategories(defaultCategories);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  const handleCategoryClick = (cat) => {
    // If the category has a numerical DB ID, navigate to it. Otherwise navigate to /products
    if (cat.id && !isNaN(cat.id)) {
      navigate(`/category/${cat.id}`);
    } else {
      // Fallback for mock IDs
      navigate(`/products?category=${encodeURIComponent(cat.name)}`);
    }
  };

  const token = localStorage.getItem("token");

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans">
      
      {/* 1. Hero Promotional Banner Slider */}
      <div className="relative w-full h-[350px] sm:h-[450px] overflow-hidden bg-slate-900">
        
        {/* Slides */}
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 w-full h-full transition-opacity duration-1000 ${
              index === activeSlide ? "opacity-100 z-10" : "opacity-0 z-0"
            }`}
          >
            {/* Background Image overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/80 to-slate-900/40 z-10" />
            <img
              src={slide.image}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            
            {/* Text Overlay */}
            <div className="absolute inset-0 flex items-center z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="max-w-lg text-white select-none">
                <span className="inline-block bg-blue-600 text-xs font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider mb-4 animate-bounce">
                  {slide.tag}
                </span>
                <h1 className="text-3xl sm:text-5xl font-extrabold leading-tight tracking-tight">
                  {slide.title}
                </h1>
                <p className="mt-4 text-sm sm:text-base text-slate-200 font-medium leading-relaxed">
                  {slide.subtitle}
                </p>
                <div className="mt-8">
                  <Link
                    to={slide.link}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 hover:scale-105 text-white font-bold px-6 py-3 rounded-full shadow-lg shadow-blue-600/20 active:scale-95 transition-all text-sm"
                  >
                    <span>Shop Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows */}
        <button
          onClick={prevSlide}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-25 bg-white/10 hover:bg-white/20 text-white hover:scale-105 p-2 rounded-full backdrop-blur-sm transition-all"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-25 bg-white/10 hover:bg-white/20 text-white hover:scale-105 p-2 rounded-full backdrop-blur-sm transition-all"
        >
          <ChevronRight className="w-6 h-6" />
        </button>

        {/* Slide Indicators */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-25 flex gap-2">
          {slides.map((_, i) => (
            <button
              key={i}
              onClick={() => setActiveSlide(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                i === activeSlide ? "bg-blue-600 w-6" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Guest Warning Notification */}
      {!token && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 w-full">
          <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded-r-xl flex items-start gap-3 shadow-sm">
            <AlertCircle className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-blue-800">Authentication Required</h4>
              <p className="text-xs text-blue-700 mt-1">
                The product catalog requires a user token. Please{" "}
                <Link to="/login" className="underline font-bold text-blue-900 hover:text-blue-950">
                  Sign In
                </Link>{" "}
                or{" "}
                <Link to="/register" className="underline font-bold text-blue-900 hover:text-blue-950">
                  Register
                </Link>{" "}
                to unlock the complete store database and shopping features.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* 2. Categories Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Shop by Categories
            </h2>
            <p className="text-sm text-gray-500">Pick from our handpicked collections suited for you.</p>
          </div>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-6">
          {categories.map((cat) => {
            const catImage = cat.image
              ? cat.image.startsWith("http") ? cat.image : `${CATEGORY_API}${cat.image}`
              : "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?auto=format&fit=crop&q=80&w=300";

            return (
              <div
                key={cat.id}
                onClick={() => handleCategoryClick(cat)}
                className="group cursor-pointer bg-white rounded-2xl p-4 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center"
              >
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-4 bg-gray-50 border border-gray-100 flex items-center justify-center">
                  <img
                    src={catImage}
                    alt={cat.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <h3 className="text-sm sm:text-base font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[10px] font-semibold text-gray-400 mt-1 flex items-center gap-1 group-hover:text-blue-500">
                  Browse items <ArrowRight className="w-2.5 h-2.5" />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Featured Products Listing Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full border-t border-gray-100">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
              Featured Products
            </h2>
            <p className="text-sm text-gray-500">Top-rated items loved by customers this week.</p>
          </div>
          <Link
            to="/products"
            className="inline-flex items-center gap-1.5 text-sm font-bold text-blue-600 hover:text-blue-700 group hover:underline"
          >
            <span>View All Catalog</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
            <p className="text-gray-500 mt-4 text-sm font-medium">Fetching featured items...</p>
          </div>
        ) : featuredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(prod) => setSelectedProduct(prod)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-2xl p-12 text-center text-gray-500">
            <p className="text-base font-medium">No products found in the catalog.</p>
            {token ? (
              <p className="text-xs text-gray-400 mt-1">Visit the Admin panel to upload some product listings.</p>
            ) : (
              <p className="text-xs text-slate-400 mt-2">Log in to view available items.</p>
            )}
          </div>
        )}
      </div>

      {/* 4. Our Services / How It Works Section */}
      <div className="w-full bg-blue-50/15 py-16 border-t border-b border-blue-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          
          <span className="text-blue-600 text-xs font-black tracking-widest uppercase block">
            Our Services
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-2 mb-16">
            How Does It Works?
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl mx-auto">
            
            {/* Step 1 */}
            <div className="flex flex-col items-center">
              <div className="hover:scale-105 transition-transform duration-300">
                <svg className="w-20 h-20 mb-4" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect x="20" y="4" width="24" height="56" rx="4" stroke="#111" strokeWidth="2.5" fill="#FFF"/>
                  <rect x="23" y="8" width="18" height="40" rx="2" fill="#EFF6FF"/>
                  <circle cx="32" cy="52" r="2.5" stroke="#111" strokeWidth="2" fill="#FFF"/>
                  <path d="M26 38 C26 31 38 31 38 38 Z" fill="#93C5FD" stroke="#111" strokeWidth="2.5"/>
                  <rect x="24" y="38" width="16" height="3" rx="1.5" fill="#111"/>
                  <path d="M32 15 L34 20 L39 20 L35 24 L37 29 L32 26 L27 29 L29 24 L25 20 L30 20 Z" fill="#3B82F6" stroke="#111" strokeWidth="2"/>
                  <line x1="28" y1="2" x2="36" y2="2" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mb-2">Easy To Order</h3>
              <p className="text-xs text-gray-500 font-medium max-w-[220px] leading-relaxed">
                You only a few steps in ordering products
              </p>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col items-center">
              <div className="hover:scale-105 transition-transform duration-300">
                <svg className="w-20 h-20 mb-4" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <line x1="6" y1="20" x2="16" y2="20" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
                  <line x1="4" y1="28" x2="12" y2="28" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
                  <path d="M20 42 H46 L42 28 H30 L20 42 Z" fill="#3B82F6" stroke="#111" strokeWidth="2.5" strokeLinejoin="round"/>
                  <rect x="36" y="18" width="14" height="14" rx="2" fill="#93C5FD" stroke="#111" strokeWidth="2.5"/>
                  <path d="M24 28 L22 22 H18" stroke="#111" strokeWidth="2.5" strokeLinecap="round"/>
                  <circle cx="24" cy="46" r="8" fill="#FFF" stroke="#111" strokeWidth="2.5"/>
                  <circle cx="24" cy="46" r="3" fill="#111"/>
                  <circle cx="42" cy="46" r="8" fill="#FFF" stroke="#111" strokeWidth="2.5"/>
                  <circle cx="42" cy="46" r="3" fill="#111"/>
                  <path d="M17 25 H20 V27 H17 Z" fill="#FFF" stroke="#111" strokeWidth="2"/>
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mb-2">Fast Delivery</h3>
              <p className="text-xs text-gray-500 font-medium max-w-[220px] leading-relaxed">
                Delivery that is always ontime even faster
              </p>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col items-center">
              <div className="hover:scale-105 transition-transform duration-300">
                <svg className="w-20 h-20 mb-4" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M26 38 L22 56 L32 50 L42 56 L38 38 Z" fill="#93C5FD" stroke="#111" strokeWidth="2.5" strokeLinejoin="round"/>
                  <circle cx="32" cy="28" r="18" fill="#3B82F6" stroke="#111" strokeWidth="2.5"/>
                  <circle cx="32" cy="28" r="14" fill="#EFF6FF" stroke="#111" strokeWidth="2"/>
                  <path d="M26 30 C26 24 38 24 38 30 Z" fill="#2563EB" stroke="#111" strokeWidth="2"/>
                  <rect x="25" y="31" width="14" height="2" rx="1" fill="#111"/>
                  <path d="M30 45 L32 40 L34 45" stroke="#111" strokeWidth="2" strokeLinecap="round"/>
                </svg>
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 mb-2">Best Quality</h3>
              <p className="text-xs text-gray-500 font-medium max-w-[220px] leading-relaxed">
                not only fast for us in quality is also number one
              </p>
            </div>

          </div>

        </div>
      </div>

      {/* 5. Mobile App Promotion Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 rounded-[2.5rem] p-8 sm:p-12 md:py-16 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden shadow-xl relative border border-blue-500/25">
          
          {/* Decorative Background Shapes */}
          <div className="absolute top-[-30px] right-[-30px] w-36 h-36 rounded-full bg-blue-500/20 opacity-40 blur-lg" />
          <div className="absolute bottom-[-30px] left-[-30px] w-36 h-36 rounded-full bg-blue-500/20 opacity-40 blur-lg" />

          {/* Left: Mobile App Mockup */}
          <div className="w-full md:w-1/2 flex justify-center relative select-none">
            <img
              src={`${CATEGORY_API}/uploads/mobile_app_mockup.png`}
              alt="Mobile Application Mockup"
              className="w-56 sm:w-72 h-auto object-contain hover:scale-[1.03] transition-transform duration-500 drop-shadow-[0_20px_50px_rgba(37,99,235,0.25)]"
            />
          </div>

          {/* Right: Promotion Details & Store Badges */}
          <div className="w-full md:w-1/2 text-left space-y-4 md:pl-6 relative z-10">
            <span className="text-blue-200 text-xs font-black tracking-widest uppercase block">
              Our Application
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Simple Way To Order Your Products
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 font-semibold leading-relaxed max-w-md">
              Discover products wherever and whenever, and get your shopping order delivered quickly right to your doorstep.
            </p>
            
            {/* Playstore & Appstore Badges */}
            <div className="flex flex-wrap gap-4 pt-6">
              
              {/* App Store Badge */}
              <a 
                href="#appstore" 
                onClick={(e) => { e.preventDefault(); alert("App Store download coming soon!"); }}
                className="inline-flex items-center gap-2.5 bg-white hover:bg-blue-50 text-slate-950 px-4.5 py-2.5 rounded-2xl transition-all shadow-md active:scale-95 group"
              >
                <svg className="w-6 h-6 fill-slate-950 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.17c.66-.81 1.11-1.93.99-3.06-1 .04-2.22.67-2.94 1.5-.64.74-1.2 1.88-1.05 2.99 1.11.09 2.25-.56 2.94-1.43z"/>
                </svg>
                <div className="text-left leading-tight text-slate-950">
                  <span className="text-[8px] font-bold block uppercase tracking-wider text-slate-500">Download on the</span>
                  <span className="text-xs sm:text-sm font-extrabold block">App Store</span>
                </div>
              </a>

              {/* Google Play Badge */}
              <a 
                href="#playstore" 
                onClick={(e) => { e.preventDefault(); alert("Google Play Store download coming soon!"); }}
                className="inline-flex items-center gap-2.5 bg-white hover:bg-blue-50 text-slate-950 px-4.5 py-2.5 rounded-2xl transition-all shadow-md active:scale-95 group"
              >
                <svg className="w-6 h-6 fill-slate-950 group-hover:scale-105 transition-transform" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M5 3.662c0-.528.283-.974.7-.974.198 0 .385.093.535.253l11.066 11.065L6.235 25.07c-.15.16-.337.253-.535.253-.417 0-.7-.446-.7-.974V3.662zm12.3 8.338l-4.148-4.148 2.913-1.942 5.098 3.398c.417.278.637.724.637 1.192s-.22.914-.637 1.192l-5.098 3.398-2.765-1.89zm-5.202-5.202L4.032 1.192A2.22 2.22 0 0 1 5 1v1.162l7.098 4.636zm-2.033 8.87L5 20.301v1.5c0 .248.04.49.12.713l6.978-6.845z"/>
                </svg>
                <div className="text-left leading-tight text-slate-950">
                  <span className="text-[8px] font-bold block uppercase tracking-wider text-slate-500">GET IT ON</span>
                  <span className="text-xs sm:text-sm font-extrabold block">Google Play</span>
                </div>
              </a>

            </div>

          </div>

        </div>
      </div>

      {/* Quick View Modal */}
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default Home;

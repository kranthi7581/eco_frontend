import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { CATEGORY_API } from "../../repo/Apis";
import { ArrowLeft, ChevronRight, Layers, Sparkles } from "lucide-react";

const Subcategories = () => {
  const navigate = useNavigate();
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Mocks fallback
  const fallbackSubcategories = [
    { id: "mobiles", name: "Mobiles", categoryId: "electronics", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=200" },
    { id: "laptops", name: "Laptops", categoryId: "electronics", image: "https://images.unsplash.com/photo-1496181130204-755241544e35?auto=format&fit=crop&q=80&w=200" },
    { id: "headphones", name: "Headphones", categoryId: "electronics", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200" },
    { id: "men-wear", name: "Men Wear", categoryId: "fashion", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=200" },
    { id: "women-wear", name: "Women Wear", categoryId: "fashion", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200" },
    { id: "footwear", name: "Footwear", categoryId: "fashion", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=200" }
  ];

  useEffect(() => {
    const fetchAllSubcategories = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = token ? { Authorization: `Bearer ${token}` } : {};
        const res = await api.get(`${CATEGORY_API}/subcategories`, { headers });
        if (res.data && Array.isArray(res.data.subcategories)) {
          setSubcategories(res.data.subcategories);
        } else {
          setSubcategories(fallbackSubcategories);
        }
      } catch (err) {
        console.error("Error fetching subcategories directory:", err);
        setSubcategories(fallbackSubcategories);
      } finally {
        setLoading(false);
      }
    };

    fetchAllSubcategories();
  }, []);

  const handleSubcategoryClick = (sub) => {
    if (sub.id && !isNaN(sub.id)) {
      navigate(`/subcategory/${sub.id}`);
    } else {
      navigate(`/products?subcategory=${encodeURIComponent(sub.name)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1 text-sm font-semibold text-gray-500 hover:text-blue-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Link to="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 font-semibold">Subcategories</span>
          </div>
        </div>

        {/* Header */}
        <div className="mb-10 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full bg-blue-50" />
          <div className="bg-blue-600 text-white p-3 rounded-2xl shadow shadow-blue-600/10">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Explore Subcategories
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">
              Subcategory Directory
            </h1>
            <p className="text-sm text-gray-500 mt-1">Browse all available product segments across our collections.</p>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
            <p className="text-gray-500 mt-4 text-sm font-medium">Loading segments...</p>
          </div>
        ) : subcategories.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
            {subcategories.map((sub) => {
              const subImage = sub.image
                ? sub.image.startsWith("http") ? sub.image : `${CATEGORY_API}${sub.image}`
                : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=200";

              return (
                <div
                  key={sub.id}
                  onClick={() => handleSubcategoryClick(sub)}
                  className="group cursor-pointer bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col p-4 items-center text-center"
                >
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden mb-4 bg-gray-50 border border-gray-100 flex items-center justify-center">
                    <img
                      src={subImage}
                      alt={sub.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <h3 className="text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                    {sub.name}
                  </h3>
                  <span className="text-[10px] font-bold text-gray-400 mt-1 group-hover:text-blue-500 transition-colors">
                    View collection
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-500 shadow-sm">
            <p className="text-base font-bold">No subcategories found.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Subcategories;

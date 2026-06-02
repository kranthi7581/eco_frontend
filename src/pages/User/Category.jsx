import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../../services/api";
import { CATEGORY_API } from "../../repo/Apis";
import { ChevronRight, ArrowLeft, Layers, Sparkles } from "lucide-react";

const Category = () => {
  const { categoryId } = useParams();
  const navigate = useNavigate();
  const [categoryName, setCategoryName] = useState("Category");
  const [subcategories, setSubcategories] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fallbacks in case the database is empty (matches user specifications)
  const defaultSubcategories = {
    // Electronics
    "electronics": [
      { id: "mobiles", name: "Mobiles", image: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=300", description: "Smartphones, feature phones & mobile accessories." },
      { id: "laptops", name: "Laptops", image: "https://images.unsplash.com/photo-1496181130204-755241544e35?auto=format&fit=crop&q=80&w=300", description: "Workstations, gaming rigs & ultrabooks." },
      { id: "headphones", name: "Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300", description: "Wireless earbuds, over-ear & noise cancelling headphones." }
    ],
    // Fashion
    "fashion": [
      { id: "men-wear", name: "Men Wear", image: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=300", description: "Shirts, trousers, jackets & formal suits." },
      { id: "women-wear", name: "Women Wear", image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=300", description: "Dresses, tops, kurtis & traditional clothing." },
      { id: "footwear", name: "Footwear", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&q=80&w=300", description: "Running sneakers, casual shoes & formal leather boots." }
    ],
    // Grocery
    "grocery": [
      { id: "fruits-veggies", name: "Fruits & Vegetables", image: "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=300", description: "Fresh farm produce delivered organic and healthy." },
      { id: "staples", name: "Daily Staples", image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&q=80&w=300", description: "Rice, flour, grains, spices & cooking oils." }
    ],
    // Beauty
    "beauty": [
      { id: "skincare", name: "Skincare", image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&q=80&w=300", description: "Moisturizers, face serums, sunscreens & toners." },
      { id: "makeup", name: "Makeup", image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?auto=format&fit=crop&q=80&w=300", description: "Lipsticks, foundations, eyeliners & eyeshadow palettes." }
    ],
    // Home & Kitchen
    "home-kitchen": [
      { id: "kitchen-appliances", name: "Kitchen Appliances", image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=300", description: "Mixers, air fryers, water purifiers & toasters." },
      { id: "home-decor", name: "Home Decor", image: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&q=80&w=300", description: "Curtains, bedsheets, wall arts & decorative lights." }
    ]
  };

  useEffect(() => {
    const fetchCategoryDetails = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        // Check if numerical ID (which means database record)
        if (categoryId && !isNaN(categoryId)) {
          const headers = { Authorization: `Bearer ${token}` };

          // Fetch Category Name
          const catRes = await api.get(`${CATEGORY_API}/categories/${categoryId}`, { headers });
          if (catRes.data && catRes.data.category) {
            setCategoryName(catRes.data.category.name);
          }

          // Fetch All Subcategories and filter by categoryId
          const subRes = await api.get(`${CATEGORY_API}/subcategories`, { headers });
          if (subRes.data && Array.isArray(subRes.data.subcategories)) {
            const filtered = subRes.data.subcategories.filter(
              (sub) => Number(sub.categoryId) === Number(categoryId)
            );
            setSubcategories(filtered);
          }
        } else {
          // Mock data handling based on slug string
          const formattedSlug = categoryId.toLowerCase();
          const nameMap = {
            "electronics": "Electronics",
            "fashion": "Fashion",
            "grocery": "Grocery",
            "beauty": "Beauty",
            "home-kitchen": "Home & Kitchen"
          };
          setCategoryName(nameMap[formattedSlug] || "Category Catalog");
          setSubcategories(defaultSubcategories[formattedSlug] || []);
        }
      } catch (error) {
        console.error("Error fetching subcategories:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCategoryDetails();
  }, [categoryId]);

  const handleSubcategoryClick = (sub) => {
    if (sub.id && !isNaN(sub.id)) {
      navigate(`/subcategory/${sub.id}`);
    } else {
      // Fallback for mocks
      navigate(`/products?subcategory=${encodeURIComponent(sub.name)}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumb & Back action */}
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
            <span className="text-gray-600 font-semibold">{categoryName}</span>
          </div>
        </div>

        {/* Header Title Section */}
        <div className="mb-10 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4 relative overflow-hidden">
          <div className="absolute top-[-20px] right-[-20px] w-24 h-24 rounded-full bg-blue-50" />
          <div className="bg-blue-600 text-white p-3 rounded-2xl shadow shadow-blue-600/10">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> Category Collections
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 mt-0.5">
              {categoryName}
            </h1>
            <p className="text-sm text-gray-500 mt-1">Select a subcategory to browse products catalog.</p>
          </div>
        </div>

        {/* Subcategories Grid */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
            <p className="text-gray-500 mt-4 text-sm font-medium">Loading subcategories...</p>
          </div>
        ) : subcategories.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {subcategories.map((sub) => {
              const subImage = sub.image
                ? sub.image.startsWith("http") ? sub.image : `${CATEGORY_API}${sub.image}`
                : "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&q=80&w=300";

              return (
                <div
                  key={sub.id}
                  onClick={() => handleSubcategoryClick(sub)}
                  className="group cursor-pointer bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col"
                >
                  {/* Subcategory Image */}
                  <div className="aspect-[4/3] w-full overflow-hidden bg-gray-50">
                    <img
                      src={subImage}
                      alt={sub.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>

                  {/* Subcategory Details */}
                  <div className="p-6 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                        {sub.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                        {sub.description || "Browse the full collection of items, comparing ratings and specifications."}
                      </p>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-50 flex items-center justify-between text-xs font-bold text-blue-600">
                      <span>View Products</span>
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white border border-gray-100 rounded-3xl p-12 text-center text-gray-500 shadow-sm">
            <p className="text-base font-bold">No subcategories found under {categoryName}.</p>
            <p className="text-xs text-gray-400 mt-1">Please configure categories and subcategories in the admin panel first.</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default Category;

import { useState, useEffect } from "react";
import { useParams, Link, useSearchParams } from "react-router-dom";
import api from "../../services/api";
import { CATEGORY_API } from "../../repo/Apis";
import { SlidersHorizontal, ArrowUpDown, ChevronRight, LayoutGrid, SearchX } from "lucide-react";
import ProductCard from "../../components/User/ProductCard";
import QuickViewModal from "../../components/User/QuickViewModal";

const ProductsListing = () => {
  const { subcategoryId } = useParams();
  const [searchParams] = useSearchParams();
  
  // States
  const [productsList, setProductsList] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [subcatName, setSubcatName] = useState("Products Catalog");
  const [loading, setLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
  // Sort State
  const [sortBy, setSortBy] = useState("default"); // 'default', 'price-asc', 'price-desc'

  const searchQuery = searchParams.get("search") || "";
  const subcategoryQueryName = searchParams.get("subcategory") || "";
  const categoryQueryName = searchParams.get("category") || "";

  useEffect(() => {
    const fetchCatalog = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch subcategory details if subcategoryId param is present
        if (subcategoryId && !isNaN(subcategoryId)) {
          const subRes = await api.get(`${CATEGORY_API}/subcategories/${subcategoryId}`, { headers }).catch(() => null);
          if (subRes && subRes.data && subRes.data.subcategory) {
            setSubcatName(subRes.data.subcategory.name);
          }
        } else if (searchQuery) {
          setSubcatName(`Search results for "${searchQuery}"`);
        } else if (subcategoryQueryName) {
          setSubcatName(subcategoryQueryName);
        } else if (categoryQueryName) {
          setSubcatName(categoryQueryName);
        } else {
          setSubcatName("All Products");
        }

        // 2. Fetch all products
        // Wait, if searchQuery is there, does backend `/products?search=query` work?
        // Let's check how the backend searches.
        // Yes, `backend/controllers/ADMIN/products.js` has a query search parameter:
        // `url = query ? ...products?search=query`
        // Let's fetch all products and filter locally for maximum safety, since local filtering handles combinations of categories/subcategories/search query perfectly.
        const response = await api.get(`${CATEGORY_API}/products`, { headers });
        if (response.data && Array.isArray(response.data.products)) {
          setProductsList(response.data.products);
        } else if (Array.isArray(response.data)) {
          setProductsList(response.data);
        }
      } catch (err) {
        console.error("Error fetching products listing:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, [subcategoryId, searchQuery, subcategoryQueryName, categoryQueryName]);

  // Handle Filtering & Sorting
  useEffect(() => {
    let items = [...productsList];

    // Filter by route subcategoryId
    if (subcategoryId && !isNaN(subcategoryId)) {
      items = items.filter((prod) => Number(prod.subcategoryId) === Number(subcategoryId));
    }

    // Filter by search query
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(
        (prod) =>
          prod.name.toLowerCase().includes(q) ||
          (prod.description && prod.description.toLowerCase().includes(q))
      );
    }

    // Filter by category query name (for mock catalog)
    if (categoryQueryName) {
      const q = categoryQueryName.toLowerCase();
      items = items.filter(
        (prod) =>
          (prod.Category && prod.Category.name.toLowerCase() === q) ||
          (prod.category && prod.category.name.toLowerCase() === q)
      );
    }

    // Filter by subcategory query name (for mock catalog)
    if (subcategoryQueryName) {
      const q = subcategoryQueryName.toLowerCase();
      items = items.filter(
        (prod) =>
          (prod.Subcategory && prod.Subcategory.name.toLowerCase() === q) ||
          (prod.subcategory && prod.subcategory.name.toLowerCase() === q)
      );
    }

    // Only show active products
    items = items.filter((prod) => prod.status !== "inactive");

    // Apply Sorting
    if (sortBy === "price-asc") {
      items.sort((a, b) => Number(a.price) - Number(b.price));
    } else if (sortBy === "price-desc") {
      items.sort((a, b) => Number(b.price) - Number(a.price));
    }

    setFilteredProducts(items);
  }, [productsList, subcategoryId, searchQuery, categoryQueryName, subcategoryQueryName, sortBy]);

  return (
    <div className="min-h-screen bg-gray-50 py-8 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Breadcrumbs */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-gray-400 font-medium">
            <Link to="/" className="hover:underline">Home</Link>
            <ChevronRight className="w-3 h-3" />
            <Link to="/products" className="hover:underline">Products</Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-600 font-semibold">{subcatName}</span>
          </div>
          <span className="text-xs text-gray-500 font-bold bg-white px-3 py-1.5 border border-gray-100 rounded-full shadow-sm">
            {filteredProducts.length} {filteredProducts.length === 1 ? "Item" : "Items"} Found
          </span>
        </div>

        {/* Toolbar & Filters */}
        <div className="mb-8 bg-white border border-gray-100 p-4 rounded-3xl shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <LayoutGrid className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-gray-900 leading-none">{subcatName}</h1>
              <p className="text-[10px] text-gray-400 mt-1 font-semibold uppercase tracking-wider">Store Catalog</p>
            </div>
          </div>

          {/* Sort selection dropdown */}
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <ArrowUpDown className="w-4 h-4 text-blue-600" />
              <span>Sort By</span>
            </div>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-sm font-semibold text-gray-700 rounded-xl px-4 py-2 focus:outline-none focus:border-blue-500 cursor-pointer flex-1 sm:flex-none"
            >
              <option value="default">New Arrivals</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent" />
            <p className="text-gray-500 mt-4 text-sm font-medium">Fetching products catalog...</p>
          </div>
        ) : filteredProducts.length > 0 ? (
          /* Products Grid: Desktop (4 cols), Tablet (2 cols), Mobile (1 col) */
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onQuickView={(prod) => setSelectedProduct(prod)}
              />
            ))}
          </div>
        ) : (
          /* No products empty state */
          <div className="bg-white border border-gray-100 rounded-3xl py-20 px-4 text-center max-w-xl mx-auto shadow-sm">
            <SearchX className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-bold text-gray-800">No products matching filters</h3>
            <p className="text-sm text-gray-500 mt-2">
              We couldn't find any products in our database matching this search or category specification.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <Link
                to="/"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm px-6 py-2.5 rounded-full transition-colors shadow"
              >
                Back to Home
              </Link>
              <Link
                to="/products"
                className="border border-gray-300 hover:bg-gray-50 text-gray-700 font-bold text-sm px-6 py-2.5 rounded-full transition-colors"
              >
                Clear Search
              </Link>
            </div>
          </div>
        )}

      </div>

      {/* Quick View Modal overlay */}
      {selectedProduct && (
        <QuickViewModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
        />
      )}
    </div>
  );
};

export default ProductsListing;

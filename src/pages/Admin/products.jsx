import { useState, useEffect } from "react";
import api from "../../services/api";
import { CATEGORY_API } from "../../repo/Apis";
import { Edit, Trash2, Search, Plus, Trash } from "lucide-react";
import { Link } from "react-router-dom";

const ProductsPage = () => {
  const [productsList, setProductsList] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Delete Confirmation State
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Fetch all products
  const fetchProducts = async (query = "") => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const url = query ? `${CATEGORY_API}/products?search=${query}` : `${CATEGORY_API}/products`;
      const response = await api.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProductsList(
        response.data && Array.isArray(response.data.products)
          ? response.data.products
          : []
      );
    } catch (err) {
      console.error("Error fetching products:", err);
      setError("Failed to fetch products catalog.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchProducts(searchQuery);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`${CATEGORY_API}/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setDeleteConfirmId(null);
      fetchProducts(searchQuery);
    } catch (err) {
      console.error("Error deleting product:", err);
      setError("Failed to delete product.");
    }
  };

  return (
    <div className="min-h-full bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Products</h1>
          <p className="text-gray-500">Manage all store products and stock</p>
        </div>

        <Link
          to="/admin/products/add"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-between items-center p-5 border-b gap-4">
          <h2 className="text-xl font-semibold text-gray-800">Product List</h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center border rounded-lg px-3 py-2 w-full sm:w-64 bg-gray-55 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2 bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* Loading state */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2 text-sm">Loading products catalog...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-700 border-b">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">#</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Image</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Name</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Category</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Subcategory</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Price</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Stock Qty</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {productsList.length > 0 ? (
                  productsList.map((product, index) => (
                    <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                      <td className="p-4 text-sm text-gray-600">{index + 1}</td>

                      <td className="p-4">
                        <img
                          src={product.image ? `${CATEGORY_API}${product.image}` : "https://via.placeholder.com/50"}
                          alt={product.name}
                          className="w-12 h-12 rounded-md object-cover border bg-gray-100"
                        />
                      </td>

                      <td className="p-4 text-sm font-semibold text-gray-800">{product.name}</td>
                      <td className="p-4 text-sm text-gray-600">
                        {product.Category?.name || product.category?.name || "N/A"}
                      </td>
                      <td className="p-4 text-sm text-blue-600 font-medium">
                        {product.Subcategory?.name || product.subcategory?.name || "N/A"}
                      </td>
                      <td className="p-4 text-sm font-bold text-gray-900">
                        ₹{Number(product.price).toLocaleString("en-IN")}
                      </td>
                      <td className="p-4 text-sm text-gray-700 font-semibold">{product.quantity}</td>

                      <td className="p-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            product.status === "active"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {product.status || "active"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-3">
                          <Link
                            to={`/admin/products/edit/${product.id}`}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors shadow flex items-center justify-center"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </Link>

                          <button
                            onClick={() => setDeleteConfirmId(product.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors shadow flex items-center justify-center"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="10" className="text-center p-8 text-gray-500">
                      No products found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border p-6 text-center">
            <Trash size={40} className="mx-auto text-red-500 mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Product</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this product? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirmId)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors shadow"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductsPage;
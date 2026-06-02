import { Edit, Trash2, Search, Plus, Trash } from "lucide-react";
import { useState, useEffect } from "react";
import api from "../../services/api";
import { Link } from "react-router-dom";
import { CATEGORY_API } from "../../repo/Apis";

const CategoriesPage = () => {
  const [categories, setCategories] = useState([]);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch Categories
  const fetchCategories = async (query = "") => {
    try {
      const token = localStorage.getItem("token");
      const url = query ? `${CATEGORY_API}/categories?search=${query}` : `${CATEGORY_API}/categories`;
      const response = await api.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setCategories(
        response.data && Array.isArray(response.data.categories)
          ? response.data.categories
          : []
      );
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const deleteCategory = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`${CATEGORY_API}/categories/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeleteConfirmId(null);
      fetchCategories(searchQuery);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchCategories(searchQuery);
    }, 300);
    return () => clearTimeout(delayDebounce);
  }, [searchQuery]);


  return (
    <div className="min-h-full bg-gray-100 p-6">
      {/* Heading */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Categories</h1>
          <p className="text-gray-500">Manage all product categories</p>
        </div>

        <Link
          to="/admin/categories/add"
          className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow"
        >
          <Plus size={18} />
          Add Category
        </Link>
      </div>

      {/* Table Container */}
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        {/* Top Controls */}
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-semibold">Category List</h2>

          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search categories..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2 bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table */}
        <table className="w-full">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="p-4 text-left">#</th>
              <th className="p-4 text-left">Image</th>
              <th className="p-4 text-left">Name</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-left">Status</th>
              <th className="p-4 text-center">Actions</th>
            </tr>
          </thead>

          <tbody>
            {categories.length > 0 ? (
              categories.map((category, index) => (
                <tr
                  key={category._id || category.id}
                  className="border-b hover:bg-gray-50"
                >
                  <td className="p-4">{index + 1}</td>

                  <td className="p-4">
                    <img
                      src={category.image ? `${CATEGORY_API}${category.image}` : "https://via.placeholder.com/50"}
                      alt={category.name}
                      className="w-12 h-12 rounded-md object-cover border"
                    />
                  </td>

                  <td className="p-4">{category.name}</td>
                  <td className="p-4">{category.description}</td>

                  <td className="p-4">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        category.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {category.status}
                    </span>
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-3">
                      <Link
                        to={`/admin/categories/edit/${category._id || category.id}`}
                        className="bg-green-500 text-white p-2 rounded-lg hover:bg-green-600 transition-colors"
                      >
                        <Edit size={18} />
                      </Link>

                      <button
                        onClick={() =>
                          setDeleteConfirmId(category._id || category.id)
                        }
                        className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors shadow flex items-center justify-center"
                        title="Delete"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" className="text-center p-6 text-gray-500">
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal (No backdrop blur) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border p-6 text-center">
            <Trash size={40} className="mx-auto text-red-500 mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Category</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this category? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => deleteCategory(deleteConfirmId)}
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

export default CategoriesPage;

import { useState, useEffect } from "react";
import api from "../services/api";
import { CATEGORY_API } from "../repo/Apis";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Upload, Image as ImageIcon } from "lucide-react";

const AddSubcategory = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    categoryId: "",
    status: "active",
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch parent categories on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get(`${CATEGORY_API}/categories`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cats = response.data && Array.isArray(response.data.categories)
          ? response.data.categories
          : [];
        setCategories(cats);
        if (cats.length > 0) {
          setFormData((prev) => ({ ...prev, categoryId: String(cats[0].id) }));
        }
      } catch (err) {
        console.error("Error fetching categories:", err);
        setError("Failed to fetch parent categories.");
      }
    };
    fetchCategories();
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (!formData.categoryId) {
      setError("Please select a parent category.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("categoryId", formData.categoryId);
      data.append("status", formData.status);
      
      // Auto-generate slug
      const generatedSlug = formData.name
        ? formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
        : "";
      data.append("slug", generatedSlug);

      if (imageFile) {
        data.append("image", imageFile);
      }

      const token = localStorage.getItem("token");
      await api.post(`${CATEGORY_API}/subcategories`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/admin/subcategories");
    } catch (err) {
      console.error("Error creating subcategory:", err);
      setError(err.response?.data?.message || "Failed to create subcategory.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back button and title */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/subcategories"
          className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Add Subcategory</h1>
          <p className="text-sm text-gray-500">Create a new subcategory connected to a parent category</p>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Form */}
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Smart Phones"
                value={formData.name}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Parent Category</label>
              <select
                required
                value={formData.categoryId}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow"
                onChange={(e) =>
                  setFormData({ ...formData, categoryId: e.target.value })
                }
              >
                <option value="" disabled>Select parent category...</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                rows="4"
                placeholder="e.g. Android and iOS mobile devices..."
                value={formData.description}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow resize-none"
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    description: e.target.value,
                  })
                }
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
              <select
                value={formData.status}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow bg-white"
                onChange={(e) =>
                  setFormData({ ...formData, status: e.target.value })
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Image Upload Area */}
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-xl p-6 bg-gray-50 hover:bg-gray-100/50 transition-colors">
            <span className="block text-sm font-semibold text-gray-700 mb-4 self-start">Subcategory Image</span>
            
            {/* Image Preview */}
            <div className="relative w-40 h-40 rounded-lg overflow-hidden border shadow bg-white flex items-center justify-center mb-4">
              {previewUrl ? (
                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center justify-center text-gray-400">
                  <ImageIcon size={40} className="mb-2" />
                  <span className="text-xs">No Image Selected</span>
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-sm font-medium text-gray-700 cursor-pointer transition-colors">
              <Upload size={16} />
              Choose Image
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </label>
            <span className="text-xs text-gray-400 mt-2">PNG, JPG or JPEG up to 5MB</span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-4 border-t pt-6">
          <Link
            to="/admin/subcategories"
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm transition-colors shadow disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? "Saving..." : "Save Subcategory"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSubcategory;

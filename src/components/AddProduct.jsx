import { useState, useEffect } from "react";
import api from "../services/api";
import { CATEGORY_API } from "../repo/Apis";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Save, Upload, Image as ImageIcon } from "lucide-react";

const AddProduct = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    quantity: "0",
    categoryId: "",
    subcategoryId: "",
    status: "active",
  });
  const [categories, setCategories] = useState([]);
  const [allSubcategories, setAllSubcategories] = useState([]);
  const [filteredSubcategories, setFilteredSubcategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Fetch Categories & Subcategories on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        const [catRes, subRes] = await Promise.all([
          api.get(`${CATEGORY_API}/categories`, { headers }),
          api.get(`${CATEGORY_API}/subcategories`, { headers }),
        ]);

        const cats = catRes.data && Array.isArray(catRes.data.categories) ? catRes.data.categories : [];
        const subs = subRes.data && Array.isArray(subRes.data.subcategories) ? subRes.data.subcategories : [];

        setCategories(cats);
        setAllSubcategories(subs);

        if (cats.length > 0) {
          const defaultCatId = String(cats[0].id);
          setFormData((prev) => ({ ...prev, categoryId: defaultCatId }));

          // Filter subcategories for the default category
          const filtered = subs.filter((sub) => String(sub.categoryId) === defaultCatId);
          setFilteredSubcategories(filtered);
          if (filtered.length > 0) {
            setFormData((prev) => ({ ...prev, categoryId: defaultCatId, subcategoryId: String(filtered[0].id) }));
          }
        }
      } catch (err) {
        console.error("Error fetching dependencies:", err);
        setError("Failed to load category/subcategory list.");
      }
    };
    fetchData();
  }, []);

  // Update filtered subcategories when category selection changes
  const handleCategoryChange = (e) => {
    const selectedCatId = e.target.value;
    const filtered = allSubcategories.filter((sub) => String(sub.categoryId) === selectedCatId);
    
    setFilteredSubcategories(filtered);
    setFormData({
      ...formData,
      categoryId: selectedCatId,
      subcategoryId: filtered.length > 0 ? String(filtered[0].id) : "",
    });
  };

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

    if (!formData.categoryId || !formData.subcategoryId) {
      setError("Please select both a parent category and subcategory.");
      setLoading(false);
      return;
    }

    try {
      const data = new FormData();
      data.append("name", formData.name);
      data.append("description", formData.description);
      data.append("price", String(formData.price));
      data.append("quantity", String(formData.quantity));
      data.append("categoryId", formData.categoryId);
      data.append("subcategoryId", formData.subcategoryId);
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
      await api.post(`${CATEGORY_API}/products`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      navigate("/admin/products");
    } catch (err) {
      console.error("Error creating product:", err);
      setError(err.response?.data?.message || "Failed to create product.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      {/* Back button and title */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/products"
          className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Add Product</h1>
          <p className="text-sm text-gray-500">Create a new product catalog listing</p>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
              <input
                type="text"
                required
                placeholder="e.g. iPhone 15 Pro"
                value={formData.name}
                className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                <input
                  type="number"
                  required
                  min="1"
                  step="any"
                  placeholder="Price"
                  value={formData.price}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Quantity</label>
                <input
                  type="number"
                  required
                  min="0"
                  placeholder="Quantity"
                  value={formData.quantity}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow"
                  onChange={(e) =>
                    setFormData({ ...formData, quantity: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  required
                  value={formData.categoryId}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow"
                  onChange={handleCategoryChange}
                >
                  <option value="" disabled>Select parent...</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Subcategory</label>
                <select
                  required
                  value={formData.subcategoryId}
                  className="w-full border border-gray-300 px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow"
                  onChange={(e) =>
                    setFormData({ ...formData, subcategoryId: e.target.value })
                  }
                >
                  <option value="" disabled>Select subcategory...</option>
                  {filteredSubcategories.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                rows="3"
                placeholder="Product description..."
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
            <span className="block text-sm font-semibold text-gray-700 mb-4 self-start">Product Image</span>
            
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
            to="/admin/products"
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
            {loading ? "Saving..." : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;

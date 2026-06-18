import { useState, useEffect } from "react";
import api from "../../services/api";
import { CATEGORY_API } from "../../repo/Apis";
import { Edit, Trash2, Search, Plus, Trash, Sparkles, X } from "lucide-react";

const SubscriptionsPage = () => {
  const [plans, setPlans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  // Form Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [formSaving, setFormSaving] = useState(false);
  const [formState, setFormState] = useState({
    name: "",
    price: "",
    duration_days: "",
    description: "",
    status: 1, // 1 for active, 0 for inactive
  });

  const fetchPlans = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`${CATEGORY_API}/plans`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && Array.isArray(response.data.plans)) {
        setPlans(response.data.plans);
      } else {
        setPlans([]);
      }
    } catch (err) {
      console.error("Error fetching subscription plans:", err);
      setError("Failed to load subscription plans from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleDeletePlan = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`${CATEGORY_API}/subscription/plan/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeleteConfirmId(null);
      setPlans((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting subscription plan:", err);
      alert("Failed to delete subscription plan.");
    }
  };

  const handleOpenAddModal = () => {
    setEditingPlanId(null);
    setFormState({
      name: "",
      price: "",
      duration_days: "",
      description: "",
      status: 1,
    });
    setModalOpen(true);
  };

  const handleOpenEditModal = (plan) => {
    setEditingPlanId(plan.id);
    setFormState({
      name: plan.name || "",
      price: plan.price || "",
      duration_days: plan.duration_days || "",
      description: plan.description || "",
      status: plan.status !== undefined ? plan.status : 1,
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setFormSaving(true);
    try {
      const token = localStorage.getItem("token");
      const payload = {
        name: formState.name,
        price: parseFloat(formState.price),
        duration_days: parseInt(formState.duration_days),
        description: formState.description || null,
        status: parseInt(formState.status),
      };

      if (editingPlanId) {
        await api.put(`${CATEGORY_API}/subscription/update-newplan/${editingPlanId}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await api.post(`${CATEGORY_API}/subscription/create-newplan`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setModalOpen(false);
      fetchPlans();
    } catch (err) {
      console.error("Error saving subscription plan:", err);
      alert(err.response?.data?.message || "Failed to save subscription plan.");
    } finally {
      setFormSaving(false);
    }
  };

  // Filter list based on search query
  const filteredPlans = plans.filter((plan) => {
    const name = plan.name?.toLowerCase() || "";
    const description = plan.description?.toLowerCase() || "";
    const query = searchQuery.toLowerCase();
    return name.includes(query) || description.includes(query);
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Subscriptions</h1>
          <p className="text-gray-500">Manage all membership subscription plans</p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow"
        >
          <Plus size={18} />
          Add Plan
        </button>
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
          <h2 className="text-xl font-semibold text-gray-800">Plan List</h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all w-full sm:w-64">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search plans..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2 bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table & Loader */}
        {loading && plans.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2 text-sm">Loading plans list...</p>
          </div>
        ) : filteredPlans.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Sparkles size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium">No subscription plans found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b text-gray-700">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">#</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Plan Name</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Price (₹)</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Duration</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Description</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredPlans.map((plan, idx) => (
                  <tr key={plan.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{idx + 1}</td>
                    <td className="p-4 font-semibold text-gray-800 tracking-wider">{plan.name}</td>
                    <td className="p-4 text-sm font-semibold text-gray-800">₹{parseFloat(plan.price).toLocaleString("en-IN")}</td>
                    <td className="p-4 text-sm text-gray-600">{plan.duration_days} Days</td>
                    <td className="p-4 text-sm text-gray-600 max-w-xs truncate" title={plan.description || ""}>
                      {plan.description || "-"}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          plan.status === 1
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {plan.status === 1 ? "active" : "inactive"}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleOpenEditModal(plan)}
                          className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors shadow flex items-center justify-center"
                          title="Edit"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => setDeleteConfirmId(plan.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors shadow flex items-center justify-center"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Plan Form Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden border">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b">
              <h3 className="text-xl font-bold text-gray-800">
                {editingPlanId ? "Edit Subscription Plan" : "Add Subscription Plan"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1 hover:bg-gray-150 bg-gray-100 hover:bg-gray-200 text-gray-500 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleFormSubmit} className="p-6 space-y-4">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Plan Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Gold Monthly Plan"
                    value={formState.name}
                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Price (₹)
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 499"
                      value={formState.price}
                      onChange={(e) => setFormState({ ...formState, price: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Duration (Days)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="e.g. 30"
                      value={formState.duration_days}
                      onChange={(e) => setFormState({ ...formState, duration_days: e.target.value })}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Description
                  </label>
                  <textarea
                    rows="3"
                    placeholder="Provide a brief description of the subscription benefits..."
                    value={formState.description}
                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Plan Status
                  </label>
                  <select
                    value={formState.status}
                    onChange={(e) => setFormState({ ...formState, status: parseInt(e.target.value) })}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>Active</option>
                    <option value={0}>Inactive</option>
                  </select>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg text-sm transition-colors hover:bg-gray-55"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formSaving}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-colors shadow disabled:opacity-50"
                >
                  {formSaving ? "Saving..." : editingPlanId ? "Update Plan" : "Create Plan"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal (Yes / No) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border p-6 text-center">
            <Trash size={40} className="mx-auto text-red-500 mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Plan</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this subscription plan? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-55 text-sm font-semibold text-gray-700 transition-colors"
              >
                No, Cancel
              </button>
              <button
                onClick={() => handleDeletePlan(deleteConfirmId)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-semibold transition-colors shadow"
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

export default SubscriptionsPage;

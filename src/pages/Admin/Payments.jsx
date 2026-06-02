import { useState, useEffect } from "react";
import api from "../../services/api";
import { CATEGORY_API } from "../../repo/Apis";
import { Trash2, Search, CreditCard, User as UserIcon } from "lucide-react";

const PaymentsPage = () => {
  const [payments, setPayments] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const fetchPayments = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`${CATEGORY_API}/payment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && Array.isArray(response.data.payments)) {
        setPayments(response.data.payments);
      } else {
        setPayments([]);
      }
    } catch (err) {
      console.error("Error fetching payments:", err);
      setError("Failed to load payment transactions from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleDeletePayment = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`${CATEGORY_API}/payment/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeleteConfirmId(null);
      setPayments((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error("Error deleting payment:", err);
      alert("Failed to delete payment transaction.");
    }
  };

  // Filter list based on search query
  const filteredPayments = payments.filter((payment) => {
    const username = payment.Order?.User?.username?.toLowerCase() || "";
    const email = payment.Order?.User?.email?.toLowerCase() || "";
    const rzOrderId = payment.razorpayOrderId?.toLowerCase() || "";
    const rzPayId = payment.razorpayPaymentId?.toLowerCase() || "";
    const orderIdStr = String(payment.orderId || "");
    const status = payment.status?.toLowerCase() || "";

    const query = searchQuery.toLowerCase();
    return (
      username.includes(query) ||
      email.includes(query) ||
      rzOrderId.includes(query) ||
      rzPayId.includes(query) ||
      orderIdStr.includes(query) ||
      status.includes(query)
    );
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Payments</h1>
          <p className="text-gray-500">Manage all payment transactions and statuses</p>
        </div>
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
          <h2 className="text-xl font-semibold text-gray-800">Payment List</h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all w-full sm:w-64">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search payments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2 bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table & Loader */}
        {loading && payments.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2 text-sm">Loading transactions list...</p>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <CreditCard size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium">No payment transactions found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-55 border-b text-gray-700 bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">#</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Razorpay Order ID</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Payment ID</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Order ID</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Amount</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredPayments.map((payment, idx) => (
                  <tr key={payment.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="p-4 text-sm text-gray-600">{idx + 1}</td>
                    
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                          <UserIcon size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-gray-800 capitalize">
                            {payment.Order?.User?.username || "Guest"}
                          </p>
                          <p className="text-xs text-gray-400">{payment.Order?.User?.email || "-"}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-4 text-sm text-gray-600 font-medium">{payment.razorpayOrderId || "-"}</td>
                    <td className="p-4 text-sm text-gray-600 font-medium">{payment.razorpayPaymentId || "-"}</td>
                    <td className="p-4 text-sm text-gray-600 font-semibold">#{payment.orderId || "-"}</td>
                    <td className="p-4 text-sm font-bold text-gray-900">
                      ₹{Number(payment.amount).toLocaleString("en-IN")}
                    </td>

                    <td className="p-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-bold ${
                          payment.status === "completed"
                            ? "bg-green-50 text-green-700 border border-green-200"
                            : payment.status === "pending"
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            : "bg-red-50 text-red-700 border border-red-200"
                        }`}
                      >
                        {payment.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => setDeleteConfirmId(payment.id)}
                          className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors shadow flex items-center justify-center"
                          title="Delete Transaction"
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

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border p-6 text-center">
            <Trash2 size={40} className="mx-auto text-red-500 mb-3 animate-bounce" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">Delete Transaction</h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this payment transaction? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-5 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-semibold text-gray-700 transition-colors"
              >
                No, Cancel
              </button>
              <button
                onClick={() => handleDeletePayment(deleteConfirmId)}
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

export default PaymentsPage;
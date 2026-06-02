import { useEffect, useState } from "react";
import api from "../services/api";
import { CATEGORY_API } from "../repo/Apis";
import { Link } from "react-router-dom";
import {
  ShoppingCart,
  Package,
  Users,
  CreditCard,
  TrendingUp,
  AlertTriangle,
  ArrowUpRight,
  ShieldAlert,
  Loader2,
  Settings,
  PlusCircle,
  FolderPlus
} from "lucide-react";

const DashboardContent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dashboardData, setDashboardData] = useState({
    orders: [],
    products: [],
    users: [],
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      setError("");
      try {
        const token = localStorage.getItem("token");
        const headers = { Authorization: `Bearer ${token}` };

        // Fetch orders, products, and users concurrently
        const [ordersRes, productsRes, usersRes] = await Promise.all([
          api.get(`${CATEGORY_API}/orderstatus`, { headers }),
          api.get(`${CATEGORY_API}/products`, { headers }),
          api.get(`${CATEGORY_API}/auth/all-users`, { headers }),
        ]);

        setDashboardData({
          orders: ordersRes.data?.orders || [],
          products: productsRes.data?.products || [],
          users: Array.isArray(usersRes.data) ? usersRes.data : [],
        });
      } catch (err) {
        console.error("Dashboard fetch error:", err);
        setError(
          err.response?.data?.message ||
          "Access denied. Please ensure you are logged in as an Admin."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600 w-10 h-10 mb-4" />
        <p className="text-gray-500 font-semibold text-sm">Aggregating real-time stats...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-12 bg-white rounded-2xl border border-red-100 shadow-md p-8 text-center flex flex-col items-center">
        <div className="bg-red-50 text-red-600 p-4 rounded-full mb-4">
          <ShieldAlert size={48} />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Admin Authorization Failed</h2>
        <p className="text-sm text-gray-500 mb-6 leading-relaxed">
          {error} Verify you have signed in using your Administrator credentials (`admin@gmail.com`).
        </p>
        <Link
          to="/admin/login"
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-2.5 rounded-xl shadow transition-all duration-200"
        >
          Sign In as Admin
        </Link>
      </div>
    );
  }

  const { orders, products: allProducts, users } = dashboardData;

  // Process statistics
  const totalOrdersCount = orders.length;
  const pendingOrders = orders.filter((o) => o.status === "pending");
  const completedOrders = orders.filter((o) => o.status === "completed");
  const cancelledOrders = orders.filter((o) => o.status === "cancelled");

  // Sum completed orders for actual realized earnings
  const totalEarnings = completedOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  // Identify low stock items (quantity <= 10)
  const lowStockItems = allProducts.filter((p) => Number(p.quantity) <= 10).slice(0, 5);

  // Display top 5 latest orders
  const recentOrdersList = orders.slice(0, 5);

  return (
    <div className="min-h-full bg-gray-50/50 p-6 font-sans">
      
      {/* Top Greeting Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            Hi, Admin Panel
          </h1>
          <p className="text-sm text-slate-500 font-medium mt-1">
            Overview of store inventory, registrations, and transactions.
          </p>
        </div>
        <div className="text-xs font-bold text-slate-600 bg-white border border-slate-200 px-4 py-2.5 rounded-xl shadow-sm flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          Live Database Connection
        </div>
      </div>

      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        
        {/* Earnings Card */}
        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-2xl p-6 shadow-md relative overflow-hidden group hover:scale-[1.01] transition-transform duration-300">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl pointer-events-none translate-x-8 -translate-y-8 group-hover:scale-110 transition-transform" />
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-blue-100">Total Earnings</span>
            <span className="p-2.5 bg-white/10 rounded-xl text-white">
              <TrendingUp size={20} />
            </span>
          </div>
          <h3 className="text-3xl font-extrabold tracking-tight">
            ₹{totalEarnings.toLocaleString("en-IN")}
          </h3>
          <p className="text-xs text-blue-100 font-semibold mt-2 flex items-center gap-1">
            <span>From {completedOrders.length} completed orders</span>
          </p>
        </div>

        {/* Total Orders Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-slate-500">Orders Status</span>
            <span className="p-2.5 bg-orange-50 text-orange-600 rounded-xl">
              <ShoppingCart size={20} />
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {totalOrdersCount}
          </h3>
          <div className="text-xs font-semibold text-slate-500 mt-2 flex items-center gap-1.5 flex-wrap">
            <span className="text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">{pendingOrders.length} Pending</span>
            <span className="text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">{completedOrders.length} Done</span>
            <span className="text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">{cancelledOrders.length} Cancelled</span>
          </div>
        </div>

        {/* Total Products Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-slate-500">Total Products</span>
            <span className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
              <Package size={20} />
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {allProducts.length}
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-2">
            Active items in store catalog
          </p>
        </div>

        {/* Total Users Card */}
        <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-semibold text-slate-500">Registered Users</span>
            <span className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
              <Users size={20} />
            </span>
          </div>
          <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">
            {users.length}
          </h3>
          <p className="text-xs text-slate-400 font-semibold mt-2">
            Registered buyer accounts
          </p>
        </div>

      </div>

      {/* Main Body Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Span: Recent Orders List */}
        <div className="lg:col-span-2 bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-slate-900">Recent Orders</h2>
                <p className="text-xs text-slate-500 mt-0.5">Latest 5 sales invoices</p>
              </div>
              <Link
                to="/admin/order-status"
                className="text-xs font-bold text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-0.5"
              >
                Manage Orders
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {recentOrdersList.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="pb-3">Order</th>
                      <th className="pb-3">Buyer</th>
                      <th className="pb-3">Date</th>
                      <th className="pb-3">Total</th>
                      <th className="pb-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {recentOrdersList.map((ord) => (
                      <tr key={ord.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-3 font-semibold text-slate-800">
                          #{ord.id}
                        </td>
                        <td className="py-3 text-slate-600 font-medium">
                          {ord.User?.username || "Guest User"}
                        </td>
                        <td className="py-3 text-slate-400 text-xs font-medium">
                          {new Date(ord.createdAt).toLocaleDateString("en-IN", {
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit"
                          })}
                        </td>
                        <td className="py-3 font-bold text-slate-800">
                          ₹{Number(ord.totalPrice).toLocaleString("en-IN")}
                        </td>
                        <td className="py-3 text-right">
                          <span
                            className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                              ord.status === "completed"
                                ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                                : ord.status === "pending"
                                ? "bg-amber-50 border-amber-100 text-amber-700"
                                : "bg-red-50 border-red-100 text-red-700"
                            }`}
                          >
                            {ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-400 font-medium text-sm">
                No orders received in the system yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Span: Low Stock and Quick Actions */}
        <div className="space-y-8 col-span-1">
          
          {/* Low Stock Alerts */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <AlertTriangle className="text-amber-500 w-5 h-5" />
              Low Stock Warnings
            </h2>
            <p className="text-xs text-slate-500 mb-4 font-medium">Restock items running out of inventory</p>

            {lowStockItems.length > 0 ? (
              <div className="space-y-3.5">
                {lowStockItems.map((item) => (
                  <Link
                    key={item.id}
                    to={`/admin/products/edit/${item.id}`}
                    className="flex justify-between items-center p-3 rounded-xl border border-slate-100 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-200 transition-all group"
                  >
                    <div className="flex flex-col gap-0.5 truncate max-w-[70%]">
                      <span className="text-xs font-bold text-slate-700 truncate group-hover:text-blue-600 transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider">
                        SKU ID: {item.id}
                      </span>
                    </div>
                    <span className="text-xs font-extrabold text-red-600 bg-red-50 border border-red-100 px-2 py-0.5 rounded-full shrink-0">
                      {item.quantity} left
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 text-center text-xs font-bold text-emerald-600 bg-emerald-50 rounded-xl border border-emerald-100">
                Excellent! All items are fully stocked.
              </div>
            )}
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 mb-1 flex items-center gap-2">
              <Settings className="text-slate-500 w-5 h-5" />
              Quick Shortcuts
            </h2>
            <p className="text-xs text-slate-500 mb-4 font-medium">Quick links to inventory operations</p>
            
            <div className="grid grid-cols-2 gap-3">
              <Link
                to="/admin/products/add"
                className="flex flex-col items-center text-center p-4 rounded-xl border border-slate-100 hover:border-blue-500 hover:bg-blue-50/10 transition-all gap-2 group"
              >
                <PlusCircle className="text-blue-500 group-hover:scale-105 transition-transform" size={24} />
                <span className="text-xs font-bold text-slate-700">Add Product</span>
              </Link>
              <Link
                to="/admin/categories/add"
                className="flex flex-col items-center text-center p-4 rounded-xl border border-slate-100 hover:border-indigo-500 hover:bg-indigo-50/10 transition-all gap-2 group"
              >
                <FolderPlus className="text-indigo-500 group-hover:scale-105 transition-transform" size={24} />
                <span className="text-xs font-bold text-slate-700">Add Category</span>
              </Link>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};

export default DashboardContent;

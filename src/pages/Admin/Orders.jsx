import { useState, useEffect } from "react";
import api from "../../services/api";
import { CATEGORY_API } from "../../repo/Apis";
import { Trash2, Search, Package, MapPin, User as UserIcon } from "lucide-react";

const OrdersPage = () => {
  const [orders, setOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchOrders = async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`${CATEGORY_API}/orderstatus`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (response.data && Array.isArray(response.data.orders)) {
        setOrders(response.data.orders);
      } else {
        setOrders([]);
      }
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load customer orders from database.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    const handleNewOrder = (event) => {
      const { order } = event.detail;
      if (order) {
        setOrders((prevOrders) => {
          // Prevent duplicates if list is refreshed concurrently
          if (prevOrders.some((o) => o.id === order.id)) {
            return prevOrders;
          }
          return [order, ...prevOrders];
        });
      }
    };

    window.addEventListener("new-order-alert", handleNewOrder);
    return () => {
      window.removeEventListener("new-order-alert", handleNewOrder);
    };
  }, []);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const token = localStorage.getItem("token");
      await api.put(
        `${CATEGORY_API}/orderstatus/${orderId}`,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      // Update state locally for instant UI response, or fetch again
      setOrders((prevOrders) =>
        prevOrders.map((ord) =>
          ord.id === orderId ? { ...ord, status: newStatus } : ord
        )
      );
    } catch (err) {
      console.error("Error updating order status:", err);
      alert("Failed to update order status.");
      fetchOrders();
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to delete this order?")) return;
    try {
      const token = localStorage.getItem("token");
      await api.delete(`${CATEGORY_API}/orderstatus/${orderId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setOrders((prevOrders) => prevOrders.filter((ord) => ord.id !== orderId));
    } catch (err) {
      console.error("Error deleting order:", err);
      alert("Failed to delete order.");
    }
  };

  // Filter list based on search query
  const filteredOrders = orders.filter((order) => {
    const username = order.User?.username?.toLowerCase() || "";
    const email = order.User?.email?.toLowerCase() || "";
    const address = order.address?.toLowerCase() || "";
    const status = order.status?.toLowerCase() || "";
    const productsStr = order.OrderItems
      ? order.OrderItems.map((item) => item.Product?.name || "").join(" ").toLowerCase()
      : "";

    const query = searchQuery.toLowerCase();
    return (
      username.includes(query) ||
      email.includes(query) ||
      address.includes(query) ||
      status.includes(query) ||
      productsStr.includes(query)
    );
  });

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Orders</h1>
          <p className="text-gray-500">Manage all customer orders and statuses</p>
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
          <h2 className="text-xl font-semibold text-gray-800">Order List</h2>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all w-full sm:w-64">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search orders..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="ml-2 bg-transparent outline-none w-full text-sm"
              />
            </div>
          </div>
        </div>

        {/* Table & Loader */}
        {loading && orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-500 mt-2 text-sm">Loading orders list...</p>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Package size={40} className="mx-auto text-gray-300 mb-2" />
            <p className="text-sm font-medium">No orders found.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b text-gray-700">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider"># ID</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Customer</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Items Ordered</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Total Price</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Shipping Address</th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">Status</th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredOrders.map((order) => {
                  const totalQty = order.OrderItems
                    ? order.OrderItems.reduce((sum, item) => sum + item.quantity, 0)
                    : 0;

                  return (
                    <tr key={order.id} className="hover:bg-gray-55/50 hover:bg-gray-50/50 transition-colors">
                      <td className="p-4 text-sm font-semibold text-gray-700">#{order.id}</td>
                      
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
                            <UserIcon size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 capitalize">
                              {order.User?.username || "Guest"}
                            </p>
                            <p className="text-xs text-gray-400">{order.User?.email || "-"}</p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-1">
                          {order.OrderItems && order.OrderItems.length > 0 ? (
                            order.OrderItems.map((item) => (
                              <div key={item.id} className="text-xs text-gray-600 flex items-center gap-1.5">
                                <span className="font-semibold text-gray-800">{item.Product?.name || "Product"}</span>
                                <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.2 rounded-full font-medium">
                                  x{item.quantity}
                                </span>
                              </div>
                            ))
                          ) : (
                            <span className="text-xs text-gray-400">N/A</span>
                          )}
                          {totalQty > 1 && (
                            <p className="text-[10px] text-gray-400 font-medium pt-1">
                              Total items: {totalQty}
                            </p>
                          )}
                        </div>
                      </td>

                      <td className="p-4 text-sm font-bold text-gray-900">
                        ₹{Number(order.totalPrice).toLocaleString("en-IN")}
                      </td>

                      <td className="p-4">
                        <div className="flex items-start gap-1 max-w-[200px]">
                          <MapPin size={14} className="text-gray-400 shrink-0 mt-0.5" />
                          <span className="text-xs text-gray-600 line-clamp-2 leading-relaxed">
                            {order.address}
                          </span>
                        </div>
                      </td>

                      <td className="p-4">
                        <select
                          value={order.status}
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className={`px-3 py-1 rounded-full text-xs font-bold focus:outline-none border cursor-pointer ${
                            order.status === "completed" || order.status === "delivered"
                              ? "bg-green-50 text-green-700 border-green-200"
                              : order.status === "pending"
                              ? "bg-yellow-50 text-yellow-700 border-yellow-200"
                              : order.status === "cancelled"
                              ? "bg-red-50 text-red-700 border-red-200"
                              : order.status === "packing"
                              ? "bg-purple-50 text-purple-700 border-purple-200"
                              : order.status === "shipping"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : "bg-gray-50 text-gray-700 border-gray-200"
                          }`}
                        >
                          <option value="pending">Pending</option>
                          <option value="packing">Packing</option>
                          <option value="shipping">Shipping</option>
                          <option value="delivered">Delivered</option>
                          <option value="completed">Completed</option>
                          <option value="cancelled">Cancelled</option>
                        </select>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleDeleteOrder(order.id)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded-lg transition-colors shadow flex items-center justify-center"
                            title="Delete Order"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrdersPage;
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/api";
import { AUTH_API } from "../../repo/Apis";
import { Edit, Trash2, Search, Plus, Trash } from "lucide-react";

const UsersPage = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [brokenImages, setBrokenImages] = useState({});

  const getUserImageUrl = (image) => {
    if (!image) return "";
    if (image.startsWith("http")) return image;

    const baseURL = AUTH_API.replace("/auth", "");
    const normalized = image.startsWith("/") ? image : `/${image}`;

    if (normalized.startsWith("/uploads")) {
      return `${baseURL}${normalized}`;
    }

    return `${baseURL}/uploads${normalized}`;
  };

  // Fetch Users from Database
  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const response = await api.get(`${AUTH_API}/all-users`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setUsers(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError("Failed to load user list from database.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const loadUsers = async () => {
      await fetchUsers();
    };

    loadUsers();
  }, [fetchUsers]);

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem("token");
      await api.delete(`${AUTH_API}/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setDeleteConfirmId(null);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user:", err);
      setError("Failed to delete user.");
    }
  };

  // Filter list based on search query
  const filteredUsers = users.filter((user) => {
    return (
      user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.phone && user.phone.includes(searchQuery))
    );
  });

  return (
    <div className="min-h-full bg-gray-100 p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Users</h1>
          <p className="text-gray-500">Manage all registered users</p>
        </div>

        <button
          onClick={() => navigate("/admin/users/add")}
          className="bg-blue-600 text-white px-5 py-2 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors shadow"
        >
          <Plus size={18} />
          Add User
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
        <div className="flex justify-between items-center p-5 border-b">
          <h2 className="text-xl font-semibold text-gray-800">User List</h2>

          <div className="flex items-center gap-3">
            <div className="flex items-center border rounded-lg px-3 py-2 bg-gray-50 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500 transition-all">
              <Search size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search users..."
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
            <p className="text-gray-500 mt-2 text-sm">Loading user list...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 text-gray-700 border-b">
                <tr>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">
                    #
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Image
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Username
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Email
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Role
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="p-4 text-left text-xs font-semibold uppercase tracking-wider">
                    Status
                  </th>
                  <th className="p-4 text-center text-xs font-semibold uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-200">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr
                      key={user.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="p-4 text-sm text-gray-600">{index + 1}</td>

                      <td className="p-4">
                        {user.image && !brokenImages[user.id] ? (
                          <img
                            src={getUserImageUrl(user.image)}
                            alt={user.username}
                            className="w-10 h-10 rounded-full object-cover border"
                            onError={() =>
                              setBrokenImages((prev) => ({
                                ...prev,
                                [user.id]: true,
                              }))
                            }
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-semibold border uppercase text-sm">
                            {user.username ? user.username.charAt(0) : "?"}
                          </div>
                        )}
                      </td>

                      <td className="p-4 text-sm font-semibold text-gray-800">
                        {user.username}
                      </td>
                      <td className="p-4 text-sm text-gray-600">
                        {user.email}
                      </td>

                      <td className="p-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.role === "admin"
                              ? "bg-purple-100 text-purple-700"
                              : "bg-blue-100 text-blue-700"
                          }`}
                        >
                          {user.role}
                        </span>
                      </td>

                      <td className="p-4 text-sm text-gray-600">
                        {user.phone || "-"}
                      </td>

                      <td className="p-4 text-sm">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            user.is_active !== false
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {user.is_active !== false ? "active" : "inactive"}
                        </span>
                      </td>

                      <td className="p-4">
                        <div className="flex justify-center gap-3">
                          <button
                            onClick={() => navigate(`/admin/users/edit/${user.id}`)}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded-lg transition-colors shadow flex items-center justify-center"
                            title="Edit"
                          >
                            <Edit size={16} />
                          </button>

                          <button
                            onClick={() => setDeleteConfirmId(user.id)}
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
                    <td colSpan="8" className="text-center p-8 text-gray-500">
                      No users found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal (No backdrop blur) */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-sm overflow-hidden border p-6 text-center">
            <Trash
              size={40}
              className="mx-auto text-red-500 mb-3 animate-bounce"
            />
            <h3 className="text-lg font-bold text-gray-800 mb-1">
              Delete User
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Are you sure you want to delete this user? This action cannot be
              undone.
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

export default UsersPage;

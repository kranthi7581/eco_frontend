import { useEffect, useState } from "react";
import api from "../services/api";
import { AUTH_API } from "../repo/Apis";
import { useNavigate, useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  MapPin,
  Lock,
  User,
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
} from "lucide-react";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Section 1: User Details State
  const [detailsForm, setDetailsForm] = useState({
    username: "",
    email: "",
    phone: "",
    role: "user",
    is_active: true,
  });
  const [imageFile, setImageFile] = useState(null);
  const [existingImage, setExistingImage] = useState("");
  const [previewUrl, setPreviewUrl] = useState("");
  const [detailsSaving, setDetailsSaving] = useState(false);

  // Section 2: Address State
  const [addresses, setAddresses] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState(null);
  const [addressForm, setAddressForm] = useState({
    label: "",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
  });
  const [addressSaving, setAddressSaving] = useState(false);

  // Section 3: Password State
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordSaving, setPasswordSaving] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  const token = localStorage.getItem("token");

  // Fetch all user data (Details + Addresses) on mount
  useEffect(() => {
    fetchUserDetails();
    fetchUserAddresses();
  }, [id]);

  const fetchUserDetails = async () => {
    setLoading(true);
    setGeneralError("");
    try {
      const response = await api.get(`${AUTH_API}/user/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        const u = response.data;
        setDetailsForm({
          username: u.username || "",
          email: u.email || "",
          phone: u.phone || "",
          role: u.role || "user",
          is_active: u.is_active !== false,
        });
        setExistingImage(u.image || "");
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
      setGeneralError("Failed to load user profile details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUserAddresses = async () => {
    setAddressLoading(true);
    try {
      const response = await api.get(`${AUTH_API.replace("/auth", "")}/address?userId=${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data && response.data.addresses) {
        setAddresses(response.data.addresses);
      }
    } catch (err) {
      console.error("Error fetching addresses:", err);
    } finally {
      setAddressLoading(false);
    }
  };

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

  // Section 1 Handler: User Details Submit
  const handleDetailsSubmit = async (e) => {
    e.preventDefault();
    setDetailsSaving(true);
    setGeneralError("");
    setSuccessMsg("");

    try {
      const data = new FormData();
      data.append("username", detailsForm.username);
      data.append("email", detailsForm.email);
      data.append("phone", detailsForm.phone);
      data.append("role", detailsForm.role);
      data.append("is_active", detailsForm.is_active);
      
      if (imageFile) {
        data.append("image", imageFile);
      }

      const res = await api.put(`${AUTH_API}/user/${id}`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data && res.data.user) {
        setDetailsForm({
          username: res.data.user.username || "",
          email: res.data.user.email || "",
          phone: res.data.user.phone || "",
          role: res.data.user.role || "user",
          is_active: res.data.user.is_active !== false,
        });
        setExistingImage(res.data.user.image || "");
        setImageFile(null);
        setPreviewUrl("");
        showNotification("User profile details updated successfully!");

        // If the edited user is the current logged-in user, sync localStorage
        const loggedUserStr = localStorage.getItem("user");
        if (loggedUserStr) {
          const loggedUser = JSON.parse(loggedUserStr);
          if (loggedUser.id === parseInt(id)) {
            localStorage.setItem("user", JSON.stringify(res.data.user));
          }
        }
      }
    } catch (err) {
      console.error("Error updating user details:", err);
      setGeneralError(err.response?.data?.message || "Failed to update user details.");
    } finally {
      setDetailsSaving(false);
    }
  };

  // Section 2 Handler: Address Submit (Create / Update)
  const handleAddressSubmit = async (e) => {
    e.preventDefault();
    setAddressSaving(true);
    setGeneralError("");
    setSuccessMsg("");

    try {
      const payload = {
        ...addressForm,
        userId: parseInt(id),
      };

      if (editingAddressId) {
        // Update existing address
        await api.put(
          `${AUTH_API.replace("/auth", "")}/address/${editingAddressId}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification("Address updated successfully!");
      } else {
        // Create new address
        await api.post(
          `${AUTH_API.replace("/auth", "")}/address`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        showNotification("Address added successfully!");
      }

      // Reset address form
      setAddressForm({
        label: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
      });
      setEditingAddressId(null);
      fetchUserAddresses();
    } catch (err) {
      console.error("Error saving address:", err);
      setGeneralError(err.response?.data?.message || "Failed to save address.");
    } finally {
      setAddressSaving(false);
    }
  };

  const handleEditAddressClick = (addr) => {
    setEditingAddressId(addr.id);
    setAddressForm({
      label: addr.label || "",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      country: addr.country || "India",
    });
  };

  const handleDeleteAddress = async (addrId) => {
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    
    try {
      await api.delete(`${AUTH_API.replace("/auth", "")}/address/${addrId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      showNotification("Address deleted successfully!");
      fetchUserAddresses();
      if (editingAddressId === addrId) {
        // Clear address form if we were editing it
        setEditingAddressId(null);
        setAddressForm({
          label: "",
          line1: "",
          line2: "",
          city: "",
          state: "",
          pincode: "",
          country: "India",
        });
      }
    } catch (err) {
      console.error("Error deleting address:", err);
      setGeneralError("Failed to delete address.");
    }
  };

  // Section 3 Handler: Password Change
  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setGeneralError("");
    setSuccessMsg("");

    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (passwordForm.password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setPasswordSaving(true);
    try {
      await api.put(
        `${AUTH_API}/user/${id}`,
        { password: passwordForm.password },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showNotification("Password updated successfully!");
      setPasswordForm({ password: "", confirmPassword: "" });
    } catch (err) {
      console.error("Error updating password:", err);
      setPasswordError(err.response?.data?.message || "Failed to update password.");
    } finally {
      setPasswordSaving(false);
    }
  };

  const showNotification = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => {
      setSuccessMsg("");
    }, 4000);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50/50 pb-20">
      
      {/* Page Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link
          to="/admin/users"
          className="p-2 bg-white rounded-lg border hover:bg-gray-50 transition-colors shadow-sm"
        >
          <ArrowLeft size={20} className="text-gray-600" />
        </Link>
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            Edit User Profile
          </h1>
          <p className="text-sm text-gray-500">Manage account information, address list, and credentials</p>
        </div>
      </div>

      {/* Global Alerts */}
      {generalError && (
        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-700 text-sm shadow-sm flex items-center gap-2">
          <span>{generalError}</span>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg text-green-700 text-sm shadow-sm flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={18} className="shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {loading ? (
        <div className="text-center py-20 bg-white rounded-2xl shadow border p-8">
          <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600"></div>
          <p className="text-gray-500 mt-4 text-sm font-medium">Loading user details...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Top - Section 1: User Details Form */}
          <div className="lg:col-span-2 space-y-8">
            <form
              onSubmit={handleDetailsSubmit}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8 space-y-6"
            >
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                  <User size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Account Details</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Inputs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      required
                      value={detailsForm.username}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                      onChange={(e) =>
                        setDetailsForm({ ...detailsForm, username: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={detailsForm.email}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                      onChange={(e) =>
                        setDetailsForm({ ...detailsForm, email: e.target.value })
                      }
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={detailsForm.phone}
                      className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                      placeholder="e.g. 9876543210"
                      onChange={(e) =>
                        setDetailsForm({ ...detailsForm, phone: e.target.value })
                      }
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Account Role
                      </label>
                      <select
                        value={detailsForm.role}
                        className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                        onChange={(e) =>
                          setDetailsForm({ ...detailsForm, role: e.target.value })
                        }
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Status
                      </label>
                      <select
                        value={detailsForm.is_active ? "active" : "inactive"}
                        className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm"
                        onChange={(e) =>
                          setDetailsForm({
                            ...detailsForm,
                            is_active: e.target.value === "active",
                          })
                        }
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Avatar Image Uploader */}
                <div className="flex flex-col items-center justify-center border border-dashed border-gray-300 rounded-xl p-6 bg-gray-50/50 hover:bg-gray-50 transition-colors">
                  <span className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-4 self-start">
                    Profile Photo
                  </span>

                  <div className="relative w-36 h-36 rounded-full overflow-hidden border shadow-sm bg-white flex items-center justify-center mb-4 ring-4 ring-gray-100">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                    ) : existingImage ? (
                      <img
                        src={getUserImageUrl(existingImage)}
                        alt="Profile avatar"
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-400">
                        <ImageIcon size={36} className="mb-1" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider">No Photo</span>
                      </div>
                    )}
                  </div>

                  <label className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 text-xs font-bold text-gray-700 cursor-pointer transition-all hover:scale-[1.02]">
                    <Upload size={14} />
                    Choose Image
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageChange}
                    />
                  </label>
                  <span className="text-[10px] text-gray-400 mt-2">PNG, JPG or JPEG up to 5MB</span>
                </div>
              </div>

              {/* Submit Details Button */}
              <div className="flex justify-end pt-4 border-t">
                <button
                  type="submit"
                  disabled={detailsSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-all shadow hover:shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Save size={16} />
                  {detailsSaving ? "Saving Details..." : "Save Account Details"}
                </button>
              </div>
            </form>

            {/* Section 2: User Address Section */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
                  <MapPin size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">User Addresses</h2>
              </div>

              {/* Grid: Address List and Address Form side-by-side */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* List of current addresses */}
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wider">Saved Addresses</h3>
                  
                  {addressLoading ? (
                    <div className="text-center py-8">
                      <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
                    </div>
                  ) : addresses.length === 0 ? (
                    <div className="text-center py-10 bg-gray-50 border rounded-xl p-4 text-gray-400 text-sm">
                      No addresses saved for this user.
                    </div>
                  ) : (
                    <div className="space-y-3 max-h-[360px] overflow-y-auto pr-2">
                      {addresses.map((addr) => (
                        <div
                          key={addr.id}
                          className={`p-4 rounded-xl border transition-all ${
                            editingAddressId === addr.id
                              ? "border-purple-500 bg-purple-50/20 ring-1 ring-purple-400"
                              : "border-gray-200 bg-white hover:border-gray-300"
                          }`}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="inline-block px-2.5 py-0.5 bg-purple-100 text-purple-700 text-xs font-bold rounded-full capitalize">
                              {addr.label || "Address"}
                            </span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditAddressClick(addr)}
                                className="p-1 hover:bg-gray-100 text-gray-500 rounded transition-colors"
                                title="Edit Address"
                              >
                                <Edit size={14} />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeleteAddress(addr.id)}
                                className="p-1 hover:bg-red-50 text-red-500 rounded transition-colors"
                                title="Delete Address"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                          <div className="text-xs text-gray-600 space-y-0.5 leading-relaxed">
                            <p className="font-semibold text-gray-800">{addr.line1}</p>
                            {addr.line2 && <p>{addr.line2}</p>}
                            <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                            <p className="text-gray-400 font-medium">{addr.country}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Add/Edit Address Form */}
                <form onSubmit={handleAddressSubmit} className="space-y-4 bg-gray-50/50 p-4 rounded-xl border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-700 uppercase tracking-wider flex items-center justify-between">
                    <span>{editingAddressId ? "Edit Address Details" : "Add New Address"}</span>
                    {editingAddressId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingAddressId(null);
                          setAddressForm({
                            label: "",
                            line1: "",
                            line2: "",
                            city: "",
                            state: "",
                            pincode: "",
                            country: "India",
                          });
                        }}
                        className="text-[11px] font-bold text-red-500 hover:underline"
                      >
                        Cancel Edit
                      </button>
                    )}
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Label (e.g. Home, Work)</label>
                      <input
                        type="text"
                        placeholder="e.g. Home, Work, Office"
                        required
                        value={addressForm.label}
                        onChange={(e) => setAddressForm({ ...addressForm, label: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Address Line 1</label>
                      <input
                        type="text"
                        required
                        value={addressForm.line1}
                        onChange={(e) => setAddressForm({ ...addressForm, line1: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Address Line 2</label>
                      <input
                        type="text"
                        value={addressForm.line2}
                        onChange={(e) => setAddressForm({ ...addressForm, line2: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={addressForm.city}
                        onChange={(e) => setAddressForm({ ...addressForm, city: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">State</label>
                      <input
                        type="text"
                        required
                        value={addressForm.state}
                        onChange={(e) => setAddressForm({ ...addressForm, state: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Pincode</label>
                      <input
                        type="text"
                        required
                        value={addressForm.pincode}
                        onChange={(e) => setAddressForm({ ...addressForm, pincode: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Country</label>
                      <input
                        type="text"
                        required
                        value={addressForm.country}
                        onChange={(e) => setAddressForm({ ...addressForm, country: e.target.value })}
                        className="w-full border border-gray-300 px-3 py-2 rounded-lg text-xs focus:ring-2 focus:ring-purple-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={addressSaving}
                    className="w-full flex items-center justify-center gap-1.5 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-lg text-xs transition-colors shadow disabled:opacity-50 mt-2"
                  >
                    <Plus size={14} />
                    {addressSaving ? "Saving Address..." : editingAddressId ? "Update Address" : "Add Address"}
                  </button>
                </form>

              </div>
            </div>
          </div>

          {/* Right - Section 3: User Password Changing Form */}
          <div className="space-y-6">
            <form
              onSubmit={handlePasswordSubmit}
              className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8 space-y-6"
            >
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Change Password</h2>
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-lg font-medium">
                  {passwordError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    New Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter new password"
                    value={passwordForm.password}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm"
                    onChange={(e) =>
                      setPasswordForm({ ...passwordForm, password: e.target.value })
                    }
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Confirm new password"
                    value={passwordForm.confirmPassword}
                    className="w-full border border-gray-300 px-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 transition-all text-sm"
                    onChange={(e) =>
                      setPasswordForm({
                        ...passwordForm,
                        confirmPassword: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <button
                  type="submit"
                  disabled={passwordSaving}
                  className="w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-lg text-sm transition-all shadow hover:shadow-md active:scale-95 disabled:opacity-50"
                >
                  <Lock size={16} />
                  {passwordSaving ? "Updating Password..." : "Update Password"}
                </button>
              </div>
            </form>
          </div>

        </div>
      )}
    </div>
  );
};

export default EditUser;

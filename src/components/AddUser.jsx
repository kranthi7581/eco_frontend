import { useState } from "react";
import api from "../services/api";
import { AUTH_API } from "../repo/Apis";
import { useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Upload,
  Image as ImageIcon,
  MapPin,
  Lock,
  User,
  CheckCircle2,
} from "lucide-react";

const AddUser = () => {
  const navigate = useNavigate();

  // Loading & Error states
  const [loading, setLoading] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  // Form Fields State
  const [detailsForm, setDetailsForm] = useState({
    username: "",
    email: "",
    phone: "",
    role: "user",
    is_active: true,
  });
  
  // Password State
  const [passwordForm, setPasswordForm] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordError, setPasswordError] = useState("");

  // Avatar State
  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState("");

  const token = localStorage.getItem("token");

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");
    setPasswordError("");
    setSuccessMsg("");

    // Validate Passwords match
    if (passwordForm.password !== passwordForm.confirmPassword) {
      setPasswordError("Passwords do not match.");
      return;
    }

    if (passwordForm.password.length < 6) {
      setPasswordError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      const data = new FormData();
      data.append("username", detailsForm.username);
      data.append("email", detailsForm.email);
      data.append("phone", detailsForm.phone);
      data.append("role", detailsForm.role);
      data.append("is_active", detailsForm.is_active);
      data.append("password", passwordForm.password);
      
      if (imageFile) {
        data.append("image", imageFile);
      }

      const res = await api.post(`${AUTH_API}/user`, data, {
        headers: {
          "Content-Type": "multipart/form-data",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data && res.data.user) {
        setSuccessMsg("User profile created successfully!");
        setTimeout(() => {
          navigate("/admin/users");
        }, 1500);
      }
    } catch (err) {
      console.error("Error creating user:", err);
      setGeneralError(err.response?.data?.message || err.response?.data?.error || "Failed to create user profile.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-55/50 bg-gray-50/50 pb-20">
      
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
            Create User Profile
          </h1>
          <p className="text-sm text-gray-500">Provide account details, phone number, role, status, and credentials</p>
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

      <form onSubmit={handleFormSubmit} className="space-y-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left / Top - Section 1: User Details Fields */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8 space-y-6">
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
                      placeholder="e.g. johndoe"
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
                      placeholder="e.g. john@example.com"
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
            </div>
          </div>

          {/* Right - Section 2: Account Password Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8 space-y-6">
              <div className="flex items-center gap-3 border-b pb-4">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg">
                  <Lock size={20} />
                </div>
                <h2 className="text-xl font-bold text-gray-800">Account Password</h2>
              </div>

              {passwordError && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-r-lg font-medium">
                  {passwordError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    placeholder="Enter password"
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
                    placeholder="Confirm password"
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
            </div>
          </div>
        </div>

        {/* Bottom - Section 3: User Address Section (Disabled/Placeholder) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-3 border-b pb-4">
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <MapPin size={20} />
            </div>
            <h2 className="text-xl font-bold text-gray-800">User Addresses</h2>
          </div>

          <div className="p-8 text-center bg-gray-50 border border-dashed border-gray-300 rounded-xl max-w-md mx-auto">
            <MapPin className="mx-auto text-gray-400 mb-3" size={32} />
            <h3 className="text-sm font-bold text-gray-700 mb-1">Addresses Locked</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Shipping addresses can be configured and managed once the user profile has been successfully created.
            </p>
          </div>
        </div>

        {/* Global Save Button */}
        <div className="flex justify-end pt-4 border-t gap-4">
          <Link
            to="/admin/users"
            className="px-6 py-3 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-bold text-gray-700 transition-colors"
          >
            Cancel
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-sm transition-all shadow hover:shadow-md active:scale-95 disabled:opacity-50"
          >
            <Save size={16} />
            {loading ? "Creating Profile..." : "Create User Profile"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddUser;

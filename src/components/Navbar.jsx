import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { AUTH_API } from "../repo/Apis";
import { Bell, Search, UserCircle, User, LogOut, MessageSquare } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [imageError, setImageError] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userStr = localStorage.getItem("user");
        if (!userStr) return;
        const storedUser = JSON.parse(userStr);
        if (!storedUser || !storedUser.id) return;

        // Set initial user details from localStorage
        setCurrentUser(storedUser);

        const token = localStorage.getItem("token");
        const response = await api.get(`${AUTH_API}/user/${storedUser.id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        
        if (response.data) {
          setCurrentUser(response.data);
          // Sync back to localStorage if values changed
          localStorage.setItem("user", JSON.stringify(response.data));
        }
      } catch (err) {
        console.error("Error fetching navbar user profile:", err);
      }
    };

    fetchUserData();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const closeDropdown = () => setDropdownOpen(false);
    window.addEventListener("click", closeDropdown);
    return () => window.removeEventListener("click", closeDropdown);
  }, [dropdownOpen]);

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

  const handleMyProfileClick = () => {
    setDropdownOpen(false);
    if (currentUser?.id) {
      navigate(`/admin/users/edit/${currentUser.id}`);
    }
  };

  const handleLogoutClick = async () => {
    setDropdownOpen(false);
    try {
      const token = localStorage.getItem("token");
      await api.post(`${AUTH_API}/logout`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (err) {
      console.error("Logout API call error:", err);
    } finally {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate("/admin/login");
    }
  };

  const displayName = currentUser?.username
    ? currentUser.username.charAt(0).toUpperCase() + currentUser.username.slice(1)
    : "Admin";

  const displayRole = currentUser?.role === "admin"
    ? "Super Admin"
    : currentUser?.role
    ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1)
    : "Super Admin";

  return (
    <nav className="flex h-[72px] w-full shrink-0 items-center justify-between bg-white px-6 py-4 shadow-md">
      
      {/* Left Side - Title */}
      <div>
        <h1 className="text-2xl font-bold text-gray-800">
          Admin Panel
        </h1>
      </div>

      {/* Right Side - Message + Notification + Profile */}
      <div className="flex items-center gap-6">
        
        {/* Message */}
        <button className="relative transition-transform active:scale-95">
          <MessageSquare size={24} className="text-gray-700 cursor-pointer hover:text-indigo-600 transition-colors" />
          <span className="absolute -top-1 -right-1 bg-indigo-600 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            5
          </span>
        </button>

        {/* Notification */}
        <button className="relative transition-transform active:scale-95">
          <Bell size={24} className="text-gray-700 cursor-pointer hover:text-indigo-600 transition-colors" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
            3
          </span>
        </button>

        {/* Profile */}
        <div className="relative">
          <div
            onClick={(e) => {
              e.stopPropagation();
              setDropdownOpen(!dropdownOpen);
            }}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            {currentUser?.image && !imageError ? (
              <img
                src={getUserImageUrl(currentUser.image)}
                alt={displayName}
                className="w-[35px] h-[35px] rounded-full object-cover border border-gray-300 shadow-sm transition-transform duration-200 active:scale-95"
                onError={() => setImageError(true)}
              />
            ) : (
              <UserCircle size={35} className="text-gray-700 transition-transform duration-200 active:scale-95" />
            )}
            <div>
              <p className="text-sm font-semibold">{displayName}</p>
              <p className="text-xs text-gray-500">{displayRole}</p>
            </div>
          </div>

          {dropdownOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-50 animate-fade-in">
              <button
                onClick={handleMyProfileClick}
                className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
              >
                <User size={16} className="text-gray-500" />
                My profile
              </button>
              <hr className="my-1 border-gray-100" />
              <button
                onClick={handleLogoutClick}
                className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors flex items-center gap-2 font-medium"
              >
                <LogOut size={16} className="text-red-500" />
                Logout
              </button>
            </div>
          )}
        </div>

      </div>
    </nav>
  );
};

export default Navbar;

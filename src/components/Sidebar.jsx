import {
  LayoutDashboard,
  FolderKanban,
  FolderTree,
  Package,
  ClipboardList,
  TicketPercent,
  CreditCard,
  Users,
} from "lucide-react";
import { NavLink } from "react-router-dom";

const AdminSidebar = () => {
  const menuItems = [
    { name: "Dashboard", path: "/admin/dashboard", icon: <LayoutDashboard size={20} /> },
    { name: "Categories", path: "/admin/categories", icon: <FolderKanban size={20} /> },
    { name: "Subcategories", path: "/admin/subcategories", icon: <FolderTree size={20} /> },
    { name: "Products", path: "/admin/products", icon: <Package size={20} /> },
    { name: "Order Status", path: "/admin/order-status", icon: <ClipboardList size={20} /> },
    { name: "Coupons", path: "/admin/coupons", icon: <TicketPercent size={20} /> },
    { name: "Payments", path: "/admin/payments", icon: <CreditCard size={20} /> },
    { name: "Users List", path: "/admin/users", icon: <Users size={20} /> },
  ];

  return (
    <aside className="h-full w-64 shrink-0 overflow-y-auto bg-gray-900 text-white shadow-lg">
      {/* Logo
      <div className="p-6 text-2xl font-bold border-b border-gray-700">
        Admin Panel
      </div> */}

      {/* Menu */}
      <ul className="mt-6 space-y-2 px-4">
        {menuItems.map((item, index) => (
          <li
            key={index}
          >
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-4 py-3 transition-all duration-300 ${
                  isActive ? "bg-blue-600" : "hover:bg-blue-600"
                }`
              }
            >
              {item.icon}
              <span>{item.name}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </aside>
  );
};

export default AdminSidebar;

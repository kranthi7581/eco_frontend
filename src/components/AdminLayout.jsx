import Navbar from "./Navbar";
import AdminSidebar from "./Sidebar";

const AdminLayout = ({ children }) => {
  return (
    <div className="h-screen overflow-hidden bg-gray-100">
      <Navbar />

      <div className="flex h-[calc(100vh-72px)] overflow-hidden">
        <AdminSidebar />

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
};

export default AdminLayout;

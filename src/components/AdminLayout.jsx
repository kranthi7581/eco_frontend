import Navbar from "./Navbar";
import AdminSidebar from "./Sidebar";
import { PusherProvider } from "../context/PusherContext";

const AdminLayout = ({ children }) => {
  return (
    <PusherProvider>
      <div className="h-screen overflow-hidden bg-gray-100">
        <Navbar />

        <div className="flex h-[calc(100vh-72px)] overflow-hidden">
          <AdminSidebar />

          <main className="flex-1 overflow-y-auto">{children}</main>
        </div>
      </div>
    </PusherProvider>
  );
};

export default AdminLayout;

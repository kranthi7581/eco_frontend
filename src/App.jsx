import { useLocation } from "react-router-dom";
import AdminPages from "./routes/AdminRoutes/login.route";
import UserRoutes from "./routes/UserRoutes/user.routes";
import { UserProvider } from "./context/UserContext";
import { SocketProvider } from "./context/SocketContext";

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <UserProvider>
      <SocketProvider>
        <div>
          {isAdminPath ? <AdminPages /> : <UserRoutes />}
        </div>
      </SocketProvider>
    </UserProvider>
  );
}
export default App;

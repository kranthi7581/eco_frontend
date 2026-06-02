import { useLocation } from "react-router-dom";
import AdminPages from "./routes/AdminRoutes/login.route";
import UserRoutes from "./routes/UserRoutes/user.routes";

function App() {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  return (
    <div>
      {isAdminPath ? <AdminPages /> : <UserRoutes />}
    </div>
  );
}
export default App;

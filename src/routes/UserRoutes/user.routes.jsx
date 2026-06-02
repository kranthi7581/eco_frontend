import { Routes, Route, Outlet } from "react-router-dom";
import { UserProvider } from "../../context/UserContext";

// Pages
import Home from "../../pages/User/Home";
import Category from "../../pages/User/Category";
import Subcategories from "../../pages/User/Subcategories";
import ProductsListing from "../../pages/User/ProductsListing";
import ProductDetails from "../../pages/User/ProductDetails";
import Cart from "../../pages/User/Cart";
import Checkout from "../../pages/User/Checkout";
import PaymentSuccess from "../../pages/User/PaymentSuccess";
import Profile from "../../pages/User/Profile";
import AuthPages from "../../pages/User/AuthPages";

// Components
import UserNavbar from "../../components/User/UserNavbar";
import UserFooter from "../../components/User/UserFooter";

const UserLayout = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <UserNavbar />
      <main className="flex-grow">
        <Outlet />
      </main>
      <UserFooter />
    </div>
  );
};

const UserRoutes = () => {
  return (
    <UserProvider>
      <Routes>
        {/* Auth routes without Navbar/Footer */}
        <Route path="/login" element={<AuthPages />} />
        <Route path="/register" element={<AuthPages />} />

        {/* User site routes with Layout */}
        <Route element={<UserLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/category/:categoryId" element={<Category />} />
          <Route path="/subcategories" element={<Subcategories />} />
          <Route path="/subcategory/:subcategoryId" element={<ProductsListing />} />
          <Route path="/products" element={<ProductsListing />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/success" element={<PaymentSuccess />} />
          <Route path="/profile" element={<Profile />} />
        </Route>
      </Routes>
    </UserProvider>
  );
};

export default UserRoutes;

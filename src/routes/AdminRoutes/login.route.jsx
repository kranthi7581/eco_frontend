import LoginPage from "../../pages/Admin/LoginPage";
import Dashboard from "../../pages/Admin/dashbord";
import CategoriesPage from "../../pages/Admin/Categorypage";
import SubcategoriesPage from "../../pages/Admin/Subcategorypage";
import AdminLayout from "../../components/AdminLayout";
import { Route, Routes } from "react-router-dom";
import ProductsPage from "../../pages/Admin/products";
import OrdersPage from "../../pages/Admin/Orders";
import CouponsPage from "../../pages/Admin/Coupons";
import PaymentsPage from "../../pages/Admin/Payments";
import UsersPage from "../../pages/Admin/Userslist";
import AddCategory from "../../components/AddEdit.cat";
import EditCategory from "../../components/Edit.cat";
import AddSubcategory from "../../components/AddSubcategory";
import EditSubcategory from "../../components/EditSubcategory";
import AddProduct from "../../components/AddProduct";
import EditProduct from "../../components/EditProduct";
import EditUser from "../../components/EditUser";
import AddUser from "../../components/AddUser";

const AdminPages = () => {
  return (
    <Routes>
      <Route path="/admin/login" element={<LoginPage />} />
      <Route path="/admin/dashboard" element={<Dashboard />} />
      <Route
        path="/admin/categories"
        element={
          <AdminLayout>
            <CategoriesPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/subcategories"
        element={
          <AdminLayout>
            <SubcategoriesPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/subcategories/add"
        element={
          <AdminLayout>
            <AddSubcategory />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/subcategories/edit/:id"
        element={
          <AdminLayout>
            <EditSubcategory />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminLayout>
            <ProductsPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/products/add"
        element={
          <AdminLayout>
            <AddProduct />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/products/edit/:id"
        element={
          <AdminLayout>
            <EditProduct />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/order-status"
        element={
          <AdminLayout>
            <OrdersPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/coupons"
        element={
          <AdminLayout>
            <CouponsPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/payments"
        element={
          <AdminLayout>
            <PaymentsPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminLayout>
            <UsersPage />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/users/edit/:id"
        element={
          <AdminLayout>
            <EditUser />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/users/add"
        element={
          <AdminLayout>
            <AddUser />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/categories/add"
        element={
          <AdminLayout>
            <AddCategory />
          </AdminLayout>
        }
      />
      <Route
        path="/admin/categories/edit/:id"
        element={
          <AdminLayout>
            <EditCategory />
          </AdminLayout>
        }
      />
    </Routes>
  );
};

export default AdminPages;

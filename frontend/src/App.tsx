import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AdminOnlyOutlet } from "./layout/AdminOnlyOutlet";
import { AppLayout } from "./layout/AppLayout";
import { PublicLayout } from "./layout/PublicLayout";
import { ProtectedRoute } from "./layout/ProtectedRoute";
import { ProfileEditPage } from "./pages/auth/ProfileEditPage";
import { LandingContato } from "./pages/public/LandingContato";
import { LandingHome } from "./pages/public/LandingHome";
import { LandingSobre } from "./pages/public/LandingSobre";
import { LandingVitrine } from "./pages/public/LandingVitrine";
import { ProductPublicDetailPage } from "./pages/public/ProductPublicDetailPage";
import { DashboardHome } from "./pages/DashboardHome";
import { UserListPage } from "./pages/users/UserListPage";
import { UserEditPage } from "./pages/users/UserEditPage";
import { CategoryListPage } from "./pages/categories/CategoryListPage";
import { CategoryNewPage } from "./pages/categories/CategoryNewPage";
import { CategoryEditPage } from "./pages/categories/CategoryEditPage";
import { ProductListPage } from "./pages/products/ProductListPage";
import { ProductNewPage } from "./pages/products/ProductNewPage";
import { ProductEditPage } from "./pages/products/ProductEditPage";
import { OrderListPage } from "./pages/orders/OrderListPage";
import { OrderEditPage } from "./pages/orders/OrderEditPage";
import { CartPage } from "./pages/cart/CartPage";
import { UserCartsAdminPage } from "./pages/users/UserCartsAdminPage";

// App component for the ecommerce web application with routes and context providers
export const App = (): React.ReactElement => (
  // BrowserRouter for the ecommerce web application with routes and context providers
  // AuthProvider for the ecommerce web application with routes and context providers
  // Routes for the ecommerce web application with routes and context providers
  <BrowserRouter>
    <AuthProvider>
      <Routes>
        // PublicLayout for the ecommerce web application with routes and context providers
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingHome />} />
          <Route path="/sobre" element={<LandingSobre />} />
          <Route path="/vitrine" element={<LandingVitrine />} />
          <Route path="/vitrine/:productId" element={<ProductPublicDetailPage />} />
          <Route path="/contato" element={<LandingContato />} />
        </Route>
        <Route
          path="/register"
          element={<Navigate to="/?cadastro=1" replace />}
        />
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/profile/edit" element={<ProfileEditPage />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/orders" element={<OrderListPage />} />
            <Route element={<AdminOnlyOutlet />}>
              <Route path="/dashboard" element={<DashboardHome />} />
              <Route path="/users" element={<UserListPage />} />
              <Route path="/user-carts" element={<UserCartsAdminPage />} />
              <Route path="/users/:id/edit" element={<UserEditPage />} />
              <Route path="/categories" element={<CategoryListPage />} />
              <Route path="/categories/new" element={<CategoryNewPage />} />
              <Route path="/categories/:id/edit" element={<CategoryEditPage />} />
              <Route path="/products" element={<ProductListPage />} />
              <Route path="/products/new" element={<ProductNewPage />} />
              <Route path="/products/:id/edit" element={<ProductEditPage />} />
              <Route path="/orders/:id/edit" element={<OrderEditPage />} />
            </Route>
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  </BrowserRouter>
);

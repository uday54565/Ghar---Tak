
import { Routes, Route, Navigate } from "react-router-dom";

import OwnerSettings from "./pages/owner/OwnerSettings";
import OwnerShop from "./pages/owner/OwnerShop";
import OwnerCategories from "./pages/owner/OwnerCategories";
import OwnerProducts from "./pages/owner/OwnerProducts";
import OwnerOrders from "./pages/owner/OwnerOrders";

import Home from "./pages/home/Home";
import ShopOwnerLogin from "./pages/auth/ShopOwnerLogin";
import Register from "./pages/auth/Register";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import CustomerDashboard from "./pages/home/CustomerDashboard";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import ProtectedRoute from "./routes/ProtectedRoute";

function App() {
  return (
    <Routes>
      {/* Public pages */}
      <Route path="/" element={<Home />} />

      {/* Common login page */}
      <Route path="/login" element={<ShopOwnerLogin />} />
      <Route path="/owner/login" element={<ShopOwnerLogin />} />

      {/* Redirect old customer login URL to common login */}
      <Route
        path="/customer/login"
        element={<Navigate to="/login" replace />}
      />

      {/* Registration */}
      <Route path="/register" element={<Register />} />
      <Route path="/customer/register" element={<Register />} />

      {/* Password reset */}
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route
        path="/customer/forgot-password"
        element={<Navigate to="/forgot-password" replace />}
      />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* Customer */}
      <Route
        path="/customer/dashboard"
        element={
          <ProtectedRoute role="user">
            <CustomerDashboard />
          </ProtectedRoute>
        }
      />

      {/* Shop owner */}
      <Route
        path="/owner/dashboard"
        element={
          <ProtectedRoute role="shop_owner">
            <OwnerDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/shop"
        element={
          <ProtectedRoute role="shop_owner">
            <OwnerShop />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/products"
        element={
          <ProtectedRoute role="shop_owner">
            <OwnerProducts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/categories"
        element={
          <ProtectedRoute role="shop_owner">
            <OwnerCategories />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/orders"
        element={
          <ProtectedRoute role="shop_owner">
            <OwnerOrders />
          </ProtectedRoute>
        }
      />
      <Route
        path="/owner/settings"
        element={
          <ProtectedRoute role="shop_owner">
            <OwnerSettings />
          </ProtectedRoute>
        }
      />

      {/* Unknown URLs return to home */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

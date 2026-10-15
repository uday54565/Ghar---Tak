import { Routes, Route } from "react-router-dom";
import Home from "../pages/home/Home";
import ShopOwnerLogin from "../pages/auth/ShopOwnerLogin";
import Register from "../pages/auth/Register";
import ForgotPassword from "../pages/auth/ForgotPassword";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<ShopOwnerLogin />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
    </Routes>
  );
}

export default AppRoutes;
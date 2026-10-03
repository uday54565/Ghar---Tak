import { Routes, Route } from "react-router-dom";
import Home from "../pages/home/Home";
import ShopOwnerLogin from "../pages/auth/ShopOwnerLogin";
import Register from "../pages/auth/Register";

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<ShopOwnerLogin />} />
      <Route path="/register" element={<Register />} />
    </Routes>
  );
}

export default AppRoutes;
import { Routes, Route } from "react-router-dom";

import OwnerSettings from "./pages/owner/OwnerSettings";
import OwnerShop from "./pages/owner/OwnerShop";
import OwnerCategories from "./pages/owner/OwnerCategories";
import OwnerProducts from "./pages/owner/OwnerProducts";
import OwnerOrders from "./pages/owner/OwnerOrders";
import Home from "./pages/home/Home";
import ShopOwnerLogin from "./pages/auth/ShopOwnerLogin";
import CustomerLogin from "./pages/auth/CustomerLogin";
import Register from "./pages/auth/Register";
import OwnerDashboard from "./pages/owner/OwnerDashboard";
import CustomerDashboard from "./pages/home/CustomerDashboard";

function App() {
  return (
    <Routes>

      <Route
  path="/owner/settings"
  element={<OwnerSettings />}/>

      <Route path="/owner/shop" element={<OwnerShop />} />

      <Route
  path="/owner/categories"
  element={<OwnerCategories />}/>

      <Route
  path="/owner/products"
  element={<OwnerProducts />}/>

      <Route path="/owner/orders" element={<OwnerOrders />} />
      {/* Public */}
      <Route path="/" element={<Home />} />

      {/* Customer / General Login */}
      <Route path="/login" element={<ShopOwnerLogin />} />
      <Route path="/customer/login" element={<CustomerLogin />} />
      <Route path="/customer/register" element={<Register />} />
      <Route path="/customer/dashboard" element={<CustomerDashboard />} />

      {/* Shop Owner Login */}
      <Route path="/owner/login" element={<ShopOwnerLogin />} />

      {/* Register */}
      <Route path="/register" element={<Register />} />

      {/* Owner Dashboard */}
      <Route path="/owner/dashboard" element={<OwnerDashboard />} />
    </Routes>
  );
}

export default App;
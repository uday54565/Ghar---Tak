import { Routes, Route } from "react-router-dom";

import Home from "./pages/home/Home";
import ShopOwnerLogin from "./pages/auth/ShopOwnerLogin";
import Register from "./pages/auth/Register";
import OwnerDashboard from "./pages/owner/OwnerDashboard";

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />

      {/* Customer / General Login */}
      <Route path="/login" element={<ShopOwnerLogin />} />

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
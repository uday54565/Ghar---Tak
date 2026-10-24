import { Navigate } from "react-router-dom";
import { useAuth } from "../context/useAuth";

export default function ProtectedRoute({ role, children }) {
  const { user, loading } = useAuth();

  if (loading) return <main aria-live="polite">Loading your account...</main>;
  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) {
    return <Navigate to={user.role === "shop_owner" ? "/owner/dashboard" : "/customer/dashboard"} replace />;
  }
  return children;
}

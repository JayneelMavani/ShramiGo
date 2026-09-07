import { Navigate, useLocation } from "react-router-dom";
import { getStoredUser } from "../../services/auth";

type AllowedRole = "customer" | "worker" | "admin";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: AllowedRole[];
}

export default function ProtectedRoute({
  children,
  roles,
}: ProtectedRouteProps) {
  const location = useLocation();
  const token = localStorage.getItem("shramigo_token");
  const user = getStoredUser();

  if (!token || !user) {
    return <Navigate to="/role-selection" replace state={{ from: location.pathname }} />;
  }

  if (roles && !roles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
}
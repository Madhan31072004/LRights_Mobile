import { Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import { getCurrentUser } from "../services/authService";

const AdminRoute = ({ children }) => {
  const user = getCurrentUser();

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <MainLayout>{children}</MainLayout>;
};

export default AdminRoute;

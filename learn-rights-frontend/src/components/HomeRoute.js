import { Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";

const HomeRoute = ({ children }) => {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Wrap home children with MainLayout so Navbar is consistent
  return <MainLayout>{children}</MainLayout>;
};

export default HomeRoute;

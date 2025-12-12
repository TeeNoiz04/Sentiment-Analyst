import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Login from "../pages/Login";
import ForgotPassword from "../pages/ForgotPassword";
import Home from "../pages/Home";
import NotFound from "../pages/NotFound";
import UserManagement from "../pages/UserManagement";
import PostManagement from "../pages/PostManagement";
// Kiểm tra login
const ProtectedRoute = ({ children }) => {
  const userName = sessionStorage.getItem("userName");
  return userName ? children : <Navigate to="/login" replace />;
};

const router = createBrowserRouter([
  {
    path: "/login",
    element: <Login />,

  },
  {
    path: "/forgot-password",
    element: <ForgotPassword />,
  },
  {
    path: "/",
    element: <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>,
    children: [
      { index: true, element: <Home /> },
      { path: "users", element: <UserManagement /> },
      { path: "posts", element: <PostManagement /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;

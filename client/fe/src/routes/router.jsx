import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
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
    path: "/",
    element: <ProtectedRoute>
      <MainLayout />
    </ProtectedRoute>,
    children: [
      { index: true, element: <Home /> },
      { path: "dashboard", element: <Dashboard /> },
    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;

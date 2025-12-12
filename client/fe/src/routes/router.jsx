import { createBrowserRouter, Navigate } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import Home from "../pages/Home";
import Dashboard from "../pages/Dashboard";
import NotFound from "../pages/NotFound";
import Login from "../pages/Login";
import About from "../pages/About";
import Profile from "../pages/Profile";
import CreatePostPage from "../pages/CreatePostPage";
import ForgotPassword from "../pages/ForgotPassword";
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
      { path: "dashboard", element: <Dashboard /> },
      { path: "post", element: <CreatePostPage /> },
      { path: "about", element: <About /> },
      { path: "profile", element: <Profile /> },

    ],
  },
  { path: "*", element: <NotFound /> },
]);

export default router;

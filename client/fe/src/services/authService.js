import api from "./api";

// Đăng ký tài khoản
export const register = async (data) => {
  try {
    const res = await api.post("/auth/register", data);

    // Check if response has error status
    if (res.data?.status && res.data.status >= 400) {
      return { success: false, message: res.data.message || "Đăng ký thất bại" };
    }

    if (res.data?.access_token) {
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      return { success: true, data: res.data };
    }

    return { success: false, message: "Không nhận được token" };

  } catch (error) {
    console.error("Register error:", error);
    const msg = error?.response?.data?.message || error?.response?.data?.detail || "Đăng ký thất bại";
    return { success: false, message: msg };
  }
};

// Đăng nhập
export const login = async (data) => {
  try {
    const res = await api.post("/auth/login", data);

    // Check if response has error status
    if (res.data?.status && res.data.status >= 400) {
      return { success: false, message: res.data.message || "Đăng nhập thất bại" };
    }

    if (res.data?.access_token) {
      localStorage.setItem("access_token", res.data.access_token);
      localStorage.setItem("refresh_token", res.data.refresh_token);
      return { success: true, data: res.data };
    }

    return { success: false, message: "Không nhận được token" };

  } catch (error) {
    console.error("Login error:", error);
    const msg = error?.response?.data?.message || error?.response?.data?.detail || "Đăng nhập thất bại";
    return { success: false, message: msg };
  }
};

// Refresh token
export const refreshToken = async () => {
  const refresh_token = localStorage.getItem("refresh_token");
  return await api.post("/auth/refresh", { refresh_token });
};

export const getProfile = async () => {
  try {
    const res = await api.get("/auth/me"); // nếu API chạy ở /client/auth/me thì sửa lại

    return {
      success: true,
      data: res.data,
    };
  } catch (error) {
    console.error("Get Profile Error:", error);

    const msg = error?.response?.data?.detail || "Không thể lấy thông tin người dùng";
    return { success: false, message: msg };
  }
};

// Đổi mật khẩu
export const changePassword = async (data) => {
  return await api.post("/auth/change-password", data);
};

// Logout 1 session hiện tại
export const logout = async () => {
  const res = await api.post("/auth/logout");
  localStorage.removeItem("token");
  localStorage.removeItem("refresh_token");
  return res;
};

// Logout tất cả thiết bị
export const logoutAll = async () => {
  return await api.post("/auth/logout-all");
};

// Danh sách session đang hoạt động
export const getSessions = async () => {
  return await api.get("/auth/sessions");
};

// Hủy một session theo ID
export const revokeSession = async (session_id) => {
  return await api.delete(`/auth/sessions/${session_id}`);
};


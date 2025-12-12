import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8000/client",
  timeout: 5000,
});

// Gắn token vào request
api.interceptors.request.use((config) => {
  const noAuthUrls = ["/auth/register", "/auth/login", "/auth/refresh"];
  // Nếu URL nằm trong danh sách, return config không gắn Authorization
  if (noAuthUrls.some(url => config.url.includes(url))) {
    return config;
  }
  const token = localStorage.getItem("access_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Xử lý lỗi chung
api.interceptors.response.use(
  (res) => res,
  async (err) => {
    console.error("API Error:", err);

    // Kiểm tra xem có phải lỗi auth từ login/register không
    const isAuthEndpoint = err.config?.url?.includes("/auth/login") ||
      err.config?.url?.includes("/auth/register");

    // Nếu token hết hạn → tự refresh (nhưng không phải từ login endpoint)
    if (err.response?.status === 401 && !isAuthEndpoint) {
      try {
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) throw new Error("No refresh token");

        const res = await axios.post("http://localhost:8000/client/auth/refresh", {
          refresh_token: refresh,
        });

        // Check if refresh response has error status
        if (res.data?.status && res.data.status !== 200) {
          throw new Error("Token refresh failed");
        }

        localStorage.setItem("access_token", res.data.access_token);
        localStorage.setItem("refresh_token", res.data.refresh_token);

        err.config.headers.Authorization = `Bearer ${res.data.access_token}`;
        return api(err.config); // gọi lại request cũ
      } catch {
        localStorage.clear();
        window.location.href = "/login";
      }
    }

    return Promise.reject(err);
  }
);

export default api;

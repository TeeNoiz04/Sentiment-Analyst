import api from "./api";

// Lấy thông tin user từ ID
export const getUserById = async (id) => {
    const params = {};
    if (id) params.user_id  = id;
    const response = await api.get(`/users/${id}`, { params });
    console.log("UserService - getUserById response:", response);
    return response.data;
};


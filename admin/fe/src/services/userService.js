import api from "./api";

// Lấy thông tin user từ ID
export const getUserById = async (id) => {
    const params = {};
    if (id) params.user_id = id;
    const response = await api.get(`/users/${id}`, { params });
    console.log("UserService - getUserById response:", response);
    return response.data;
};

export const getAllUsers = async (filters) => {

    try {
        console.log("UserService - getAllUsers called with filters:", filters);
        const response = await api.get(`/users`, { params: filters });
        console.log("UserService - getAllUsers response:", response);
        return response.data;
    } catch (err) {
        throw err;
    }

};

export const updateUserStatus = async (userId, status) => {
    try {
        console.log(`UserService - updateUserStatus called with userId: ${userId}, status: ${status}`);
        const params = {
            status: status
        };
        const response = await api.put(`/users/${userId}/status`, null, {params: params });
        console.log("UserService - updateUserStatus response:", response);
        return response.data;
    } catch (err) {
        throw err;
    }
};
export const updateUserRole = async (userId, role) => {
    try {
        console.log(`UserService - updateUserRole called with userId: ${userId}, role: ${role}`);
        const response = await api.put(`/users/${userId}/role`, { role });
        console.log("UserService - updateUserRole response:", response);
        return response.data;
    } catch (err) {
        throw err;
    }   
};

export const deleteUser = async (userId) => {
    try {
        console.log(`UserService - deleteUser called with userId: ${userId}`);
        const response = await api.delete(`/users/${userId}`);
        console.log("UserService - deleteUser response:", response);
        return response.data;
    } catch (err) {
        throw err;
    }   
};
export const createUser = async (userData) => {
    try {
        console.log("UserService - createUser called with userData:", userData);
        const response = await api.post(`/users`, userData);
        console.log("UserService - createUser response:", response);
        return response.data;
    } catch (err) {
        throw err;
    }
};
export const updateUser = async (userId, userData) => {
    try {
        console.log(`UserService - updateUser called with userId: ${userId}, userData:`, userData); 
        const response = await api.put(`/users/${userId}`, userData);
        console.log("UserService - updateUser response:", response);
        return response.data;
    } catch (err) {
        throw err;
    }   
};
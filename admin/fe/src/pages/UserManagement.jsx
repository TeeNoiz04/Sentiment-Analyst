import { useEffect, useState } from "react";
import { 
    Users, 
    Plus, 
    Edit, 
    Trash2, 
    Search, 
    Filter, 
    Eye, 
    EyeOff, 
    User, 
    Mail, 
    Shield,
    Calendar,
    Activity,
    Ban,
    Check,
    X,
    Save
} from "lucide-react";
import { get, useForm } from "react-hook-form";
import { notifyError, notifySuccess } from "../utils/toast";
import { getAllUsers, deleteUser, updateUserStatus, createUser, updateUser } from "../services/userService";

export default function UserManagement() {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
    const [selectedUser, setSelectedUser] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showPassword, setShowPassword] = useState(false);
    const [totalUsers, setTotalUsers] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(10);

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors }
    } = useForm();

    // Mock data - thay thế bằng API calls thực tế
    useEffect(() => {
        fetchUsers();
    }, [ ]);
   

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const filters = {
                skip : (currentPage - 1) * itemsPerPage,
                limit : itemsPerPage,
            };
            const res = await getAllUsers(filters);  
            setTotalUsers(res.total || 0);  
            console.log("Fetched users:", res);
            const mockUsers = res.users || [];
            setUsers(mockUsers);
        } catch (error) {
            console.log("Error fetching users:", error);
            notifyError("Không thể tải danh sách người dùng");
        }
        setLoading(false);
    };

    const handleCreate = () => {
        setModalMode('create');
        setSelectedUser(null);
        reset();
        setShowModal(true);
    };

    const handleEdit = (user) => {
        setModalMode('edit');
        setSelectedUser(user);
        Object.keys(user).forEach(key => {
            setValue(key, user[key]);
        });
        setShowModal(true);
    };

    const handleView = (user) => {
        setModalMode('view');
        setSelectedUser(user);
        setShowModal(true);
    };

    const handleDelete = async (userId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa người dùng này?')) {
            try {
                console.log(`Deleting user with ID: ${userId}`);
                // API call để xóa user
                const response = await deleteUser(userId);
                console.log("Delete response:", response);
                setUsers(users.filter(user => user.UserID !== userId));
                notifySuccess("Xóa người dùng thành công!");
            } catch (error) {
                notifyError("Không thể xóa người dùng");
            }
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            if (modalMode === 'create') {
                const response = await createUser(data);
                console.log("Create user response:", response);
                const newUser = {
                    ...data,
                };
                setUsers([...users, newUser]);
                notifySuccess("Tạo người dùng thành công!");
            } else if (modalMode === 'edit') {
                const response = await updateUser(selectedUser.UserID, data);
                console.log("Update user response:", response);
                const updatedUsers = users.map(user => 
                    user.UserID === selectedUser.UserID 
                        ? { ...user, ...data }
                        : user
                );
                setUsers(updatedUsers);
                notifySuccess("Cập nhật người dùng thành công!");
            }
            setShowModal(false);
            reset();
        } catch (error) {
            notifyError("Có lỗi xảy ra");
        }
        setLoading(false);
    };

    const toggleUserStatus = async (userId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'active' ? 'banned' : 'active';
            const updatedUsers = users.map(user => 
                user.UserID === userId 
                    ? { ...user, Status: newStatus }
                    : user
            );
            const response = await updateUserStatus(userId, newStatus);
            console.log("Update status response:", response);
            setUsers(updatedUsers);
            notifySuccess(`${newStatus === 'active' ? 'Kích hoạt' : 'Cấm'} người dùng thành công!`);
        } catch (error) {
            notifyError("Không thể thay đổi trạng thái người dùng");
        }
    };

    // Filter và search logic
    const filteredUsers = users.filter(user => {
        const matchesSearch = user.Username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.FullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            user.Email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || user.Status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(totalUsers / itemsPerPage);

    const formatDate = (dateString) => {
        if (!dateString) return 'Chưa có';
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
                    <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                    <div className="p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-4">
                                <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-lg">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                        Quản lý người dùng
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Quản lý tài khoản và thông tin người dùng
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <Plus className="w-5 h-5" />
                                Thêm người dùng
                            </button>
                        </div>

                        {/* Search và Filter */}
                        <div className="flex flex-col sm:flex-row gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tên đăng nhập, họ tên, email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="relative">
                                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <select
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                    className="pl-10 pr-8 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="all">Tất cả trạng thái</option>
                                    <option value="active">Đang hoạt động</option>
                                    <option value="banned">Đã cấm</option>
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 dark:bg-gray-700">
                                <tr>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">ID</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Avatar</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Tên đăng nhập</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Họ tên</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Email</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Trạng thái</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {currentUsers.map((user) => (
                                    <tr key={user.UserID} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                            {user.UserID}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                {user.AvatarURL ? (
                                                    <img src={user.AvatarURL} alt="Avatar" className="w-full h-full object-cover" />
                                                ) : (
                                                    <User className="w-5 h-5 text-white" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100 font-medium">
                                            {user.Username || 'Chưa có'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                            {user.FullName || 'Chưa có'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                            <div className="flex items-center gap-2">
                                                {user.Email || 'Chưa có'}
                                                {user.IsEmailConfirmed && (
                                                    <Check className="w-4 h-4 text-green-500" />
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                user.Status === 'active' 
                                                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                    : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                            }`}>
                                                {user.Status === 'active' ? 'Hoạt động' : 'Đã cấm'}
                                            </span>
                                        </td>
                                     
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleView(user)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(user)}
                                                    className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => toggleUserStatus(user.UserID, user.Status)}
                                                    className={`p-2 rounded-lg transition-colors ${
                                                        user.Status === 'active'
                                                            ? 'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                                                            : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30'
                                                    }`}
                                                    title={user.Status === 'active' ? 'Cấm người dùng' : 'Kích hoạt người dùng'}
                                                >
                                                    {user.Status === 'active' ? <Ban className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(user.UserID)}
                                                    className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                                    title="Xóa"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-700 dark:text-gray-300">
                                    Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredUsers.length)} trong tổng số {filteredUsers.length} kết quả
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Trước
                                    </button>
                                    {[...Array(totalPages)].map((_, index) => (
                                        <button
                                            key={index + 1}
                                            onClick={() => setCurrentPage(index + 1)}
                                            className={`px-3 py-2 text-sm rounded-lg ${
                                                currentPage === index + 1
                                                    ? 'bg-blue-600 text-white'
                                                    : 'border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700'
                                            }`}
                                        >
                                            {index + 1}
                                        </button>
                                    ))}
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
                                    >
                                        Sau
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>
                        
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {modalMode === 'create' && 'Thêm người dùng mới'}
                                    {modalMode === 'edit' && 'Chỉnh sửa người dùng'}
                                    {modalMode === 'view' && 'Thông tin người dùng'}
                                </h2>
                                <button
                                    onClick={() => setShowModal(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="max-h-[60vh] overflow-y-auto">
                                {modalMode === 'view' ? (
                                    // View Mode
                                    <div className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    ID người dùng
                                                </label>
                                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                    {selectedUser?.UserID || 'Chưa có'}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Device ID
                                                </label>
                                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                    {selectedUser?.DeviceID || 'Chưa có'}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Tên đăng nhập
                                                </label>
                                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                    {selectedUser?.Username || 'Chưa có'}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Họ tên
                                                </label>
                                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                    {selectedUser?.FullName || 'Chưa có'}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Email
                                                </label>
                                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl flex items-center gap-2">
                                                    {selectedUser?.Email || 'Chưa có'}
                                                    {selectedUser?.IsEmailConfirmed && (
                                                        <span className="text-green-500 text-sm">(Đã xác thực)</span>
                                                    )}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Trạng thái
                                                </label>
                                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                        selectedUser?.Status === 'active' 
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                            : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                    }`}>
                                                        {selectedUser?.Status === 'active' ? 'Hoạt động' : 'Đã cấm'}
                                                    </span>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Số lần đăng nhập thất bại
                                                </label>
                                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                    {selectedUser?.FailedLoginAttempts || 0}
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Ngày tạo
                                                </label>
                                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                    {formatDate(selectedUser?.CreatedAt)}
                                                </div>
                                            </div>
                                            <div className="md:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Lần cuối hoạt động
                                                </label>
                                                <div className="px-4 py-3 bg-gray-50 dark:bg-gray-900 rounded-xl">
                                                    {formatDate(selectedUser?.LastActive)}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Create/Edit Form
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            {/* Username */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Tên đăng nhập
                                                </label>
                                                <input
                                                    {...register("Username", {
                                                        required: "Tên đăng nhập không được bỏ trống"
                                                    })}
                                                    className={`w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                        errors.Username ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                                                    }`}
                                                    placeholder="Nhập tên đăng nhập..."
                                                />
                                                {errors.Username && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.Username.message}</p>
                                                )}
                                            </div>

                                            {/* Password */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {modalMode === 'edit' ? 'Đổi mật khẩu mới' : 'Mật khẩu'} {modalMode === 'create' && <span className="text-red-500">*</span>}
                                                </label>
                                                <div className="relative">
                                                    <input
                                                        {...register("PasswordHash", modalMode === 'create' ? {
                                                            required: "Mật khẩu không được bỏ trống",
                                                            minLength: { value: 6, message: "Mật khẩu ít nhất 6 ký tự" }
                                                        } : {
                                                            // Edit: optional, only validate if provided
                                                            validate: ((value) => {
                                                                if (!/[A-Z]/.test(value)) return "Phải có chữ hoa (A-Z)";
                                                                if (!/[a-z]/.test(value)) return "Phải có chữ thường (a-z)";
                                                                if (!/[0-9]/.test(value)) return "Phải có số (0-9)";
                                                                if (!/[@$!%*?&]/.test(value)) return "Phải có ký tự đặc biệt (@$!%*?&)";
                                                                return true;
                                                            })
                                                        })}
                                                        type={showPassword ? "text" : "password"}
                                                        className={`w-full px-4 py-3 pr-11 border rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                            errors.PasswordHash ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                                                        }`}
                                                        placeholder={modalMode === 'edit' ? "Để trống nếu không thay đổi..." : "Nhập mật khẩu..."}
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                                    >
                                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                                    </button>
                                                </div>
                                                {errors.PasswordHash && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.PasswordHash.message}</p>
                                                )}
                                            </div>

                                            {/* Confirm Password */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    {modalMode === 'edit' ? 'Xác nhận mật khẩu mới' : 'Xác nhận mật khẩu'} {modalMode === 'create' && <span className="text-red-500">*</span>}
                                                </label>
                                                <input
                                                    {...register("ConfirmPassword", {
                                                        validate: (value) => {
                                                            const pw = watch("PasswordHash");
                                                            if (modalMode === 'create') {
                                                                if (!value) return "Vui lòng xác nhận mật khẩu";
                                                            }
                                                            if (value) {
                                                                return value === pw || "Mật khẩu xác nhận không khớp";
                                                            }
                                                            // In edit mode, confirm is optional if password not changed
                                                            return !pw || "Vui lòng xác nhận mật khẩu";
                                                        }
                                                    })}
                                                    type="password"
                                                    className={`w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                        errors.ConfirmPassword ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                                                    }`}
                                                    placeholder={modalMode === 'edit' ? "Nhập lại nếu đổi mật khẩu..." : "Nhập lại mật khẩu..."}
                                                />
                                                {errors.ConfirmPassword && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.ConfirmPassword.message}</p>
                                                )}
                                            </div>

                                            {/* Full Name */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Họ tên
                                                </label>
                                                <input
                                                    {...register("FullName")}
                                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    placeholder="Nhập họ tên..."
                                                />
                                            </div>

                                            {/* Email */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Email
                                                </label>
                                                <input
                                                    {...register("Email", {
                                                        pattern: {
                                                            value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                            message: "Email không hợp lệ"
                                                        }
                                                    })}
                                                    type="email"
                                                    className={`w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                                                        errors.Email ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                                                    }`}
                                                    placeholder="Nhập email..."
                                                />
                                                {errors.Email && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.Email.message}</p>
                                                )}
                                            </div>

                                    

                                            {/* Status */}
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Trạng thái
                                                </label>
                                                <select
                                                    {...register("Status")}
                                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="active">Hoạt động</option>
                                                    <option value="banned">Đã cấm</option>
                                                </select>
                                            </div>

                                          
                                        </div>

                                        <div className="flex gap-4 pt-6">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                                            >
                                                <Save className="w-5 h-5" />
                                                {modalMode === 'create' ? 'Tạo người dùng' : 'Cập nhật'}
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Hủy
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
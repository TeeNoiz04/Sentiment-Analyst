import { useEffect, useState } from "react";
import {
    FileText,
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    Eye,
    User,
    Calendar,
    ThumbsUp,
    ThumbsDown,
    EyeOff,
    Tag,
    Clock,
    Save,
    X,
    MessageSquare,
    TrendingUp,
    CheckCircle,
    XCircle
} from "lucide-react";
import { useForm } from "react-hook-form";
import { notifyError, notifySuccess } from "../utils/toast";
import { fetchPostsService, createPost, deletePost, updatePostStatus, updatePost } from "../services/postService";
export default function PostManagement() {
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [modalMode, setModalMode] = useState('create'); // 'create', 'edit', 'view'
    const [selectedPost, setSelectedPost] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [categoryFilter, setCategoryFilter] = useState('all');
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

    // Categories - có thể lấy từ API
    const categories = [
        { label: "Cơ sở vật chất", value: "LABEL_0" },
        { label: "Giảng viên", value: "LABEL_1" },
        { label: "Sinh viên", value: "LABEL_2" },
        { label: "Chương trình đào tạo", value: "LABEL_3" },
    ];

    // Mock data - thay thế bằng API calls thực tế
    useEffect(() => {
        fetchPosts();
    }, []);
    

    const fetchPosts = async () => {
        setLoading(true);
        try {
            const filters = {
                skip: (currentPage - 1) * itemsPerPage,
                limit: itemsPerPage,
                status: statusFilter !== 'all' ? statusFilter : undefined,
                category: categoryFilter !== 'all' ? categoryFilter : undefined
            };
            const response = await fetchPostsService(filters);
            console.log("Fetched posts:", response);
            const mockPosts = response.posts || [];

            setPosts(mockPosts);
        } catch (error) {
            notifyError("Không thể tải danh sách bài viết");
        }
        setLoading(false);
    };

    const handleCreate = () => {
        setModalMode('create');
        setSelectedPost(null);
        reset();
        setShowModal(true);
    };

    const handleEdit = (post) => {
        setModalMode('edit');
        setSelectedPost(post);
        // Điền dữ liệu vào form
        Object.keys(post).forEach(key => {
            setValue(key, post[key]);
        });
        setShowModal(true);
    };

    const handleView = (post) => {
        setModalMode('view');
        console.log("Viewing post:", post);
        setSelectedPost(post);
        setShowModal(true);
    };

    const handleDelete = async (postId) => {
        if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này?')) {
            try {
                // API call để xóa post
                const response = await deletePost(postId);
                console.log("Deleted post:", response);
                setPosts(posts.filter(post => post.PostID !== postId));
                notifySuccess("Xóa bài viết thành công!");
            } catch (error) {
                notifyError("Không thể xóa bài viết");
            }
        }
    };

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            if (modalMode === 'create') {
                // API call để tạo post mới
                data.UserID = Number(sessionStorage.getItem("user_id")); // Lấy từ session
                console.log("Creating post with data:", data);
                const response = await createPost(data);
                console.log("Created post:", response);
                const newPost = response;
                setPosts([newPost, ...posts]);
                notifySuccess("Tạo bài viết thành công!");
            } else if (modalMode === 'edit') {
                const response = await updatePost(selectedPost.PostID, data);
                console.log("Updated post:", response);
                const updatedPosts = posts.map(post =>
                    post.PostID === selectedPost.PostID
                        ? { ...post, ...data }
                        : post
                );
                setPosts(updatedPosts);
                notifySuccess("Cập nhật bài viết thành công!");
            }
            setShowModal(false);
            reset();
        } catch (error) {
            notifyError("Có lỗi xảy ra");
        }
        setLoading(false);
    };

    const togglePostStatus = async (postId, currentStatus) => {
        try {
            const newStatus = currentStatus === 'approved' ? 'hidden' : 'approved';
            const updatedPosts = posts.map(post =>
                post.PostID === postId
                    ? { ...post, Status: newStatus }
                    : post
            );
            const response = await updatePostStatus(postId, newStatus);
            console.log("Updated post status:", response);
            setPosts(updatedPosts);
            notifySuccess(`${newStatus === 'approved' ? 'Hiển thị' : 'Ẩn'} bài viết thành công!`);
        } catch (error) {
            notifyError("Không thể thay đổi trạng thái bài viết");
        }
    };

    // Filter và search logic
    const filteredPosts = posts.filter(post => {
        const matchesSearch = post.Title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.Content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            post.FullName?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || post.Status === statusFilter;
        const matchesCategory = categoryFilter === 'all' || post.Category === categoryFilter;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(filteredPosts.length / itemsPerPage);

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

    const truncateContent = (content, maxLength = 100) => {
        if (!content) return '';
        return content.length > maxLength ? content.substring(0, maxLength) + '...' : content;
    };

    const getEngagementRate = (upVotes, downVotes) => {
        const total = upVotes + downVotes;
        if (total === 0) return 0;
        return Math.round((upVotes / total) * 100);
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
                                    <FileText className="w-8 h-8 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                                        Quản lý bài viết
                                    </h1>
                                    <p className="text-gray-600 dark:text-gray-400">
                                        Quản lý và kiểm duyệt nội dung bài viết
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={handleCreate}
                                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <Plus className="w-5 h-5" />
                                Thêm bài viết
                            </button>
                        </div>

                        {/* Stats Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-blue-100">Tổng bài viết</p>
                                        <p className="text-2xl font-bold">{posts.length}</p>
                                    </div>
                                    <FileText className="w-8 h-8 text-blue-200" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-green-100">Đã duyệt</p>
                                        <p className="text-2xl font-bold">{posts.filter(p => p.Status === 'approved').length}</p>
                                    </div>
                                    <CheckCircle className="w-8 h-8 text-green-200" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-orange-100">Đã ẩn</p>
                                        <p className="text-2xl font-bold">{posts.filter(p => p.Status === 'hidden').length}</p>
                                    </div>
                                    <EyeOff className="w-8 h-8 text-orange-200" />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-4 text-white">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-purple-100">Tổng lượt vote</p>
                                        <p className="text-2xl font-bold">{posts.reduce((sum, p) => sum + p.UpVotes + p.DownVotes, 0)}</p>
                                    </div>
                                    <TrendingUp className="w-8 h-8 text-purple-200" />
                                </div>
                            </div>
                        </div>

                        {/* Search và Filter */}
                        <div className="flex flex-col lg:flex-row gap-4 mb-6">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Tìm kiếm theo tiêu đề, nội dung, tác giả..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>
                            <div className="flex gap-4">
                                <div className="relative">
                                    <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                        className="pl-10 pr-8 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">Tất cả trạng thái</option>
                                        <option value="approved">Đã duyệt</option>
                                        <option value="hidden">Đã ẩn</option>
                                    </select>
                                </div>
                                <div className="relative">
                                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <select
                                        value={categoryFilter}
                                        onChange={(e) => setCategoryFilter(e.target.value)}
                                        className="pl-10 pr-8 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    >
                                        <option value="all">Tất cả chủ đề</option>
                                        {categories.map(category => (
                                            <option key={category.value} value={category.value}>{category.label}</option>
                                        ))}
                                    </select>
                                </div>
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
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Tiêu đề</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Chủ đề</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Trạng thái</th>
                                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900 dark:text-gray-100">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {currentPosts.map((post) => (
                                    <tr key={post.PostID} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                        <td className="px-6 py-4 text-sm text-gray-900 dark:text-gray-100">
                                            {post.PostID}
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="max-w-xs">
                                                <p className="font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {post.Title}
                                                </p>
                                                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                                    {truncateContent(post.Content, 60)}
                                                </p>
                                            </div>
                                        </td>

                                        <td className="px-6 py-4">
                                            {post.Category && (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                    {
                                                        categories.find(t => t.value === post.Category)?.label
                                                        || post.Category
                                                    }
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${post.Status === 'approved'
                                                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                                                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
                                                }`}>
                                                {post.Status === 'approved' ? 'Đã duyệt' : 'Đã ẩn'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleView(post)}
                                                    className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                                    title="Xem chi tiết"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(post)}
                                                    className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30 rounded-lg transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => togglePostStatus(post.PostID, post.Status)}
                                                    className={`p-2 rounded-lg transition-colors ${post.Status === 'approved'
                                                        ? 'text-orange-600 hover:bg-orange-100 dark:hover:bg-orange-900/30'
                                                        : 'text-green-600 hover:bg-green-100 dark:hover:bg-green-900/30'
                                                        }`}
                                                    title={post.Status === 'approved' ? 'Ẩn bài viết' : 'Hiển thị bài viết'}
                                                >
                                                    {post.Status === 'approved' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(post.PostID)}
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
                                    Hiển thị {indexOfFirstItem + 1} đến {Math.min(indexOfLastItem, filteredPosts.length)} trong tổng số {filteredPosts.length} kết quả
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
                                            className={`px-3 py-2 text-sm rounded-lg ${currentPage === index + 1
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
                    <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden">
                        <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                                    {modalMode === 'create' && 'Thêm bài viết mới'}
                                    {modalMode === 'edit' && 'Chỉnh sửa bài viết'}
                                    {modalMode === 'view' && 'Chi tiết bài viết'}
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
                                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                            <div className="lg:col-span-2 space-y-6">
                                                <div>
                                                    <h3 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-3">
                                                        {selectedPost?.Title}
                                                    </h3>
                                                    <div className="prose max-w-none dark:prose-invert">
                                                        <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                                                            {selectedPost?.Content}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="space-y-4">
                                                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Thông tin bài viết</h4>
                                                    <div className="space-y-3 text-sm">
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">ID:</span>
                                                            <span className="font-medium">{selectedPost?.PostID}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Tác giả:</span>
                                                            <span className="font-medium">{selectedPost?.Username || 'Unknown'}</span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Chủ đề:</span>
                                                            {/* <span className="font-medium">{selectedPost?.Category || 'Chưa phân loại'}</span> */}
                                                            {selectedPost.Category && (
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                                                                    {
                                                                        categories.find(t => t.value === selectedPost.Category)?.label
                                                                        || selectedPost.Category
                                                                    }
                                                                </span>
                                                            )}
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Trạng thái:</span>
                                                            <span className={`font-medium ${selectedPost?.Status === 'approved' ? 'text-green-600' : 'text-red-600'}`}>
                                                                {selectedPost?.Status === 'approved' ? 'Đã duyệt' : 'Đã ẩn'}
                                                            </span>
                                                        </div>
                                                        <div className="flex justify-between">
                                                            <span className="text-gray-600 dark:text-gray-400">Ngày đăng:</span>
                                                            <span className="font-medium">{formatDate(selectedPost?.CreatedOn)}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-4">
                                                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-3">Thống kê tương tác</h4>
                                                    <div className="space-y-3">
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <ThumbsUp className="w-4 h-4 text-green-600" />
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">Upvotes</span>
                                                            </div>
                                                            <span className="font-bold text-green-600">{selectedPost?.UpVotes}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <ThumbsDown className="w-4 h-4 text-red-600" />
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">Downvotes</span>
                                                            </div>
                                                            <span className="font-bold text-red-600">{selectedPost?.DownVotes}</span>
                                                        </div>
                                                        <div className="flex items-center justify-between">
                                                            <div className="flex items-center gap-2">
                                                                <TrendingUp className="w-4 h-4 text-blue-600" />
                                                                <span className="text-sm text-gray-600 dark:text-gray-400">Tỷ lệ tích cực</span>
                                                            </div>
                                                            <span className="font-bold text-blue-600">
                                                                {getEngagementRate(selectedPost?.UpVotes, selectedPost?.DownVotes)}%
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    // Create/Edit Form
                                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                            {/* Title */}
                                            <div className="lg:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Tiêu đề <span className="text-red-500">*</span>
                                                </label>
                                                <input
                                                    {...register("Title", {
                                                        required: "Tiêu đề không được bỏ trống",
                                                        maxLength: { value: 255, message: "Tiêu đề không được quá 255 ký tự" }
                                                    })}
                                                    className={`w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent ${errors.Title ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                                                        }`}
                                                    placeholder="Nhập tiêu đề bài viết..."
                                                />
                                                {errors.Title && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.Title.message}</p>
                                                )}
                                            </div>

                                            {/* Category */}
                                            <div className={modalMode === 'create' ? 'lg:col-span-2' : ''}>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Chủ đề
                                                </label>
                                                <select
                                                    {...register("Category")}
                                                    className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                >
                                                    <option value="">Chọn chủ đề</option>
                                                    {categories.map(category => (
                                                        <option key={category.value} value={category.value}>{category.label}</option>
                                                    ))}
                                                </select>
                                            </div>

                                            {/* Status - Only show in edit mode */}
                                            {modalMode === 'edit' && (
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                        Trạng thái
                                                    </label>
                                                    <select
                                                        {...register("Status")}
                                                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                                    >
                                                        <option value="approved">Đã duyệt</option>
                                                        <option value="hidden">Đã ẩn</option>
                                                    </select>
                                                </div>
                                            )}

                                            {/* Content */}
                                            <div className="lg:col-span-2">
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Nội dung <span className="text-red-500">*</span>
                                                </label>
                                                <textarea
                                                    {...register("Content", {
                                                        required: "Nội dung không được bỏ trống"
                                                    })}
                                                    rows={8}
                                                    className={`w-full px-4 py-3 border rounded-xl bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${errors.Content ? "border-red-500" : "border-gray-200 dark:border-gray-600"
                                                        }`}
                                                    placeholder="Nhập nội dung bài viết..."
                                                />
                                                {errors.Content && (
                                                    <p className="text-red-500 text-sm mt-1">{errors.Content.message}</p>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex gap-4 pt-6">
                                            <button
                                                type="submit"
                                                disabled={loading}
                                                className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50"
                                            >
                                                <Save className="w-5 h-5" />
                                                {modalMode === 'create' ? 'Tạo bài viết' : 'Cập nhật'}
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
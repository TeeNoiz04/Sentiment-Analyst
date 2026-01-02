import { useState, useEffect } from "react";
import { User, Mail, Phone, Edit2, Save, X, Camera, Shield, Bell, LogOut, Sparkles, Loader2 } from "lucide-react";
import api from "../services/api";
import { getUserById } from "../services/userService";
export default function Profile() {
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [userId, setUserId] = useState(null);
  const [editName, setEditName] = useState(false);
  const [tempName, setTempName] = useState("");
  const [stats, setStats] = useState({
    posts: 0,
    likes: 0
  });

  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingStats, setLoadingStats] = useState(true);
  const [savingName, setSavingName] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        setError(null);
        const userId = sessionStorage.getItem("user_id");
        const response = await getUserById(userId);

     

        const userData = response;
        setUserId(userData.UserID);
        setDisplayName(userData.FullName);
        setTempName(userData.FullName);
        setEmail(userData.Email);


      } catch (err) {
        const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi tải thông tin';
        setError(errorMessage);
        console.error('Error fetching profile:', err);

        // Fallback data
        setDisplayName("Người dùng");
        setTempName("Người dùng");
        setEmail("user@example.com");
        setPhone("0123 456 789");
      } finally {
        setLoadingProfile(false);
      }
    };

    fetchProfile();
  }, []);

  // Fetch user activity stats
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoadingStats(true);
        const userId = sessionStorage.getItem("user_id");

        const response = await api.get(`/users/${userId}/activity`);
  
        if (response.data.status !== 200) {
          throw new Error('Không thể tải thông tin hoạt động');
        }

        const activityData = response.data.data;
        setStats({
          posts: activityData.posts || 0,
          likes: activityData.likes || 0
        });


      } catch (err) {
        console.error('Error fetching stats:', err);
        setStats({ posts: 0, likes: 0 });
      } finally {
        setLoadingStats(false);
      }
    };

    fetchStats();
  }, []);

  const handleSave = async () => {
    if (!tempName.trim()) {
      alert('Tên không được để trống');
      return;
    }

    try {
      setSavingName(true);

      const response = await api.patch('/users/profile', {
        UserID: userId,
        name: tempName
      });
      console.log('Update response:', response);
      if (response.status !== 200) {
        throw new Error(response.data.message || 'Không thể cập nhật tên');
      }

      setDisplayName(tempName);
      setEditName(false);

      // Hiển thị thông báo thành công (optional)
      const successMsg = response.data.message || 'Cập nhật thành công';
      console.log(successMsg);

    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Lỗi khi cập nhật tên';
      alert('Lỗi: ' + errorMessage);
      console.error('Error updating name:', err);
    } finally {
      setSavingName(false);
    }
  };

  const handleCancel = () => {
    setTempName(displayName);
    setEditName(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    window.location.href = '/login';

  };

  const getInitials = (name) => {
    if (!name) return "?";
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  };

  // Loading state
  if (loadingProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-8 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
          <p className="text-gray-600 dark:text-gray-400">Đang tải thông tin...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 p-4 sm:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center gap-3">
            <User className="w-10 h-10 text-blue-500" />
            Hồ sơ cá nhân
          </h1>
          <p className="text-gray-600 dark:text-gray-400 ml-[52px]">
            Quản lý thông tin và cài đặt tài khoản của bạn
          </p>
        </div>

        {error && (
          <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-xl text-red-700 dark:text-red-300 flex items-center justify-between">
            <span>{error}</span>
            <button
              onClick={() => window.location.reload()}
              className="px-3 py-1 bg-red-500 text-white rounded-lg hover:bg-red-600 text-sm"
            >
              Thử lại
            </button>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden transform transition-all duration-300 hover:shadow-3xl">
            {/* Gradient Header */}
            <div className="h-32 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 relative">
              <div className="absolute inset-0 bg-black opacity-10"></div>
            </div>

            {/* Profile Content */}
            <div className="px-8 pb-8">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-center sm:items-end gap-6 -mt-16 mb-8">
                <div className="relative group">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-75 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative w-32 h-32 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-xl ring-4 ring-white dark:ring-gray-800">
                    {getInitials(displayName)}
                  </div>
                  <button className="absolute bottom-0 right-0 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transform hover:scale-110 transition-all duration-300 ring-4 ring-white dark:ring-gray-800">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>

                <div className="text-center sm:text-left mb-4 sm:mb-0">
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                    {displayName}
                  </h2>
                  <p className="text-blue-500 dark:text-blue-400 flex items-center gap-2 justify-center sm:justify-start">
                    <Sparkles className="w-4 h-4" />
                    Thành viên tích cực
                  </p>
                </div>
              </div>

              {/* Info Fields */}
              <div className="space-y-6">
                {/* Display Name */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <User className="w-4 h-4 text-blue-500" />
                    Tên đầy đủ
                  </label>
                  {editName ? (
                    <div className="flex gap-3 flex-wrap">
                      <input
                        type="text"
                        value={tempName}
                        onChange={(e) => setTempName(e.target.value)}
                        className="flex-1 px-4 py-3 border-2 border-blue-300 dark:border-blue-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all"
                        autoFocus
                        disabled={savingName}
                      />
                      <button
                        onClick={handleSave}
                        disabled={savingName}
                        className="flex items-center gap-2 px-4 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                      >
                        {savingName ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Save className="w-4 h-4" />
                        )}
                        {savingName ? 'Đang lưu...' : 'Lưu'}
                      </button>
                      <button
                        onClick={handleCancel}
                        disabled={savingName}
                        className="flex items-center gap-2 px-4 py-3 bg-gray-500 text-white rounded-xl hover:bg-gray-600 transition-all duration-300 hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <X className="w-4 h-4" />
                        Hủy
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-all">
                      <span className="text-gray-900 dark:text-white font-medium">
                        {displayName}
                      </span>
                      <button
                        onClick={() => setEditName(true)}
                        className="flex items-center gap-2 px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-all duration-300 hover:scale-105"
                      >
                        <Edit2 className="w-4 h-4" />
                        Đổi tên
                      </button>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div className="group">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
                    <Mail className="w-4 h-4 text-purple-500" />
                    Email
                  </label>
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl group-hover:bg-gray-100 dark:group-hover:bg-gray-800 transition-all">
                    <span className="text-gray-900 dark:text-white">{email}</span>
                    <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-full text-sm font-medium">
                      Đã xác minh
                    </span>
                  </div>
                </div>


              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 transform transition-all duration-300 hover:shadow-2xl">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-500" />
                Hành động nhanh
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900 dark:to-blue-800 hover:from-blue-100 hover:to-blue-200 dark:hover:from-blue-800 dark:hover:to-blue-700 transition-all duration-300 group">
                  <Shield className="w-5 h-5 text-blue-500 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-900 dark:text-white font-medium">Bảo mật</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-900 dark:to-purple-800 hover:from-purple-100 hover:to-purple-200 dark:hover:from-purple-800 dark:hover:to-purple-700 transition-all duration-300 group">
                  <Bell className="w-5 h-5 text-purple-500 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-900 dark:text-white font-medium">Thông báo</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-red-50 to-red-100 dark:from-red-900 dark:to-red-800 hover:from-red-100 hover:to-red-200 dark:hover:from-red-800 dark:hover:to-red-700 transition-all duration-300 group"
                >
                  <LogOut className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                  <span className="text-gray-900 dark:text-white font-medium">Đăng xuất</span>
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-3xl shadow-xl p-6 text-white transform transition-all duration-300 hover:shadow-2xl hover:scale-105">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5" />
                Hoạt động của bạn
              </h3>
              {loadingStats ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-8 h-8 animate-spin" />
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/10 backdrop-blur-lg border border-white/20
                  rounded-2xl p-4 text-center transition-all
                  hover:bg-white/20 hover:scale-105">
                    <div className="text-3xl font-bold mb-1">{formatNumber(stats.posts)}</div>
                    <div className="text-sm opacity-90">Bài viết</div>
                  </div>

                  <div className="bg-white/10 backdrop-blur-lg border border-white/20
                  rounded-2xl p-4 text-center transition-all
                  hover:bg-white/20 hover:scale-105">
                    <div className="text-3xl font-bold mb-1">{formatNumber(stats.likes)}</div>
                    <div className="text-sm opacity-90">Thích</div>
                  </div>
                </div>

              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
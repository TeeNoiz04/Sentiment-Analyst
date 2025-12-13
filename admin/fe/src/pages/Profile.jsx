import { useState } from "react";
import { User, Mail, Phone, Edit2, Save, X, Camera, Shield, Bell, LogOut, Sparkles } from "lucide-react";

export default function Profile() {
  const [displayName, setDisplayName] = useState("Nguyễn Văn A");
  const [editName, setEditName] = useState(false);
  const [tempName, setTempName] = useState(displayName);

  const handleSave = () => {
    setDisplayName(tempName);
    setEditName(false);
  };

  const handleCancel = () => {
    setTempName(displayName);
    setEditName(false);
  };

  // Tạo avatar gradient từ tên
  const getInitials = (name) => {
    return name
      .split(" ")
      .map((word) => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900">
      <div className="container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <div className="inline-flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <User className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-3xl sm:text-4xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Hồ sơ cá nhân
            </h1>
          </div>
          <p className="text-gray-600 dark:text-gray-400">
            Quản lý thông tin và cài đặt tài khoản của bạn
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Main Profile Card */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
             {/* Gradient Header */}
<div className="h-32 bg-gradient-to-r from-blue-500 via-blue-400 to-cyan-400 relative">
  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-30"></div>
</div>

              {/* Profile Content */}
              <div className="px-6 sm:px-8 pb-8">
                {/* Avatar Section */}
                <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6">
                  <div className="relative group">
                    {/* Avatar with gradient border */}
                   <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 p-1 shadow-2xl">
  <div className="w-full h-full rounded-full bg-white dark:bg-gray-800 flex items-center justify-center text-4xl font-black text-transparent bg-gradient-to-br from-blue-600 to-cyan-500 bg-clip-text">
    {getInitials(displayName)}
  </div>
</div>
                    
                    {/* Camera Button */}
                    <button className="absolute bottom-0 right-0 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-transform duration-300 border-4 border-white dark:border-gray-800">
                      <Camera className="w-5 h-5 text-white" />
                    </button>
                  </div>

                  <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {displayName}
                    </h2>
                    <p className="text-gray-500 dark:text-gray-400 flex items-center justify-center sm:justify-start gap-2 mt-1">
                      <Sparkles className="w-4 h-4 text-purple-500" />
                      Thành viên tích cực
                    </p>
                  </div>
                </div>

                {/* Info Fields */}
                <div className="space-y-6">
                  {/* Display Name */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <User className="w-4 h-4 text-blue-500" />
                      Tên hiển thị
                    </label>

                    {editName ? (
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={tempName}
                          onChange={(e) => setTempName(e.target.value)}
                          className="flex-1 px-4 py-3 border-2 border-blue-300 dark:border-blue-600 rounded-xl bg-white dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all"
                          autoFocus
                        />
                        <button
                          onClick={handleSave}
                          className="px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-105 flex items-center gap-2"
                        >
                          <Save className="w-4 h-4" />
                          <span className="hidden sm:inline">Lưu</span>
                        </button>
                        <button
                          onClick={handleCancel}
                          className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-300 flex items-center gap-2"
                        >
                          <X className="w-4 h-4" />
                          <span className="hidden sm:inline">Hủy</span>
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                        <span className="text-gray-900 dark:text-white font-medium text-lg">
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
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Mail className="w-4 h-4 text-purple-500" />
                      Email
                    </label>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-white font-medium">
                        user@example.com
                      </span>
                      <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-semibold rounded-full">
                        Đã xác minh
                      </span>
                    </div>
                  </div>

                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                      <Phone className="w-4 h-4 text-pink-500" />
                      Số điện thoại
                    </label>
                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-700">
                      <span className="text-gray-900 dark:text-white font-medium">
                        0123 456 789
                      </span>
                      <button className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold text-sm">
                        Cập nhật
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar - Settings & Actions */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">
                Hành động nhanh
              </h3>
              <div className="space-y-3">
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 text-blue-700 dark:text-blue-400 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105">
                  <Shield className="w-5 h-5" />
                  <span className="font-semibold">Bảo mật</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 text-purple-700 dark:text-purple-400 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105">
                  <Bell className="w-5 h-5" />
                  <span className="font-semibold">Thông báo</span>
                </button>
                <button className="w-full flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-900/20 dark:to-rose-900/20 text-red-700 dark:text-red-400 rounded-xl hover:shadow-md transition-all duration-300 hover:scale-105">
                  <LogOut className="w-5 h-5" />
                  <span className="font-semibold">Đăng xuất</span>
                </button>
              </div>
            </div>

            {/* Stats Card */}
            <div className="bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-2xl shadow-xl p-6 text-white relative overflow-hidden">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iYSIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVHJhbnNmb3JtPSJyb3RhdGUoNDUpIj48cGF0aCBkPSJNLTEwIDMwaDYwIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMSIgb3BhY2l0eT0iMC4xIi8+PC9wYXR0ZXJuPjwvZGVmcz48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSJ1cmwoI2EpIi8+PC9zdmc+')] opacity-30"></div>
              
              <div className="relative z-10">
                <Sparkles className="w-8 h-8 mb-3" />
                <h3 className="text-xl font-bold mb-2">Hoạt động của bạn</h3>
                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <div className="text-2xl font-black">42</div>
                    <div className="text-sm opacity-90">Bài viết</div>
                  </div>
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3">
                    <div className="text-2xl font-black">1.2K</div>
                    <div className="text-sm opacity-90">Thích</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useEffect, useState } from "react";
import { LogIn, UserPlus, User, Lock, Mail, Eye, EyeOff, Sparkles, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { register as handleRegister, login as handleLogin } from "../services/authService";
import { notifyError, notifySuccess } from "../utils/toast";
export default function Login() {
    const [activeTab, setActiveTab] = useState("login");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        if (user && token) {
            console.log("Storing user session:", user);
            localStorage.setItem("access_token", token);
            sessionStorage.setItem("user_id", user.user_id);
            sessionStorage.setItem("userName", user.username);
            sessionStorage.setItem("email", user.email);
        }
    }, [user, token]);

    const navigate = useNavigate();
    const {
        register,
        handleSubmit,
        watch,
        reset,
        formState: { errors }
    } = useForm();

    const password = watch("registerPassword");

    const onLoginSubmit = async (data) => {
        setLoading(true);
        const res = await handleLogin(data);
        setLoading(false);
        if (res.success) {
            notifySuccess("Đăng nhập thành công!");
            setUser(res.data.user);
            setToken(res.data.access_token);
            navigate("/");
        } else {
            notifyError(res.message || "Đăng nhập thất bại. Vui lòng thử lại.");
        }
    };

    const handleForgotPassword = () => {
        navigate("/forgot-password");
    };



    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900 p-4">
            <div className="w-full max-w-md">
                {/* Logo & Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl mb-4">
                        <Sparkles className="w-10 h-10 text-white" />
                    </div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                        Hội Bàn Tròn Admin
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 mt-2">
                        Cộng đồng kết nối và chia sẻ
                    </p>
                </div>

                {/* Main Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                    {/* Gradient Top Border */}
                    <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

                    {/* Tabs */}
                    <div className="flex border-b border-gray-200 dark:border-gray-700">
                        <button
                            onClick={() => { setActiveTab("login"); setShowPassword(false); setShowConfirmPassword(false); reset(); }}
                            className={`flex-1 py-4 px-6 font-semibold transition-all duration-300 relative ${activeTab === "login"
                                ? "text-blue-600 dark:text-blue-400"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2 cursor-pointer">
                                <LogIn className="w-5 h-5" />
                                Đăng nhập
                            </span>
                            {activeTab === "login" && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-t-full"></div>
                            )}
                        </button>                 
                    </div>

                    {/* Forms Container */}
                    <div className="p-8">
                        {/* Login Form */}
                        {activeTab === "login" && (
                            <form onSubmit={handleSubmit(onLoginSubmit)} className="space-y-5 animate-fade-in">

                                {/* Username */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300 cursor-pointer">
                                        <User className="w-4 h-4 text-blue-500" />
                                        Tên đăng nhập <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            {...register("username", { required: "Vui lòng nhập tên đăng nhập" })}
                                            placeholder="Nhập tên đăng nhập..."
                                            className={`w-full px-4 py-3 pl-11 border-2 rounded-xl bg-gray-50 dark:bg-gray-900
                                            ${errors.username ? "border-red-500" : "border-gray-200 dark:border-gray-600"}`}
                                        />
                                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    </div>
                                    {errors.username && <p className="text-red-500 text-sm">{errors.username.message}</p>}
                                </div>

                                {/* Password */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        <Lock className="w-4 h-4 text-purple-500" />
                                        Mật khẩu <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            {...register("password", {
                                                required: "Vui lòng nhập mật khẩu",
                                                minLength: { value: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                                                validate: (value) => {
                                                    if (!/[A-Z]/.test(value)) return "Phải có chữ hoa (A-Z)";
                                                    if (!/[a-z]/.test(value)) return "Phải có chữ thường (a-z)";
                                                    if (!/[0-9]/.test(value)) return "Phải có số (0-9)";
                                                    if (!/[@$!%*?&]/.test(value)) return "Phải có ký tự đặc biệt (@$!%*?&)";
                                                    return true;
                                                }
                                            })}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Nhập mật khẩu..."
                                            className={`w-full px-4 py-3 pl-11 pr-11 border-2 rounded-xl bg-gray-50 dark:bg-gray-900
                                             ${errors.password ? "border-red-500" : "border-gray-200 dark:border-gray-600"}`}
                                        />

                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />

                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    {errors.password && <p className="text-red-500 text-sm">{errors.password.message}</p>}
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" className="rounded border-gray-300 text-blue-600 focus:ring-blue-500" />
                                        <span className="text-gray-600 dark:text-gray-400">Ghi nhớ</span>
                                    </label>
                                    <button type="button" className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                                        onClick={handleForgotPassword}>
                                        Quên mật khẩu?
                                    </button>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                                >
                                    <LogIn className="w-5 h-5" />
                                    Đăng nhập
                                </button>
                            </form>
                        )}

                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
                    © 2025 Hội Bàn Tròn - Nền tảng cộng đồng
                </p>
            </div>

            <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
        </div>
    );
}
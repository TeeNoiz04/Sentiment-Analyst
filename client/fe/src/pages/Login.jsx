import { useEffect, useState } from "react";
import { LogIn, UserPlus, User, Lock, Mail, Eye, EyeOff, Sparkles, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { register as handleRegister, login as handleLogin } from "../services/authService";
import { notifyError, notifySuccess } from "../utils/toast";
export default function Login() {
    const [activeTab, setActiveTab] = useState("login");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);

    useEffect(() => {
        if (user && token) {
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
            sessionStorage.setItem("userName", res.data.user.Username);
            navigate("/");
        } else {
            notifyError(res.message || "Đăng nhập thất bại. Vui lòng thử lại.");
        }
    };


    const onRegisterSubmit = async (data) => {
        setLoading(true);
        const registerData = {
            username: data.registerName,
            password: data.registerPassword,
            email: data.registerEmail || undefined,
        };
        const res = await handleRegister(registerData);
        setLoading(false);

        if (res.success) {
            notifySuccess("Đăng ký thành công!");
            setActiveTab("login");
            reset();
        } else {
            notifyError(res.message || "Đăng ký thất bại. Vui lòng thử lại.");
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
                        Hội Bàn Tròn
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

                        <button
                            onClick={() => { setActiveTab("register"); setShowPassword(false); setShowConfirmPassword(false); reset(); }}
                            className={`flex-1 py-4 px-6 font-semibold transition-all duration-300 relative ${activeTab === "register"
                                ? "text-purple-600 dark:text-purple-400"
                                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                                }`}
                        >
                            <span className="flex items-center justify-center gap-2 cursor-pointer">
                                <UserPlus className="w-5 h-5" />
                                Đăng ký
                            </span>
                            {activeTab === "register" && (
                                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 to-pink-600 rounded-t-full"></div>
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

                        {/* Register Form */}
                        {activeTab === "register" && (
                            <form onSubmit={handleSubmit(onRegisterSubmit)} className="space-y-5 animate-fade-in">

                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        <User className="w-4 h-4 text-blue-500" />
                                        Tên đăng nhập <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="text"
                                            placeholder="Nhập tên đăng nhập..."
                                            {...register("registerName", {
                                                required: "Tên không được bỏ trống",
                                                minLength: { value: 2, message: "Tên quá ngắn" }
                                            })}
                                            className={`w-full px-4 py-3 pl-10 border rounded-xl bg-gray-50 dark:bg-gray-900 ${errors.registerName ? "border-red-500" : "border-gray-200 dark:border-gray-600"}`}
                                        />
                                    </div>
                                    {errors.registerName && <p className="text-red-500 text-sm">{errors.registerName.message}</p>}

                                </div>


                                {/* Email */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        <Mail className="w-4 h-4 text-purple-500" />
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type="email"
                                            placeholder="Nhập email..."
                                            {...register("registerEmail", {
                                                pattern: {
                                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                                    message: "Email không hợp lệ"
                                                }
                                            })}
                                            className={`w-full px-4 py-3 pl-10 border rounded-xl bg-gray-50 dark:bg-gray-900 ${errors.registerEmail ? "border-red-500" : "border-gray-200 dark:border-gray-600"}`}
                                        />


                                    </div>
                                    <p className="text-red-500 text-sm">{errors.registerEmail?.message}</p>

                                </div>
                                {/* Password */}

                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        <Lock className="w-4 h-4 text-pink-500" />
                                        Mật khẩu <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? "text" : "password"}
                                            placeholder="Nhập mật khẩu..."
                                            {...register("registerPassword", {
                                                required: "Vui lòng nhập mật khẩu",
                                                minLength: { value: 6, message: "Mật khẩu ít nhất 6 ký tự" },
                                                validate: (value) => {
                                                    if (!/[A-Z]/.test(value)) return "Phải có chữ hoa (A-Z)";
                                                    if (!/[a-z]/.test(value)) return "Phải có chữ thường (a-z)";
                                                    if (!/[0-9]/.test(value)) return "Phải có số (0-9)";
                                                    if (!/[@$!%*?&]/.test(value)) return "Phải có ký tự đặc biệt (@$!%*?&)";
                                                    return true;
                                                }
                                            })}
                                            className={`w-full px-4 py-3 pl-10 border rounded-xl bg-gray-50 dark:bg-gray-900 ${errors.registerPassword ? "border-red-500" : "border-gray-200 dark:border-gray-600"}`}
                                        />

                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <button
                                            type="button"
                                            onClick={() => { setShowPassword(!showPassword); }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-red-500 text-sm">{errors.registerPassword?.message}</p>
                                </div>


                                {/* Confirm Password */}
                                <div className="space-y-2">
                                    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                                        <Shield className="w-4 h-4 text-green-500" />
                                        Xác nhận mật khẩu <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            placeholder="Nhập lại mật khẩu..."
                                            {...register("confirmPassword", {
                                                required: "Vui lòng xác nhận mật khẩu",
                                                validate: value =>
                                                    value === password || "Mật khẩu nhập lại không khớp"
                                            })}
                                            className={`w-full px-4 py-3 pl-10 border rounded-xl bg-gray-50 dark:bg-gray-900 ${errors.confirmPassword ? "border-red-500" : "border-gray-200 dark:border-gray-600"}`}
                                        />

                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowConfirmPassword(!showConfirmPassword)
                                            }}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                                        >
                                            {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                    <p className="text-red-500 text-sm">{errors.confirmPassword?.message}</p>

                                </div>
                                <div className="flex items-start gap-2">
                                    <input type="checkbox" className="mt-1 rounded border-gray-300 text-purple-600 focus:ring-purple-500" required />
                                    <label className="text-sm text-gray-600 dark:text-gray-400">
                                        Tôi đồng ý với{" "}
                                        <button type="button" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
                                            Điều khoản
                                        </button>{" "}
                                        và{" "}
                                        <button type="button" className="text-purple-600 dark:text-purple-400 hover:underline font-semibold">
                                            Chính sách
                                        </button>
                                    </label>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-3.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                                >
                                    <UserPlus className="w-5 h-5" />
                                    Đăng ký
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
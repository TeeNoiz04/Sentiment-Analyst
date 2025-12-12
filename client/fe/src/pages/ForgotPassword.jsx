import { useState } from "react";
import { Mail, ArrowLeft, Send, CheckCircle, KeyRound, Lock, Shield } from "lucide-react";
import { useNavigate } from "react-router-dom";
export default function ForgotPassword() {
  const [step, setStep] = useState(1); // 1: Email, 2: Code, 3: New Password, 4: Success
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // Handle sending reset email
  const handleSendEmail = async (e) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setStep(2);
  };

  // Handle OTP code input
  const handleCodeChange = (index, value) => {
    if (value.length > 1) return;
    
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);

    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) nextInput.focus();
    }
  };

  // Handle code verification
  const handleVerifyCode = async (e) => {
    e.preventDefault();
    const fullCode = code.join("");
    if (fullCode.length !== 6) return;

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setStep(3);
  };

  // Handle password reset
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (!newPassword || !confirmPassword) return;
    if (newPassword !== confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }

    setLoading(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    setStep(4);
  };

  // Handle back to login
  const handleBackToLogin = () => {
    // Navigate to login page - replace with your navigation logic
    console.log("Navigate to login");
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl shadow-2xl mb-4">
            <KeyRound className="w-10 h-10 text-white" />
          </div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Quên mật khẩu?
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            {step === 1 && "Nhập email để nhận mã xác thực"}
            {step === 2 && "Nhập mã 6 số đã gửi đến email"}
            {step === 3 && "Tạo mật khẩu mới cho tài khoản"}
            {step === 4 && "Mật khẩu đã được đặt lại thành công"}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Gradient Top Border */}
          <div className="h-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"></div>

          <div className="p-8">
            {/* Step 1: Enter Email */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Mail className="w-4 h-4 text-blue-500" />
                    Địa chỉ Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      placeholder="your@email.com"
                      className="w-full px-4 py-3 pl-11 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                    Chúng tôi sẽ gửi mã xác thực 6 số đến email này
                  </p>
                </div>

                <button
                  onClick={handleSendEmail}
                  disabled={loading || !email}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang gửi...
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      Gửi mã xác thực
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 2: Enter Code */}
            {step === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-3">
                    <Mail className="w-8 h-8 text-white" />
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Mã xác thực đã được gửi đến
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">{email}</p>
                </div>

                <div className="space-y-4">
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 text-center">
                    Nhập mã xác thực
                  </label>
                  
                  <div className="flex gap-2 justify-center">
                    {code.map((digit, index) => (
                      <input
                        key={index}
                        id={`code-${index}`}
                        type="text"
                        maxLength={1}
                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900 transition-all"
                        value={digit}
                        onChange={(e) => handleCodeChange(index, e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !digit && index > 0) {
                            const prevInput = document.getElementById(`code-${index - 1}`);
                            if (prevInput) prevInput.focus();
                          }
                        }}
                      />
                    ))}
                  </div>

                  <div className="text-center">
                    <button
                      type="button"
                      className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold"
                    >
                      Gửi lại mã
                    </button>
                  </div>
                </div>

                <button
                  onClick={handleVerifyCode}
                  disabled={loading || code.join("").length !== 6}
                  className="w-full py-3.5 bg-gradient-to-r from-purple-500 via-pink-500 to-rose-500 hover:from-purple-600 hover:via-pink-600 hover:to-rose-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xác thực...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Xác thực
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Lock className="w-4 h-4 text-purple-500" />
                    Mật khẩu mới
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Nhập mật khẩu mới..."
                      className="w-full px-4 py-3 pl-11 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900 transition-all"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                    />
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                    <Shield className="w-4 h-4 text-green-500" />
                    Xác nhận mật khẩu
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      placeholder="Nhập lại mật khẩu..."
                      className="w-full px-4 py-3 pl-11 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white focus:border-green-400 focus:ring-4 focus:ring-green-100 dark:focus:ring-green-900 transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-300 font-medium mb-2">
                    Mật khẩu mạnh nên có:
                  </p>
                  <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-1">
                    <li>• Ít nhất 8 ký tự</li>
                    <li>• Chữ hoa và chữ thường</li>
                    <li>• Ít nhất 1 số</li>
                    <li>• Ký tự đặc biệt (@, #, $...)</li>
                  </ul>
                </div>

                <button
                  onClick={handleResetPassword}
                  disabled={loading || !newPassword || !confirmPassword}
                  className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5" />
                      Đặt lại mật khẩu
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="space-y-6 text-center animate-fade-in">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full mb-4">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Thành công!
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Mật khẩu của bạn đã được đặt lại thành công.
                    <br />
                    Bây giờ bạn có thể đăng nhập bằng mật khẩu mới.
                  </p>
                </div>

                <button
                  onClick={handleBackToLogin}
                  className="w-full py-3.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Quay lại đăng nhập
                </button>
              </div>
            )}

            {/* Back Button (Steps 1-3) */}
            {step < 4 && (
              <button
                onClick={() => step === 1 ? handleBackToLogin() : setStep(step - 1)}
                className="w-full mt-4 py-2.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white font-semibold transition-colors flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                {step === 1 ? "Quay lại đăng nhập" : "Quay lại"}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400 mt-6">
          Cần trợ giúp?{" "}
          <button className="text-blue-600 dark:text-blue-400 hover:underline font-semibold">
            Liên hệ hỗ trợ
          </button>
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
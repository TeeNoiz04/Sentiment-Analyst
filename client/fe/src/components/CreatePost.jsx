import { useState, useEffect } from "react";
import { FileText, Type, AlignLeft, Sparkles } from "lucide-react";

export default function CreatePost({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({ title: "", content: "" });
  const [isFocused, setIsFocused] = useState({ title: false, content: false });

  const handleSubmit = (e) => {
    e.preventDefault();
    let newErrors = { title: "", content: "" };
    let hasError = false;

    if (!title.trim()) {
      newErrors.title = "Không được để trống tiêu đề";
      hasError = true;
    }
    if (!content.trim()) {
      newErrors.content = "Không được để trống nội dung";
      hasError = true;
    }

    setErrors(newErrors);
    if (hasError) return;
    const userId = Number(sessionStorage.getItem("user_id")) || 1;
    let data = { Title: title, Content: content, UserID: userId };
    onSubmit(data);
    setTitle("");
    setContent("");
    setErrors({ title: "", content: "" });
  };

  useEffect(() => {
    console.log("Errors updated:", errors);
  }, [errors]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8 sm:py-12">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl shadow-lg mb-4">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-2">
            Tạo bài viết mới
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Chia sẻ suy nghĩ và ý tưởng của bạn với cộng đồng
          </p>
        </div>

        {/* Form Card */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90 border border-gray-100 dark:border-gray-700">
          <div className="p-6 sm:p-8 md:p-10 space-y-6">
            {/* Title Input */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <Type className="w-4 h-4 text-blue-500" />
                Tiêu đề
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Nhập tiêu đề hấp dẫn cho bài viết..."
                  className={`w-full px-5 py-4 text-lg border-2 rounded-2xl transition-all duration-300 ${
                    errors.title
                      ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900"
                      : isFocused.title
                      ? "border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-800`}
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    if (errors.title) {
                      setErrors((prev) => ({ ...prev, title: "" }));
                    }
                  }}
                  onFocus={() => setIsFocused({ ...isFocused, title: true })}
                  onBlur={() => setIsFocused({ ...isFocused, title: false })}
                />
                {title && (
                  <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>
              {errors.title && (
                <div className="flex items-center gap-2 text-red-500 text-sm animate-pulse">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.title}
                </div>
              )}
            </div>

            {/* Content Textarea */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                <AlignLeft className="w-4 h-4 text-blue-500" />
                Nội dung
                <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <textarea
                  rows={8}
                  placeholder="Viết nội dung chi tiết và sinh động..."
                  className={`w-full px-5 py-4 text-base border-2 rounded-2xl resize-none transition-all duration-300 ${
                    errors.content
                      ? "border-red-400 focus:border-red-500 focus:ring-4 focus:ring-red-100 dark:focus:ring-red-900"
                      : isFocused.content
                      ? "border-blue-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900"
                      : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500"
                  } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:bg-white dark:focus:bg-gray-800`}
                  value={content}
                  onChange={(e) => {
                    setContent(e.target.value);
                    if (errors.content) {
                      setErrors((prev) => ({ ...prev, content: "" }));
                    }
                  }}
                  onFocus={() => setIsFocused({ ...isFocused, content: true })}
                  onBlur={() => setIsFocused({ ...isFocused, content: false })}
                />
                {content && (
                  <div className="absolute right-4 bottom-4">
                    <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
                      {content.length} ký tự
                    </span>
                  </div>
                )}
              </div>
              {errors.content && (
                <div className="flex items-center gap-2 text-red-500 text-sm animate-pulse">
                  <div className="w-1 h-1 bg-red-500 rounded-full"></div>
                  {errors.content}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <button
                onClick={handleSubmit}
                className="w-full group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-2xl focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800"
              >
                <span className="flex items-center justify-center gap-2">
                  <FileText className="w-5 h-5" />
                  Đăng bài viết
                  <span className="inline-block transition-transform group-hover:translate-x-1">
                    →
                  </span>
                </span>
                <div className="absolute inset-0 rounded-2xl bg-white opacity-0 group-hover:opacity-20 transition-opacity"></div>
              </button>
            </div>
          </div>
  
        </div>

        {/* Helper Text */}
        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          💡 Mẹo: Sử dụng tiêu đề ngắn gọn và nội dung rõ ràng để thu hút độc giả
        </p>
      </div>
    </div>
  );
}
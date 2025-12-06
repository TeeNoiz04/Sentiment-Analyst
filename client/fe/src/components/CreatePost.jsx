import {  useEffect, useState } from "react";
export default function CreatePost({ onSubmit }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [errors, setErrors] = useState({ title: "", content: "" });
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
    let data = { Title: title, Content: content, UserID: 1 };
    onSubmit(data);
    setTitle("");
    setContent("");
    setErrors({ title: "", content: "" });
  };

  useEffect(() => {
    console.log("Errors updated:", errors);
  }, [errors]);
  
  return (
    <div className="flex justify-center px-4 py-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-3xl sm:w-11/12 md:w-3/4 p-6 border rounded-xl shadow-lg bg-white dark:bg-gray-800"
      >
        <h2 className="text-2xl font-semibold mb-6 text-center text-gray-900 dark:text-gray-100">
          Tạo bài viết
        </h2>

        {/* Input Title */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-900 dark:text-gray-100 font-medium">
            Tiêu đề <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            placeholder="Nhập tiêu đề bài viết..."
            className={`w-full px-4 py-3 border rounded focus:outline-none focus:ring-2 ${errors.title
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
              } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) {
                setErrors((prev) => ({ ...prev, title: "" }));
              }

            }}
          />
          {errors.title && (
            <p className="text-red-500 text-sm mt-1">{errors.title}</p>
          )}
        </div>

        {/* Textarea Content */}
        <div className="mb-4">
          <label className="block mb-1 text-gray-900 dark:text-gray-100 font-medium">
            Nội dung <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={6}
            placeholder="Nhập nội dung bài viết..."
            className={`w-full px-4 py-3 border rounded resize-none focus:outline-none focus:ring-2 ${errors.content
              ? "border-red-500 focus:ring-red-500"
              : "border-gray-300 focus:ring-blue-500"
              } bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100`}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              if (errors.content) {
                setErrors((prev) => ({ ...prev, content: "" }));
              }
            }}
          />
          {errors.content && (
            <p className="text-red-500 text-sm mt-1">{errors.content}</p>
          )}
        </div>

        <div className="flex justify-center">
          <button
            type="submit"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            Tạo bài viết
          </button>
        </div>
      </form>
    </div>

  );
}

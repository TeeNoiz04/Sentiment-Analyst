import useComments from "../hooks/useComments";
import { useState } from "react";


export default function ModalComment({ isOpen, onClose, post, user }) {
  if (!isOpen) return null;

  const {comments, loading, addComment, loadMore, loadingMore, total } = useComments(post.PostID, user.UserID);
  const [text, setText] = useState("");

  const handleSubmit = () => {  
    if (!text.trim()) return;
    addComment(post.PostID, text, user.UserID);
    setText("");
  
  };
  
  return (
    <div
      className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
      onClick={onClose}
    >
      {/* Modal Container: Lớn, bo góc mềm mại, sử dụng flex-col để chia bố cục dọc */}
      <div
        className="bg-white dark:bg-gray-800 w-full max-w-3xl lg:max-w-4xl rounded-xl shadow-2xl relative max-h-[95vh] h-full sm:h-auto sm:max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300 scale-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. HEADER & POST SUMMARY (Phần cố định trên cùng) */}
        <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">

          {/* Nút Đóng */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full bg-gray-50 dark:bg-gray-700 z-10"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>

          {/* Header User Info */}
          <div className="flex items-center mb-4">
            <img
              src={user?.AvatarURL || "/img/avatar.jpg"}
              alt={user?.Username}
              className="w-10 h-10 rounded-full mr-3 object-cover border-2 border-blue-400 flex-shrink-0"
            />
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white hover:text-blue-500 cursor-pointer leading-tight">
                {user?.Username}
              </h3>
              <span className="text-xs text-gray-500">{post.CreatedOn}</span>
            </div>
          </div>

          {/* Post Title & Content (Giới hạn hiển thị để ưu tiên bình luận) */}
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white mb-2 leading-snug">
            {post.Title}
          </h2>
          <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed max-h-24 overflow-y-auto pr-2">
            {post.Content}
          </p>
        </div>

        {/* 2. COMMENT LIST SECTION (Phần cuộn chính) */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {loading ? (
            <p className="text-center text-blue-500 animate-pulse font-medium">Đang tải bình luận...</p>
          ) : (
            <>
              {comments && comments.length === 0 && <p className="text-gray-500 text-center italic">Chưa có bình luận. Hãy là người đầu tiên!</p>}

              <ul className="space-y-4">
                {comments && comments.map((c, i) => (
                  <li key={i} className="flex items-start gap-3">
                    {/* Avatar bình luận */}
                    <img
                      src={c.UserAvatarURL || "/img/default-comment-avatar.jpg"}
                      alt={c.user}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0 mt-1"
                    />
                    <div className="flex-1 p-2 bg-gray-100 dark:bg-gray-700 rounded-xl">
                      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-tight">
                        {c.Username}
                        <span className="ml-2 text-xs font-normal text-gray-500 dark:text-gray-400">
                          {c.CreatedAt}
                        </span>
                      </p>
                      <span className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-line">
                        {c.content}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>

              {comments && comments.length < total && (
                <button
                  onClick={loadMore}
                  className="w-full py-2 text-blue-600 border border-blue-300 dark:border-blue-700 rounded-full mt-4 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition duration-200 font-semibold"
                  disabled={loadingMore}
            >
                  {loadingMore ? "Đang tải..." : "Tải thêm bình luận"}
                </button>
              )}
            </>
          )}
        </div>

        {/* 3. COMMENT INPUT FORM (Phần cố định dưới cùng) */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex-shrink-0">
          <div className="flex gap-3 items-center">
            {/* Avatar người dùng hiện tại */}
            <img
              src={user?.AvatarURL || "/img/avatar.jpg"}
              className="w-8 h-8 rounded-full object-cover flex-shrink-0"
              alt="Your Avatar"
            />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Viết bình luận của bạn..."
              className="flex-1 border border-gray-300 p-3 rounded-full dark:bg-gray-700 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
              aria-label="Nhập bình luận mới"
            />
            <button
              onClick={handleSubmit}
              className="px-5 py-2.5 bg-blue-600 text-white font-semibold rounded-full hover:bg-blue-700 transition disabled:bg-blue-400 flex-shrink-0"
              disabled={!text || text.trim() === ''}
            >
              Gửi
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

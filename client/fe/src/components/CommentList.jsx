import React, { useState } from "react";

export default function CommentList({ comments, onAddComment }) {
  const [text, setText] = useState("");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onAddComment(text);
    setText("");
  };

  return (
    <div className="mt-4 bg-gray-50 dark:bg-gray-800 rounded-xl p-4">

      {/* Input comment */}
      <div className="flex items-start gap-3 mb-4">
        <img
          src="/avatar-default.png"
          alt="User"
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1">
          <textarea
            rows={1}
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Viết bình luận..."
            className="w-full p-2 border border-gray-300 dark:border-gray-700 rounded-lg 
                       bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                       focus:ring-2 focus:ring-blue-500 outline-none resize-none"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition"
        >
          Gửi
        </button>
      </div>

      {/* Danh sách comment */}
      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-gray-500 text-sm">Chưa có bình luận nào</p>
        )}

        {comments.map((cmt, index) => (
          <div key={index} className="flex items-start gap-3">
            {/* Avatar */}
            <img
              src={cmt.avatar || "/avatar-default.png"}
              alt={cmt.user}
              className="w-10 h-10 rounded-full object-cover"
            />

            {/* Nội dung */}
            <div className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-sm w-full">
              <h4 className="font-semibold text-gray-900 dark:text-gray-100 text-sm">
                {cmt.user}
              </h4>
              <p className="text-gray-700 dark:text-gray-300 text-sm mt-1">
                {cmt.text}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 block">
                {cmt.time}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

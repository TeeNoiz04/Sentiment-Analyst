import React from "react";

const Loading = () => {
  return (
    <div className="flex items-center justify-center p-6 bg-white rounded-2xl shadow-lg border border-gray-200">
      <span className="mr-4 font-semibold text-gray-700 text-lg">Đang phân tích</span>
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
        <div className="w-3 h-3 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
        <div className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
      </div>
    </div>
  );
};


export default Loading;

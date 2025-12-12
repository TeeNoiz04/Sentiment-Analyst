// components/Loading.jsx
import { useState, useRef, useEffect } from "react";
import { Calendar, Tag, Search, AlertCircle, Home, PenSquare, Users, User, LogOut, Menu, X, Sparkles } from "lucide-react";
function Loading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900">
      <div className="relative">
        {/* Outer ring */}
        <div className="w-20 h-20 border-4 border-gray-200 dark:border-gray-700 rounded-full"></div>
        
        {/* Spinning gradient ring */}
        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-t-blue-500 border-r-purple-500 border-b-pink-500 rounded-full animate-spin"></div>
        
        {/* Center dot */}
        <div className="absolute inset-0 m-auto w-4 h-4 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-pulse"></div>
      </div>
      
      <p className="mt-6 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
        Đang tải...
      </p>
    </div>
  );
}
export default Loading;
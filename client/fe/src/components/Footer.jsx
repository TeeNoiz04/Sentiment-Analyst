import { useState, useRef, useEffect } from "react";
import { Calendar, Tag, Search, AlertCircle, Home, PenSquare, Users, User, LogOut, Menu, X, Sparkles } from "lucide-react";

function Footer() {
  const footerLinks = [
    { name: "Tạo bài viết", path: "/post" },
    { name: "Về chúng tôi", path: "/about" },
    { name: "Hồ sơ", path: "/profile" },
  ];

  return (
    <footer className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-6">
          {/* Copyright */}
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Copyright © {new Date().getFullYear()}{" "}
              <span className="font-semibold bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Creative Hội Bàn Tròn
              </span>
            </p>
          </div>

          {/* Links */}
          <div className="flex gap-6">
            {footerLinks.map((link) => (
              <a
                key={link.name}
                href={link.path}
                className="text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
export default Footer;
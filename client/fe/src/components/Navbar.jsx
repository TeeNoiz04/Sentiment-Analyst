import { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const userName = sessionStorage.getItem("userName");
  const navigate = useNavigate();
  const location = useLocation();
  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef();

  const menuItems = [
    { name: "Home", path: "/" },
    { name: "Dashboard", path: "/dashboard" },
    { name: "About", path: "/about" }, // ví dụ thêm
  ];

  const handleLogout = () => {
    sessionStorage.removeItem("userName");
    navigate("/login", { replace: true });
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md py-3 px-6">
      <div className="container mx-auto flex items-center justify-between">
        {/* Menu chính ở giữa */}
        <div className="flex-1 flex justify-center gap-6 font-medium text-gray-700 dark:text-gray-200">
          {menuItems.map((item) => (
            <Link
              key={item.name}
              to={item.path}
              className={`relative px-2 py-1 hover:text-blue-500 transition ${location.pathname === item.path
                ? "text-blue-500 after:content-[''] after:block after:h-0.5 after:w-full after:bg-blue-500 after:mt-1"
                : ""
                }`}
            >
              {item.name}
            </Link>
          ))}

        </div>
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setOpenMenu((prev) => !prev)}
            className="flex items-center justify-center focus:outline-none"
          >
            {/* Avatar chính với border tròn */}
            <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold shadow-lg border-2 border-white dark:border-gray-700">
              {userName.charAt(0).toUpperCase()}
            </div>
          </button>

          {openMenu && (
            <div className="absolute right-0 mt-2 w-44 bg-white dark:bg-gray-800 shadow-lg rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden z-50">
              <button
                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={() => alert("Trang Hồ sơ")}
              >
                Hồ sơ
              </button>
              <button
                className="w-full text-left px-4 py-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                onClick={handleLogout}
              >
                Đăng xuất
              </button>
            </div>
          )}
        </div>


      </div>
    </nav>
  );
}

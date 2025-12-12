import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

export default function Pagination({ currentPage, totalPages, onPageChange }) {
  const getPageNumbers = () => {
    const pages = [];
    const delta = 1; // số trang hiển thị trước và sau trang hiện tại
    const left = Math.max(2, currentPage - delta);
    const right = Math.min(totalPages - 1, currentPage + delta);
    
    pages.push(1); // luôn có trang đầu

    if (left > 2) pages.push("left-ellipsis");

    for (let i = left; i <= right; i++) {
      pages.push(i);
    }

    if (right < totalPages - 1) pages.push("right-ellipsis");

    if (totalPages > 1) pages.push(totalPages); // luôn có trang cuối

    return pages;
  };

  const pages = getPageNumbers();

  return (
    <nav className="flex justify-center mt-8 mb-6">
      <div className="inline-flex items-center gap-2 p-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700">
        {/* Previous Button */}
        <button
          onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
            currentPage === 1
              ? "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
              : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-500 hover:to-purple-600 hover:text-white hover:shadow-md hover:scale-105"
          }`}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Trước</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pages.map((page, idx) => {
            if (page === "left-ellipsis" || page === "right-ellipsis") {
              return (
                <div
                  key={page + idx}
                  className="px-3 py-2 text-gray-400 dark:text-gray-600"
                >
                  <MoreHorizontal className="w-5 h-5" />
                </div>
              );
            }

            return (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`min-w-[40px] px-3 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
                  currentPage === page
                    ? "bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/30 scale-110"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:scale-105"
                }`}
              >
                {page}
              </button>
            );
          })}
        </div>

        {/* Next Button */}
        <button
          onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold transition-all duration-300 ${
            currentPage === totalPages
              ? "text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50"
              : "text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-600 hover:text-white hover:shadow-md hover:scale-105"
          }`}
        >
          <span className="hidden sm:inline">Sau</span>
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>
    </nav>
  );
}


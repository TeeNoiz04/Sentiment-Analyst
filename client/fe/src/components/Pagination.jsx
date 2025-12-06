import React from "react";

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
    <nav className="flex justify-center mt-6">
      <ul className="inline-flex items-center -space-x-px">
        {/* Previous */}
        <li>
          <button
            onClick={() => currentPage > 1 && onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`px-3 py-1 rounded-l-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Previous
          </button>
        </li>

        {/* Page numbers */}
        {pages.map((page, idx) => {
          if (page === "left-ellipsis" || page === "right-ellipsis") {
            return (
              <li key={page + idx}>
                <span className="px-3 py-1 border border-gray-300 bg-white text-gray-700">
                  ...
                </span>
              </li>
            );
          }

          return (
            <li key={page}>
              <button
                onClick={() => onPageChange(page)}
                className={`px-3 py-1 border border-gray-300 ${
                  currentPage === page
                    ? "bg-blue-500 text-white"
                    : "bg-white text-gray-700 hover:bg-gray-100"
                }`}
              >
                {page}
              </button>
            </li>
          );
        })}

        {/* Next */}
        <li>
          <button
            onClick={() => currentPage < totalPages && onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`px-3 py-1 rounded-r-lg border border-gray-300 bg-white text-gray-700 hover:bg-gray-100 ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Next
          </button>
        </li>
      </ul>
    </nav>
  );
}

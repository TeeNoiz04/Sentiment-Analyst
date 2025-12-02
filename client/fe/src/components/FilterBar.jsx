import React from "react";

const FilterBar = ({ filters, setFilters }) => {
  const users = ["All", "Nguyen Van A", "Tran Thi B", "Le Van C"];
  const topics = ["All", "React", "AI", "Flutter"];
  const days = ["All", "Today", "This Week", "This Month"];

  return (
    <div className="flex flex-col md:flex-row gap-4 mb-4 justify-between items-center">
      {/* Người đăng */}
      <div className="flex gap-2 flex-wrap">
        {users.map((u) => (
          <button
            key={u}
            onClick={() => setFilters({ ...filters, user: u })}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              filters.user === u
                ? "bg-blue-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {u}
          </button>
        ))}
      </div>

      {/* Chủ đề */}
      <div className="flex gap-2 flex-wrap">
        {topics.map((t) => (
          <button
            key={t}
            onClick={() => setFilters({ ...filters, topic: t })}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              filters.topic === t
                ? "bg-green-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Ngày đăng */}
      <div className="flex gap-2 flex-wrap">
        {days.map((d) => (
          <button
            key={d}
            onClick={() => setFilters({ ...filters, day: d })}
            className={`px-3 py-1 rounded-full text-sm font-medium transition ${
              filters.day === d
                ? "bg-pink-500 text-white"
                : "bg-gray-200 dark:bg-gray-700 dark:text-white hover:bg-gray-300 dark:hover:bg-gray-600"
            }`}
          >
            {d}
          </button>
        ))}
      </div>
    </div>
  );
};

export default FilterBar;

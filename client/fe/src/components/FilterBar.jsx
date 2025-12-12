//components/FilterBar.jsx
import { Calendar, Tag, Search, AlertCircle, Home, PenSquare, Users, User, LogOut, Menu, X, Sparkles } from "lucide-react";

// ============================================
// FilterBar Component
// ============================================
const topics = [
  { label: "Cơ sở vật chất", value: "LABEL_0" },
  { label: "Giảng viên", value: "LABEL_1" },
  { label: "Sinh viên", value: "LABEL_2" },
  { label: "Chương trình đào tạo", value: "LABEL_3" },
];

function FilterBar({
  startDate,
  endDate,
  selectedTopic,
  isLoadingData,
  error,
  onChangeStart,
  onChangeEnd,
  onChangeTopic,
  onSearch,
}) {
  return (
    <div className="bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 dark:from-gray-900 dark:via-purple-900/10 dark:to-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
            <Search className="w-5 h-5 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Bộ lọc tìm kiếm
          </h2>
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          {/* Date From */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-blue-500" />
              Từ ngày
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-blue-400 focus:ring-4 focus:ring-blue-100 dark:focus:ring-blue-900 transition-all cursor-pointer"
                value={startDate}
                onChange={(e) => onChangeStart(e.target.value)}
              />
            </div>
          </div>

          {/* Date To */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Calendar className="w-4 h-4 text-purple-500" />
              Đến ngày
            </label>
            <div className="relative">
              <input
                type="date"
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-purple-400 focus:ring-4 focus:ring-purple-100 dark:focus:ring-purple-900 transition-all cursor-pointer"
                value={endDate}
                onChange={(e) => onChangeEnd(e.target.value)}
              />
            </div>
          </div>

          {/* Topic */}
          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
              <Tag className="w-4 h-4 text-pink-500" />
              Chủ đề
            </label>
            <div className="relative">
              <select
                className="w-full px-4 py-3 border-2 border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:border-pink-400 focus:ring-4 focus:ring-pink-100 dark:focus:ring-pink-900 transition-all cursor-pointer appearance-none"
                value={selectedTopic}
                onChange={(e) => onChangeTopic(e.target.value)}
              >
                <option value="">Tất cả chủ đề</option>
                {topics.map((topic) => (
                  <option key={topic.value} value={topic.value}>
                    {topic.label}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Search Button */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-transparent">Action</label>
            <button
              onClick={onSearch}
              disabled={isLoadingData}
              className="w-full h-[52px] px-6 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoadingData ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Đang tải...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Tìm kiếm
                </>
              )}
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default FilterBar;
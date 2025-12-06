const topics = [
  { label: "Cơ sở vật chất", value: "LABEL_0" },
  { label: "Giảng viên", value: "LABEL_1" },
  { label: "Sinh viên", value: "LABEL_2" },
  { label: "Chương trình đào tạo", value: "LABEL_3" },
];

export default function FilterBar({
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
    <div className="p-6 bg-gray-50 border-b">
      <div className="flex flex-wrap items-end space-x-4">

        {/* DATE FROM */}
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
          <input
            type="date"
            className="w-full cursor-pointer px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={startDate}
            onChange={(e) => onChangeStart(e.target.value)}
          />
        </div>

        {/* DATE TO */}
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
          <input
            type="date"
            className="w-full cursor-pointer px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={endDate}
            onChange={(e) => onChangeEnd(e.target.value)}
          />
        </div>

        {/* TOPIC */}
        <div className="flex-1 min-w-0">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chủ đề
          </label>

          <div className="relative">
            <select
              className="w-full cursor-pointer px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none pr-10"
              value={selectedTopic}
              onChange={(e) => onChangeTopic(e.target.value)}
            >
              <option value="">Tất cả chủ đề</option>
              {Array.isArray(topics) &&
                topics.map((topic) => (
                  <option key={topic.value} value={topic.value}>
                    {topic.label}
                  </option>
                ))}
            </select>

            {/* Icon dropdown */}
            <svg
              className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>

        {/* BUTTON */}
        <div>
          <button
            className="px-6 py-2 text-white rounded-lg bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 transition shadow-md"
            onClick={onSearch}
            disabled={isLoadingData}
          >
            {isLoadingData ? "Đang tải..." : "Tìm kiếm"}
          </button>
        </div>

      </div>

      {error && (
        <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
          {console.log("FilterBar error:", error)}
          {error}
        </div>
      )}
    </div>
  );
}

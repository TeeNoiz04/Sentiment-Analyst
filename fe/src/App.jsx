import axios from "axios";
import { useEffect, useState } from "react";
import EmotionStats from "./components/EmotionStats";
import Loading from "./components/Loading";
import PostList from "./components/PostList"; // Import the new PostList component
import { MagnifyingGlassIcon } from "@heroicons/react/24/solid";

const initialPages = [
  "UTC2 Confessions",
  "UTC2 Zone",
  "UTC2 Chia Sẻ Cảm Xúc",
  "Diễn Đàn Nghe SV nói"
];

// Changed from hashtags to topics based on the backend model
const topics = [
  { label: "Cơ sở vật chất", value: "LABEL_0" },
  { label: "Giảng viên", value: "LABEL_1" },
  { label: "Sinh viên", value: "LABEL_2" },
  { label: "Chương trình đào tạo", value: "LABEL_3" },
];

const API_URL = "http://127.0.0.1:8000";

export default function FilterConfession() {
  const [pagesList, setPagesList] = useState(initialPages);
  const [isLoadingOverView, setIsLoadingOverView] = useState(false);
  const [overViewContent, setOverViewContent] = useState("");

  const [isLoadingSentiment, setIsLoadingSentiment] = useState(false);
  const [sentimentContent, setSentimentContent] = useState({
    positive: [],
    negative: [],
    neutral: []
  });

  const [data, setData] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);

  const [selectedPage, setSelectedPage] = useState(0);
  const [selectedTopic, setSelectedTopic] = useState(""); // Changed from selectedTag to selectedTopic
  const [startDate, setStartDate] = useState(undefined);
  const [endDate, setEndDate] = useState(undefined);
  const [error, setError] = useState("");

  // New state to control which view is active
  const [activeView, setActiveView] = useState("sentiment"); // "sentiment" or "posts"

  // New states for custom searchable dropdown demo
  const [customPageLink, setCustomPageLink] = useState("");
  const [pageDropdownOpen, setPageDropdownOpen] = useState(false);
  const [pageSearch, setPageSearch] = useState("");
  // helper to extract username after facebook.com/
  const extractFbName = (raw) => {
    if (!raw) return null;
    let u = raw.trim();
    if (!/^https?:\/\//i.test(u)) u = "https://" + u;
    try {
      const parsed = new URL(u);
      const path = parsed.pathname.replace(/^\/+|\/+$/g, "");
      if (path) return path.split("/")[0];
      return null;
    } catch {
      const m = raw.match(/facebook\.com\/([^\/\?\#]+)/i);
      if (m) return m[1];
      const segs = raw.split("/").filter(Boolean);
      return segs[segs.length - 1] || null;
    }
  };
  // Function to truncate text to 50 characters
  const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  // Fetch data function
  const fetchData = async () => {
    setIsLoadingData(true);
    setError("");
    try {
      console.log("Fetching data with parameters: " + selectedPage );
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const response = await axios.get(`${API_URL}/posts`, {
        params: {
          page: 1,
          limit: 50,
          selected_page: selectedPage,
          topic: selectedTopic, // Changed from tag to topic
          start_date: startDate,
          end_date: endDate,
        },
      });
      setData(response.data.posts);
    } catch (err) {
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setIsLoadingData(false);
    }
  };

  const shoolOverview = async () => {
    setIsLoadingOverView(true);
    setError("");
    try {
      await new Promise((resolve) => setTimeout(resolve, 3000));
      const response = await axios.post(`${API_URL}/school-summary-2`, data);
      setOverViewContent(response.data);
    } catch (err) {
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setIsLoadingOverView(false);
    }
  };

  const shoolSentiment = async () => {
    setIsLoadingSentiment(true);
    setError("");
    try {
      console.log("Sending data for sentiment analysis:", data);
      const response = await axios.post(`${API_URL}/sentiment`, data);
      if (response.data && typeof response.data === 'object') {
        setSentimentContent(response.data);
      } else {
        console.error('Invalid response format:', response.data);
        setError("Định dạng dữ liệu không hợp lệ");
      }
    } catch (err) {
      console.error('Error fetching sentiment:', err);
      setError("Lỗi kết nối: " + err.message);
    } finally {
      setIsLoadingSentiment(false);
    }
  };

  // UseEffect to fetch data on dependency change
  const handleSearch = () => {
    fetchData();
  };

  // Trigger shoolOverview whenever `data` is updated
  useEffect(() => {
    if (data.length > 0) {
      shoolOverview();
      shoolSentiment();
    }
  }, [data]);

  // Fetch initial data on component mount
  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="max-w-6xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
      {/* Header */}

      <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-600 py-6 px-8 rounded-xl shadow-md">
        <h1 className="text-3xl font-bold text-white">NLP & ML</h1>
        <p className="text-pink-100 mt-2">
          NGHIÊN CỨU THUẬT TOÁN NLP VÀ ỨNG DỤNG VÀO BÀI TOÁN TÓM TẮT VĂN BẢN...
        </p>
      </div>

      {isLoadingData && (
        <div className="flex items-center gap-3 p-4 bg-white border border-blue-200 rounded-xl shadow-sm">
          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-blue-700 font-medium">Đang tải dữ liệu...</span>
        </div>
      )}

      {/* Summarize school situation */}
      <div className="p-4 space-y-3 max-h-96 overflow-y-auto rounded-b-lg bg-white shadow-inner">
        {!isLoadingData && (
          <div className="p-4 bg-gradient-to-r from-pink-50 via-purple-50 to-indigo-50 rounded-xl shadow-md border border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="w-3 h-8 bg-gradient-to-b from-pink-400 via-purple-500 to-indigo-500 rounded-lg"></div>
              <h2 className="text-2xl font-extrabold text-gray-800">
                Tình hình trường UTC2
              </h2>
            </div>
            <p className="mt-2 text-gray-600">
              Tổng quan các bài viết, cảm xúc và chủ đề gần đây từ sinh viên UTC2
            </p>
          </div>
        )}

        {isLoadingOverView && <Loading />}


        {overViewContent && !isLoadingOverView && (
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-md hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start space-x-4">
              <p className="text-gray-800 text-base leading-relaxed">
                {overViewContent}
              </p>
            </div>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1 text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              Cập nhật lần cuối: {new Date().toLocaleString("vi-VN")}
            </div>
          </div>
        )}

      </div>

      {/* Filter Section - All in one row */}
      <div className="p-6 bg-gray-50 border-b">
        <div className="flex flex-wrap items-end space-x-4">
          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Page
            </label>

            {/* Custom searchable dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setPageDropdownOpen((s) => !s)}
                className="w-full text-left px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex justify-between items-center"
              >
                <span>
                  {pagesList[selectedPage] ?? "Chọn trang"}
                </span>
                <svg
                  className={`h-4 w-4 ml-2 transition-transform ${pageDropdownOpen ? "transform rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 111.06 1.06l-4.24 4.24a.75.75 0 01-1.06 0L5.21 8.29a.75.75 0 01.02-1.08z" />
                </svg>
              </button>

              {pageDropdownOpen && (
                <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-lg shadow-lg">
                  <div className="max-h-48 overflow-y-auto divide-y divide-gray-100">
                    {pagesList
                      .filter((p) =>
                        p.toLowerCase().includes(pageSearch.trim().toLowerCase())
                      )
                      .map((page, index) => (
                        <button
                          key={page}
                          onClick={() => {
                            setSelectedPage(index);
                            setPageDropdownOpen(false);
                            setPageSearch("");
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50"
                        >
                          {page}
                        </button>
                      ))}
                  </div>
                  <div className="p-2">
                    <div className="relative w-full">
                      <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-black" />
                      <input
                        type="text"
                        placeholder="Paste URL (facebook.com/xxx) hoặc tìm..."
                        value={pageSearch}
                        onChange={(e) => setPageSearch(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            const value = pageSearch.trim();
                            if (!value) return;
                            const name = extractFbName(value);
                            if (!name) return;
                            setPagesList((prev) => {
                              if (prev.includes(name)) {
                                const idx = prev.indexOf(name);
                                setSelectedPage(idx);
                                return prev;
                              }
                              const newArr = [...prev, name];
                              setSelectedPage(newArr.length - 1);
                              return newArr;
                            });
                            setCustomPageLink(value);
                            setPageSearch("");
                            setPageDropdownOpen(false);
                          }
                        }}
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-sm focus:outline-none focus:ring-1 focus:ring-blue-400"
                      />
                      {/* logic here */}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              className="w-full cursor-pointer px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              className="w-full cursor-pointer px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>

          <div className="flex-1 min-w-0">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chủ đề
            </label>
            <select
              className="w-full cursor-pointer px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
            >
              <option value="">Tất cả chủ đề</option>
              {topics.map((topic) => (
                <option key={topic.value} value={topic.value}>
                  {topic.label}
                </option>
              ))}
            </select>
          </div>


          <div>
            <button
              className="px-6 py-2 text-white rounded-lg bg-gradient-to-r from-pink-500 to-orange-400 hover:from-pink-600 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-offset-1 transition shadow-md"
              onClick={handleSearch}
              disabled={isLoadingData}
            >
              {isLoadingData ? "Đang tải..." : "Tìm kiếm"}
            </button>
          </div>

        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
            {error}
          </div>
        )}
      </div>

      {/* View Toggle Buttons */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveView("sentiment")}
          className={`flex-1 py-3 text-center font-medium text-sm relative transition-colors duration-300 ${activeView === "sentiment"
              ? "text-pink-600"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Phân tích cảm xúc
          {activeView === "sentiment" && (
            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-t"></span>
          )}
        </button>

        <button
          onClick={() => setActiveView("posts")}
          className={`flex-1 py-3 text-center font-medium text-sm relative transition-colors duration-300 ${activeView === "posts"
              ? "text-pink-600"
              : "text-gray-500 hover:text-gray-700"
            }`}
        >
          Danh sách bài viết
          {activeView === "posts" && (
            <span className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-pink-500 to-purple-600 rounded-t"></span>
          )}
        </button>
      </div>

      {/* Conditional View Content */}
      {activeView === "sentiment" ? (
        <>
          {sentimentContent && !isLoadingSentiment && (() => {
            const total =
              sentimentContent.positive.length +
              sentimentContent.negative.length +
              sentimentContent.neutral.length;

            const numPositive = sentimentContent.positive.length;
            const numNegative = sentimentContent.negative.length;
            const numNeutral = sentimentContent.neutral.length;

            const percentPositive = total
              ? ((numPositive / total) * 100).toFixed(1)
              : 0;
            const percentNegative = total
              ? ((numNegative / total) * 100).toFixed(1)
              : 0;
            const percentNeutral = total
              ? ((numNeutral / total) * 100).toFixed(1)
              : 0;

            const Circle = ({ percent, color, size = 60, strokeWidth = 8 }) => { // Thêm props size và strokeWidth
              const radius = size / 2;
              const normalizedRadius = radius - strokeWidth / 2;
              const circumference = normalizedRadius * 2 * Math.PI;
              const strokeDashoffset = circumference - (percent / 100) * circumference;

              return (
                <svg height={size} width={size}> {/* Sử dụng size cho chiều cao và chiều rộng */}
                  <circle
                    stroke="#e5e7eb"
                    fill="transparent"
                    strokeWidth={strokeWidth} // Sử dụng strokeWidth
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                  />
                  <circle
                    stroke={color}
                    fill="transparent"
                    strokeWidth={strokeWidth} // Sử dụng strokeWidth
                    strokeDasharray={circumference + " " + circumference}
                    style={{ strokeDashoffset, transition: "stroke-dashoffset 0.5s" }}
                    r={normalizedRadius}
                    cx={radius}
                    cy={radius}
                    strokeLinecap="round"
                  />
                  <text
                    x="50%"
                    y="50%"
                    dominantBaseline="middle"
                    textAnchor="middle"
                    className="text-base font-semibold" // Tăng kích thước chữ trong vòng tròn
                  >
                    {percent}%
                  </text>
                </svg>
              );
            };

            const SentimentCard = ({ title, percent, count, color }) => (
              <div className="bg-white rounded-xl shadow-md p-6 flex items-center hover:shadow-lg transition"> {/* Loại bỏ flex-col ở đây */}
                <div className="flex-shrink-0">
                  <Circle percent={percent} color={color} size={80} strokeWidth={8} /> {/* Truyền size và strokeWidth lớn hơn */}
                </div>
                <div className="ml-6"> {/* Tăng khoảng cách từ hình tròn */}
                  <p className="text-base text-gray-700 font-medium mb-1">{title}</p> {/* Tăng kích thước và độ đậm của tiêu đề */}
                  <p className="text-3xl font-bold text-gray-800">{count}</p> {/* Giữ nguyên kích thước số lượng */}
                </div>
              </div>
            );

            return (
              <div className="grid grid-cols-3 gap-4 p-6">
                {/* Tích cực */}
                <SentimentCard
                  title="Tích cực"
                  percent={percentPositive}
                  count={numPositive}
                  color="#22c55e"
                />

                {/* Tiêu cực */}
                <SentimentCard
                  title="Tiêu cực"
                  percent={percentNegative}
                  count={numNegative}
                  color="#ef4444"
                />

                {/* Trung lập */}
                <SentimentCard
                  title="Trung lập"
                  percent={percentNeutral}
                  count={numNeutral}
                  color="#6b7280"
                />
              </div>
            );
          })()}
          {/* Detailed Sentiment Lists */}
          <div className="p-6">
            <div className="grid grid-cols-3 gap-4">
              {/* Tích cực */}
              <div className="flex flex-col rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gradient-to-r from-green-400 to-green-600 text-white p-3 text-center">
                  <h2 className="text-lg font-bold">Tích cực</h2>
                </div>
                {isLoadingSentiment ? (
                  <Loading />
                ) : (
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto bg-gradient-to-b from-green-50 to-green-100">
                    {sentimentContent.positive.map((text, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded-lg border border-green-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        {truncateText(text)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Tiêu cực */}
              <div className="flex flex-col rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gradient-to-r from-red-400 to-red-600 text-white p-3 text-center">
                  <h2 className="text-lg font-bold">Tiêu cực</h2>
                </div>
                {isLoadingSentiment ? (
                  <Loading />
                ) : (
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto bg-gradient-to-b from-red-50 to-red-100">
                    {sentimentContent.negative.map((text, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded-lg border border-red-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        {truncateText(text)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Trung lập */}
              <div className="flex flex-col rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300">
                <div className="bg-gradient-to-r from-gray-400 to-gray-600 text-white p-3 text-center">
                  <h2 className="text-lg font-bold">Trung lập</h2>
                </div>
                {isLoadingSentiment ? (
                  <Loading />
                ) : (
                  <div className="p-4 space-y-3 max-h-96 overflow-y-auto bg-gradient-to-b from-gray-50 to-gray-100">
                    {sentimentContent.neutral.map((text, index) => (
                      <div
                        key={index}
                        className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200"
                      >
                        {truncateText(text)}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* Create a section for the visualization and statistical */}
          <div className="min-h-screen bg-gray-50 p-4">

            <h1 className="text-3xl font-extrabold mb-4 text-center bg-clip-text text-transparent 
                          bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 
                          drop-shadow-lg">
              Thống kê cảm xúc
            </h1>
            {sentimentContent && !isLoadingSentiment && (
              <EmotionStats data={sentimentContent} selected_page={selectedPage} selectedTopic={selectedTopic} startDate={startDate} endDate={endDate} />
            )}
          </div>
        </>
      ) : (
        // The PostList view
        <div className="p-6">
          {isLoadingData ? (
            <Loading />
          ) : (
            <PostList posts={data} />
          )}
        </div>
      )}
    </div>
  );
}
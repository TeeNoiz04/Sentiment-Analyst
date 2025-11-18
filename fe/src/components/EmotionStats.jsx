import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const EmotionDashboard = ({ data, selectedTopic, selected_page, startDate, endDate }) => {
  const [timelineData, setTimelineData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSentimentTrend = async () => {
      try {
        setLoading(true);
        let params = {
          topic: selectedTopic,
          selectedPage: selected_page, 
          startDate: startDate,
          endDate: endDate
        };
        // Use the provided date range or default to last year
        // const endDateObj = endDate ? new Date(endDate) : new Date();
        // const startDateObj = startDate ? new Date(startDate) : new Date();
        // if (!startDate) {
        //   startDateObj.setFullYear(endDateObj.getFullYear() - 1);
        // }
        // const startDateObj = new Date('2022-01-01');
        // const endDateObj = new Date('2023-12-31');
        console.log(params);
        const formatDate = (date) => {
          if (!date) return null; // Tránh lỗi khi tạo Date từ null/undefined
          // Đảm bảo đối tượng là Date trước khi gọi toISOString
          const dateObj = date instanceof Date ? date : new Date(date);
          return dateObj.toISOString().split('T')[0];
        };

        if (startDate === null || startDate === undefined && endDate === null || endDate === undefined) {
            // Trường hợp 1: Cả hai đều là null/undefined, không truyền tham số ngày
            startDate = new Date('2020-01-01');
            endDate = new Date();
        } else {
            // Trường hợp 2: Có ít nhất một tham số ngày được cung cấp (hoặc sử dụng mặc định)
            console.log("Fetching data with date constraints.");
            let finalEndDate = endDate ? new Date(endDate) : new Date();
            let finalStartDate;

            if (startDate !== null || startDate !== undefined) {
                finalStartDate = new Date(startDate);
            } else {
                // Nếu chỉ có endDate, mặc định startDate là 1 năm trước
                finalStartDate = new Date(finalEndDate);
                finalStartDate.setFullYear(finalEndDate.getFullYear() - 3);
            }
            
            params.start_date = formatDate(finalStartDate);
            params.end_date = formatDate(finalEndDate);
            
            console.log(`Fetching data from ${params.start_date} to ${params.end_date}.`);
        }
       
        // Format dates as YYYY-MM-DD
        // const formatDate = (date) => {
        //   return date.toISOString().split('T')[0];
        // };

        const response = await axios.get("http://127.0.0.1:8000/sentiment-trend", {
          params: params
        });
        console.log("Sentiment trend response 11:", response.data.data);
        if (response.data && response.data.data) {
          // Transform data to match the chart requirements
          const transformedData = response.data.data.map(item => ({
            day: item.day,
            Positive: item.Positive || 0,
            Negative: item.Negative || 0,
            Neutral: item.Neutral || 0

          }));
          setTimelineData(transformedData);
        }
      } catch (error) {
        console.error("Error fetching sentiment trend data:", error);
        // Set default data if API fails
        const defaultData = [];
        const today = new Date();
        for (let i = 11; i >= 0; i--) {
          const date = new Date(today);
          date.setMonth(today.getMonth() - i);
          defaultData.push({
            day: date.toLocaleDateString('vi-VN', { month: 'short', year: 'numeric' }),
            Positive: 0,
            Negative: 0,
            Neutral: 0
          });
        }
        setTimelineData(defaultData);
      } finally {
        setLoading(false);
      }
    };

    fetchSentimentTrend();
  }, [selectedTopic, startDate, endDate]); // Add dependencies to useEffect

  // Calculate summary data from the provided data prop
  const summaryData = [
    { name: "Tích cực", value: data?.positive?.length || 0 },
    { name: "Tiêu cực", value: data?.negative?.length || 0 },
    { name: "Trung lập", value: data?.neutral?.length || 0 },
  ];

  const COLORS = ["#4CAF50", "#F44336", "#9E9E9E"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 p-4">
      {/* Bar Chart */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Phân bố cảm xúc</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={summaryData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="value" name="Số lượng">
              {summaryData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Tỷ lệ cảm xúc</h2>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={summaryData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              fill="#8884d8"
              label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
            >
              {summaryData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index]} />
              ))}
            </Pie>
            <Tooltip formatter={(value) => [`${value} bài đăng`, 'Số lượng']} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {/* Stacked Bar Chart */}

      <div className="bg-white shadow rounded-xl p-4 lg:col-span-2"> 
          <h2 className="text-lg font-semibold mb-2">Số lượng cảm xúc theo ngày (Xếp chồng)</h2>
          {loading ? (
              <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                  <span className="ml-3 text-blue-500">Đang tải dữ liệu...</span>
              </div>
          ) : (
              <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={timelineData}>
                      <XAxis
                          dataKey="day"
                          angle={-45}
                          textAnchor="end"
                          height={60}
                      />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      {/* Quan trọng: Sử dụng stackId="a" để xếp chồng các Bar */}
                      <Bar dataKey="Positive" name="Tích cực" stackId="a" fill="#4CAF50" />
                      <Bar dataKey="Neutral" name="Trung lập" stackId="a" fill="#9E9E9E" />
                      <Bar dataKey="Negative" name="Tiêu cực" stackId="a" fill="#F44336" />
                  </BarChart>
              </ResponsiveContainer>
          )}
      </div>
              
      {/* Line Chart */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">
          Xu hướng cảm xúc theo thời gian
        </h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-blue-500">Đang tải dữ liệu...</span>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={timelineData}>
              <XAxis 
                dataKey="day" 
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Positive" 
                name="Tích cực"
                stroke="#4CAF50" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Negative" 
                name="Tiêu cực"
                stroke="#F44336" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
              <Line 
                type="monotone" 
                dataKey="Neutral" 
                name="Trung lập"
                stroke="#9E9E9E" 
                strokeWidth={2}
                dot={{ r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Area Chart */}
      <div className="bg-white shadow rounded-xl p-4">
        <h2 className="text-lg font-semibold mb-2">Phân bố cảm xúc theo thời gian</h2>
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-blue-500">Đang tải dữ liệu...</span>
          </div>
        ) : (
          
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={timelineData}>
              <XAxis 
                dataKey="day" 
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="Positive"
                name="Tích cực"
                stackId="1"
                stroke="#4CAF50"
                fill="#4CAF50"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="Negative"
                name="Tiêu cực"
                stackId="1"
                stroke="#F44336"
                fill="#F44336"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="Neutral"
                name="Trung lập"
                stackId="1"
                stroke="#9E9E9E"
                fill="#9E9E9E"
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Radar Chart */}
      <div className="bg-white shadow rounded-xl p-4 col-span-1 lg:col-span-2">
        <h2 className="text-lg font-semibold mb-2">Phân tích đa chiều cảm xúc</h2>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart outerRadius="80%" data={summaryData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            <Radar
              name="Cảm xúc"
              dataKey="value"
              stroke="#8884d8"
              fill="#8884d8"
              fillOpacity={0.6}
            />
            <Tooltip />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default EmotionDashboard;

import React from "react";
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

{/* Sentiment Card Component */ }
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
export default SentimentCard;
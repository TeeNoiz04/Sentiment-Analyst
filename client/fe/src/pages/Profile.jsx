import { useState } from "react";

export default function Profile() {
  const [displayName, setDisplayName] = useState("Nguyen Van A");
  const [editName, setEditName] = useState(false);

  return (
    <div className="container mx-auto px-6 py-12">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Hồ sơ cá nhân</h1>

      <div className="bg-white shadow-md rounded-lg p-6 flex flex-col items-center md:flex-row md:items-start md:space-x-8">
        
        {/* Avatar */}
        <div className="mb-6 md:mb-0">
          <img
            src="https://via.placeholder.com/150"
            alt="avatar"
            className="w-32 h-32 rounded-full object-cover border-2 border-gray-300"
          />
        </div>

        {/* Info */}
        <div className="flex-1 w-full">
          <div className="mb-4">
            <label className="block text-gray-600 font-medium mb-1">
              Tên hiển thị
            </label>

            {editName ? (
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <button
                  onClick={() => setEditName(false)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                >
                  Lưu
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <span className="text-gray-800 font-medium text-lg">{displayName}</span>
                <button
                  onClick={() => setEditName(true)}
                  className="px-2 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300 transition"
                >
                  Đổi tên
                </button>
              </div>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-gray-600 font-medium mb-1">
              Email
            </label>
            <span className="text-gray-800">user@example.com</span>
          </div>

          <div className="mb-4">
            <label className="block text-gray-600 font-medium mb-1">
              Số điện thoại
            </label>
            <span className="text-gray-800">0123 456 789</span>
          </div>
        </div>
      </div>
    </div>
  );
}

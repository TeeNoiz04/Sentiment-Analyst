// components/PostStats.jsx
import { FaHeart, FaComment } from "react-icons/fa";
import usePostStats from "../hooks/usePostStats";
import { use } from "react";

export default function PostStats({ likes , comments }) {
    return (
        <div className="flex justify-between items-center mt-2 mb-3 text-sm text-gray-600 dark:text-gray-400">

            {/* Like Counter */}
            <div className="flex items-center gap-2 cursor-pointer" >
                <FaHeart className="text-red-500" />
                <span className="font-semibold">{likes} lượt thích</span>
            </div>

            {/* Comment Counter */}
            <div className="flex items-center gap-2 cursor-pointer" >
                <FaComment className="text-blue-500" />
                <span className="font-semibold">{comments} bình luận</span>
            </div>

        </div>
    );
}

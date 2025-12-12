// components/PostActions.jsx

import { FaRegThumbsUp, FaRegCommentDots, FaRegFlag, FaThumbsUp } from "react-icons/fa";
import PostStats from "./PostStats";
import usePostStats from "../hooks/usePostStats";

export default function PostActions({postId, user_id, onComment, onReport }) {
    const { handleLike, likeCount, commentCount, liked } = usePostStats(postId, user_id);
     
    const handleClick = () => {
        handleLike();
    }
    return (
      <div className="pt-3 -mx-2">
    {/* Hàng 1: PostStats (Thống kê bài viết) */}
    <div className="px-2 pb-3">
        <PostStats
            likes={likeCount}
            comments={commentCount}
        />
    </div>

    {/* Đường kẻ phân cách */}
    <hr className="border-gray-200 dark:border-gray-700 mx-2" />

    {/* Hàng 2: Các nút tương tác (Like, Comment, Report) */}
    <div className="flex items-center justify-around pt-3">
        
         <button
            onClick={handleClick}
            className={`
                flex-1 flex items-center justify-center gap-2 px-2 py-2.5 rounded-xl transition-all duration-200
                ${liked 
                    ? "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30" 
                    : "text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                }
            `}
        >
            {/* Icon khác khi đã like */}
            {liked ? (
                <FaThumbsUp className="text-xl scale-110" />
            ) : (
                <FaRegThumbsUp className="text-xl group-hover:scale-110 transition-transform" />
            )}

            <span className="font-semibold text-base">
                {liked ? "Đã thích" : "Thích"}
            </span>

        </button>

        {/* Comment */}
        <button
            onClick={onComment}
            className="flex-1 flex items-center justify-center gap-2 px-2 py-2.5 
                text-gray-600 dark:text-gray-300 
                hover:text-blue-600 dark:hover:text-blue-400 
                hover:bg-blue-50 dark:hover:bg-blue-900/20
                rounded-xl transition-all duration-200 group"
        >
            <FaRegCommentDots className="text-xl group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-base">Bình luận</span>
        </button>

        {/* Report */}
        <button
            onClick={onReport}
            className="flex-1 flex items-center justify-center gap-2 px-2 py-2.5 
                text-gray-600 dark:text-gray-300 
                hover:text-amber-600 dark:hover:text-amber-400
                hover:bg-amber-50 dark:hover:bg-amber-900/20
                rounded-xl transition-all duration-200 group"
        >
            <FaRegFlag className="text-xl group-hover:scale-110 transition-transform" />
            <span className="font-semibold text-base">Báo cáo</span>
        </button>
    </div>
</div>
    );
}

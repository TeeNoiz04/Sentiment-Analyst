import React from "react";
import { FaRegThumbsUp, FaRegCommentDots, FaShare } from "react-icons/fa";
const Post = ({ post }) => (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-4 mb-6">
        {/* Header */}
        <div className="flex items-center mb-4">
            <img
                src={post.avatar}
                alt={post.userName}
                className="w-12 h-12 rounded-full object-cover mr-3"
            />
            <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                    {post.userName}
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                    {post.time}
                </span>
            </div>
        </div>

        {/* Content */}
        <p className="text-gray-800 dark:text-gray-200 mb-3">{post.content}</p>

        {/* Image */}
        {post.image && (
            <img
                src={post.image}
                alt="Post"
                className="w-full rounded-xl object-cover mb-3 max-h-96"
            />
        )}

        {/* Actions */}
        <div className="flex justify-between text-gray-600 dark:text-gray-300 border-t border-gray-200 dark:border-gray-700 mt-3 pt-2">
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <FaRegThumbsUp className="text-lg" />
                <span className="font-medium">Like</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <FaRegCommentDots className="text-lg" />
                <span className="font-medium">Comment</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700 transition">
                <FaShare className="text-lg" />
                <span className="font-medium">Share</span>
            </button>
        </div>
    </div>
);

export default Post;

import React, { use, useEffect, useState } from "react";
import { FaHeart, FaComment } from "react-icons/fa";
import useUser from "../hooks/useUser";
export default function Post({ post }) {
    const { user, loading } = useUser(post.UserID);
 

    return (
        <div className="bg-white ">
            {/* Header */}
            <div className="flex items-start mb-5">
                <img
                    src={user?.AvatarURL || "/img/avatar.jpg"}
                    alt={user?.Username}
                    className="w-12 h-12 rounded-full object-cover mr-4 border-2 border-blue-500/50 dark:border-blue-400/50 flex-shrink-0"
                />
                <div className="flex flex-col">
                    <h3 className="font-bold text-lg text-gray-900 dark:text-white leading-snug hover:text-blue-600 transition-colors cursor-pointer">
                        {user?.Username || "Người dùng"}
                    </h3>
                    <span className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        {post.CreatedOn}
                    </span>
                </div>
            </div>

            {/* Title */}
            <h2 className="text-gray-900 dark:text-white font-extrabold text-2xl mb-3 leading-snug">
                {post.Title}
            </h2>

            {/* Content */}
            <p className="text-gray-700 dark:text-gray-300 text-base mb-4 leading-relaxed whitespace-pre-line">
                {post.Content}
            </p>

        </div>

    );
};
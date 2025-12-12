import React, { useState } from "react";
import CreatePost from "../components/CreatePost";
import { usePosts } from "../hooks/usePosts";
export default function CreatePostPage() {
  const { loading, error, addPost } = usePosts();

  if (loading) return <p>Đang tải bài viết...</p>;
  if (error) return <p>Lỗi: {error.message}</p>;


  return (
    <div className="bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 px-4 py-8 sm:py-12">
    <CreatePost onSubmit={addPost} />
    </div>
  );
}

import React, { useState } from "react";
import CreatePost from "../components/CreatePost";
import { usePosts } from "../hooks/usePosts";
export default function CreatePostPage() {
  const { posts, loading, error, addPost } = usePosts();

  if (loading) return <p>Đang tải bài viết...</p>;
  if (error) return <p>Lỗi: {error.message}</p>;


  return (
    console.log("Current posts:", posts),
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen py-6">
      <CreatePost onSubmit={addPost} />
    </div>
  );
}

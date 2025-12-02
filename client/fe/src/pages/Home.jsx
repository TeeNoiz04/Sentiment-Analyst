import React from "react";
import PostList from "../components/PostList";
export default function Home() {
  return (
    <>
     <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
      <PostList />
    </div>
    </>
   
  );
}

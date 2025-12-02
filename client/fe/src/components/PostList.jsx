import React from "react";
import Post from "../components/Post";

// Dữ liệu demo
const posts = [
  {
    id: 1,
    userName: "Nguyen Van A",
    avatar: "/assets/avatar1.jpg",
    time: "2 giờ trước",
    content: "Hôm nay trời đẹp quá! Đi chơi thôi mọi người 😄",
    image: "/assets/post1.jpg",
  },
  {
    id: 2,
    userName: "Tran Thi B",
    avatar: "/assets/avatar2.jpg",
    time: "5 giờ trước",
    content: "Mình vừa hoàn thành dự án React đầu tiên!",
    image: null,
  },
  {
    id: 3,
    userName: "Le Van C",
    avatar: "/assets/avatar3.jpg",
    time: "1 ngày trước",
    content: "Hãy sống hết mình và tận hưởng cuộc sống.",
    image: "/assets/post2.jpg",
  },
];

const PostList = () => (
  <div className="max-w-2xl mx-auto p-4">
    {posts.map((post) => (
      <Post key={post.id} post={post} />
    ))}
  </div>
);

export default PostList;

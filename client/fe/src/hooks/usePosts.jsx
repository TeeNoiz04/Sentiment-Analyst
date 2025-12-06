// src/hooks/usePosts.jsx
import { useState, useEffect } from "react";
import { getPosts, createPost } from "../services/postService";
import { notifySuccess } from "../utils/toast";
export const usePosts = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPosts = async () => {
    try {
      setLoading(true);
      const data = await getPosts();
      setPosts(data);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const addPost = async (postData) => {
    try {
      console.log("Adding post:", postData);
      const newPost = await createPost(postData);
      console.log("Post created:", newPost);
      notifySuccess("🎉 Tạo bài viết thành công!");
    } catch (err) {
      setError(err);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return { posts, loading, error, fetchPosts, addPost };
};

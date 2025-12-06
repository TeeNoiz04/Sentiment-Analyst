import { useState, useEffect } from "react";
import { fetchPosts } from "../services/postService";

export const useFilterPosts = (initialFilters) => {
  const [startDate, setStartDate] = useState(initialFilters.startDate || "");
  const [endDate, setEndDate] = useState(initialFilters.endDate || "");
  const [selectedTopic, setSelectedTopic] = useState(initialFilters.topic || "");
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(initialFilters.totalPages || 1);

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchPosts({ startDate, endDate, topic: selectedTopic, skip: 0, Status: "approved", user_id: "" });
      setPosts(data.posts || data);
      setTotalPages(Math.ceil((data.posts ? data.posts.length : data.length) / 10)); 
    } catch (err) {
      setError(err.message || "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []); // load lần đầu

  const handleSearch = () => {
    loadPosts();
  };

  return {
    startDate,
    endDate,
    selectedTopic,
    posts,
    isLoading,
    error,
    totalPages,
    setStartDate,
    setEndDate,
    setSelectedTopic,
    handleSearch,
  };
};

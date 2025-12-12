import { useState, useEffect } from "react";
import { fetchPosts } from "../services/postService";
import { getUserById } from "../services/userService";

export const useFilterPosts = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedTopic, setSelectedTopic] = useState("");
  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState();
  const [currentPage, setCurrentPage] = useState(1);
  const [user, setUser] = useState(null);

  const loadPosts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      let formattedStartDate = startDate ? new Date(startDate).toISOString().split("T")[0] : null;
      let formattedEndDate = endDate ? new Date(endDate).toISOString().split("T")[0] : null;
      let param = {
        start_date: formattedStartDate,
        end_date: formattedEndDate,
        category: selectedTopic,
        skip: (currentPage - 1) * 10,
        limit: 10,
        status: "approved"
      };
      const data = await fetchPosts(param);
      setPosts(data.posts);
      setTotalPages((Math.ceil(data.total / 10)));
    } catch (err) {
      setError(err.message || "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  };

  const getProfile = async () => {
    setIsLoading(true);
    setError(null);
    const userId = sessionStorage.getItem("user_id");
    try {
      const data = await getUserById(userId);
      if (data) {
        let user = {
          Username: data.Username,
          FullName: data.FullName,
          Email: data.Email,
          AvatarURL: data.AvatarURL,
          UserID: data.UserID,
          FailedLoginAttempts: data.FailedLoginAttempts,
          IsEmailConfirmed: data.IsEmailConfirmed,
          CreatedAt: data.CreatedAt,
          LastActive: null,
          Status: data.Status
        };
        setUser(user); 
      }
    } catch (err) {
      setError(err.message || "Lỗi khi tải dữ liệu");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadPosts();
    getProfile();
  }, []);


  useEffect(() => {
    loadPosts();
  }, [currentPage]);

  const handleSearch = () => {
    loadPosts();
  };

  return {
    startDate,
    endDate,
    selectedTopic,
    currentPage,
    user,
    setCurrentPage,
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

// src/services/postService.js
import api from "../services/api";

export const getPosts = async () => {
  const response = await api.get("/posts");
  console.log("Fetched posts:", response.data);
  return response.data;
};

export const fetchPosts = async (filters) => {

  try {  
    const res = await api.get("/posts", { params: filters });
    return res.data;
  } catch (err) {
    throw err;
  }
};


export const createPost = async (postData) => {
  const response = await api.post("/posts", postData);
  return response.data;
};

// Lấy thống kê bài viết (likes + comments)
export const getPostStats = async (postId) => {
  let params = {};
  if (postId) params.postId = postId;
  const response = await api.get(`/posts/${postId}/stats`, { params });
  return response.data;
};

// Like bài viết
export const likePost = async (postId, user_id) => {
 
  const url = `/posts/${postId}/like?user_id=${user_id}`;
  const response = await api.post(url);
  return response.data;
};

export const checkLiked = async (postId, user_id) => {
  let params = {};
  params.user_id = user_id;
  const response = await api.get(`votes/post/${postId}/check-upvote`, {
    params,
  });
  return response.data.upvoted;
}

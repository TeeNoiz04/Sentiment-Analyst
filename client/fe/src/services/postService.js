// src/services/postService.js
import api from "../services/api";

export const getPosts = async () => {
  const response = await api.get("/posts");
  console.log("Fetched posts:", response.data);
  return response.data;
};

export const fetchPosts = async (filters) => {
  const params = {};
  if (filters.skip) params.skip = filters.skip;
  if (filters.limit) params.limit = filters.limit;
  if (filters.Status) params.Status = filters.Status;
  if (filters.user_id) params.user_id = filters.user_id;
  if (filters.topic) params.topic = filters.topic;
  if (filters.startDate) params.startDate = filters.startDate;
  if (filters.endDate) params.endDate = filters.endDate;

  try {
    const res = await api.get("/posts", { params });
    return res.data;
  } catch (err) {
    console.error("Fetch posts error:", err);
    throw err;
  }
};


export const createPost = async (postData) => {
  const response = await api.post("/posts", postData);
  console.log("Created post:", response.data);
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
// Lấy số lượng comment (nếu cần tách riêng)
// export const getCommentsCount = async (postId) => {
//   const response = await api.get(`/posts/${postId}/comments/count`);
//   return response.data;
// };
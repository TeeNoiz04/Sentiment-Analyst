// src/services/commentService.js
import api from "./api";

export const getCommentsByPost = async (postId, skip = 0, limit = 10) => {
  console.log(`Fetching comments for post ${postId}...`);
  const response = await api.get(`/posts/${postId}/comments`, {
    params: { skip, limit },
  });
  console.log(`Fetched: `, response.data);
  return response.data;
};
export const addCommentApi = (postId, content, UserID) => {
    let params = {};
    if (postId) {
        params.PostID = postId;
    }
    if (content) {
        params.Content = content;
    }
    if (UserID) {
        params.UserID = UserID;
    }
    return api.post(`/comments`, params);
};

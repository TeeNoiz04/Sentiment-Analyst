// src/services/commentService.js
import api from "./api";

export const getCommentsByPost = async (postId, skip = 0, limit = 10) => {
  const response = await api.get(`/posts/${postId}/comments`, {
    params: { skip, limit },
  });
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

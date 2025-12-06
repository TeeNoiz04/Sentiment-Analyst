// src/services/reportService.js
import api from "./api";

// Gửi report bài viết
export const sendReport = (PostID, Reason, UserID) => {
  return api.post("/reports", {
    PostID,
    Reason,
    UserID,
  });
};

import React, { useState, useEffect } from "react";
import Post from "../components/Post";
import PostActions from "./PostActions";
import ModalComment from "../components/ModalComment";  // nhớ import
import ModalReport from "../components/ReportModal";  // import modal report
const PostList = ({ posts, user }) => {
  const [activePostComment, setActivePostComment] = useState(null);  // Post đang mở modal bình luận
  const [activePostReport, setActivePostReport] = useState(null); // Post đang mở modal báo cáo
  return (
    <div className="w-3/4 mx-auto p-4 space-y-6">
      {posts.map((post) => (
        <div key={post.PostID} className="bg-white dark:bg-gray-800 rounded-xl shadow p-4">
          {/* Hiển thị bài viết */}
          <Post post={post} />

          {/* Actions */}
          <PostActions
            postId={post.PostID}
            user_id={user.UserID}
            onComment={() => setActivePostComment(post)}        
            onReport={() => setActivePostReport(post)}
          />

          {/* Modal comment chỉ mở khi đúng post */}
          {activePostComment?.PostID === post.PostID && (
            <ModalComment
              post={activePostComment}
              user={user}
              isOpen={true}
              onClose={() => setActivePostComment(null)}
            />
          )}
          {activePostReport?.PostID === post.PostID && (
            <ModalReport
              post={activePostReport}
              user={user}
              isOpen={true}
              onClose={() => setActivePostReport(null)}
            />
          )}
        </div>
      ))}
    </div>
  );
};

export default PostList;

// hooks/usePostStats.js
import { useEffect, useState } from "react";
import { getPostStats, likePost, checkLiked } from "../services/postService";
import { notifySuccess } from "../utils/toast";
export default function usePostStats(postId, user_id) {
    const [likeCount, setLikeCount] = useState(0);
    const [commentCount, setCommentCount] = useState(0);
    const [liked, setLiked] = useState(null);
    const fetchStats = async () => {
        try {
            const res = await getPostStats(postId);
            setLikeCount(res.likes);
            setCommentCount(res.comments);
            const hasLiked = await checkLiked(postId, user_id);
            setLiked(hasLiked);

        } catch (err) {
            console.error("Failed load stats", err);
        }
    };
    useEffect(() => {
        if (!postId) return;
        fetchStats();
    }, [postId]);


    const handleLike = async () => {
        try {
            if (liked) {
                setLikeCount(prev => prev - 1);
                setLiked(false);
                notifySuccess("🎉 Bỏ thích bài viết thành công!");
            } else {
                setLiked(true);
                setLikeCount(prev => prev + 1);
                notifySuccess("🎉 Thích bài viết thành công!");
            }
            await likePost(postId, user_id);


        } catch (err) {
            console.error("Like failed", err);
        }
    };
    const handleCommented =  () => {
         fetchStats();
    };


    return { likeCount, commentCount, liked, handleLike, handleCommented };
}

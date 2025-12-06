// hooks/usePostStats.js
import { useEffect, useState } from "react";
import { getPostStats, likePost, checkLiked } from "../services/postService";
import { notifySuccess } from "../utils/toast";
export default function usePostStats(postId, user_id) {
    const [likes, setLikes] = useState(0);
    const [comments, setComments] = useState(0);
    const [liked, setLiked] = useState(null);
    useEffect(() => {
        if (!postId) return;
        const fetchStats = async () => {
            try {
                const res = await getPostStats(postId);
                console.log("Post stats:", res);
                setLikes(res.likes);
                setComments(res.comments);
                const hasLiked = await checkLiked(postId, user_id);
                console.log("User has liked:", hasLiked);
                setLiked(hasLiked);
                
            } catch (err) {
                console.error("Failed load stats", err);
            }
        };
        fetchStats();
    }, [postId]);


    const handleLike = async () => {
        try {
            if (liked) {
                setLikes(prev => prev - 1);
                setLiked(false);
                notifySuccess("🎉 Bỏ thích bài viết thành công!");
            }else {
                setLiked(true);
                setLikes(prev => prev + 1);   
                notifySuccess("🎉 Thích bài viết thành công!");   
            }
            await likePost(postId, user_id);

           
        } catch (err) {
            console.error("Like failed", err);
        }
    };


    return { likes, comments, liked, handleLike };
}

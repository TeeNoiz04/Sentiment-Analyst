import { useEffect, useState } from "react";
import { getCommentsByPost, addCommentApi } from "../services/commentService";
import { notifySuccess } from "../utils/toast";
export default function useComments(postId, UserID, limit = 10) {
    const [comments, setComments] = useState([]);
    const [skip, setSkip] = useState(0);
    const [total, setTotal] = useState(0);
    const [loading, setLoading] = useState(true);
    const [loadingMore, setLoadingMore] = useState(false);

    useEffect(() => {
        if (!postId) return;
        resetAndLoad();
    }, [postId]);

    const resetAndLoad = async () => {
        setSkip(0);
        await fetchComments(0, true);
    };

    const fetchComments = async (skipVal = skip, replace = false) => {
        setLoading(true);
        const res = await getCommentsByPost(postId, skipVal, limit);       
        setComments(prev => replace ? res.comments : [...prev, ...res.comments]);
        setTotal(res.total);
        setLoading(false);
    };

    const loadMore = async () => {
        if (comments.length >= total) return;
        setLoadingMore(true);
        const newSkip = skip + limit;
        setSkip(newSkip);
        await fetchComments(newSkip);
        setLoadingMore(false);
    };

    const addComment = async (postId, text, UserID) => {
        const res = await addCommentApi(postId, text, UserID);
        setLoading(true);
        await fetchComments(0, true);
        setLoading(false);
        notifySuccess("🎉 Tạo bình luận thành công!");
    };

    return {
        comments,
        total,
        loading,
        loadMore,
        loadingMore,
        addComment
    };
}

// src/hooks/useReport.js
import { useState } from "react";
import { sendReport } from "../services/reportService";
import { notifySuccess, notifyError } from "../utils/toast";
export default function useReport() {
    const [loading, setLoading] = useState(false);

    // Gửi report bài viết
    const reportPost = async (PostID, Reason, UserID) => {
        try {
            setLoading(true);
            const res = await sendReport(PostID, Reason, UserID);
            notifySuccess("🎉 Gửi báo cáo thành công!");
            return res.data;
        } catch (err) {
            console.error("Report Error:", err);
            notifyError("❌ Gửi báo cáo thất bại! Do bạn đã báo cáo trước đó hoặc lỗi hệ thống.");
            throw err;         // đẩy lỗi ra ngoài để xử lý UI
        } finally {
            setLoading(false);
           
        }
    };

    return { reportPost, loading };
}

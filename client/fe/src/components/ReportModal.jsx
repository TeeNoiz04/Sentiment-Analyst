import { useState } from "react";
import useReport from "../hooks/useReport";
export default function ModalReport({ isOpen, onClose, post, user }) {
    if (!isOpen) return null;
    const { reportPost, loading } = useReport();
    const reasons = [
        "Nội dung không phù hợp",
        "Spam / Quảng cáo",
        "Ngôn từ thù địch",
        "Thông tin sai sự thật",
        "Lý do khác"
    ];

    const [reason, setReason] = useState("");
    const [customReason, setCustomReason] = useState("");

    const handleSubmit = async () => {
        const finalReason = reason === "Lý do khác" ? customReason : reason;

        if (!finalReason.trim()) return alert("Vui lòng nhập lý do!");

        await reportPost(post.PostID, finalReason, user.UserID);
        setReason("");
        setCustomReason("");
        onClose();
    };

    return (
        <div
            className="fixed inset-0 bg-black/70 flex justify-center items-center z-50 p-4"
            onClick={onClose}
        >
            <div
                className="bg-white dark:bg-gray-800 w-full max-w-xl rounded-xl shadow-2xl relative max-h-[95vh] sm:max-h-[90vh] overflow-hidden flex flex-col transform transition-all duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* HEADER giống comment modal */}
                <div className="p-5 border-b border-gray-100 dark:border-gray-700 flex-shrink-0">
                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 text-gray-400 hover:text-red-500 dark:hover:text-red-400 transition-colors p-1 rounded-full bg-gray-50 dark:bg-gray-700"
                    >
                        ✕
                    </button>
                    <div className="flex items-center">
                        <div>
                            <h3 className="text-base font-bold text-gray-900 dark:text-white">Gửi báo cáo vi phạm nội dung</h3>
                            <span className="text-xs text-gray-500">Hãy chọn lý do báo cáo bài viết</span>
                        </div>
                    </div>
                </div>


                {/* BODY – dropdown + input điều kiện */}
                <div className="flex-1 overflow-y-auto p-5 space-y-4">

                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                        Chọn lý do báo cáo
                    </label>

                    <select
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                    >
                        <option value="">-- Chọn lý do --</option>
                        {reasons.map((r, i) => (
                            <option key={i} value={r}>{r}</option>
                        ))}
                    </select>

                    {reason === "Lý do khác" && (
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">Nhập lý do</label>
                            <textarea
                                rows="3"
                                className="w-full mt-2 px-3 py-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-gray-100"
                                placeholder="Nhập mô tả lý do..."
                                value={customReason}
                                onChange={(e) => setCustomReason(e.target.value)}
                            />
                        </div>
                    )}
                </div>


                {/* FOOTER giống input comment nhưng đổi thành nút gửi */}
                <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 rounded-full bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                    >
                        Hủy
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={!reason || (reason === "Lý do khác" && customReason.trim() === '')}
                        className="px-5 py-2.5 bg-red-600 text-white font-semibold rounded-full hover:bg-red-700 disabled:bg-red-400"
                    >
                        Gửi báo cáo
                    </button>
                </div>
            </div>
        </div>
    );
}

// src/utils/toast.js
import toast from "react-hot-toast";

export const notifySuccess = (message) => toast.success(message);
export const notifyError = (message) => toast.error(message);
export const notifyLoading = (message) => toast.loading(message);
export const notifyCustom = (message) =>
  toast(message, {
    style: {
      border: "1px solid #713200",
      padding: "16px",
      color: "#713200",
    },
  });

import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
    const [name, setName] = useState("");
    const navigate = useNavigate();

    const handleSubmit = (e) => {
        e.preventDefault();
        if (!name) return;
        // lưu tạm name vào sessionStorage
        sessionStorage.setItem("userName", name);
        navigate("/"); // chuyển vào trang home
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200">
            <div className="p-8 bg-white/80 backdrop-blur-md rounded-3xl shadow-xl w-96 text-center">
                <img
                    src="/img/logo.jpg"
                    alt="Logo"
                    className="mx-auto mb-6 w-28 h-28 rounded-full shadow-md object-cover"
                />
                <h2 className="text-3xl font-bold mb-6 text-gray-800">Login</h2>
                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <input
                        type="text"
                        placeholder="Enter your name"
                        className="px-5 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:bg-gray-800 dark:text-white transition"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                    />
                    <button
                        type="submit"
                        className="px-5 py-3 rounded-xl bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 text-white font-semibold hover:scale-105 transition-transform shadow-lg"
                    >
                        Login
                    </button>
                </form>
            </div>
        </div>

    );
}

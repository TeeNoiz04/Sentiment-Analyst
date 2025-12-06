import { useEffect, useState } from "react";
import { getUserById } from "../services/userService";

export default function useUser(userId) {
    const [user, setUser] = useState();
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        if (!userId) return;
        const fetchUser = async () => {
            try {
                const res = await getUserById(userId);
                setUser(res);
            } catch (err) {
                console.error("Failed to fetch user:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, [userId]);
    
    return { user, loading };
}

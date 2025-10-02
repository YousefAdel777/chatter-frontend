import { useStompContext } from "@/features/common/contexts/StompContextProvider";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

const useOnlineStatus = (userId?: number) => {
    const { getClient } = useStompContext();
    const { data: session } = useSession();
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        const stompClient = getClient();
        if (!userId || !session?.user?.accessToken || !stompClient?.connected) return;

        stompClient.subscribe(`/topic/users.${userId}`, (message) => {
            const isOnline = JSON.parse(message.body);
            setIsOnline(isOnline);
        });
        stompClient.subscribe(`/app/users.${userId}.status`, (message) => {
            const isOnline = JSON.parse(message.body);
            setIsOnline(isOnline);
        });

    }, [session?.user?.accessToken, userId, getClient]);

    return { isOnline };
}

export default useOnlineStatus;
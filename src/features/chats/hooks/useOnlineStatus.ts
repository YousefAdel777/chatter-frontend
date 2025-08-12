import { Client } from "@stomp/stompjs";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
const BASE_WS_URL = process.env.NEXT_PUBLIC_BASE_WS_URL;

const useOnlineStatus = (userId?: number) => {

    const stompClient = useRef<Client | null>(null);
    const [isOnline, setIsOnline] = useState(false);
    const { data: session } = useSession();

    useEffect(() => {
        if (!userId || !session?.user?.accessToken) return;
        stompClient.current = new Client({
            brokerURL: BASE_WS_URL,
            connectHeaders: {
                "Authorization": `Bearer ${session.user.accessToken}`,
            },
            onStompError: (e) => {
                console.error(e);
            },
            onConnect: () => {
                stompClient.current?.subscribe(`/topic/users.${userId}`, (message) => {
                    const isOnline = JSON.parse(message.body);
                    setIsOnline(isOnline);
                });
                stompClient.current?.subscribe(`/app/users.${userId}.status`, (message) => {
                    const isOnline = JSON.parse(message.body);
                    setIsOnline(isOnline);
                });
            }
        });

        stompClient.current.activate();

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
            }
        }
    }, [session?.user?.accessToken, userId]);

    return { isOnline };
}

export default useOnlineStatus;
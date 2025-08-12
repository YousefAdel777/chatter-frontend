import { Client } from "@stomp/stompjs";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
const BASE_WS_URL = process.env.NEXT_PUBLIC_BASE_WS_URL;

const useTypingUsers = (chatId?: number) => {

    const { data: session } = useSession();
    const [typingUsers, setTypingUsers] = useState<User[]>([]);
    const stompClient = useRef<Client | null>(null);
    const typingUsernames = useMemo(() => {
        return typingUsers.filter(u => u.id.toString() !== session?.user?.id).map(u => u.username).join(", ");
    }, [session?.user?.id, typingUsers]);

    const startTyping = useCallback(() => {
        if (!chatId) return;
        stompClient.current?.publish({
            destination: `/app/chat.${chatId}.add-typing-users`,
            headers: {
                "Authorization": `Bearer ${session?.user?.accessToken}`,
            },
        });
    }, [chatId, session?.user?.accessToken]);

    const stopTyping = useCallback(() => {
        if (!stompClient.current?.connected || !chatId) return;
        stompClient.current?.publish({
            destination: `/app/chat.${chatId}.remove-typing-users`,
            headers: {
                "Authorization": `Bearer ${session?.user?.accessToken}`,
            },
        });
    }, [chatId, session?.user?.accessToken]);

    useEffect(() => {
        if (!chatId) return;
        if (!session?.user?.accessToken) return;
        stompClient.current = new Client({
            brokerURL: BASE_WS_URL,
            connectHeaders: {
                "Authorization": `Bearer ${session?.user?.accessToken}`,
            },
            onStompError: (e) => {
                console.log(e);
            },
            onConnect: () => {
                stompClient.current?.subscribe(`/app/chat.${chatId}.typing-users`, (message) => {
                    const users = JSON.parse(message.body);
                    setTypingUsers(users);
                });

                stompClient.current?.subscribe(`/topic/chat.${chatId}.removed-typing-users`, (message) => {
                    const typingUserId = JSON.parse(message.body);
                    setTypingUsers((typingUsers) => typingUsers.filter((user) => user.id !== typingUserId));
                });

                stompClient.current?.subscribe(`/topic/chat.${chatId}.added-typing-users`, (message) => {
                    const typingUser = JSON.parse(message.body);
                    setTypingUsers((typingUsers) => [...typingUsers, typingUser]);
                }); 

            }
        });

        stompClient.current?.activate();

        return () => {
            stompClient.current?.deactivate();
        }
    }, [session?.user?.accessToken, chatId]);

    return { typingUsers, typingUsernames, startTyping, stopTyping };
};

export default useTypingUsers;
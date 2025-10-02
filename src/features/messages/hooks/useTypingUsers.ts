import { useStompContext } from "@/features/common/contexts/StompContextProvider";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useMemo, useState } from "react";

const useTypingUsers = (chatId?: number) => {
    const { data: session } = useSession();
    const [typingUsers, setTypingUsers] = useState<User[]>([]);
    const { getClient } = useStompContext();

    const typingUsernames = useMemo(() => {
        return typingUsers.filter(u => u.id.toString() !== session?.user?.id).map(u => u.username).join(", ");
    }, [session?.user?.id, typingUsers]);

    const startTyping = useCallback(() => {
        const stompClient = getClient();
        if (!chatId || !stompClient?.connected || !session?.user?.accessToken) return;
        
        stompClient.publish({
            destination: `/app/chat.${chatId}.add-typing-users`,
            headers: {
                "Authorization": `Bearer ${session.user.accessToken}`,
            },
        });
    }, [chatId, session?.user?.accessToken, getClient]);

    const stopTyping = useCallback(() => {
        const stompClient = getClient();
        if (!chatId || !stompClient?.connected || !session?.user?.accessToken) return;
        
        stompClient.publish({
            destination: `/app/chat.${chatId}.remove-typing-users`,
            headers: {
                "Authorization": `Bearer ${session.user.accessToken}`,
            },
        });
    }, [chatId, session?.user?.accessToken, getClient]);

    useEffect(() => {
        const stompClient = getClient();
        if (!chatId || !stompClient?.connected) return;

            stompClient.subscribe(`/topic/chat.${chatId}.typing-users`, (message) => {
                const users = JSON.parse(message.body);
                setTypingUsers(users);
            });
            stompClient.subscribe(`/topic/chat.${chatId}.removed-typing-users`, (message) => {
                const typingUserId = JSON.parse(message.body);
                setTypingUsers(typingUsers => typingUsers.filter(user => user.id !== typingUserId));
            });
            stompClient.subscribe(`/topic/chat.${chatId}.added-typing-users`, (message) => {
                const typingUser = JSON.parse(message.body);
                setTypingUsers(typingUsers => [...typingUsers.filter(u => u.id !== typingUser.id), typingUser]);
            });
    }, [chatId, getClient]);

    return { typingUsers, typingUsernames, startTyping, stopTyping };
};

export default useTypingUsers;
"use client";

import Chat from "./Chat";
import SearchBar from "@/features/search/components/SearchBar";
import IconButton from "@/features/common/components/IconButton";
import { useEffect, useMemo, useRef, useState } from "react";
import { FiPlus } from "react-icons/fi";
import { createPortal } from "react-dom";
import CreateGroupModal from "@/features/groups/components/GroupModal";
import { Client } from "@stomp/stompjs";
import { useSession } from "next-auth/react";
const BASE_WS_URL = process.env.NEXT_PUBLIC_BASE_WS_URL;

type Props = {
    initialData: Chat[];
    user: User;
}

const ChatsContainer: React.FC<Props> = ({ initialData, user }) => {

    const { data: session } = useSession();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [chats, setChats] = useState(initialData);
    const stompClient = useRef<Client | null>(null);

    const sortChats = (chats: Chat[]) => {
        const sortedChats = chats?.sort((a, b) => {
            const aDate = new Date(a.lastMessage?.createdAt || a.createdAt).getTime();
            const bDate = new Date(b.lastMessage?.createdAt || b.createdAt).getTime();
            return bDate - aDate;
        });
        return sortedChats;
    }

    const sortedChats = useMemo(() => sortChats(chats), [chats]);

    useEffect(() => {
        if (!session?.user?.accessToken) return;
        stompClient.current = new Client({
            brokerURL: BASE_WS_URL,
            connectHeaders: {
                "Authorization": `Bearer ${session?.user?.accessToken}`,
            },
            onConnect: () => {
                stompClient.current?.subscribe(`/topic/users.${user.id}.created-chats`, (message) => {
                    const chat = JSON.parse(message.body);
                    setChats(prevState => [chat, ...prevState]);
                });

                stompClient.current?.subscribe(`/topic/users.${user.id}.deleted-chats`, (message) => {
                    const chatId = JSON.parse(message.body);
                    setChats(prevChats => prevChats.filter(chat => chat.id !== chatId));
                });

                stompClient.current?.subscribe(`/topic/users.${user.id}.updated-chats`, (message) => {
                    const chat = JSON.parse(message.body);
                    setChats(prevChats => prevChats.map(prevChat => prevChat.id === chat.id ? chat : prevChat));
                });
            }
        })

        stompClient.current?.activate();

        return () => {
            stompClient.current?.deactivate();
        }
    }, [session?.user?.accessToken, user.id]);

    return (
        <div>
            {
                isModalOpen &&
                createPortal(
                    <CreateGroupModal closeModal={() => setIsModalOpen(false)} />,
                    document.body
                )
            }
            <div className="flex gap-2 items-center justify-between mb-2">
                <SearchBar />
                <IconButton onClick={() => setIsModalOpen(true)}>
                    <FiPlus size={22} className="text-primary" />
                </IconButton>
            </div>
            <div className="flex flex-col gap-1.5">
                {
                    sortedChats.length > 0 ?
                    sortedChats?.map(chat => (
                        <Chat key={chat.id} chat={chat} />
                    ))
                    :
                    <h3 className="text-muted font-semibold text-sm text-center mt-2">No chats found</h3>
                }
            </div>
        </div>
    );
}

export default ChatsContainer;
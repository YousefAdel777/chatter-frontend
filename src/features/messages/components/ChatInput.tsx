"use client";

import IconButton from "@/features/common/components/IconButton";
import { useEffect, useRef, useState, useTransition } from "react";
import { FiMic, FiSend, FiSmile, FiX } from "react-icons/fi";
import MessageInputMenu from "./MessageInputMenu";
import { batchUpdateMessagesMutation, createMessageMutationAfter, createMessageMutationBefore, deleteMessageMutation, updateMessageMutation } from "../mutations";
import { Client } from "@stomp/stompjs";
import { useSession } from "next-auth/react";
import SelectedMessage from "./SelectedMessage";
import Picker, { EmojiStyle, Theme } from 'emoji-picker-react';
import Recorder from "./Recorder";
import { useTheme } from "next-themes";
import { useMessagesContext } from "../contexts/MessagesContextProvider";
import { createMessageWithFiles, updateMessage } from "../actions";
import useTypingUsers from "../hooks/useTypingUsers";
import { useRouter } from "next/navigation";
const BASE_WS_URL = process.env.NEXT_PUBLIC_BASE_WS_URL;

type Props = {
    chatId?: number;
    userId?: number;
    editedMessage: Message | null;
    replyMessage: Message | null;
    unselectMessage: () => void;
}

const ChatInput: React.FC<Props> = ({ chatId, userId, editedMessage, replyMessage, unselectMessage }) => {

    const { data: session } = useSession();
    const [message, setMessage] = useState(editedMessage?.content || "");
    const [isEmojiMenuOpen, setIsEmojiMenuOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isRecorderOpen, setIsRecorderOpen] = useState(false);
    const stompClient = useRef<Client | null>(null);
    const messagesContainerRef = useRef<HTMLDivElement | null>(null);
    const [typing, setTyping] = useState(false);
    const typingTimeout = useRef<NodeJS.Timeout>(null);
    const pickerRef = useRef<HTMLDivElement>(null);
    const { theme } = useTheme();
    const router = useRouter();
    const { mutateAfter, mutateBefore, paginatedDataAfter, paginatedDataBefore, hasMoreAfter } = useMessagesContext() as MessagesContextType;
    const { startTyping, stopTyping } = useTypingUsers(chatId);

    const hadleSubmit = () => {
        if (!message) return;
        startTransition(async () => {
            if (editedMessage) {
                if (paginatedDataAfter) {
                    mutateAfter(updateMessageMutation(editedMessage.id, { content: message }, paginatedDataAfter), {
                        revalidate: false,
                        populateCache: true,
                        rollbackOnError: true,
                    });
                }
                else if (paginatedDataBefore) {
                    mutateBefore(updateMessageMutation(editedMessage.id, { content: message }, paginatedDataBefore), {
                        revalidate: false,
                        populateCache: true,
                        rollbackOnError: true,
                    });
                }
                await updateMessage(editedMessage.id, { content: message });
            }
            else {
                const newMessage = { 
                    userId,
                    chatId,
                    content: message, 
                    messageType: "TEXT", 
                    replyMessageId: replyMessage?.id
                };
                const formData = new FormData();
                formData.append("message", new Blob([JSON.stringify(newMessage)], { type: "application/json" }));
                const createdMessage = await createMessageWithFiles(formData);
                if (hasMoreAfter) return;
                if (paginatedDataAfter) {
                    mutateAfter(createMessageMutationAfter(paginatedDataAfter, createdMessage), {
                        revalidate: false,
                        populateCache: true,
                        rollbackOnError: true,
                    });
                }
                else if (paginatedDataBefore) {
                    mutateBefore(createMessageMutationBefore(paginatedDataBefore, createdMessage), {
                        revalidate: false,
                        populateCache: true,
                        rollbackOnError: true,
                    });
                }
                else {
                    mutateBefore([{ content: [createdMessage], nextCursor: null, previousCursor: null }], { revalidate: false, populateCache: true, rollbackOnError: true });
                    if (!chatId) {
                        router.push(`/chats/${createdMessage.chatId}`);
                    }
                }
            }
            unselectMessage();
            setMessage("");
        });
    }

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setMessage(e.target.value);
        if (!typing) {
            startTyping();
            setTyping(true);
        }
        if (typingTimeout.current) {
            clearTimeout(typingTimeout.current);
        }
        typingTimeout.current = setTimeout(() => {
            stopTyping();
            setTyping(false);
        }, 1000);
    }

    useEffect(() => {
        if (!chatId || !session?.user?.accessToken) return;
        stompClient.current = new Client({
            brokerURL: BASE_WS_URL,
            connectHeaders: {
                "Authorization": `Bearer ${session?.user?.accessToken}`
            },
            onStompError: (e) => {
                console.log(e);
            }
        });

        stompClient.current.onConnect = () => {
            const options = {
                revalidate: false,
                populateCache: true,
                rollbackOnError: true,
            }
            stompClient.current?.subscribe(`/topic/chat.${chatId}.created-messages`, (message) => {
                const newMessage: Message = JSON.parse(message.body);
                if (newMessage.user?.id.toString() === session?.user?.id) return;
                if (hasMoreAfter) return;
                if (paginatedDataAfter) {
                    mutateAfter(createMessageMutationAfter(paginatedDataAfter, newMessage), options);
                }
                else if (paginatedDataBefore) {
                    mutateBefore(createMessageMutationBefore(paginatedDataBefore, newMessage), options);
                }
                else {
                    mutateBefore([{ content: [newMessage], nextCursor: null, previousCursor: null }], { revalidate: false, populateCache: true, rollbackOnError: true });
                } 
            });

            stompClient.current?.subscribe(`/topic/chat.${chatId}.edited-messages?userId=${session.user?.id}`, (message) => {
                const updatedMessage = JSON.parse(message.body);
                if (paginatedDataAfter) {
                    mutateAfter(updateMessageMutation(updatedMessage.id, updatedMessage, paginatedDataAfter), options);
                }
                else if (paginatedDataBefore) {
                    mutateBefore(updateMessageMutation(updatedMessage.id, updatedMessage, paginatedDataBefore), options);
                }
            });

            stompClient.current?.subscribe(`/topic/chat.${chatId}.edited-messages-batch?userId=${session.user?.id}`, (message) => {
                const updatedMessages = JSON.parse(message.body);
                if (paginatedDataAfter) {
                    mutateAfter(batchUpdateMessagesMutation(updatedMessages, paginatedDataAfter), options);
                }
                else if (paginatedDataBefore) {
                    mutateBefore(batchUpdateMessagesMutation(updatedMessages, paginatedDataBefore), options);
                }
            });


            stompClient.current?.subscribe(`/topic/chat.${chatId}.deleted-messages`, (message) => {
                const deletedMessageId = JSON.parse(message.body);
                if (paginatedDataAfter) {
                    mutateAfter(deleteMessageMutation(deletedMessageId, paginatedDataAfter), {
                        revalidate: false,
                        populateCache: true,
                        rollbackOnError: true,
                    });
                }
                else if (paginatedDataBefore) {
                    mutateBefore(deleteMessageMutation(deletedMessageId, paginatedDataBefore), {
                        revalidate: false,
                        populateCache: true,
                        rollbackOnError: true,
                    });
                }
            });
        };
        
        stompClient.current.activate();

        return () => {
            if (stompClient.current) {
                stompClient.current.deactivate();
            }
        };
    }, [mutateAfter, mutateBefore, paginatedDataAfter, paginatedDataBefore, hasMoreAfter, chatId, session?.user?.id, session?.user?.accessToken]);

    useEffect(() => {
        return () => {
            stopTyping();
            if (typingTimeout.current) clearTimeout(typingTimeout.current);
        };
    }, [stopTyping]);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
                setIsEmojiMenuOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div ref={messagesContainerRef} className="absolute bottom-0 w-full">
            {
                editedMessage ?
                <SelectedMessage unselectMessage={unselectMessage} message={editedMessage} />
                :
                replyMessage ?
                <SelectedMessage unselectMessage={unselectMessage} message={replyMessage} />
                :
                null
            }
            {
                isRecorderOpen &&
                <Recorder replyMessageId={replyMessage?.id} chatId={chatId} userId={userId} />
            }
            <div ref={pickerRef} className="w-fit z-10 relative">
                <Picker theme={theme === "dark" ? Theme.DARK : Theme.AUTO} emojiStyle={EmojiStyle.NATIVE} open={isEmojiMenuOpen} onEmojiClick={e => setMessage(prevState => `${prevState}${e.emoji}`)} />
            </div>
            <form onSubmit={e => e.preventDefault()} className="flex items-center gap-2 w-full bg-background px-4 py-2">
                <MessageInputMenu userId={userId} chatId={chatId} replyMessageId={replyMessage?.id} disabled={isPending} />
                <IconButton onClick={() => !isEmojiMenuOpen && setIsEmojiMenuOpen(true)} disabled={isPending}>
                    {
                        isEmojiMenuOpen ?
                        <FiX size={22} className="text-primary" />
                        :
                        <FiSmile size={22} className="text-primary" />
                    }
                </IconButton>
                <IconButton disabled={isPending} onClick={() => setIsRecorderOpen(!isRecorderOpen)}>
                    {
                        isRecorderOpen ?
                        <FiX size={22} className="text-primary" />
                        :
                        <FiMic size={22} className="text-primary" />
                    }
                </IconButton>
                <textarea 
                    placeholder="Type a message..." 
                    className="form-input m-0 grow h-11 max-h-44 resize-none" 
                    value={message}
                    onChange={handleChange}
                />
                <IconButton onClick={hadleSubmit} disabled={isPending}>
                    <FiSend size={22} className="text-primary" />
                </IconButton>
            </form>
        </div>
    );
}

export default ChatInput;
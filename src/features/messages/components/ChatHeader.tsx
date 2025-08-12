"use client";

import ChatFilters from "@/features/chats/components/ChatFilters";
import { useFiltersContext } from "@/features/chats/contexts/FiltersContextProvider";
import useOnlineStatus from "@/features/chats/hooks/useOnlineStatus";
import Avatar from "@/features/common/components/Avatar"
import IconButton from "@/features/common/components/IconButton";
import { formatDate, getFormattedHours } from "@/features/common/lib/utils";
import UserModal from "@/features/users/components/UserModal";
import { useCallStore } from "@/store/callStore";
import { useState } from "react";
import { createPortal } from "react-dom";
import { FaFilter, FaPhone } from "react-icons/fa";
import { FiX } from "react-icons/fi";
import { RiResetLeftFill } from "react-icons/ri";
import useTypingUsers from "../hooks/useTypingUsers";


type Props = {
    user?: User;
    chatId?: number;
}

const ChatHeader: React.FC<Props> = ({ user, chatId }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const { setIsCallModalOpen, setCallingUser } = useCallStore();
    const { isFiltered, resetFilters } = useFiltersContext() as FiltersContextType;
    const { isOnline } = useOnlineStatus(user?.id);
    const { typingUsernames } = useTypingUsers(chatId);

    const handleVoiceCall = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (!user) return;
        e.stopPropagation();
        setCallingUser(user);
        setIsCallModalOpen(true);
    };

    const toggleFilters = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        setShowFilters(prev => !prev)
    }
    
    const handleReset = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.stopPropagation();
        resetFilters();
    }

    return (
        <div className="relative">
            {
                isModalOpen && user &&
                createPortal(<UserModal user={user} closeModal={() => setIsModalOpen(false)} />, document.body)
            }
            <div onClick={() => user && setIsModalOpen(true)} className="flex flex-1 items-center gap-3 cursor-pointer duration-200 bg-background p-3 shadow-md hover:bg-background-secondary">
                <Avatar isOnline={isOnline} alt={user?.username || "Deleted User"} image={user?.image || "/user_image.webp"} />
                <div>
                    <h2 className="font-semibold truncate text-nowrap max-w-44 md:max-w-none">{user?.username || "Deleted User"}</h2>
                    {
                        user?.lastOnline && !isOnline &&
                        <p className="text-xs font-semibold italic text-muted">
                            Last seen: {" "}
                            {formatDate(user.lastOnline)} {" "}
                            {getFormattedHours(user.lastOnline)}
                        </p>
                    }
                    {
                        typingUsernames &&
                        <p className="text-xs font-semibold italic text-muted">Typing...</p>
                    }
                </div>
                <div className="ml-auto flex gap-2">
                    {
                        isFiltered &&
                        <IconButton onClick={handleReset}>
                            <RiResetLeftFill size={22} className="text-primary" />
                        </IconButton>
                    }
                    <IconButton onClick={toggleFilters}>
                        {
                            showFilters ?
                            <FiX size={22} className="text-primary" />
                            :
                            <FaFilter size={22} className="text-primary" />
                        }
                    </IconButton>
                    <IconButton onClick={handleVoiceCall}>
                        <FaPhone size={22} className="text-primary" />
                    </IconButton>
                </div>
            </div>
            {
                showFilters &&
                <div className="absolute z-10 left-0 bottom-0 w-full translate-y-full">
                    <ChatFilters />
                </div>
            }
        </div>
    );
}

export default ChatHeader;
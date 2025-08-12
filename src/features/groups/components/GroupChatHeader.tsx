"use client";

import { MouseEvent, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import GroupMembersModal from "./GroupMembersModal";
import Avatar from "@/features/common/components/Avatar";
import IconButton from "@/features/common/components/IconButton";
import { FaGear } from "react-icons/fa6";
import GroupModal from "./GroupModal";
import {  HiUsers } from "react-icons/hi2";
import { HiUserAdd } from "react-icons/hi";
import InviteModal from "../../invites/components/InviteModal";
import { FaFilter, FaSignOutAlt } from "react-icons/fa";
import { deleteMember } from "../actions";
import { useRouter } from "next/navigation";
import { useFiltersContext } from "@/features/chats/contexts/FiltersContextProvider";
import { RiResetLeftFill } from "react-icons/ri";
import { FiX } from "react-icons/fi";
import ChatFilters from "@/features/chats/components/ChatFilters";
import useTypingUsers from "@/features/messages/hooks/useTypingUsers";

type Props = {
    chat: Chat;
    member: Member;
}

const GroupChatHeader: React.FC<Props> = ({ chat, member }) => {

    const { typingUsernames } = useTypingUsers();
    const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
    const [isGroupEditModalOpen, setIsGroupEditModalOpen] = useState(false);
    const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const isAdmin = member.memberRole === "ADMIN" || member.memberRole === "OWNER";
    const { isFiltered, resetFilters } = useFiltersContext() as FiltersContextType;

    const leaveChat = (e: MouseEvent) => {
        e.stopPropagation();
        startTransition(async () => {
            const res = await deleteMember(member.id);
            if (!res?.error) {
                router.push("/");
            }
        });
    }

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
            <div className="cursor-pointer duration-200 bg-background p-3 shadow-md hover:bg-background-secondary relative">
                {
                    isMembersModalOpen &&
                    createPortal(
                        <GroupMembersModal
                            currentMemberRole={member.memberRole}
                            chat={chat}
                            closeModal={() => setIsMembersModalOpen(false)} 
                        />, 
                        document.body
                    )
                }
                {
                    isGroupEditModalOpen &&
                    createPortal(
                        <GroupModal
                            chat={chat}
                            closeModal={() => setIsGroupEditModalOpen(false)} 
                        />, 
                        document.body
                    )
                }
                {
                    isInviteModalOpen &&
                    createPortal(
                        <InviteModal
                            inviteChatId={chat.id}
                            closeModal={() => setIsInviteModalOpen(false)} 
                        />, 
                        document.body
                    )
                }
                <div className="flex flex-1 items-center gap-3">
                    <Avatar alt={chat.name || "Chat Image"} image={chat.image as string} />
                    <div>
                        <h2 className="tex-lg font-semibold">{chat.name}</h2>
                        <p className="text-xs text-muted">{chat.description}</p>
                        {
                            typingUsernames.length > 0 &&
                            <>
                                <p className="text-xs text-muted max-w-full truncate text-nowrap">{typingUsernames} are typing...</p>
                            </>
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
                        {
                            (isAdmin || !chat.onlyAdminsCanEditGroup) &&
                            <IconButton onClick={(e) => {
                                e.stopPropagation();
                                setIsGroupEditModalOpen(true);
                            }}>
                                <FaGear size={22} className="text-primary" />
                            </IconButton>
                        }
                        {
                            (isAdmin || !chat.onlyAdminsCanInvite) &&
                            <IconButton onClick={(e) => {
                                e.stopPropagation();
                                setIsInviteModalOpen(true);
                            }}>
                                <HiUserAdd size={22} className="text-primary" />
                            </IconButton>
                        }
                        <IconButton onClick={(e) => {
                            e.stopPropagation();
                            setIsMembersModalOpen(true);
                        }}>
                            <HiUsers size={22} className="text-primary" />
                        </IconButton>
                        <IconButton onClick={leaveChat} disabled={isPending}>
                            <FaSignOutAlt size={22} className="text-red-500" />
                        </IconButton>
                    </div>
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

export default GroupChatHeader;
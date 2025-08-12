import Modal from "@/features/common/components/Modal";
import useSWR from "swr";
import Member from "./Member";
import useDebounce from "@/features/search/hooks/useDebounce";
import Loading from "@/features/common/components/Loading";
import { useState } from "react";
import { updateMemberMutation, updateMemberOptions, deleteMemberMutation, deleteMemberOptions } from "../mutations";

type Props = {
    currentMemberRole: MemberRole;
    chat: Chat;
    closeModal: () => void;
}

const GroupMembersModal: React.FC<Props> = ({ currentMemberRole, chat, closeModal }) => {

    const [search, setSearch] = useState("");
    const { debouncedValue } = useDebounce(search, 500);
    const { data: members, isLoading, error, mutate } = useSWR<Member[]>(`/api/members?chatId=${chat.id}&username=${debouncedValue}&email=${debouncedValue}`);

    const removeMember = async (memberId: number) => {
        await mutate(
            deleteMemberMutation(memberId, members || []),
            deleteMemberOptions(memberId, members || [])
        );
    }

    const toggleAdmin = async (member: Member) => {
        if (member.memberRole === "OWNER") return;
        const data = { 
            memberRole: member.memberRole === "ADMIN" ? "MEMBER" : "ADMIN" as MemberRole 
        };
        await mutate(
            updateMemberMutation(member.id, members || [], data),
            updateMemberOptions(member.id, members || [], data)
        );
    }

    return (
        <Modal  title="Group Members" closeModal={closeModal}>
            <div className="flex items-center gap-3 mb-3">
                <input 
                    type="text" 
                    placeholder="Search..." 
                    className="form-input m-0" 
                    onChange={e => setSearch(e.target.value)} 
                />
                {
                    (members && members.length > 0) &&
                    <span className="text-sm font-semibold text-muted text-nowrap">
                        {members.length} {members.length > 1 ? "Members" : "Member"}
                    </span>
                }
            </div>
            <div className="max-h-72 min-h-72 overflow-y-auto">
                {
                    error ?
                    <p className="text-center text-muted font-semibold text-sm">
                        Something went wrong
                    </p>
                    :
                    isLoading ?
                    <Loading />
                    :
                    members?.length === 0 ?
                    <p className="text-center text-muted font-semibold text-sm">
                        No members found
                    </p>
                    :
                    members?.map(member => (
                        <Member 
                            key={member.id} 
                            member={member}
                            currentMemberRole={currentMemberRole}
                            toggleAdmin={() => toggleAdmin(member)}
                            removeMember={() => removeMember(member.id)}
                        />
                    ))
                }
            </div>
        </Modal>
    );
}

export default GroupMembersModal;
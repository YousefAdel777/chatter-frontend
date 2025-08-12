import Avatar from "@/features/common/components/Avatar";
import IconButton from "@/features/common/components/IconButton";
import Switch from "@/features/common/components/Switch";
import UserModal from "@/features/users/components/UserModal";
import { useSession } from "next-auth/react";
import { useState } from "react";
import { createPortal } from "react-dom";
import { FaTrashAlt } from "react-icons/fa";

type Props = {
    member: Member
    currentMemberRole: MemberRole;
    toggleAdmin: () => void;
    removeMember: () => void;
}

const Member: React.FC<Props> = ({ member, currentMemberRole, toggleAdmin, removeMember }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);
    const { data: session } = useSession();
    const isOwner = currentMemberRole === "OWNER";
    const isAdmin = isOwner || currentMemberRole === "ADMIN";

    return (
        <div className="flex cursor-pointer items-center justify-between px-3 py-2 hover:bg-background-secondary duration-200 rounded-md">
            {
                isModalOpen &&
                createPortal(
                    <UserModal
                        user={member.user}
                        closeModal={() => setIsModalOpen(false)} 
                    />,
                    document.body
                )
            }
            <div onClick={() => setIsModalOpen(true)} className="flex-1 flex items-center gap-2">
                <Avatar alt={member.user.username} image={member.user.image}  />
                <h2 className="text-lg max-w-48 font-semibold truncate">{member.user.username}</h2>
            </div>
            <div className="flex items-center gap-2.5">
                <p className="text-xs font-semibold text-muted">{member.memberRole}</p>
                {
                    isAdmin && member.memberRole !== "OWNER" && member.memberRole !== "ADMIN" && session?.user?.id !== member.user.id.toString() ?
                    <>
                        <Switch checked={false} onChange={toggleAdmin} />
                        <IconButton onClick={removeMember}>
                            <FaTrashAlt size={22} className="text-red-500" />
                        </IconButton>
                    </>
                    :
                    isOwner && session?.user?.id !== member.user.id.toString() ?
                    <>
                        <Switch checked={member.memberRole === "ADMIN"} onChange={toggleAdmin} />
                        <IconButton onClick={removeMember}>
                            <FaTrashAlt size={22} className="text-red-500" />
                        </IconButton>
                    </>
                    :
                    null
                }
            </div>
        </div>
    );
}

export default Member;
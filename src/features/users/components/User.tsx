import { useState } from "react";
import { createPortal } from "react-dom";
import UserModal from "./UserModal";
import Avatar from "@/features/common/components/Avatar";

type Props = {
    user: User;
}

const User: React.FC<Props> = ({ user }) => {

    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <>
            {
                isModalOpen &&
                createPortal(
                    <UserModal user={user} closeModal={() => setIsModalOpen(false)} />,
                    document.body
                )
            }
            <div onClick={() => setIsModalOpen(true)} className="flex flex-1 w-full items-center px-2 py-1.5 rounded-md gap-3 cursor-pointer duration-200 hover:bg-background-ternary">
                <Avatar size={45} alt={user.username} image={user.image}  />
                <h2 className="text-lg max-w-48 font-semibold truncate">{user.username}</h2>
            </div>
        </>
    );
}

export default User;
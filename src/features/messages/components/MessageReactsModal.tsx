import Avatar from "@/features/common/components/Avatar";
import Modal from "@/features/common/components/Modal";
import UserModal from "@/features/users/components/UserModal";
import { useState } from "react";
import { createPortal } from "react-dom";

type Props = {
    reacts: MessageReact[];
    closeModal: () => void;
}

const MessageReactsModal: React.FC<Props> = ({ reacts, closeModal }) => {
    const [user, setUser] = useState<User | null>(null);
    return (
        <Modal  title="Reacts" closeModal={closeModal}>
            {
                user &&
                createPortal(
                    <UserModal user={user} closeModal={() => setUser(null)} />,
                    document.body
                )
            }
            <div className="flex flex-col gap-1.5">
                {
                    reacts.map((react) => (
                        <div onClick={() => setUser(react.user)} className="flex rounded-lg cursor-pointer duration-200 items-center gap-2 p-1.5 hover:bg-background-secondary" key={react.id}>
                            <Avatar size={40} alt={react.user.username} image={react.user.image} />
                            <p className="font-bold truncate">{react.user.username}</p>
                            <p className="text-xl ml-auto">{react.emoji}</p>
                        </div>
                    ))
                }
            </div>
        </Modal>
    );
}

export default MessageReactsModal;
import Avatar from "../../common/components/Avatar";
import Modal from "../../common/components/Modal";
import IconButton from "../../common/components/IconButton";
import { BiBlock, BiChat } from "react-icons/bi";
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { createBlock, deleteBlock } from "../actions";
import Loading from "@/features/common/components/Loading";
import ErrorMessage from "@/features/common/components/ErrorMessage";
import { useTransition } from "react";
import { useSession } from "next-auth/react";

type Props = {
    user: User;
    closeModal: () => void;
}

const UserModal: React.FC<Props> = ({ user, closeModal }) => {
    
    const { data: session } = useSession();
    const [isPending, startTransition] = useTransition();
    const { data: block, isLoading, error, mutate } = useSWR<Block>(`/api/blocks/me?userId=${user.id}`);
    const router = useRouter();
    const isCurrentUser = session?.user?.id === user.id.toString();

    const handleBlock = () => {
        startTransition(async () => {
            if (block?.id) {
                const res = await deleteBlock(block.id);
                if (res?.error) return;
                mutate(undefined, {
                    rollbackOnError: true,
                    populateCache: true,
                    revalidate: false
                });
            }
            else {
                mutate(await createBlock(user.id), {
                    rollbackOnError: true,
                    populateCache: true,
                    revalidate: false
                });
            }
        });
    }

    return (
        <Modal  closeModal={closeModal} title={user.username}>
            <div className="flex flex-col items-center">
                {
                    isLoading ?
                    <Loading />
                    :
                    error ?
                    <ErrorMessage className="text-center" message="Something went wrong" isActive={!!error} />
                    :
                    <>
                        <Avatar size={70} alt={user.username} image={user.image} />
                        <h2 className="text-2xl font-bold">{user.username}</h2>
                        <p>{user.email}</p>
                        <p className="text-sm text-muted">
                            {user.bio}
                        </p>
                        {
                            !isCurrentUser && 
                            <div className="flex mt-2 items-center justify-center gap-2">
                                <div className="flex flex-col items-center justify-center gap-0.5">
                                    <IconButton disabled={isPending} onClick={handleBlock}>
                                        <BiBlock className="w-7 h-7 text-red-500" />
                                    </IconButton>
                                    <p className="text-xs text-red-500">{block?.id ? "Unblock" : "Block"}</p>
                                </div>
                                <div className="flex flex-col items-center justify-center gap-0.5">
                                    <IconButton onClick={() => {
                                        router.push(`/chats?userId=${user.id}`);
                                        closeModal();
                                    }}>
                                        <BiChat className="w-7 h-7 text-primary" />
                                    </IconButton>
                                    <p className="text-xs text-primary">Chat</p>
                                </div>
                            </div>
                        }
                    </>
                }
            </div>
        </Modal>
    );
}

export default UserModal;
import Loading from "@/features/common/components/Loading";
import Modal from "@/features/common/components/Modal";
import useSWR from "swr";
import ExcludedUser from "./ExcludedUser";
import ErrorMessage from "@/features/common/components/ErrorMessage";
import { useState, useTransition } from "react";
import Button from "@/features/common/components/Button";

type Props = {
    excludedUsersIds: number[];
    toggleExclusion: (userId: number) => void; 
    closeModal: () => void;
    handleUpdate?: () => Promise<{ error?: string }>;
}

const ExcludedUsersModal: React.FC<Props> = ({ excludedUsersIds, closeModal, toggleExclusion, handleUpdate }) => {

    const [errorMessage, setErrorMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const { data: users, isLoading, error } = useSWR<User[]>("/api/users/me/contacts");

    const handleSave = () => {
        setErrorMessage("");
        startTransition(async () => {
            if (!handleUpdate) return;
            const res = await handleUpdate();
            if (res.error) {
                setErrorMessage(res.error);
                return;
            }
            closeModal();
        });
    }

    return (
        <Modal  title="Exclude Users" closeModal={closeModal}>
            {
                isLoading ?
                <div className="flex items-center justify-center mt-20">
                    <Loading />
                </div>
                :
                error ? 
                <h3 className="text-xl font-semibold text-center">Something went wrong</h3>
                :
                !users || users.length === 0 ?
                <div className="text-xl font-semibold text-center">
                    No users found.
                </div>
                :
                <div>
                    <div className="max-h-64 overflow-y-auto">
                        {
                            users?.map(user => (
                                user &&
                                <ExcludedUser 
                                    key={user.id}
                                    excluded={excludedUsersIds.includes(user?.id)}
                                    username={user.username} 
                                    image={user?.image} 
                                    handleToggle={() => toggleExclusion(user.id)}
                                />
                            ))
                        }
                    </div>
                    {
                        handleUpdate &&
                        <div className="flex mt-3 items-center justify-between">
                            <ErrorMessage className="m-0" message={errorMessage} isActive={!!errorMessage} />
                            <Button disabled={isPending} onClick={handleSave}>
                                Save
                            </Button>
                        </div>
                    }
                </div>
            }
        </Modal>
    );
}

export default ExcludedUsersModal;
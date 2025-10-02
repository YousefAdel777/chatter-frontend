import Button from "@/features/common/components/Button";
import Modal from "@/features/common/components/Modal";
import { useState, useTransition } from "react";
import useSWR from "swr";
import { fowardMessage } from "../actions";
import ErrorMessage from "@/features/common/components/ErrorMessage";
import Loading from "@/features/common/components/Loading";
import Chat from "@/features/chats/components/Chat";
import Switch from "@/features/common/components/Switch";
import useDebounce from "@/features/search/hooks/useDebounce";
import { useMessagesContext } from "../contexts/MessagesContextProvider";

type Props = {
    message: Message;
    closeModal: () => void;
}

const ForwardMessageModal: React.FC<Props> = ({ message, closeModal }) => {

    const [chatIds, setChatIds] = useState<number[]>([]);
    const [search, setSearch] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const { mutateAfter, mutateBefore } = useMessagesContext() ;
    const { debouncedValue } = useDebounce(search, 500);
    const { data: chats, isLoading, error } = useSWR<Chat[]>(`/api/chats?name=${debouncedValue}&description=${debouncedValue}`);

    const handleSend = () => {
        setErrorMessage("");
        startTransition(async () => {
            const res = await fowardMessage({ messageId: message.id, chatIds });
            if (res.error) {
                setErrorMessage(res.error);
            }
            else {
                mutateAfter();
                mutateBefore();
                closeModal();
            }
        });
    }

    const toggleChat = (chatId: number) => {
        if (chatIds.includes(chatId)) {
            setChatIds(prevState => prevState.filter(id => id !== chatId));
        }
        else {
            setChatIds(prevState => [...prevState, chatId]);
        }
    }

    return (
        <Modal  title="Forward Message" closeModal={closeModal}>
            <form onSubmit={handleSend}>
                <input 
                    type="text"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    placeholder="Search..."
                    className="form-input" 
                />
                <div className="max-h-72 min-h-72 overflow-y-auto">
                    {
                        error ?
                        <ErrorMessage isActive message="Something went wrong" />
                        :
                        isLoading ?
                        <Loading />
                        :
                        chats?.length === 0 ?
                        <p className="text-center text-muted font-semibold text-sm">
                            No chats found
                        </p>
                        :
                        chats?.map(chat => (
                            <div key={chat.id} className="flex items-center justify-between p-1 rounded-md duration-200 hover:bg-background-secondary">
                                <Chat chat={chat} />
                                <Switch checked={chatIds.includes(chat.id)} onChange={() => toggleChat(chat.id)} />
                            </div>
                        ))
                    }
                </div>
                <div className="flex mt-3 items-center justify-between">
                    <ErrorMessage isActive={!!errorMessage} message={errorMessage} />
                    <Button disabled={isPending || isLoading || chatIds.length === 0} onClick={handleSend}>
                        Send
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default ForwardMessageModal;
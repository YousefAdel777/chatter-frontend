import Chat from "@/features/chats/components/Chat";
import Button from "@/features/common/components/Button";
import ErrorMessage from "@/features/common/components/ErrorMessage";
import Modal from "@/features/common/components/Modal";
import Switch from "@/features/common/components/Switch";
import useDebounce from "@/features/search/hooks/useDebounce";
import { useMemo, useState, useTransition } from "react";
import useSWR from "swr";
import Loading from "@/features/common/components/Loading";
import { formatDateForInput } from "@/features/common/lib/utils";
import { useForm } from "react-hook-form";
import inviteSchema, { InviteSchema } from "@/features/chats/schemas/inviteSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { createInvite } from "@/features/invites/actions";
import { createMessages } from "@/features/messages/actions";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_FRONTEND_URL;
import InviteUrlModal from "./InviteUrlModal";

type Props = {
    inviteChatId: number;
    closeModal: () => void;
}

const InviteModal: React.FC<Props> = ({ inviteChatId, closeModal }) => {

    const [chatIds, setChatIds] = useState<number[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const [search, setSearch] = useState("");
    const [inviteUrl, setInviteUrl] = useState("");

    const { debouncedValue } = useDebounce(search, 500);
    const { data, isLoading, error } = useSWR<Chat[]>(`/api/chats?name=${debouncedValue}&description=${debouncedValue}`);
    const chats = useMemo(() => {
        return data?.filter(chat => {
            if (chat.chatType === "GROUP") {
                return  chat.id !== inviteChatId;
            }
            return !!chat.otherUser;
        });
    }, [data, inviteChatId]);

    const {
        handleSubmit,
        formState: { errors },
        register,
        setValue,
        watch,
    } = useForm<InviteSchema>({
        resolver: zodResolver(inviteSchema),
        defaultValues: {
            inviteChatId,
            expires: false,
            canUseLink: false,
        }
    });
    
    const canUseLink = watch("canUseLink");
    const expires = watch("expires");

    const onSubmit = (data: InviteSchema) => {
        setErrorMessage("");
        startTransition(async () => {
            const res = await createInvite({
                ...data,
                expiresAt: data.expires && data.expiresAt ? new Date(data.expiresAt) : undefined,
            });
            if (res.error) {
                setErrorMessage(res.error);
                return;
            }
            if (chatIds.length > 0) {
                const formData = new FormData();
                formData.append("message", new Blob([JSON.stringify({
                    messageType: "INVITE",
                    inviteId: res.id,
                    chatsIds: chatIds
                })], { type: "application/json" }));
                const messagesRes = await createMessages(formData);
                if (messagesRes.error) {
                    setErrorMessage(messagesRes.error);
                    return;
                }
            }
            if (data.canUseLink) {
                setInviteUrl(`${BASE_URL}/invites/${res.id}`);
            }
            else {
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

    const handleInviteUrlClose = () => {
        setInviteUrl("");
        closeModal();
    }

    return (
        <>
            {
                inviteUrl ? 
                <InviteUrlModal closeModal={handleInviteUrlClose} url={inviteUrl} />
                :
                <Modal title="Invite Users" closeModal={closeModal}>
                    <form noValidate onSubmit={handleSubmit(onSubmit)}>
                        <input 
                            type="text"
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            placeholder="Search..."
                            className="form-input" 
                        />
                        <div className="flex items-center gap-2 mb-4">
                            <p className="text-sm font-semibold text-muted">Expires: </p>
                            <input 
                                disabled={!expires}
                                type="datetime-local"
                                {...register("expiresAt")}
                                placeholder="Search..."
                                className="form-input m-0" 
                                min={formatDateForInput(new Date())}
                            />
                            <Switch checked={expires} 
                                onChange={(e) => {
                                    if (!e.target.checked) {
                                        setValue("expiresAt", "");
                                    }
                                    setValue("expires", e.target.checked)
                                }} 
                            />
                        </div>
                        {
                            errors.expiresAt &&
                            <ErrorMessage isActive={!!errors.expiresAt} message={errors.expiresAt.message || ""} />
                        }
                        <div className="flex items-center mb-3 justify-between">
                            <span className="text-sm font-semibold">Generate URL for invite</span>
                            <Switch onChange={e => setValue("canUseLink", e.target.checked)} checked={canUseLink} />
                        </div>
                        <div className=" max-h-64 min-h-64 overflow-y-auto">
                            {
                                error ?
                                <p className="text-center text-muted font-semibold text-sm">
                                    Something went wrong
                                </p>
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
                                    <div key={chat.id} className="flex items-center justify-between p-1 rounded-md duration-200">
                                        <Chat disabled chat={chat} />
                                        <div className="ml-2">
                                            <Switch checked={chatIds.includes(chat.id)} onChange={() => toggleChat(chat.id)} />
                                        </div>
                                    </div>
                                ))
                            }
                        </div>
                        <div className="flex mt-3 items-center justify-between">
                            <ErrorMessage isActive={!!errorMessage} message={errorMessage} />
                            <Button disabled={isPending || isLoading || (chatIds.length === 0 && !canUseLink)}>
                                Invite
                            </Button>
                        </div>
                    </form>
                </Modal>
            }
        </>
    );
}

export default InviteModal;

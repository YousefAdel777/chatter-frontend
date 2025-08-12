import { useTransition } from "react";
import useSWR from "swr";
import { acceptInviteMessage } from "../actions";
import { useRouter } from "next/navigation";
import Avatar from "@/features/common/components/Avatar";
import { useSession } from "next-auth/react";
import Button from "@/features/common/components/Button";

type Props = {
    message: Message;
}

const InviteMessage: React.FC<Props> = ({ message }) => {

    const { data: session } = useSession();
    const isCurrentUser = session?.user?.id === message.user?.id.toString();
    const isExpired = !!message.expiresAt && new Date(message.expiresAt) < new Date();
    const chat = message.invite?.inviteChat;
    const { data: member, isLoading, error } = useSWR<Member>(!chat ? null : `/api/members/me?chatId=${chat.id}`);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const joinChat = () => {
        if (isExpired) return;
        if (member?.id) {
            const searchParams = new URLSearchParams();
            if (chat?.firstUnreadMessageId) {
                searchParams.append("messageId", chat?.firstUnreadMessageId.toString());
            }
            if (chat?.chatType === "GROUP") {
                router.push(`/chats/${chat?.id}?${searchParams.toString()}`);
            }
            return;
        }
        if (isCurrentUser) return;
        startTransition(async () => {
            const res = await acceptInviteMessage(message.id);
            if (!res.error) {
                router.push(`/chats/${chat?.id}`);
            }
        });
    }

    if (error) {
        <h3 className="text-center font-semibold text-sm text-muted">
            Something went wrong
        </h3>
    }

    if (!chat) {
        return null
    }

    return  (
        <div className="bg-background rounded-lg shadow-sm border border-border-primary p-3 w-80">
            <h3 className="text-sm font-medium mb-1.5">Group Invite</h3>
            {
                chat?.id ?
                <div className=" bg-background-ternary rounded-md p-3 mb-3">
                    <div className="flex items-center gap-2 mb-2">
                        <Avatar image={chat?.image || undefined} alt={`${chat?.name || ""} group chat image`} />
                        <div>
                            <h3 className="font-medium">{chat?.name}</h3>
                            <p className="text-xs text-muted">{chat?.membersCount} members</p>
                        </div>
                    </div>
                    <p className="text-xs font-medium text-muted">{chat?.description}</p>
                </div>
                :
                <h3 className="text-sm font-semibold">
                    Group chat unavailable
                </h3>
            }
            <div className="flex gap-2">
                <Button 
                    isLoading={isLoading}
                    onClick={joinChat}
                    className="flex-1 py-2 px-3 rounded-md"
                    disabled={(isCurrentUser && !member?.id) || isExpired || isPending || !chat?.id}
                >
                    {isExpired ? "Expired" : isPending ? "Joining..." : member?.id ? "View Group" : "Join"}
                </Button>
            </div>
        </div>
    );
}

export default InviteMessage;
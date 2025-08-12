import Avatar from "@/features/common/components/Avatar";
import Button from "@/features/common/components/Button";
import { redirect } from "next/navigation";
import { acceptInvite } from "../actions";
import fetcher from "@/features/common/lib/fetcher";

type Props = {
    invite: Invite;
}

const Invite: React.FC<Props> = async ({ invite }) => {

    const isExpired = !!invite.expiresAt && new Date(invite.expiresAt) < new Date();
    const chat = invite.inviteChat;
    const member: Member = await fetcher(`/api/members/me?chatId=${chat.id}`);


    const joinChat = async () => {
        "use server";
        if (isExpired) return;
        if (member?.id) {
            const searchParams = new URLSearchParams();
            if (chat?.firstUnreadMessageId) {
                searchParams.append("messageId", chat?.firstUnreadMessageId.toString());
            }
            if (chat?.chatType === "GROUP") {
                redirect(`/chats/${chat?.id}?${searchParams.toString()}`)
            }
            return;
        }
        const res = await acceptInvite(invite.id);
        if (!res.error) {
            redirect(`/chats/${chat?.id}`);
        }
    }

    return (
        <form 
            action={joinChat} 
            className="bg-background rounded-lg shadow-sm border border-border-primary p-3 w-80"
        >
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
                    className="flex-1 py-2 px-3 rounded-md"
                    disabled={isExpired || !chat?.id}
                >
                    {isExpired ? "Expired" : member?.id ? "View Group" : "Join"}
                </Button>
            </div>
        </form>
    );
}

export default Invite;
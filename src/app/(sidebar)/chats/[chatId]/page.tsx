import fetcher from "@/features/common/lib/fetcher";
import GroupMessagesContainer from "@/features/messages/components/GroupMessagesContainer";
import { redirect } from "next/navigation";

type Params = {
    params: Promise<{
        chatId: number;
    }>
}

const ChatPage = async ({ params }: Params) => {

    const { chatId } = await params;
    const [member, chat] = await Promise.all([
        fetcher(`/api/members/me?chatId=${chatId}`),
        fetcher(`/api/chats/${chatId}`),
    ]);

    if (!member.id) {
        redirect("/");
    }

    return (
        <GroupMessagesContainer chat={chat} member={member} />
    );
}

export default ChatPage;
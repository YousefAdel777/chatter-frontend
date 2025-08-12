import { auth } from "@/auth";
import fetcher from "@/features/common/lib/fetcher";
import IndvidualMessagesContainer from "@/features/messages/components/IndvidualMessagesContainer";
import { redirect } from "next/navigation";

type Params = {
    searchParams: Promise<{
        userId: string;
    }>
}

const ChatsPage = async ({ searchParams }: Params) => {
    const { userId } = await searchParams;
    const session = await auth();
    
    if (!userId || userId === session?.user?.id) redirect("/");

    const [user, block] = await Promise.all([
        fetcher(`/api/users/${userId}`),
        fetcher(`/api/blocks/blocked?userId=${userId}`),
    ]);

    if (!user) {
        redirect("/");
    }

    return (
        <IndvidualMessagesContainer isBlocked={!!block.isBlocked} user={user} />
    );
}

export default ChatsPage;
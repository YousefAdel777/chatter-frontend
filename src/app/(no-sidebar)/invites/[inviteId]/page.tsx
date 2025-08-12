import fetcher from "@/features/common/lib/fetcher";
import Invite from "@/features/invites/components/Invite";
import { redirect } from "next/navigation";

type Params = {
    params: Promise<{
        inviteId: number;
    }>
}

const InvitePage = async ({ params }: Params) => {
    const inviteId = (await params).inviteId;
    const invite: Invite = await fetcher(`/api/invites/${inviteId}`);

    if (!invite.id || !invite.canUseLink) redirect("/");

    return (
        <div className="flex bg-background-ternary items-center justify-center h-svh">
            {/* <div className="px-4 py-6 shadow-xl rounded-lg bg-background">

            </div> */}
            <Invite invite={invite} />
        </div>
    );
}

export default InvitePage;
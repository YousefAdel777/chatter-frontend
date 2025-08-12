import { exchangeCode } from "@/features/auth/actions";
import AuthCallback from "@/features/auth/components/AuthCallback";
import { redirect } from "next/navigation";

type Params = {
    searchParams: Promise<{ code: string }>;
}

const CallbackPage = async ({ searchParams }: Params) => {
    const { code } = await searchParams;
    if (!code) {
        redirect("/auth/signin");
    }
    const { accessToken, refreshToken } = await exchangeCode(code);
    if (!accessToken || !refreshToken) {
        redirect("/auth/signin");
    }
    return (
        <AuthCallback accessToken={accessToken} refreshToken={refreshToken} />
    );
}

export default CallbackPage;
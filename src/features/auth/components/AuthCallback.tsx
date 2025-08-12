"use client";

import Button from "@/features/common/components/Button";
import Loading from "@/features/common/components/Loading";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Props = {
    accessToken: string;
    refreshToken: string;
}

const AuthCallback: React.FC<Props> = ({ accessToken, refreshToken }) => {
    const [errorMessage, setErrorMessage] = useState("");
    const router = useRouter();

    useEffect(() => {
        const handleOauthCallback = async () => {
            if (accessToken && refreshToken) {
                const res = await signIn("oauth", { accessToken, refreshToken, redirect: false });
                if (res?.error) {
                    setErrorMessage("Failed to sign in");
                    return;
                }
                router.push("/");
            }
        }
        handleOauthCallback();
    }, [accessToken, refreshToken, router]);

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-background-secondary">
            {
                errorMessage ?
                <div>
                    <p className="text-red-500 mb-2 text-center text-xl font-semibold">{errorMessage}</p>
                    <Button onClick={() => router.push("/auth/signin")}>
                        Return to sign in
                    </Button>
                </div>
                :
                <div>
                    <Loading />
                    <p className="text-muted mb-2 text-center text-xl text-semibold">Signing in...</p>
                </div>
            }
        </div>
    );
}

export default AuthCallback;
import { DefaultSession } from "next-auth";

declare module "next-auth" {

    interface Session {
        user?: {
            username: string;
            email: string;
            image: string;
            bio: string;
            createdAt: Date;
            showOnlineStatus: boolean;
            showMessageReads: boolean;
            lastOnline: Date | null;
            accessToken?: string;
            refreshToken?: string;
        } & DefaultSession["user"];
    }

    interface User {
        id: number;
        username: string;
        email: string;
        image: string;
        bio: string;
        createdAt: Date;
        showOnlineStatus: boolean;
        showMessageReads: boolean;
        lastOnline: Date | null;
        accessToken?: string;
        refreshToken?: string;
        expires_at: Date | null;
    }

    interface JWT {
        id: number & DefaultJWT;
        accessToken: string & DefaultJWT;
        refreshToken: string & DefaultJWT;
        expires_at: number & DefaultJWT;
    }
}
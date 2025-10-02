import NextAuth from "next-auth";
import { loginUser, refreshToken } from "@/features/auth/actions";
import { NextAuthConfig } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { jwtDecode } from "jwt-decode";

const BASE_URL = process.env.BASE_URL;

export const options: NextAuthConfig = {
    providers: [
        CredentialsProvider({
            name: "Credentials",
            credentials: {
                email: { label: "Email", type: "email" },
                password: { label: "Password", type: "password" }
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) return null;

                    const res = await loginUser({ email: credentials.email as string, password: credentials.password as string });

                    if (res.error) return null;

                    const userRes = await fetch(`${BASE_URL}/api/users/me`, {
                        headers: {
                            "Authorization": `Bearer ${res.accessToken}`,
                            "Content-Type": "application/json"
                        }
                    });
                    if (!userRes.ok) return null;
                    const currentUser = await userRes.json();
                    
                    return {
                        ...currentUser,
                        id: currentUser.id.toString(),
                        accessToken: res.accessToken,
                        refreshToken: res.refreshToken,
                    };
                } catch (error) {
                    console.error("Authorization error:", error);
                    return null;
                }
            }
        }),
        CredentialsProvider({
            name: "oauth",
            id: "oauth",
            credentials: {
                accessToken: {},
                refreshToken: {},
            },
            async authorize(credentials) {
                const { accessToken, refreshToken } = credentials;
                if (!refreshToken || !accessToken) {
                    return null;
                }
                const currentUserRes = await fetch(`${BASE_URL}/api/users/me`, {
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${accessToken}`,
                    }
                });
                const currentUser = await currentUserRes.json();
                return {
                    ...currentUser,
                    id: currentUser.id.toString(),
                    accessToken,
                    refreshToken,
                };
            }
        })
    ],
    pages: {
        signIn: "/auth/signin"
    },
    session: {
        strategy: "jwt",
    },
    callbacks: {
        async jwt({ token, user }) {

            if (token?.accessToken) {
                const decodedToken = jwtDecode(token.accessToken as string);
                if (decodedToken.exp) {
                    token.expires_at = decodedToken.exp * 1000;
                }
            }

            if (user) {
                return {
                    ...token,
                    ...user,
                };
            }

            if (Date.now() < (token?.expires_at as number)) {
                return token;
            }

            try {
                const res = await refreshToken(token.refreshToken as string);
                if (res.error) return null;

                return {
                    ...token,
                    accessToken: res.accessToken,
                    refreshToken: res.refreshToken,
                };
            } catch (error) {
                console.error("Token refresh error:", error);
                return null;
            }
        },
        async session({ session, token }) {
            return {
                ...session,
                user: {
                    ...session.user,
                    id: token.id as string,
                    email: token.email as string,
                    image: token.image as string,
                    username: token.username as string,
                    bio: token.bio as string,
                    createdAt: token.createdAt as Date,
                    lastOnline: token.lastOnline as Date,
                    showMessageReads: token.showMessageReads as boolean,
                    showOnlineStatus: token.showOnlineStatus as boolean,
                    accessToken: token.accessToken as string,
                    refreshToken: token.refreshToken as string
                }
            };
        },
        authorized({ auth }) {
            return !!auth;
        }
    }
};

export const { handlers, auth, signIn, signOut, unstable_update: update } = NextAuth(options);

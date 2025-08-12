"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
const BASE_URL = process.env.BASE_URL;

export const acceptInvite = async (inviteId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/invites/${inviteId}/accept`, {
        method: "POST",
        headers: {
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        }
    });
    if (!res.ok) {
        return { error: "Failed to accept invite" };
    }
    revalidatePath("/");
    return res.json();
}

export const createInvite = async (data: { inviteChatId: number, expiresAt?: Date, canUseLink?: boolean }) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/invites`, {
        method: "POST",
        headers: {
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        return { error: "Failed to create invite" };
    }
    revalidatePath("/");
    return res.json();
}
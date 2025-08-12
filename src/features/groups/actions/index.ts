"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
const BASE_URL = process.env.BASE_URL

export const createGroup = async (data: FormData) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/chats`, {
        method: "POST",
        headers: {
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: data,
    });
    if (!res.ok) {
        return { error: "Failed to create group" }
    }
    revalidatePath("/");
    revalidatePath("/chats");
    return res.json();
}

export const updateGroup = async (groupId: number, data: FormData) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/chats/${groupId}`, {
        method: "PATCH",
        headers: {
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: data,
    });
    if (!res.ok) {
        return { error: "Failed to update group" };
    }
    revalidatePath("/");
    revalidatePath("/chats");
    return res.json();
}

export const deleteGroup = async (groupId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/groups/${groupId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
    });
    if (!res.ok) {
        return { error: "Failed to delete group" };
    }
    revalidatePath("/");
    revalidatePath("/chats");
    return res.json();
}

export const sendInvites = async (data: { inviteChatId: number, chatIds: number[], expiresAt: Date | null }) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/messages/send-invites`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        return { error: "Failed to send invites" };
    }
    revalidatePath("/");
    return res.json();
}

export const deleteMember = async (memberId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/members/${memberId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
    });
    if (!res.ok) {
        return { error: "Failed to delete member" };
    }
}

export const updateMember = async (memberId: number, data: Partial<Member>) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/members/${memberId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: JSON.stringify(data)
    });
    if (!res.ok) {
        return { error: "Failed to update member" };
    }
    return res.json();
}
"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
const BASE_URL = process.env.BASE_URL;

export const createBlock = async (userId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/blocks`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: JSON.stringify({ blockedUserId: userId }),
    });
    if (!res.ok) {
        return { error: "Failed to create block" };
    }
    revalidatePath("/");
    return res.json();
}

export const deleteBlock = async (blockId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/blocks/${blockId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
    });
    if (!res.ok) {
        return { error: "Failed to delete block" };
    }
    revalidatePath("/");
}
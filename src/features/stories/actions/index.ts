"use server";

import { auth } from "@/auth";
import { revalidatePath } from "next/cache";
const BASE_URL = process.env.BASE_URL;

export const createStory = async (data: FormData) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/stories`, {
        method: "POST",
        headers: {
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: data
    });
    revalidatePath("/");
    if (!res.ok) {
        return { error: "Failed to create story" };
    }
    return res.json();
}

export const updateStory = async (id: number, data: { excludedUsersIds: number[] }) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/stories/${id}`, {
        method: "PATCH",
        headers: {
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
    revalidatePath("/");
    if (!res.ok) {
        return { error: "Failed to update story" };
    }
    return res.json();
}

export const deleteStory = async (storyId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/stories/${storyId}`, {
        method: "DELETE",
        headers: {
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
    });
    revalidatePath("/");
    if (!res.ok) {
        return { error: "Failed to delete story" };
    }
}

export const createStoryView = async (storyId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/story-views`, {
        method: "POST",
        headers: {
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ storyId })
    });
    revalidatePath("/");
    if (!res.ok) {
        return { error: "Failed to create story view" };
    }
    return res.json();
}
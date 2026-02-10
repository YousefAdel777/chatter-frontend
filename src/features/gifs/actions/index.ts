"use server";

import { auth } from "@/auth";

const BASE_URL = process.env.BASE_URL;

export const createFavoriteGif = async (data: { gifId: string }) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/favorite-gifs`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        console.log(await res.json());
        throw new Error();
    }
    return res.json();
}

export const deleteFavoriteGif = async (gifId: string) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/favorite-gifs/${gifId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
    });
    
    if (!res.ok) {
        console.log(await res.json());
        throw new Error();
    }
    return null;
}
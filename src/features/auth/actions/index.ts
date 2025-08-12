"use server";

import { auth, signOut } from "@/auth";
import { revalidatePath } from "next/cache";

const BASE_URL = process.env.BASE_URL

export const createUser = async (data: { username: string; email: string; password: string }) => {
    const res = await fetch(`${BASE_URL}/api/users`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        }
    });
    if (!res.ok) {
        if (res.status === 400) {
            return { error: "A user with this email already exists" }
        }
        return { error: "Failed to create user" }
    }
    return res.json();
}

export const loginUser = async (data: { email: string; password: string }) => {
    const res = await fetch(`${BASE_URL}/api/auth/login`, {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        }
    });
    if (!res.ok) {
        return { error: "Failed to login" }
    }
    return res.json();
}

export const refreshToken = async (refreshToken: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/refresh`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
    });
    if (!res.ok) {
        return { error: "Failed to refresh token" }
    }
    return res.json();
}

export const exchangeCode = async (code: string) => {
    const res = await fetch(`${BASE_URL}/api/auth/exchange-code?code=${code}`);
    if (!res.ok) {
        return { error: "Failed to exchange code" };
    }
    return res.json();
}

export const logoutUser = async () => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/auth/logout`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: JSON.stringify({
            refreshToken: session?.user?.refreshToken,
        })
    });
    if (!res.ok) {
        return { error: "Failed to logout" }
    }
    await signOut({ redirectTo: "/auth/signin" });
    return res.json();
}

export const updateUser = async (data: FormData) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/users/me`, {
        method: "PATCH",
        body: data,
        headers: {
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        }
    });
    revalidatePath("/");
    if (!res.ok) {
        return { error: "Failed to update user" }
    }
    return res.json();
}

export const deleteUser = async () => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/users/me`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        }
    });
    if (!res.ok) {
        return { error: "Failed to delete user" };
    }
    await signOut({ redirectTo: "/auth/signin" });
}
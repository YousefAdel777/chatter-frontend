"use server";

import { auth } from "@/auth";
import { getSession } from "next-auth/react";
const BASE_URL = process.env.BASE_URL;

const fetcher = async (url: string) => {
    let session;
    if (typeof window === "undefined") {
        session = await auth();
    }
    else {
        session = await getSession();
    }
    const res = await fetch(`${BASE_URL}${url}`, {
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${session?.user?.accessToken}`,
        }
    });
    // if (!res.ok) {
    //     console.log(await res.json());
    //     // throw new Error("An error occurred while fetching data");
    // }
    return res.json();
};

export default fetcher;
"use server";

import { auth } from "@/auth";

const BASE_URL = process.env.BASE_URL

export const createMessage = async (data: { content?: string; userId: number, messageType: MessageType, missed?: boolean, duration?: number }) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/messages`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        return { error: "Failed to send message" };
    }
    return res.json();
}

export const createMessageWithFiles = async (data: FormData) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/messages`, {
        method: "POST",
        headers: {
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: data,
    });
    if (!res.ok) {
        return { error: "Failed to send message" };
    }
    return res.json();
}

export const createMessages = async (data: FormData) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/messages/batch`, {
        method: "POST",
        headers: {
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: data,
    });
    if (!res.ok) {
        return { error: "Failed to send messages" };
    }
    return res.json();
}

export const deleteMessage = async (messageId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/messages/${messageId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
    });
    if (!res.ok) {
        return { error: "Failed to delete message" };
    }
}

export const updateMessage = async (messageId: number, data: Partial<Message>) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/messages/${messageId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        return { error: "Failed to edit message" };
    }
    return res.json();
}

export const createReact = async (data: { messageId: number, emoji: string }) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/reacts`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        return { error: "Failed to create react" };
    }
    return res.json();
}

export const deleteReact = async (reactId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/reacts/${reactId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
    });
    if (!res.ok) {
        return { error: "Failed to delete react" };
    }
}

export const updateReact = async (reactId: number, data: Partial<MessageReact>) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/reacts/${reactId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        return { error: "Failed to update react" };
    }
    return res.json();
}

export const acceptInviteMessage = async (messageId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/messages/accept-invite/${messageId}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
    });
    if (!res.ok) {
        return { error: "Failed to accept invite" };
    }
    return res.json();
}

export const fowardMessage = async (data: { messageId: number; chatIds: number[] }) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/messages/forward-message`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        return { error: "Failed to forward message" };
    }
    return res.json();
}

export const createVotes = async (data: { optionsIds: number[] }) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/votes`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: JSON.stringify(data),
    });
    if (!res.ok) {
        return { error: "Failed to create vote" };
    }
    return res.json();
}

export const deleteVote = async (messageId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/votes?messageId=${messageId}`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
    });
    if (!res.ok) {
        return { error: "Failed to remove vote" };
    }
}

export const markChatMessagesAsRead = async (chatId: number): Promise<MessageRead[] | { error: string }> => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/message-reads/chat`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: JSON.stringify({ chatId }),
    });
    if (!res.ok) {
        return { error: "Failed to mark messages as read" };
    }
    return res.json();
}

export const createMessageRead = async (messageId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/message-reads`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: JSON.stringify({ messageId }),
    });
    if (!res.ok) {
        return { error: "Failed to mark message as read" };
    }
    return res.json();
} 

export const batchCreateMessageReads = async (messagesIds: number[]) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/message-reads/batch`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
        body: JSON.stringify({ messagesIds }),
    });
    if (!res.ok) {
        return { error: "Failed to mark messages as read" };
    }
    return res.json();
} 

export const pinMessage = async (messageId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/messages/${messageId}/pin`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
    });
    if (!res.ok) {
        return { error: "Failed to pin message" };
    }
    return res.json();
}

export const unpinMessage = async (messageId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/messages/${messageId}/unpin`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
    });
    if (!res.ok) {
        return { error: "Failed to unpin message" };
    }
    return res.json();
}

export const starMessage = async (messageId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/starred-messages/${messageId}/star`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
    });
    if (!res.ok) {
        return { error: "Failed to star message" };
    }
    return res.json();
}

export const unstarMessage = async (messageId: number) => {
    const session = await auth();
    const res = await fetch(`${BASE_URL}/api/starred-messages/${messageId}/unstar`, {
        method: "DELETE",
        headers: {
            "Content-Type": "application/json",
            "Authorization": session?.user?.accessToken ? `Bearer ${session?.user?.accessToken}` : "",
        },
    });
    if (!res.ok) {
        return { error: "Failed to unstar message" };
    }
}
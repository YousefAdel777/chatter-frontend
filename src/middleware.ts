export { auth as middleware } from "@/auth";

export const config = {
    matcher: [
        "/",
        "/call/:id",
        "/chats",
        "/chats/:id",
    ]
}
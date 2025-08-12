import { z } from "zod";

const updateProfileSchema = z.object({
    username: z.string().min(1, { message: "Username is required" }),
    bio: z.string().optional().default(""),
    showOnlineStatus: z.boolean().default(true),
    showMessageReads: z.boolean().default(true),
});

export type UpdateProfileSchema = z.infer<typeof updateProfileSchema>;
export default updateProfileSchema;
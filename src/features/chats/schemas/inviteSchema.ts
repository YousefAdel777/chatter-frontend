import { z } from "zod";

const inviteSchema = z.object({
    inviteChatId: z.number(),
    canUseLink: z.boolean().default(false),
    expires: z.boolean().default(false),
    expiresAt: z.string().optional().refine((val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime()) && date.getTime() > Date.now();
    }, { message: "End date must be in the future" }),
}).refine((data) => {
    if (data.expires) return !!data.expiresAt;
    return true;
}, { message: "End date is required", path: ["expiresAt"] });

export default inviteSchema;

export type InviteSchema = z.infer<typeof inviteSchema>;
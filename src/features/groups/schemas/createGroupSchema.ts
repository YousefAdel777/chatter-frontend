import { z } from "zod";

const createGroupSchema = z.object({
    name: z.string().min(1, { message: "Name is required" }),
    description: z.string().min(1, { message: "Description is required" }),
    onlyAdminsCanSend: z.boolean().default(false),
    onlyAdminsCanInvite: z.boolean().default(true),
    onlyAdminsCanEditGroup: z.boolean().default(true),
    onlyAdminsCanPin: z.boolean().default(true),
});

export type CreateGroupSchema = z.infer<typeof createGroupSchema>;

export default createGroupSchema;
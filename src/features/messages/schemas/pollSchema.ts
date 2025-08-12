import { z } from "zod";

const pollSchema = z.object({
    title: z.string().min(1, { message: "Title is required" }),
    options: z.array(z.string().min(1, { message: "Option is required" })).min(2, { message: "At least 2 options are required" }),
    ends: z.boolean().default(false),
    endsAt: z.string().optional().refine((val) => {
        if (!val) return true;
        const date = new Date(val);
        return !isNaN(date.getTime()) && date.getTime() > Date.now();
    }, { message: "End date must be in the future" }),
    multiple: z.boolean().default(false),
}).refine((data) => {
    if (data.ends) return !!data.endsAt;
    return true;
}, { message: "End date is required", path: ["endsAt"] });

export default pollSchema;

export type PollSchema = z.infer<typeof pollSchema>;
import { z } from "zod";

const storySchema = z.object({
    content: z.string(),
    textColor: z.string(),
    backgroundColor: z.string(),
});

export default storySchema;

export type StorySchema = z.infer<typeof storySchema>;
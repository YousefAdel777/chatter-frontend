import { z } from "zod";

const signUpSchema = z.object({
    username: z.string().min(1, { message: "Username is required" }),
    email: z.string().email(),
    password: z.string().min(1, { message: "Password is required" }),
});

export type SignUpSchema = z.infer<typeof signUpSchema>;
export default signUpSchema;
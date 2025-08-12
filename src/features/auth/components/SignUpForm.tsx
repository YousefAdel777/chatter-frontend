"use client";

import { useForm } from "react-hook-form";
import signUpSchema, { SignUpSchema } from "../schemas/signUpSchema";
import { useState, useTransition } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { createUser } from "../actions";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Button from "@/features/common/components/Button";
import ErrorMessage from "@/features/common/components/ErrorMessage";
import Link from "next/link";

const SignUpForm: React.FC = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<SignUpSchema>({
        resolver: zodResolver(signUpSchema)
    });

    const onSubmit = (data: SignUpSchema) => {
        startTransition(async () => {
            const res = await createUser(data);
            if (res.error) {
                setErrorMessage(res.error);
                return;
            }
            const loginRes = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false
            });
            if (loginRes?.error) {
                setErrorMessage("Something went wrong");
            }
            else {
                router.refresh();
                router.push("/");
            }
        });
    }

    return (
        <form noValidate onSubmit={handleSubmit(onSubmit)}>
            <input 
                type="text" 
                {...register("username")}
                placeholder="Username"
                className="form-input"
            />
            <ErrorMessage isActive={!!errors.username} message={errors.username?.message || ""} />
            <input 
                type="email"
                {...register("email")}
                placeholder="Email"
                className="form-input"
            />
            <ErrorMessage isActive={!!errors.email} message={errors.email?.message || ""} />
            <input 
                type="password"
                {...register("password")}
                placeholder="Password"
                className="form-input"
            />
            <ErrorMessage isActive={!!errors.password} message={errors.password?.message || ""} />
            <Button className="w-full" disabled={isPending}>
                Sign Up
            </Button>
            <ErrorMessage isActive={!!errorMessage} message={errorMessage} />
            <p className="text-muted text-center text-sm font-bold">
                Already have an account?
                <Link href="/auth/signin">
                    <span className="text-primary hover:underline"> Sign In</span>
                </Link>
            </p>
        </form>
    );
}

export default SignUpForm;
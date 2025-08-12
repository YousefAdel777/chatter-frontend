"use client";

import { useForm } from "react-hook-form";
import signInSchema, { SignInSchema } from "../schemas/signInScehma";
import { zodResolver } from "@hookform/resolvers/zod";
import ErrorMessage from "@/features/common/components/ErrorMessage";
import Button from "@/features/common/components/Button";
import { useState, useTransition } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const SignInForm: React.FC = () => {
    const [errorMessage, setErrorMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<SignInSchema>({
        resolver: zodResolver(signInSchema) 
    });

    const onSubmit = (data: SignInSchema) => {
        setErrorMessage("");
        startTransition(async () => {
            const res = await signIn("credentials", {
                email: data.email,
                password: data.password,
                redirect: false
            });
            if (res?.error) {
                setErrorMessage("Wrong email or password");
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
                Sign In
            </Button>
            <ErrorMessage className="text-center" isActive={!!errorMessage} message={errorMessage} />
            <p className="text-muted text-center text-sm font-bold">
                Don&apos;t have an account?
                <Link href="/auth/signup">
                    <span className="text-primary hover:underline"> Sign Up</span>
                </Link>
            </p>
        </form>
    );
}

export default SignInForm;
"use client";

import Avatar from "@/features/common/components/Avatar";
import Button from "@/features/common/components/Button";
import IconButton from "@/features/common/components/IconButton";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import Dropzone from "react-dropzone";
import { useForm } from "react-hook-form";
import { FaImage } from "react-icons/fa";
import updateProfileSchema, { UpdateProfileSchema } from "../schemas/updateProfileSchema";
import ErrorMessage from "@/features/common/components/ErrorMessage";
import { deleteUser, logoutUser, updateUser } from "../actions";
import { createPortal } from "react-dom";
import CropModal from "@/features/common/components/CropModal";
import Switch from "@/features/common/components/Switch";
import { useTheme } from "next-themes";

type Props = {
    user: User;
}

const ProfileForm: React.FC<Props> = ({ user }) => {

    const [errorMessage, setErrorMessage] = useState("");
    const [cropTarget, setCropTarget] = useState<string>("");
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null);
    const [isPending, startTransition] = useTransition();
    const { theme, setTheme } = useTheme();

    const {
        register,
        handleSubmit,
        watch,
        setValue,
        formState: { errors }
    } = useForm<UpdateProfileSchema>({
        resolver: zodResolver(updateProfileSchema),
        defaultValues: {
            username: user.username,
            bio: user.bio,
            showOnlineStatus: user.showOnlineStatus,
            showMessageReads: user.showMessageReads
        },
    });

    const handleDrop = (acceptedFiles: File[]) => {
        setCropTarget(URL.createObjectURL(acceptedFiles[0]));
    }

    const handleCrop = (file: File) => {
        setCropTarget("");
        setProfileImage(file);
        setProfileImagePreview(URL.createObjectURL(file));
    }

    useEffect(() => {
        return () => {
            if (profileImagePreview) {
                URL.revokeObjectURL(profileImagePreview);
            }
            if (cropTarget) {
                URL.revokeObjectURL(cropTarget);
            }
        }
    }, [profileImagePreview, cropTarget]);



    const onSubmit = (data: UpdateProfileSchema) => {
        setErrorMessage("");
        startTransition(async () => {
            const formData = new FormData();
            formData.append("user", new Blob([JSON.stringify(data)], { type: "application/json" }));
            if (profileImage) formData.append("profileImage", profileImage);
            const res = await updateUser(formData);
            if (res.error) {
                setErrorMessage(res.error);
            }
        });
    }

    const handleLogout = () => {
        startTransition(async () => {
            await logoutUser();
        });
    }

    const handleDeleteAccount = () => {
        startTransition(async () => {
            await deleteUser();
        });
    }

    return (
        <form className="flex flex-col items-center" onSubmit={handleSubmit(onSubmit)}>
            {
                cropTarget &&
                createPortal(
                    <CropModal 
                        title="Crop Profile Image"
                        aspect={100 / 100}
                        cropShape="round"
                        image={cropTarget}
                        onCrop={handleCrop}
                        closeModal={() => setCropTarget("")}
                    />,
                    document.body
                )
            }
            <Dropzone accept={{ "image/*": [] }} multiple={false} onDrop={handleDrop}>
                {
                    ({ getRootProps, getInputProps }) => (
                        <div className="relative cursor-pointer" {...getRootProps()} >
                            <Avatar alt={user.username} image={profileImagePreview || user.image} size={100} />
                            <input {...getInputProps()} />
                            <span className="absolute bottom-0 right-0 bg-background-secondary rounded-full">
                                <IconButton onClick={e => e.preventDefault()}>
                                    <FaImage size={18} className="text-primary" />
                                </IconButton>
                            </span>
                        </div>
                    )
                }
            </Dropzone>
            <input
                type="text"
                placeholder="Username"
                className="form-input mt-4"
                {...register("username")}
            />
            <ErrorMessage isActive={!!errors.username?.message} message={errors.username?.message || ""} />
            <textarea
                placeholder="Bio"
                className="form-input resize-none h-32"
                {...register("bio")}
            />
            <ErrorMessage isActive={!!errors.bio?.message} message={errors.bio?.message || ""} />
            <div className="flex items-center justify-between w-full mb-3">
                <p className="text-sm font-semibold">
                    Show Online Status
                </p>
                <Switch checked={watch("showOnlineStatus")} onChange={() => setValue("showOnlineStatus",  !watch("showOnlineStatus"))} />
            </div>
            <div className="flex items-center justify-between w-full mb-3">
                <p className="text-sm font-semibold">
                    Show Message Reads
                </p>
                <Switch checked={watch("showMessageReads")} onChange={() => setValue("showMessageReads",  !watch("showMessageReads"))} />
            </div>
            <div className="flex items-center justify-between w-full">
                <p className="text-sm font-semibold">
                    Dark Mode
                </p>
                <Switch checked={theme === "dark"} onChange={() => setTheme(theme === "light" ? "dark" : "light")} />
            </div>
            <ErrorMessage isActive={!!errorMessage} message={errorMessage} />
            <div className="flex items-center justify-end gap-2.5 text-sm mt-2">
                <Button disabled={isPending} onClick={handleLogout}>
                    Sign Out
                </Button>
                <Button className="bg-error" disabled={isPending} onClick={handleDeleteAccount}>
                    Delete Account
                </Button>
                <Button type="submit" disabled={isPending}>
                    Save
                </Button>
            </div>
        </form>
    );
}

export default ProfileForm;
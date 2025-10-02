"use client";

import CropModal from "@/features/common/components/CropModal";
import Modal from "@/features/common/components/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import Dropzone from "react-dropzone";
import { useForm } from "react-hook-form";
import createGroupSchema, { CreateGroupSchema } from "../schemas/createGroupSchema";
import { createGroup, updateGroup } from "../actions";
import ErrorMessage from "@/features/common/components/ErrorMessage";
import Avatar from "@/features/common/components/Avatar";
import IconButton from "@/features/common/components/IconButton";
import { FaImage } from "react-icons/fa";
import Button from "@/features/common/components/Button";
import Switch from "@/features/common/components/Switch";
import { useRouter } from "next/navigation";

type Props = {
    chat?: Chat;
    closeModal: () => void;
}

const CreateGroupModal: React.FC<Props> = ({ chat, closeModal }) => {

    const [errorMessage, setErrorMessage] = useState("");
    const [groupImage, setGroupImage] = useState<File | null>(null);
    const [cropTarget, setCropTarget] = useState("");
    const [filePreview, setFilePreview] = useState<string>("");
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    
    const {
        register,
        setValue,
        watch,
        handleSubmit,
        formState: { errors }
    } = useForm<CreateGroupSchema>({
        resolver: zodResolver(createGroupSchema),
        defaultValues: {
            name: chat?.name || "",
            description: chat?.description || "",
            onlyAdminsCanSend: chat?.onlyAdminsCanSend || false,
            onlyAdminsCanEditGroup: chat ? chat.onlyAdminsCanEditGroup : true,
            onlyAdminsCanInvite: chat ? chat.onlyAdminsCanInvite : true,
            onlyAdminsCanPin: chat ? chat.onlyAdminsCanPin : true,
        }
    });

    const handleDrop = (acceptedFiles: File[]) => {
        setCropTarget(URL.createObjectURL(acceptedFiles[0]));
    }

    const handleCrop = (file: File) => {
        setCropTarget("");
        setGroupImage(file);
        setFilePreview(URL.createObjectURL(file));
    }

    useEffect(() => {
        return () => {
            if (filePreview) URL.revokeObjectURL(filePreview);
            if (cropTarget) URL.revokeObjectURL(cropTarget);
        }
    }, [filePreview, cropTarget]);


    const onSubmit = (data: CreateGroupSchema) => {
        setErrorMessage("");
        startTransition(async () =>{
            const formData = new FormData();
            if (groupImage) formData.append("groupImage", groupImage);
            formData.append("group", new Blob([JSON.stringify(data)], { type: "application/json" }));
            let res;
            if (!chat) {
                res = await createGroup(formData);
            }
            else {
                res = await updateGroup(chat.id, formData);
            }
            if (res.error) {
                setErrorMessage(res.error);
            }
            else {
                closeModal();
                router.push(`/chats/${res.id}`);
            }
        });
    }

    return (
        <Modal closeModal={closeModal} title={`${chat ? "Edit Group" : "Create Group"}`}>
            {
                cropTarget &&
                createPortal(
                    <CropModal 
                        image={cropTarget}
                        closeModal={() => setCropTarget("")}
                        aspect={100 / 100}
                        title="Crop Image"
                        onCrop={handleCrop}
                        cropShape="round"
                    />,
                    document.body
                )
            }
            <Dropzone multiple={false} onDrop={handleDrop}>
                {
                    ({ getInputProps, getRootProps }) => {
                        return (
                            <div className="relative cursor-pointer w-fit mx-auto mb-4" {...getRootProps()} >
                                <Avatar alt="Group image" image={filePreview || chat?.image || "/group_image.webp"} size={100} />
                                <input {...getInputProps()} />
                                <span className="absolute bottom-0 right-0 bg-background-ternary rounded-full">
                                    <IconButton>
                                        <FaImage size={18} className="text-primary" />
                                    </IconButton>
                                </span>
                            </div>
                        );
                    }
                }
            </Dropzone>
            <form onSubmit={handleSubmit(onSubmit)}>
                <input 
                    type="text"
                    placeholder="Name"
                    {...register("name")}
                    className="form-input"
                />
                <ErrorMessage isActive={!!errors.name} message={errors.name?.message || ""} />
                <textarea 
                    {...register(("description"))}
                    placeholder="Description"
                    className="form-input resize-none h-48"
                />
                <div className="flex items-center mb-3 justify-between">
                    <span className="text-sm font-semibold">Only admins can send messages</span>
                    <Switch onChange={e => setValue("onlyAdminsCanSend", e.target.checked)} checked={watch("onlyAdminsCanSend")} />
                </div>
                <div className="flex items-center mb-3 justify-between">
                    <span className="text-sm font-semibold">Only admins can invite members</span>
                    <Switch onChange={e => setValue("onlyAdminsCanInvite", e.target.checked)} checked={watch("onlyAdminsCanInvite")} />
                </div>
                <div className="flex items-center mb-3 justify-between">
                    <span className="text-sm font-semibold">Only admins can edit group</span>
                    <Switch onChange={e => setValue("onlyAdminsCanEditGroup", e.target.checked)} checked={watch("onlyAdminsCanEditGroup")} />
                </div>
                <div className="flex items-center mb-3 justify-between">
                    <span className="text-sm font-semibold">Only admins can pin messages</span>
                    <Switch onChange={e => setValue("onlyAdminsCanPin", e.target.checked)} checked={watch("onlyAdminsCanPin")} />
                </div>
                <ErrorMessage isActive={!!errors.description} message={errors.description?.message || ""} />
                <div className="flex items-center justify-between">
                    <ErrorMessage isActive={!!errorMessage} message={errorMessage} />
                    <Button disabled={isPending}>
                        {chat ? "Save" : "Create"}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default CreateGroupModal;
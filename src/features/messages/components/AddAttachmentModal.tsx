"use client";

import Button from "@/features/common/components/Button";
import Modal from "@/features/common/components/Modal";
import Image from "next/image";
import { MouseEvent, useEffect, useState, useTransition } from "react";
import Dropzone from "react-dropzone";
import { FaChevronLeft, FaChevronRight, FaImage, FaTrashAlt } from "react-icons/fa";
import { Navigation, Pagination } from "swiper/modules";
import { SwiperSlide, Swiper } from "swiper/react";
import Player from "next-video/player";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { createMessageMutationAfter, createMessageMutationBefore } from "../mutations";
import { createMessageWithFiles } from "../actions";
import { useMessagesContext } from "../contexts/MessagesContextProvider";

type Props = {
    userId?: number;
    chatId?: number;
    replyMessageId?: number;
    closeModal: () => void;
}

const AddAttachmentModal: React.FC<Props> = ({ userId, chatId, closeModal, replyMessageId }) => {
    
    const [files, setFiles] = useState<File[]>([]);
    const [filePreviews, setFilePreviews] = useState<string[]>([]);
    const [isPending, startTransition] = useTransition();
    const { paginatedDataAfter, paginatedDataBefore, hasMoreAfter, mutateAfter, mutateBefore } = useMessagesContext() as MessagesContextType;

    const handleDrop = (acceptedFiles: File[]) => {
        setFiles(prevState => [...acceptedFiles, ...prevState]);
        const previews = [...acceptedFiles, ...files].map(file => URL.createObjectURL(file));
        setFilePreviews(previews);
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!userId && !chatId) return;
        startTransition(async () => {
            const formData = new FormData();
            formData.append("message", new Blob([JSON.stringify({ 
                userId,
                chatId,
                messageType: "MEDIA",
                replyMessageId: replyMessageId
            })], { type: "application/json" }));
            for (const file of files) {
                formData.append("mediaFiles", file);
            }
            const createdMessage = await createMessageWithFiles(formData);
            if (hasMoreAfter) return;
            if (paginatedDataAfter) {
                mutateAfter(createMessageMutationAfter(paginatedDataAfter, createdMessage), {
                    revalidate: false,
                    populateCache: true,
                    rollbackOnError: true,
                });
            }
            else if (paginatedDataBefore) {
                mutateBefore(createMessageMutationBefore(paginatedDataBefore, createdMessage), {
                    revalidate: false,
                    populateCache: true,
                    rollbackOnError: true,
                });
            }
            else {
                mutateBefore([{ content: [createdMessage], nextCursor: null, previousCursor: null }], { revalidate: false, populateCache: true, rollbackOnError: true });
            }
            closeModal();
        });
    }

    const handleRemove = (e: MouseEvent, index: number) => {
        e.stopPropagation();
        setFiles(prevState => prevState.filter((_, i) => i !== index));
        setFilePreviews(files.filter((_, i) => i !== index).map(file => URL.createObjectURL(file)));
    }

    useEffect(() => {
        return () => {
            filePreviews.forEach(preview => URL.revokeObjectURL(preview));
        }
    }, [filePreviews]);

    return (
        <Modal closeModal={closeModal} title="Add Attachments">
            <form onSubmit={handleSubmit}>
                <Dropzone accept={{ "image/*": [], "video/*": [] }} onDrop={handleDrop}>
                    {({ getRootProps, getInputProps }) => (
                        <div {...getRootProps()} >
                            <input {...getInputProps()} />
                            {
                                files.length === 0 ?
                                <div className="flex flex-col items-center gap-2 text-center relative cursor-pointer rounded-xl border-2 border-dashed border-border-primary hover:border-primary w-full h-80 justify-center transition-200">
                                    <FaImage className="text-5xl text-primary" />
                                    <p className="text-sm text-muted">
                                        Drag &amp; drop your files here, or click to select files
                                    </p>
                                </div>
                                :
                                <div className="flex mb-3 cursor-pointer w-fit bg-background-secondary items-center gap-2 rounded-lg px-2 py-1.5">
                                    <FaImage size={18} className="text-primary" />
                                    <span className="text-sm font-semibold">
                                        Add
                                    </span>
                                </div>
                            }
                        </div>
                    )}
                </Dropzone>
                {
                    files.length > 0 &&
                    <Swiper
                        pagination={{
                            dynamicBullets: false,
                        }}
                        navigation={{
                            nextEl: ".swiper-button-next",
                            prevEl: ".swiper-button-prev",
                        }}
                        modules={[Pagination, Navigation]}
                    >
                    {
                        files.map((file, i) => {
                            return (
                                <SwiperSlide className="relative my-auto" key={i}>
                                    {
                                        file.type.startsWith("image") ?
                                        <Image
                                            src={filePreviews[i]}
                                            quality={100}
                                            unoptimized
                                            alt="image"
                                            width={500}
                                            height={500}
                                            className="rounded-lg min-h-96 max-h-96 object-cover"
                                        />
                                        :
                                        <Player className="rounded-lg overflow-hidden max-h-96 min-h-96" src={filePreviews[i]} />
                                    }
                                    <span 
                                        onClick={e => handleRemove(e, i)}
                                        className="absolute flex items-center justify-center top-4 right-4 w-10 h-10 bg-secondary hover:bg-black/15 duration-100 rounded-full cursor-pointer"
                                    >
                                        <FaTrashAlt size={22} className="text-red-500" />
                                    </span>
                                </SwiperSlide>
                            )
                        })
                    }
                    <div style={{ width: "2rem", height: "2rem" }} className="swiper-button-next">
                        <FaChevronRight style={{ width: "1rem", height: "1rem" }} className="text-white size-6" />
                    </div>
                    <div style={{ width: "2rem", height: "2rem" }} className="swiper-button-prev">
                        <FaChevronLeft style={{ width: "1rem", height: "1rem" }} className="text-white size-6" />
                    </div>
                </Swiper>
                }
                <Button disabled={files.length === 0 || isPending} className="ml-auto mt-4">
                    Send
                </Button>
            </form>
        </Modal>
    );
}

export default AddAttachmentModal;
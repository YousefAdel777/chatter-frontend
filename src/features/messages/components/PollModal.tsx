import Modal from "@/features/common/components/Modal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import Button from "@/features/common/components/Button";
import pollSchema, { PollSchema } from "../schemas/pollSchema";
import ErrorMessage from "@/features/common/components/ErrorMessage";
import { FiX } from "react-icons/fi";
import Switch from "@/features/common/components/Switch";
import IconButton from "@/features/common/components/IconButton";
import { createMessageMutationAfter, createMessageMutationBefore } from "../mutations";
import { formatDateForInput } from "@/features/common/lib/utils";
import { createMessageWithFiles } from "../actions";
import { useMessagesContext } from "../contexts/MessagesContextProvider";

type Props = {
    userId?: number;
    chatId?: number;
    replyMessageId?: number;
    closeModal: () => void;
}

const PollModal: React.FC<Props> = ({ closeModal, userId, chatId, replyMessageId }) => {

    const [errorMessage, setErrorMessage] = useState("");
    const [isPending, startTransition] = useTransition();
    const { paginatedDataAfter, paginatedDataBefore, mutateAfter, mutateBefore, hasMoreAfter } = useMessagesContext() as MessagesContextType;

    const {
        register,
        formState: { errors },
        watch,
        setValue,
        handleSubmit
    } = useForm<PollSchema>({
        resolver: zodResolver(pollSchema),
        defaultValues: {
            title: "",
            options: ["", ""],
            multiple: false,
            ends: false,
        }
    });

    const ends = watch("ends");

    const onSubmit = (data: PollSchema) => {
        setErrorMessage("");
        startTransition(async () => {
            const formData = new FormData();
            formData.append("message", new Blob([
                JSON.stringify({
                    userId,
                    chatId,
                    messageType: "POLL",
                    replyMessageId,
                    title: data.title,
                    options: data.options,
                    multiple: data.multiple,
                    endsAt: ends && data.endsAt ? new Date(data.endsAt).toISOString() : null,
                })
            ], { type: "application/json" }));
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

    return (
        <Modal  title="Create Poll" closeModal={closeModal}>
            <form noValidate onSubmit={handleSubmit(onSubmit)}>
                <input 
                    {...register("title")}
                    type="text"
                    placeholder="Title"
                    className="form-input"
                />
                <ErrorMessage isActive={!!errors.title} message={errors.title?.message || ""} />
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold">Ends: </p>
                        <Switch checked={ends} 
                            onChange={e => {
                                if (!e.target.checked) {
                                    setValue("endsAt", "");
                                }
                                setValue("ends", e.target.checked);
                            }} 
                        />
                    </div>
                    <input 
                        disabled={!ends}
                        type="datetime-local"
                        {...register("endsAt")}
                        className="form-input m-0" 
                        min={formatDateForInput(new Date())}
                    />
                </div>
                <ErrorMessage isActive={!!errors.endsAt} message={errors.endsAt?.message || ""} />
                <div className="space-y-4 my-2 max-h-52 overflow-y-auto">
                    {
                        watch("options").map((_, index) => (
                            <div key={index}>
                                <div className="flex items-center gap-2">
                                    <input {...register(`options.${index}`)} type="text" placeholder={`Option ${index + 1}`} className="form-input mb-0" />
                                    {
                                        watch("options").length > 2 &&
                                        <IconButton onClick={() => setValue("options", watch("options").filter((_, i) => i !== index))}>
                                            <FiX size={20} className="text-red-500" />
                                        </IconButton>
                                    }
                                </div>
                                <ErrorMessage className="mt-1.5" isActive={!!errors.options?.[index]} message={errors.options?.[index]?.message || ""} />
                            </div>
                        ))
                    }
                </div>
                <Button type="button" disabled={isPending} onClick={() => setValue("options", [...watch("options"), ""])}>
                    Add
                </Button>
                <div className="flex items-center gap-3">
                    <p className="text-sm font-semibold">Allow Multiple Answers</p>
                    <Switch checked={watch("multiple")} onChange={(e) => setValue("multiple", e.target.checked)} />
                </div>
                <div className="flex items-center justify-between">
                    <ErrorMessage isActive={!!errorMessage} message={errorMessage} />
                    <Button disabled={isPending} type="submit">
                        Create
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

export default PollModal;
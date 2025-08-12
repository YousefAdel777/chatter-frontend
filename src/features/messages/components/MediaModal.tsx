import Image from "next/image";
import { Swiper, SwiperSlide } from "swiper/react";
import Player from "next-video/player";
import IconButton from "@/features/common/components/IconButton";
import { FiDownload, FiX } from "react-icons/fi";
import { Navigation, Pagination } from "swiper/modules";
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useState, useTransition } from "react";

type Props = {
    attachments: Attachment[];
    closeModal: () => void;
    startIndex: number;
}

const MediaModal: React.FC<Props> = ({ attachments, startIndex = 0, closeModal }) => {

    const [isPending, startTransition] = useTransition();
    const [activeSlideIndex, setActiveSlideIndex] = useState(startIndex);

    const handleDownload = (index: number) => {
        startTransition(async () => {
            try {
                const res = await fetch(attachments[index].filePath);
                const link = document.createElement("a");
                link.href = URL.createObjectURL(await res.blob());
                link.download = attachments[index].filePath.split("/").pop() || "file";
                link.click();
                link.remove();
                URL.revokeObjectURL(link.href);
            }
            catch(error) {
                console.log(error);
            }
        });
    }

    return (
        <div className="fixed py-8 flex top-0 left-0 items-center justify-center w-full h-full bg-black/50">
            <div className="flex gap-2.5 absolute top-4 px-20 items-center justify-end w-full">
                <IconButton disabled={isPending} onClick={() => handleDownload(activeSlideIndex)}>
                    <FiDownload size={22} className="text-primary" />
                </IconButton>
                <IconButton onClick={closeModal}>
                    <FiX size={22} className="text-primary" />
                </IconButton>
            </div>
            <div className="max-w-2xl min-w-[20rem] my-auto">
                <Swiper
                    initialSlide={startIndex}
                    pagination={{
                        dynamicBullets: false,
                    }}
                    navigation={{
                        nextEl: ".swiper-button-next",
                        prevEl: ".swiper-button-prev",
                    }}
                    modules={[Pagination, Navigation]}
                    onSlideChange={swiper => setActiveSlideIndex(swiper.activeIndex)}
                    className="relative"
                >
                    {
                        attachments.map(attachment => (
                            <SwiperSlide style={{ height: "90svh", display: "flex", justifyContent: "center", alignItems: "center" }} className="relative" key={attachment.id}>
                                {
                                    attachment.attachmentType === "IMAGE" &&
                                    <Image 
                                        src={attachment.filePath}
                                        alt="attachment"
                                        width={999}
                                        height={999}
                                        className="object-contain max-h-[90svh]"
                                    />
                                }
                                {
                                    attachment.attachmentType === "VIDEO" &&
                                    <Player src={attachment.filePath} className="my-auto" />
                                }
                            </SwiperSlide>
                        ))
                    }
                    <div style={{ width: "2rem", height: "2rem" }} className="swiper-button-next">
                        <FaChevronRight style={{ width: "1rem", height: "1rem" }} className="text-white size-6" />
                    </div>
                    <div style={{ width: "2rem", height: "2rem" }} className="swiper-button-prev">
                        <FaChevronLeft style={{ width: "1rem", height: "1rem" }} className="text-white size-6" />
                    </div>
                </Swiper>
            </div>
        </div>
    );
}

export default MediaModal;
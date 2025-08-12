"use client"

import Cropper, { Area } from "react-easy-crop";
import { useState, useCallback } from "react";
import getCroppedImage from "../lib/cropImage";
import Button from "./Button";
import Modal from "./Modal";

type Props = {
    image: string;
    aspect: number;
    title: string;
    cropShape?: "round" | "rect";
    onCrop: (file: File) => void;
    closeModal: () => void;
}

export default function CropModal({ image, aspect, closeModal, onCrop, title, cropShape }: Props) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)

    const onCropComplete = useCallback((_: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels);
    }, []);

    const showCroppedImage = async () => {
        try {
            const croppedImage = await getCroppedImage(
                image,
                croppedAreaPixels,
            )
            onCrop(croppedImage as File)
            closeModal()
        } catch (e) {
            console.error(e)
        }
    }

    return (
        <Modal  title={title} closeModal={closeModal}>
            <div className="relative w-full bg-slate-900 h-80 mb-6">
                <Cropper
                    image={image}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    cropShape={cropShape || "rect"}
                />
            </div>
            <Button className="ml-auto" onClick={showCroppedImage}>
                Crop
            </Button>
        </Modal>
    );
}
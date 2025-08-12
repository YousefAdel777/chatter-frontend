import { twMerge } from "tailwind-merge";
import IconButton from "./IconButton";
import { BsX } from "react-icons/bs";

type Props = {
    title: string;
    className?: string;
    children?: React.ReactNode;
    closeModal: () => void;
}

const Modal: React.FC<Props> = ({ closeModal, className, children, title }) => {
    return (
        <div className="flex z-50 fixed top-0 left-0 items-center justify-center w-full h-full bg-black/50">
            <div className={twMerge("bg-background min-h-80 w-[22rem] md:w-[25rem] max-w-lg shadow-lg px-3 py-2 rounded-md", className)}>
                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-2xl font-bold">{title}</h1>
                    <IconButton onClick={closeModal}>
                        <BsX className="w-8 h-8 text-muted" />
                    </IconButton>
                </div>
                <div className="max-h-[30rem] min-h-60 overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
}

export default Modal;
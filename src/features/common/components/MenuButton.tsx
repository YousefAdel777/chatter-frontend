import { HiDotsHorizontal } from "react-icons/hi";

type Props = {
    isMenuOpen: boolean;
    children?: React.ReactNode;
    disabled?: boolean;
    setIsMenuOpen: (isOpen: boolean) => void;
}

const MenuButton = ({  isMenuOpen, disabled, children, setIsMenuOpen }: Props) => {

    return (
        <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            onBlur={() => setIsMenuOpen(false)}
            tabIndex={-1}
            disabled={disabled}
            className="w-8 h-8 flex items-center justify-center rounded-full cursor-pointer hover:bg-black hover:bg-opacity-5 duration-200"
        >
            {children || <HiDotsHorizontal className="text-muted" />}
        </button>
    );
}

export default MenuButton;
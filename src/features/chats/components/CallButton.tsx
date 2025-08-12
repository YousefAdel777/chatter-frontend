type Props = {
    onClick?: (e: React.MouseEvent) => void;
    className?: string;
    children?: React.ReactNode;
    disabled?: boolean;
}

const CallButton: React.FC<Props> = ({ onClick, className, children, disabled }) => {
    return (
        <button 
            disabled={disabled} 
            onClick={onClick}
            className={`w-12 h-12 rounded-full flex items-center justify-center duration-200 hover:bg-opacity-30 ${className || ""}`}
        >
            {children}
        </button>
    )
}

export default CallButton;
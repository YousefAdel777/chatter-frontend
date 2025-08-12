type Props = {
    message: string;
    isActive: boolean;
    className?: string;
}

const ErrorMessage: React.FC<Props> = ({ isActive, message, className }) => {
    return (
        <p className={`text-red-500 duration-200 mb-2 text-sm font-bold ${isActive ? "opacity-100" : "opacity-0"} ${className || ""}`}>
            {message}
        </p>
    );
}

export default ErrorMessage;
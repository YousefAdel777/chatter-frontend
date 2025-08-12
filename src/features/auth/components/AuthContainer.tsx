import GithubButton from "./GithubButton";
import GoogleButton from "./GoogleButton";

type Props = {
    title: string;
    children?: React.ReactNode;
}

const AuthContainer: React.FC<Props> = ({ children, title }) => {
    return (
        <div className="flex bg-background-ternary items-center justify-center h-svh">
            <div className="px-4 py-6 shadow-xl rounded-lg bg-background">
                <h1 className="text-3xl text-center mb-4 font-bold">
                    {title}
                </h1>
                <div className="flex mb-3 items-center justify-center gap-4">
                    <GithubButton />
                    <GoogleButton />
                </div>
                {children}
            </div>
        </div>
    );
}

export default AuthContainer;
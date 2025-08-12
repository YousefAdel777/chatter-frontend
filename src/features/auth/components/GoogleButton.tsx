import Link from "next/link";

const BASE_URL = process.env.BASE_URL;

const GoogleButton: React.FC = () => {
    return (
        <Link href={`${BASE_URL}/oauth2/authorization/google`}  className="flex items-center justify-center py-2 px-4 border border-border-primary rounded-md shadow-sm bg-background hover:bg-background-secondary">
            <span className="text-sm font-medium text-base">Continue with Google</span>
        </Link>
    );
}

export default GoogleButton;
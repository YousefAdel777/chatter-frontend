import Link from "next/link";
const BASE_URL = process.env.BASE_URL

const GithubButton: React.FC = () => {
    return (
        <Link href={`${BASE_URL}/oauth2/authorization/github`} className="flex items-center justify-center space-x-2 rounded-md bg-gray-800 px-4 py-2 hover:bg-gray-700 transition-colors duration-200">
            <span className="text-sm font-medium text-white">Continue with GitHub</span>
        </Link>
    );
}

export default GithubButton;
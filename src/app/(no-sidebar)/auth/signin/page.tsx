import AuthContainer from "@/features/auth/components/AuthContainer";
import SignInForm from "@/features/auth/components/SignInForm";

export default function SignInPage() {
    return (
        <AuthContainer title="Sign In">
            <SignInForm />
        </AuthContainer>
    );
}
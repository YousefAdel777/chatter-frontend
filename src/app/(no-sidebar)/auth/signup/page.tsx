import AuthContainer from "@/features/auth/components/AuthContainer";
import SignUpForm from "@/features/auth/components/SignUpForm";

export default function SignUpPage() {
    return (
        <AuthContainer title="Sign Up">
            <SignUpForm />
        </AuthContainer>
    );
}
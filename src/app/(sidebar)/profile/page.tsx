import ProfileForm from "@/features/auth/components/ProfileForm";
import fetcher from "@/features/common/lib/fetcher";

const ProfilePage = async () => {
    const user = await fetcher("/api/users/me");
    return (
        <ProfileForm user={user} />
    );
}

export default ProfilePage;
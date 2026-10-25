import type { UserDTO } from "../user-mapper";
import { ProfileAvatar } from "./ProfileAvatar";
import { ProfileBanner } from "./ProfileBanner";
import { ProfileInfo } from "./ProfileInfo";

type ProfileHeaderProps = {
    profile: UserDTO;
};

export function ProfileHeader({ profile }: ProfileHeaderProps) {
    return (
        <header className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
            <ProfileBanner />

            <div className="px-6 pb-8">
                <div className="-mt-12 relative">
                    <ProfileAvatar
                        name={profile.name}
                        image={profile.image}
                    />
                </div>

                <div className="mt-4">
                    <ProfileInfo profile={profile} />
                </div>
            </div>
        </header>
    );
}
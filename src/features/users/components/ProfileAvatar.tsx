type ProfileAvatarProps = {
    name: string;
    image: string | null;
};

export function ProfileAvatar({ name, image }: ProfileAvatarProps) {
    return (
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-full border-4 border-white bg-indigo-100 shadow-sm">
            {image &&
                <img
                    src={image}
                    alt={`Profilbilde til ${name}`}
                    className="h-full w-full object-cover"
                />
            }
        </div>
    );
}
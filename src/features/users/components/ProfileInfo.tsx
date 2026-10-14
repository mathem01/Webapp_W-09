import type { UserDTO } from "../user-mapper";

type ProfileInfoProps = {
    profile: UserDTO;
};

export function ProfileInfo({ profile }: ProfileInfoProps) {
    const joinedDate = new Date(profile.createdAt)

    const formattedDate = joinedDate.toLocaleDateString("nb-NO", {
        month: "long",
        year: "numeric",
        timeZone: "Europe/Oslo",
    });

    const exactDate = joinedDate.toLocaleDateString("nb-NO", {
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        timeZone: "Europe/Oslo",
    });

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-900">
                {profile.name}
            </h1>

            <dl className="mt-2 space-y-2 text-sm text-gray-500">
                <div>
                    <dt className="sr-only">Brukernavn</dt>
                    <dd>@{profile.username}</dd>
                </div>

                <div>
                    <dt className="sr-only">Registreringsdato</dt>
                    <dd>
                        <span>Medlem siden </span>
                        <time
                            dateTime={profile.createdAt}
                            title={exactDate}
                        >
                            {formattedDate}
                        </time>
                    </dd>
                </div>
            </dl>
        </div>
    );
}
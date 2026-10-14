import type { RequestInfo } from "rwsdk/worker";
import { service } from "../user-service";

import { ProfileHeader } from "../components/ProfileHeader";

export async function Profile({ params, request }: RequestInfo) {
    const username = params.username

    if (!username || typeof username !== "string") {
        return (
            <main className="mx-auto max-w-5xl px-4 py-12">
                <h1 className="text-2xl font-bold">
                    Ugyldig brukernavn
                </h1>
            </main>
        )
    }

    const normalizedUsername = username.toLowerCase()

    if (username !== normalizedUsername) {
        const url = new URL(request.url)

        url.pathname = `/profile/${encodeURIComponent(normalizedUsername)}`
        return Response.redirect(url, 308)
    }

    const result = await service.findByUsername(params.username)

    if (!result.ok) {
        const notFound = result.error.code === "NOT_FOUND";

        return (
            <main className="mx-auto max-w-5xl px-4 py-12">
                <h1 className="text-2xl font-bold">
                    {notFound
                        ? "Brukeren finnes ikke"
                        : "Kunne ikke laste profilen"}
                </h1>

                <p className="mt-2 text-gray-500">
                    {result.error.message}
                </p>
            </main>
        )
    }

    const profile = result.data

    return (
        <main className="min-h-screen bg-gray-50 px-4 py-10">
            <article className="mx-auto max-w-5xl">
                <ProfileHeader profile={profile} />
            </article>
        </main>
    )
}
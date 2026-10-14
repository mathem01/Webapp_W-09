import type { RequestInfo } from "rwsdk/worker";
import { service } from "../user-service";

export async function Profile({ params, request }: RequestInfo) {
    const username = params.username

    if (!username || typeof username !== "string") {
        return <h1>Ugyldig brukernavn.</h1>;
    }

    const normalizedUsername = username.toLowerCase()

    if (username !== normalizedUsername) {
        const url = new URL(request.url)

        url.pathname = `/profile/${encodeURIComponent(normalizedUsername)}`
        return Response.redirect(url, 308)
    }

    const result = await service.findByUsername(params.username);

    if (!result.ok) {
        return <h1>Brukeren finnes ikke.</h1>;
    }

    return (
        <main>
        <h1>{result.data.name}</h1>
        <p>@{result.data.username}</p>
        </main>
    );
}
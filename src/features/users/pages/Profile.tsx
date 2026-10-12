import type { RequestInfo } from "rwsdk/worker";
import { service } from "../user-service";

export async function Profile({ params }: RequestInfo) {
    const result = await service.findByUsername(params.username);

    if (!result.ok) {
        return <h1>Brukeren finnes ikke</h1>;
    }

    return (
        <main>
        <h1>{result.data.name}</h1>
        <p>@{result.data.username}</p>
        </main>
    );
}
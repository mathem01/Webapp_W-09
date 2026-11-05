import { service } from "@/features/drawings/drawing-service";
import { Pagination } from "@/features/drawings/components/Pagination";
import { ExploreGrid } from "./ExploreGrid";

type Props = {
    viewerUserId: string | null;
    page: number;
};

export async function ExploreDrawings({ viewerUserId, page}: Props) {
    const result = await service.listPublicDrawings(page);

    if (!result.ok) {
        return (
            <div role="alert" className="mx-auto max-w-5xl rounded-xl bg-red-50 p-5 text-sm text-red-800">
                <p>Kunne ikke hente tegningene.</p>
                <a href="/explore" className="mt-2 inline-block font-medium underline">Prøv igjen</a>
            </div>
        );
    }

    if (result.data.total === 0) {
        return (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                <h3 className="font-medium text-gray-900">
                    Ingen tegninger er publisert.
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                    Når en bruker har publisert en tegning, dukker den opp her.
                </p>
            </div>
        );
    }

    return (
        <>
            <ExploreGrid drawings={result.data.items} viewerUserId={viewerUserId} />
            <Pagination page={result.data.page} totalPages={result.data.totalPages} basePath="/explore" />
        </>
    );
}
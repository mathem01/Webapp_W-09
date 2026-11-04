import { service } from "@/features/drawings/drawing-service";
import { DrawingGrid } from "@/features/drawings/components/DrawingGrid";

type Props = {
    userId: string;
};

export async function MyDrawings({ userId }: Props) {
    const result = await service.listAllDrawingsByUser(userId);

    if (!result.ok) {
        return (
            <div role="alert" className="rounded-xl bg-red-50 p-5 text-sm text-red-800">
                <p>Kunne ikke hente tegningene.</p>
                <a
                    href="/myPage"
                    className="mt-2 inline-block font-medium underline underline-offset-4"
                >
                    Prøv igjen
                </a>
            </div>
        );
    }

    if (result.data.length === 0) {
        return (
            <div className="rounded-xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                <h3 className="font-medium text-gray-900">
                    Du har ingen tegninger ennå
                </h3>
                <p className="mt-2 text-sm text-gray-500">
                    Når du har lagret en tegning, dukker den opp her.
                </p>
            </div>
        );
    }

    return (
        <>
            <p className="mb-4 text-sm text-gray-500">
                {result.data.length}{" "}
                {result.data.length === 1 ? "tegning" : "tegninger"}
            </p>

            <DrawingGrid drawings={result.data} editable />
        </>
    );
}
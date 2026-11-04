type Props = {
    count?: number;
};

export function DrawingGridSkeleton({ count = 8 }: Props) {
    return (
        <div
            role="status"
            aria-label="Laster inn tegninger"
            className="grid animate-pulse grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
        >
            {Array.from({ length: count }, (_, index) => (
                <div
                    key={index}
                    aria-hidden="true"
                    className="overflow-hidden rounded-xl border border-gray-200"
                >
                    <div className="aspect-square bg-gray-200" />

                    <div className="space-y-2 p-3">
                        <div className="h-4 w-3/4 rounded bg-gray-200" />
                        <div className="h-3 w-1/2 rounded bg-gray-100" />
                    </div>
                </div>
            ))}
        </div>
    );
}
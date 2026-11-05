type Props = {
    count?: number;
    variant?: "default" | "explore";
};

export function DrawingGridSkeleton({ count = 8, variant = "default" }: Props) {
    const isExplore = variant === "explore";

    return (
        <div
            role="status"
            aria-label="Laster inn tegninger"
            className={
                isExplore
                    ? "mx-auto grid max-w-5xl grid-cols-1 gap-5 min-[400px]:grid-cols-2 sm:grid-cols-3 md:grid-cols-4"
                    : "grid grid-cols-1 gap-4 min-[400px]:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
            }
        >
            {Array.from({ length: count }, (_, index) => (
                <div
                    key={index}
                    aria-hidden="true"
                    className={
                        isExplore
                            ? "min-w-0 rounded-md border border-neutral-300 bg-white p-2 shadow-sm"
                            : "overflow-hidden rounded-xl border border-gray-200"
                    }
                >
                    <div
                        className={
                            isExplore
                                ? "aspect-square animate-pulse rounded bg-gray-200"
                                : "aspect-square animate-pulse bg-gray-200"
                        }
                    />

                    {isExplore ? (
                        <div className="mt-2 flex items-center gap-2">
                            <div className="size-9 shrink-0 animate-pulse rounded-full bg-gray-200" />

                            <div className="min-w-0 flex-1 space-y-2">
                                <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                                <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 p-3">
                            <div className="h-4 w-3/4 animate-pulse rounded bg-gray-200" />
                            <div className="h-3 w-1/2 animate-pulse rounded bg-gray-100" />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
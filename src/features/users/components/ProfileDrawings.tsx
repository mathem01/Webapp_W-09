export function ProfileDrawings() {
    return (
        <section className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
            <header className="mb-6 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-semibold text-gray-900">
                    Tegninger
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                    Brukerens offentlige tegninger
                </p>
            </header>

            <div className="flex flex-col items-center justify-center rounded-xl bg-gray-50 px-6 py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-7 w-7 text-indigo-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        aria-hidden="true"
                    >
                        <rect x="3" y="3" width="18" height="18" rx="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <path d="m21 15-5-5L5 21" />
                    </svg>
                </div>

                <h3 className="font-semibold text-gray-900">
                    Ingen tegninger ennå
                </h3>

                <p className="mt-2 max-w-sm text-sm text-gray-500">
                    Når brukeren publiserer tegninger, vil de
                    vises her.
                </p>
            </div>
        </section>
    );
}
import type { RequestInfo } from "rwsdk/worker";

export function MyPage({ ctx }: RequestInfo) {
  const { username, email } = ctx.session;

  const initial = username?.charAt(0).toUpperCase() || "?";

  return (
    <section className="min-h-[80vh] bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-3xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Min side
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Her finner du profilinformasjonen din.
          </p>
        </header>

        <article
          aria-labelledby="profile-heading"
          className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
        >
          <div className="h-28 bg-indigo-400 sm:h-36" />

          <div className="px-6 pb-8 sm:px-8">
            <div
              aria-hidden="true"
              className="relative -mt-12 flex size-24 items-center justify-center rounded-full border-4 border-white bg-indigo-100 text-4xl font-bold text-indigo-700 shadow-sm"
            >
              {initial}
            </div>

            <h2
              id="profile-heading"
              className="mt-4 break-words text-2xl font-bold text-gray-900"
            >
              {username ? `@${username}` : "Din profil"}
            </h2>

            <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-100"> // dl samler lister med etikketer
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500"> // dt selve etikket tittlene for verdien
                  Brukernavn
                </dt>
                <dd className="mt-1 break-words text-sm text-gray-900 sm:col-span-2 sm:mt-0"> // dd brukes for verdien
                  {username || "Ikke tilgjengelig"}
                </dd>
              </div>

              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  E-post
                </dt>
                <dd className="mt-1 break-words text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                  {email || "Ikke tilgjengelig"}
                </dd>
              </div>
            </dl>
          </div>
        </article>
      </div>
    </section>
  );
}
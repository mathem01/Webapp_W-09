import { ErrorResponse, type RequestInfo } from "rwsdk/worker";
import { Suspense } from "react";
import { MyDrawings } from "@/features/drawings/components/MyDrawings";
import { DrawingGridSkeleton } from "@/features/drawings/components/DrawingGridSkeleton";
import { CreateNewDrawings } from "@/features/drawings/components/CreateNewDrawings";

export async function MyPage({ ctx, request }: RequestInfo) {
  const { userId, username, email } = ctx.session;
  if (!userId) throw new ErrorResponse(401, "Login required");
  
    /* Sidetall og sidestørrelse står i URL-en, så en side kan bokmerkes og
     deles. Mangler limit, bestemmer servicen standardverdien. */
  const query = new URL(request.url).searchParams;
  const page = Number(query.get("page") ?? 1);

  const initial = username?.charAt(0).toUpperCase() || "?";

  return (
    <section className="min-h-[80vh] bg-gray-50 px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">
            Min side
          </h1>
          <p className="mt-2 text-sm text-gray-500">
            Her finner du profilen din og tegningene du har lagret.
          </p>
          {username && (
            <a href={`/profile/${username}`} className="mt-4 inline-flex min-h-11 items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
              Gå til profil
            </a>
          )}
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

            <dl className="mt-6 divide-y divide-gray-100 border-t border-gray-100">
              <div className="py-4 sm:grid sm:grid-cols-3 sm:gap-4">
                <dt className="text-sm font-medium text-gray-500">
                  Brukernavn
                </dt>
                <dd className="mt-1 break-words text-sm text-gray-900 sm:col-span-2 sm:mt-0">
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

        <section
          aria-labelledby="drawings-heading"
          className="mt-8 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8"
        >
          <header className="mb-6">
            <h2
              id="drawings-heading"
              className="text-xl font-semibold text-gray-900"
            >
              Mine tegninger
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Her vises både private og offentlige tegninger.
            </p>
          </header>

          <CreateNewDrawings />

          <Suspense fallback={<DrawingGridSkeleton />}>
            <MyDrawings userId={userId} page={page} basePath="/myPage" />
          </Suspense>
        </section>
      </div>
    </section>
  );
}




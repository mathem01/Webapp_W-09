import { requestInfo } from "rwsdk/worker";

export function Home() {
  const loggedIn = requestInfo.ctx.session?.isAuthenticated ?? false;

  return (
    <section className="bg-slate-400">
      <div className="mx-auto min-h-[calc(100vh-8rem)] w-full max-w-5xl bg-neutral-200">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 px-6 py-16 text-center">
          <h1 className="text-4xl font-bold text-neutral-900">
            Tegn, del og remiks
          </h1>
          <p className="max-w-xl text-neutral-700">
            Lag pikseltegninger rett i nettleseren, publiser dem og la andre
            bygge videre på det du har laget.
          </p>

          <div className="mt-10 flex gap-3">
            <a
              href="/drawing"
              className="rounded-xl bg-green-500 px-5 py-2 font-semibold text-white transition hover:bg-green-600"
            >
              Begynn å tegne
            </a>
            <a
              href="/explore"
              className="rounded-xl bg-neutral-400 px-5 py-2 font-semibold text-white transition hover:bg-neutral-500"
            >
              Utforsk tegninger
            </a>
          </div>

          {!loggedIn && (
            <p className="text-sm text-neutral-600">
              Har du ikke bruker?{" "}
              <a href="/register" className="font-semibold underline">
                Registrer deg
              </a>
            </p>
          )}
        </div>

        <div className="mx-auto mt-30 grid max-w-4xl gap-4 px-6 pb-16 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-5">
            <h2 className="font-bold text-neutral-900">1. Tegn</h2>
            <p className="mt-1 text-sm text-neutral-700">
              Velg størrelse på lerretet og fargelegg piksel for piksel.
            </p>
          </div>
          <div className="rounded-xl bg-white p-5">
            <h2 className="font-bold text-neutral-900">2. Publiser</h2>
            <p className="mt-1 text-sm text-neutral-700">
              Del tegningen din så andre kan se, like og kommentere.
            </p>
          </div>
          <div className="rounded-xl bg-white p-5">
            <h2 className="font-bold text-neutral-900">3. Remiks</h2>
            <p className="mt-1 text-sm text-neutral-700">
              Ta en kopi av en annens tegning og lag din egen versjon.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
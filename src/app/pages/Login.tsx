
export function Login() {
  return (
    <section className="flex justify-center bg-neutral-200 px-4 py-16">
      <div className="w-full max-w-md rounded-xl bg-neutral-500 px-10 py-8 text-white">
        <h1 className="text-center text-3xl uppercase">Logg inn</h1>

        
        <form method="post" className="mt-4 flex flex-col">
          <label htmlFor="email" className="text-sm">
            Email
          </label>
          <input
            id="email"
            placeholder="ola.nordmann@example.com"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="mt-1 h-11 rounded-sm bg-neutral-200 px-3 text-neutral-900 outline-none focus:ring-2 focus:ring-white"
          />

          <label htmlFor="password" className="mt-6 text-sm">
            Passord
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            className="mt-1 h-11 rounded-sm bg-neutral-200 px-3 text-neutral-900 outline-none focus:ring-2 focus:ring-white"
          />

          <button
            type="submit"
            className="mt-4 self-end rounded-xl bg-neutral-300 px-4 py-1.5 text-neutral-900 transition hover:bg-neutral-100"
          >
            Logg inn
          </button>
        </form>

        <p className="mt-2 flex items-center gap-2 text-xs">
          Trykk registrer for å lage ny bruker
          <a
            href="/register"
            className="bg-neutral-300 px-3 py-1 text-sm text-neutral-900 transition hover:bg-neutral-100"
          >
            Registrer
          </a>
        </p>
      </div>
    </section>
  );
}

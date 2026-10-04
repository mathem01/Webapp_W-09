
export function Register() {
  return (
    <section className="flex justify-center bg-neutral-200 px-4 py-16">
      <div className="w-full max-w-md rounded-xl bg-neutral-500 px-10 py-8 text-white">
        <h1 className="text-center text-3xl">Registrer</h1>

        
        <form method="post" className="mt-4 flex flex-col">
          <label htmlFor="name" className="text-sm">
            Navn
          </label>
          <input
            id="name"
            placeholder="Ola Nordmann"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="mt-1 h-11 rounded-sm bg-neutral-200 px-3 text-neutral-900 outline-none focus:ring-2 focus:ring-white"
          />

          <label htmlFor="email" className="mt-6 text-sm">
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
            autoComplete="new-password"
            minLength={12}
            required
            aria-describedby="password-hint"
            className="mt-1 h-11 rounded-sm bg-neutral-200 px-3 text-neutral-900 outline-none focus:ring-2 focus:ring-white"
          />
          

          <button
            type="submit"
            className="mt-4 self-end rounded-xl bg-neutral-300 px-4 py-1.5 text-neutral-900 transition hover:bg-neutral-100"
          >
            Lag bruker
          </button>
        </form>

        <p className="mt-2 flex items-center gap-2 text-xs">
          Har du allerede en bruker?
          <a
            href="/login"
            className="bg-neutral-300 px-3 py-1 text-sm text-neutral-900 transition hover:bg-neutral-100"
          >
            Logg inn
          </a>
        </p>
      </div>
    </section>
  );
}

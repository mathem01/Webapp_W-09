
import {LoginForm} from "@/components/LoginForm";


export function Login() {
  return (
    <section className="flex justify-center bg-neutral-200 px-4 py-16">
      <div className="w-full max-w-md rounded-xl bg-neutral-500 px-10 py-8 text-white">
        <h1 className="text-center text-3xl uppercase">Logg inn</h1>

        <LoginForm /> 

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

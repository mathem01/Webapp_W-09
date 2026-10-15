import { RegisterForm } from "@/components/RegisterForm";

export function Register() {
  return (
    <section className="flex justify-center bg-neutral-200 px-4 py-16">
      <div className="w-full max-w-md rounded-xl bg-neutral-500 px-10 py-8 text-white">
        <h1 className="text-center text-3xl">Registrer</h1>

        
        <RegisterForm /> 

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

"use client";

import {useState, useTransition} from "react"; 
import {registerSchema, firstIssue } from "@/auth/schemas";

export function RegisterForm() {

const [name, setName] = useState("");
const [username, setUsername] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [error, setError] = useState<string | null>(null);
const [isPending, startTransition] = useTransition();

function onSubmit(e: React.FormEvent<HTMLFormElement>){

e.preventDefault();
setError(null);     


const parsed = registerSchema.safeParse({name, username, email, password});

if (!parsed.success) {

    setError(firstIssue(parsed.error));
    return; 
}

startTransition(async () => {

    const res = await fetch("/api/v1/auth/sign-up/email",{

    method: "POST", 
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify(parsed.data),    
    });

    if (!res.ok) {
        setError("kunne ikke lage bruker, prøv et annen e-postadresse eller brukernavn");
        return;
    }

    window.location.href= "/";
});

}

return (<form onSubmit={onSubmit} className="mt-4 flex flex-col">
          <label htmlFor="name" className="text-sm" >
            Navn
          </label>
          <input
            value={name}
            onChange = {(e) => setName(e.target.value)}
            id="name"
            placeholder="Ola Nordmann"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="mt-1 h-11 rounded-sm bg-neutral-200 px-3 text-neutral-900 outline-none focus:ring-2 focus:ring-white"
          />

          <label htmlFor="username" className="mt-6 text-sm">
            Brukernavn
          </label>
          <input
            value={username}
            onChange = {(e) => setUsername(e.target.value)}
            id="username"
            placeholder="FlamingHotChicken1_1"
            name="username"
            type="text"
            autoComplete="username"
            required
            className="mt-1 h-11 rounded-sm bg-neutral-200 px-3 text-neutral-900 outline-none focus:ring-2 focus:ring-white"
          />

          <label htmlFor="email" className="mt-6 text-sm">
            Email
          </label>
          <input
            value={email}
            onChange = {(e) => setEmail(e.target.value)}
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
            value = {password}
            onChange = {(e) => setPassword(e.target.value)}
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={12}
            required
            aria-describedby="password-hint"
            className="mt-1 h-11 rounded-sm bg-neutral-200 px-3 text-neutral-900 outline-none focus:ring-2 focus:ring-white"
          />

          {error && (

            <p role="alert" className = "mt-4 rounded-sm bg-red-100 px-3 py-2 text-sm text-red-800"> 
            {error}</p>


          )} 
          

          <button
           type="submit"
           disabled={isPending}
           className="mt-4 self-end rounded-xl bg-neutral-300 px-4 py-1.5 text-neutral-900 transition hover:bg-neutral-100 disabled:opacity-50"
      >
        {isPending ? "Lager bruker…" : "Lag bruker"}
      </button>
    </form>
); 


}



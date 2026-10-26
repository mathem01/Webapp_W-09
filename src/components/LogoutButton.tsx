"use client";

import {useState} from "react";


export function LogoutButton() {

const [isPending, setIsPending] = useState(false);
const [error, setError] = useState<string | null >(null);


async function handleLogout() {
    setIsPending(true);
    setError(null);

    try {
        const response = await fetch("/api/v1/auth/sign-out", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({})
            
        });

        if (!response.ok) {
            setError("Kunne ikke logge ut. Prøv igjen.");
            return;
        }

        window.location.href = "/";
         }
         catch {
            setError("Kunne ikke kontake serveren.")
         }
         finally {
            setIsPending(false);
         }



}

return (

    <div>

        <button type="button" onClick={handleLogout} disabled={isPending} className="rounded px-3 py-1 transition hover:bg-slate-200 disabled:opacity-5">


        {isPending ? "logger ut...": "logg ut"}

        </button>

        {error && <p role="alert">{error}</p>}



    </div>


);

}


// src/app/layouts/AppLayout.tsx

import type { LayoutProps } from "rwsdk/router";
import { LogoutButton } from "@/components/LogoutButton";

export function AppLayout({ children, requestInfo }: LayoutProps) {
 const isAuthenticated = requestInfo?.ctx.session.isAuthenticated;
 const username = requestInfo?.ctx.session.username;
 const initial = username?.charAt(0).toUpperCase() || "?";
  return (
    <div>
      <header>
        <nav className="flex items-center gap-3 border-b bg-white px-6 py-4 text-sm font-semibold [&_a]:rounded [&_a]:px-3 [&_a]:py-1 [&_a]:transition [&_a:hover]:bg-slate-200">
        <a href="/" className="text-xl font-bold">Logo/Navn</a>
        <a href="/canvas/1">Tegne</a>
        <a href="/explore">Utforske</a>

        <form action="/explore" className="flex ml-auto gap-2 bg-slate-200 px-3 py-2 transition hover:bg-slate-300 focus-within:bg-white">
          🔍︎
          <input name="S" placeholder="Søk..." className="w-full bg-transparent outline-none" />
        </form>
      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <LogoutButton />
          <a
            href="/myPage"
            aria-label="Gå til min profil"
            className="flex flex-col items-center gap-1"
          >
            <span
              aria-hidden="true"
              className="flex size-10 items-center justify-center rounded-full bg-indigo-100 text-lg font-bold text-indigo-700"
            >
              {initial}
            </span>
            <span className="text-xs">Profil</span>
          </a>
        </div>
        ) : (
          <>
        <a href="/register">Registrer</a>
        <a href="/login">Logg inn</a>
      </>
        )}
        
        
      </nav>
      </header>
      {/* <div className="flex items-center justify-center bg-slate-500 py-13 font-bold text-white text-3xl">
        Utforsk de nyeste tegningene
      </div> */}
      <main>{children}</main>
      {/* <footer><p>Kvitter, laget med RedwoodSDK</p></footer> */}
    </div>
  );
}

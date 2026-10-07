// src/app/layouts/AppLayout.tsx
import type { LayoutProps } from "rwsdk/router";

export function AppLayout({ children }: LayoutProps) {
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

        <a href="/register">Registrer</a>
        <a href="/login">Logg inn</a>
      </nav>
      </header>
      <div className="flex items-center justify-center bg-slate-500 py-13 font-bold text-white text-3xl">
        Utforsk de nyeste tegningene
      </div>
      <main>{children}</main>
      <footer><p>Kvitter, laget med RedwoodSDK</p></footer>
    </div>
  );
}
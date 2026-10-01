// src/app/layouts/AppLayout.tsx
import type { LayoutProps } from "rwsdk/router";

export function AppLayout({ children }: LayoutProps) {
  return (
    <div>
      <header>
        <nav>
          <a href="/">Feed</a>
          <a href="/profile">Profil</a>
          <a href="/settings">Innstillinger</a>
        </nav>
      </header>
      <main>{children}</main>
      <footer><p>Kvitter, laget med RedwoodSDK</p></footer>
    </div>
  );
}
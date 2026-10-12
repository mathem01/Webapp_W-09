// Testdata. Kjør med:
//   npm run seed      (eller pnpm seed)
//
// Poenget med en seed er at databasen kan nullstilles til en kjent tilstand.
// Slett .wrangler/, kjør migrasjonene og denne, så er dere tilbake der dere
// startet. Da slipper dere å lure på om feilen ligger i dataene.
import { defineScript } from "rwsdk/worker";
import { drizzle } from "drizzle-orm/d1";

import { relations } from "./relations";
import { user, drawings } from "./schema";
import { createDrawing } from "@/lib/drawing-service";

export const seedData = async (env: Env) => {
  const db = drizzle(env.DB, { relations });

  // Tøm først, så seed kan kjøres om igjen uten å doble alt.
  await db.delete(drawings);
  await db.delete(user);

  // Brukeren må inn før tegningene: fremmednøkkelen krever at den finnes.
  await db.insert(user).values({
    id: "seed-user-1",
    name: "Test Testesen",
    username: "testesen",
    email: "test@example.com",
  });

  // Går gjennom servicen, så valideringen kjører på samme vei som i appen.
  const liten = await createDrawing(db, "seed-user-1", {
    title: "Rødt kryss",
    width: 10,
    height: 10,
    pixels: Array.from({ length: 100 }, (_, i) =>
      i % 11 === 0 || i % 9 === 0 ? "#ff0000" : null
    ),
  });

  if (!liten.ok) throw new Error(`Seed feilet: ${liten.error}`);

  console.log("Seeding ferdig");
};

export default defineScript(async ({ env }) => {
  await seedData(env);
  return Response.json({ success: true });
});
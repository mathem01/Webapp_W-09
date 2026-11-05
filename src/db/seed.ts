// Seed-skriptet. Kjør med:
//   pnpm seed, eller http://localhost:5173/__seed i utviklingsserveren
//
// Poenget med en seed er at databasen kan nullstilles til en kjent tilstand.
// Slett .wrangler/, kjør migrasjonene og denne, så er dere tilbake der dere
// startet. Da slipper dere å lure på om feilen ligger i dataene.
//
// Selve dataene ligger i seed-data.ts, som er testbar fordi den ikke
// importerer noe fra rwsdk.
import { defineScript } from "rwsdk/worker";
import { drizzle } from "drizzle-orm/d1";
 
import { relations } from "./relations";
import { seedInto } from "./seed-data";
 
export const seedData = async (env: Env) => {
  const counts = await seedInto(drizzle(env.DB, { relations }));
 
  console.log(
    `Seeding ferdig: ${counts.users} brukere, ${counts.drawings} tegninger`
  );
};
 
export default defineScript(async ({ env }) => {
  await seedData(env);
  return Response.json({ success: true });
});
 
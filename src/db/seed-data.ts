// Selve testdataene. Ligger for seg selv, uten import fra rwsdk, så
// filen kan brukes både av seed-skriptet og av testene.
import { eq } from "drizzle-orm";

import { drawings, user } from "./schema";
import { createDrawing } from "@/lib/drawing-service";
import type { DrawingInput } from "@/lib/drawing-validation";
import type { DB } from "@/db";

/**
 * Fargene tegningene under bruker. Nøkkelen er tegnet i mønsteret.
 * Punktum er ikke med her, og betyr gjennomsiktig.
 */
const PALETTE: Record<string, string> = {
  y: "#ffd93d", // gul
  k: "#1b1b1b", // nesten svart
  r: "#e23c3c", // rød
  g: "#3cb043", // grønn
  p: "#ff7ab8", // rosa
  w: "#ffffff", // hvit
  b: "#2b5cb0", // blå
  l: "#c3cbe8", // lys blågrå
};

/**
 * Gjør et mønster av tegn om til et pikselarray.
 *
 * Hver streng er en rad, og hvert tegn en piksel. Det er langt lettere å
 * lese enn 256 hex-koder på rad, og lettere å rette hvis noe ser feil ut.
 */
function fromPattern(rows: string[]) {
  const height = rows.length;
  const width = rows[0].length;

  if (rows.some((row) => row.length !== width)) {
    throw new Error("Alle rader i mønsteret må være like lange");
  }

  const pixels: DrawingInput["pixels"] = rows.flatMap((row) =>
    [...row].map((char) => PALETTE[char] ?? null)
  );

  return { width, height, pixels };
}

const SMILEFJES = [
  "....yyyyyyyy....",
  "..yyyyyyyyyyyy..",
  ".yyyyyyyyyyyyyy.",
  "yyyyyyyyyyyyyyyy",
  "yyyykkyyyykkyyyy",
  "yyyykkyyyykkyyyy",
  "yyyyyyyyyyyyyyyy",
  "yyyyyyyyyyyyyyyy",
  "yyyyyyyyyyyyyyyy",
  "yyykyyyyyyyykyyy",
  "yyyykkyyyykkyyyy",
  "yyyyyykkkkyyyyyy",
  "yyyyyyyyyyyyyyyy",
  ".yyyyyyyyyyyyyy.",
  "..yyyyyyyyyyyy..",
  "....yyyyyyyy....",
];

const HJERTE = [
  "................",
  "..rrrr....rrrr..",
  ".rrrrrr..rrrrrr.",
  "rrrrrrrrrrrrrrrr",
  "rrrrrrrrrrrrrrrr",
  "rrrrrrrrrrrrrrrr",
  ".rrrrrrrrrrrrrr.",
  "..rrrrrrrrrrrr..",
  "...rrrrrrrrrr...",
  "....rrrrrrrr....",
  ".....rrrrrr.....",
  "......rrrr......",
  ".......rr.......",
  "................",
  "................",
  "................",
];

const PIL_OPP = [
  ".......gg.......",
  "......gggg......",
  ".....gggggg.....",
  "....gggggggg....",
  "...gggggggggg...",
  "..gggggggggggg..",
  ".gggggggggggggg.",
  "......gggg......",
  "......gggg......",
  "......gggg......",
  "......gggg......",
  "......gggg......",
  "......gggg......",
  "......gggg......",
  "......gggg......",
  "................",
];

const BLOMST = [
  "................",
  ".....pp..pp.....",
  "....pppppppp....",
  "...pppyyyyppp...",
  "...ppyyyyyypp...",
  "...pppyyyyppp...",
  "....pppppppp....",
  ".....pp..pp.....",
  ".......gg.......",
  ".......gg.......",
  "....gggggg......",
  ".......gg.......",
  ".......gg.......",
  "....gg.gg.......",
  ".......gg.......",
  "................",
];

const FLAGG = [
  "rrrrrwbbwrrrrrrr",
  "rrrrrwbbwrrrrrrr",
  "rrrrrwbbwrrrrrrr",
  "rrrrrwbbwrrrrrrr",
  "rrrrrwbbwrrrrrrr",
  "wwwwwwbbwwwwwwww",
  "bbbbbbbbbbbbbbbb",
  "bbbbbbbbbbbbbbbb",
  "wwwwwwbbwwwwwwww",
  "rrrrrwbbwrrrrrrr",
  "rrrrrwbbwrrrrrrr",
  "rrrrrwbbwrrrrrrr",
  "rrrrrwbbwrrrrrrr",
  "rrrrrwbbwrrrrrrr",
  "rrrrrwbbwrrrrrrr",
  "rrrrrwbbwrrrrrrr",
];

const SPOKELSE = [
  "................",
  "....llllllll....",
  "..llllllllllll..",
  ".llllllllllllll.",
  "llllllllllllllll",
  "lllkkllllllkklll",
  "lllkkllllllkklll",
  "llllllllllllllll",
  "llllllllllllllll",
  "llllllkkkkllllll",
  "llllllllllllllll",
  "llllllllllllllll",
  "llllllllllllllll",
  "llllllllllllllll",
  "ll..ll..ll..ll..",
  "................",
];

const STJERNE = [
  ".......yy.......",
  ".......yy.......",
  "......yyyy......",
  "......yyyy......",
  "yyyyyyyyyyyyyyyy",
  ".yyyyyyyyyyyyyy.",
  "..yyyyyyyyyyyy..",
  "...yyyyyyyyyy...",
  "....yyyyyyyy....",
  "....yyyyyyyy....",
  "...yyyy..yyyy...",
  "..yyyy....yyyy..",
  ".yyy........yyy.",
  "yy............yy",
  "................",
  "................",
];

/**
 * Sjakkbrett, laget i kode i stedet for mønster.
 *
 * 16x16 og ikke 8x8: valideringen krever minst 10 piksler i bredden.
 */
function sjakkbrett() {
  const size = 16;
  const pixels: DrawingInput["pixels"] = [];

  for (let rad = 0; rad < size; rad++) {
    for (let kolonne = 0; kolonne < size; kolonne++) {
      pixels.push((rad + kolonne) % 2 === 0 ? "#1b1b1b" : "#ffffff");
    }
  }

  return { width: size, height: size, pixels };
}

const SEED_USERS = [
  { id: "seed-alice", name: "Alice Hansen", username: "alice", email: "alice@example.com" },
  { id: "seed-bjorn", name: "Bjørn Dahl", username: "bjorn", email: "bjorn@example.com" },
  { id: "seed-cecilie", name: "Cecilie Lie", username: "cecilie", email: "cecilie@example.com" },
];

/**
 * Tegningene som legges inn. `isPublic: false` gir noe å teste
 * tilgangsreglene mot, så ikke alt er publisert.
 */
const SEED_DRAWINGS = [
  { userId: "seed-alice", title: "Smilefjes", isPublic: true, ...fromPattern(SMILEFJES) },
  { userId: "seed-alice", title: "Hjerte", isPublic: true, ...fromPattern(HJERTE) },
  { userId: "seed-alice", title: "Utkast, ikke publisert", isPublic: false, ...fromPattern(STJERNE) },
  { userId: "seed-bjorn", title: "Pil opp", isPublic: true, ...fromPattern(PIL_OPP) },
  { userId: "seed-bjorn", title: "Norsk flagg", isPublic: true, ...fromPattern(FLAGG) },
  { userId: "seed-bjorn", title: "Sjakkbrett", isPublic: true, ...sjakkbrett() },
  { userId: "seed-cecilie", title: "Blomst", isPublic: true, ...fromPattern(BLOMST) },
  { userId: "seed-cecilie", title: "Spøkelse", isPublic: true, ...fromPattern(SPOKELSE) },
];

/**
 * Legger testdataene inn i en database.
 *
 * Tar `db` inn som argument i stedet for å lage den selv, så den samme
 * koden kan kjøres mot D1 i utvikling og mot SQLite i minnet i testene.
 */
export async function seedInto(db: DB) {
  // Tøm først, så seed kan kjøres om igjen uten å doble alt.
  await db.delete(drawings);
  await db.delete(user);

  // Brukerne må inn før tegningene: fremmednøkkelen krever at de finnes.
  await db.insert(user).values(SEED_USERS);

  for (const { userId, title, isPublic, width, height, pixels } of SEED_DRAWINGS) {
    // Går gjennom servicen, så valideringen kjører samme vei som i appen.
    const result = await createDrawing(db, userId, { title, width, height, pixels });

    if (!result.ok) {
      throw new Error(`Seed feilet på "${title}": ${result.error}`);
    }

    if (isPublic) {
      await db
        .update(drawings)
        .set({ isPublic: true })
        .where(eq(drawings.id, result.data.id));
    }
  }

  return { users: SEED_USERS.length, drawings: SEED_DRAWINGS.length };
}
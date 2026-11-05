# DrawIt

DrawIt er en webapplikasjon hvor brukere kan lage pikseltegninger rett i nettleseren. En bruker kan registrere seg, velge tittel og størrelse på tegningen, tegne på et canvas og lagre tegningen på sin egen side. Tegninger kan være private eller publiseres slik at andre kan finne dem på utforsk-siden.

Prosjektet er laget i gruppe i emnet Webapplikasjoner (ITF31619).

## Hovedflyten

Den viktigste flyten i appen er:

1. Brukeren registrerer seg eller logger inn.
2. På **Min side** trykker brukeren på **Ny tegning** og velger tittel, bredde og høyde.
3. Serveren oppretter tegningen og sender brukeren videre til canvaset.
4. Når brukeren tegner, blir endringene lagret i databasen.
5. Tegningen vises på **Min side**, hvor den kan gjøres privat eller offentlig og slettes.
6. Offentlige tegninger vises på **Utforsk**, mens private tegninger bare vises for eieren.

## Teknologi

- RedwoodSDK og React
- TypeScript
- Tailwind CSS
- Cloudflare Workers og D1
- Drizzle ORM
- Better Auth
- Zod
- Vitest og Testing Library
- Playwright

## Starte prosjektet lokalt

Du trenger Node.js 22.12 eller nyere og pnpm.

Installer pakkene:

```bash
pnpm install
```

Kopier `.dev.vars.example` til en ny fil som heter `.dev.vars`. Legg inn en hemmelig nøkkel og URL-en som Better Auth skal bruke:

```env
BETTER_AUTH_SECRET="en-lang-tilfeldig-hemmelighet"
BETTER_AUTH_URL="http://localhost:5173"
```

En tilfeldig nøkkel kan lages med:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Opprett tabellene i den lokale databasen:

```bash
pnpm migrate:dev
```

Legg inn testdata hvis du ønsker det:

```bash
pnpm seed
```

Start utviklingsserveren:

```bash
pnpm dev
```

Appen åpnes på `http://localhost:5173`.

## Kommandoer

| Kommando | Hva den gjør |
| --- | --- |
| `pnpm dev` | Starter utviklingsserveren |
| `pnpm lint` | Kjører TypeScript-sjekken |
| `pnpm test` | Kjører testene med Vitest |
| `pnpm test:e2e` | Kjører Playwright-testene |
| `pnpm migrate:new` | Lager en ny migrasjon etter en skjemaendring |
| `pnpm migrate:dev` | Kjører migrasjonene mot lokal D1 |
| `pnpm seed` | Fyller den lokale databasen med testdata |
| `pnpm build` | Bygger prosjektet |

## Hvordan koden er organisert

```text
src/
├── worker.tsx                         ruter og middleware
├── middleware/                        session og tilgangskontroll
├── lib/                               Better Auth-oppsett, Result-typen og ID-er
├── app/
│   ├── pages/                         forsiden, utforsk, min side og admin
│   ├── layouts/                       felles layout og navigasjon
│   └── headers.ts                     sikkerhetsheadere
├── features/
│   ├── drawings/
│   │   ├── components/                tegnekomponenter og grensesnitt
│   │   ├── pages/Canvas.tsx           canvas-siden
│   │   ├── hooks/                     tegnelogikk og autolagring
│   │   ├── utils/                     hjelpefunksjoner for piksler og verktøy
│   │   ├── __tests__/                 tester for tegnefunksjonen
│   │   ├── actions.ts                 server actions
│   │   ├── drawing-routes.ts          REST-ruter
│   │   ├── drawing-controller.ts      HTTP inn og ut
│   │   ├── drawing-service.ts         regler og autorisasjon
│   │   ├── drawing-repository.ts      lesing og lagring i databasen
│   │   ├── drawing-mapper.ts          formen på data ut av datalaget
│   │   ├── drawing-schema.ts          Zod-regler
│   │   └── drawing-types.ts           TypeScript-typer
│   ├── login/                         innlogging, registrering og logg ut
│   └── users/                         brukerprofil gjennom samme lagdeling
├── shared/components/                 felles komponenter, som paginering
├── db/
│   ├── schema/                        tabellene for auth og tegninger
│   ├── relations.ts                   relasjonene mellom tabellene
│   ├── seed.ts                        kjøring av seed
│   └── seed-data.ts                   testdata
└── test/                              felles testoppsett                      

drizzle/migrations/                     SQL-migrasjoner
e2e/                                    Playwright-tester
```

## Arkitekturen

Tegnefunksjonen er delt opp i lag:

```text
request → route → controller → service → repository → D1-database
```

- **Route** kobler URL og HTTP-metode til riktig controller.
- **Controller** leser requesten og lager et HTTP-svar.
- **Service** validerer data og håndhever reglene, blant annet hvem som eier tegningen.
- **Repository** er laget som snakker direkte med databasen.

Server actions bruker den samme servicen som REST-endepunktene. På den måten ligger reglene på ett sted selv om data kan komme inn på forskjellige måter.

## REST-endepunkter

| Metode og URL | Bruk |
| --- | --- |
| `GET /api/v1/drawings` | Henter offentlige tegninger |
| `POST /api/v1/drawings` | Oppretter en tegning |
| `GET /api/v1/drawings/:drawingId` | Henter én tegning |
| `PATCH /api/v1/drawings/:drawingId` | Oppdaterer en tegning |
| `DELETE /api/v1/drawings/:drawingId` | Sletter en tegning |
| `PATCH /api/v1/drawings/:drawingId/visibility` | Endrer mellom privat og offentlig |
| `GET /api/v1/me/drawings` | Henter tegningene til innlogget bruker |
| `GET /api/v1/users/:userId/drawings` | Henter offentlige tegninger fra en bruker |
| `GET /api/v1/users/:username` | Henter en bruker |
| `GET /api/v1/status` | Sjekker at serveren svarer |

Ruter som oppretter, endrer eller sletter data er beskyttet på serveren. Det holder derfor ikke å bare skjule en knapp i grensesnittet. Serveren sjekker session og eierskap før endringen utføres.

## Server actions

Vi bruker server actions sammen med `useActionState` til handlinger som kommer fra skjemaer i grensesnittet:

- Opprette en ny tegning.
- Lagre endringer i canvaset.
- Endre en tegning mellom privat og offentlig.
- Slette en tegning.

Skjemadata blir behandlet på serveren, og brukeren hentes fra den gyldige sessionen. Data som kommer utenfra valideres før den blir sendt videre til repository-laget.

## Database

Databasen er Cloudflare D1, som bruker SQLite. Drizzle brukes til å definere tabellene og kjøre spørringer. De viktigste tabellene er Better Auth-tabellene for brukere og sessions, og `drawings` for tegningene.

En tegning lagrer blant annet:

- Eierens bruker-ID.
- Tittel.
- Bredde og høyde.
- Pikslene i tegningen.
- Om tegningen er offentlig eller privat.
- Tidspunkt for opprettelse og siste endring.

Dataene overlever en omstart fordi de lagres i D1 og ikke i React-state eller en variabel på serveren.

## Testing

Testene ligger sammen med området de tester:

- Enhetstester av blant annet ID-generatoren og Zod-reglene for tegninger.
- Tester av drawing-servicen mot en testdatabase.
- Komponenttester med Testing Library.
- E2E-tester med Playwright.

Kjør TypeScript-sjekken og Vitest før en commit:

```bash
pnpm lint
pnpm test
```

### E2E-tester med Playwright

Playwright tester appen i en ekte nettleser. Første gang må nettleseren som
Playwright bruker lastes ned:

```bash
pnpm exec playwright install chromium
```

E2E-testen logger inn med en vanlig testbruker. Sett derfor inn en bruker som
allerede finnes i den lokale databasen. I PowerShell kan det gjøres slik:

```powershell
$env:E2E_EMAIL="din-testbruker@example.com"
$env:E2E_PASSWORD="testbrukerens-passord"
```

Disse verdiene gjelder bare i det åpne terminalvinduet og skal ikke legges i
GitHub. Hvis de mangler, stopper testen med en tydelig feilmelding.

Etter det kan E2E-testene kjøres med:

```bash
pnpm test:e2e
```

Playwright starter utviklingsserveren selv gjennom `playwright.config.ts`.
Hvis en server allerede kjører på port 5173, kan Playwright bruke den. E2E-
testene ligger i `e2e/` og skal teste en hel brukerflyt, ikke bare en enkelt
komponent.

## Valg vi har tatt

### Samme service fra flere steder

Både controllerne og server actions kaller drawing-servicen. Alternativet hadde vært å skrive reglene flere ganger. Da kunne for eksempel REST-ruten ha sjekket eierskap, mens server actionen glemte det.

### Server- og klientkomponenter

Sider som bare henter og viser data er serverkomponenter. Komponenter som åpner vinduer, reagerer på klikk eller bruker React-state er klientkomponenter. Det gjør at vi bare sender klient-JavaScript der vi faktisk trenger interaktivitet.

### Privat som standard

Nye tegninger er private. Brukeren må selv velge å publisere dem. Servicen sjekker både innlogget bruker og eieren av tegningen før synlighet, innhold eller sletting kan endres.

## Avgrensninger

Vi prioriterte hovedflyten med innlogging, tegning, lagring og publisering. Kommentarfeltet i visningen av en offentlig tegning er derfor bare et eksempel på grensesnittet og lagrer ikke kommentarer. Full støtte for likes og remiks ble heller ikke en del av den ferdige hovedflyten.

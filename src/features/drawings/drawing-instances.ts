/* Her kobles lagene sammen med den ekte databasen.
   Ligger for seg selv så repository og service kan importeres i tester
   uten å dra inn cloudflare:workers. */

import { db } from "@/db";
import { createDrawingRepository } from "./drawing-repository";
import { createDrawingService } from "./drawing-service";

export const repository = createDrawingRepository(db);
export const service = createDrawingService(repository);
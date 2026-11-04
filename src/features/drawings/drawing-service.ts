import { Errors, ResultHandler, type Result } from "@/lib/result";
import { drawingInputSchema, drawingVisibilitySchema, type DrawingInput } from "@/features/drawings/drawing-schema";
import { serializePixels, deserializePixels } from "@/features/drawings/utils/pixels";
import { firstIssue } from "@/auth/schemas";
import {z} from "zod"; 
import { DrawingView, type PublicDrawingView, type PublicDrawingPage } from "./drawing-types";
import { repository, type DrawingRepository } from "./drawing-repository";
import { toDrawingView } from "./drawing-mapper";


export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

/* Holder et tall innenfor et intervall. */
function clamp(verdi: number, minst: number, mest: number) {
  if (!Number.isFinite(verdi)) return minst
  return Math.min(mest, Math.max(minst, Math.floor(verdi)))
}
export interface DrawingService {
  createDrawing(userId: string, input: unknown): Promise<Result<{ id: string }>>
  getDrawing(id: string, userId: string | null): Promise<Result<DrawingView>>
    remixDrawing(id: string, userId: string): Promise<Result<{ id: string }>>
  updateDrawing(id: string, userId: string, input: unknown): Promise<Result<void>>
  deleteDrawing(id: string, userId: string): Promise<Result<void>>

  listPublicDrawings(page?: number, limit?: number): Promise<Result<PublicDrawingPage>>
  listPublicDrawingsByUser(userId: string): Promise<Result<DrawingView[]>>
  listAllDrawingsByUser(userId: string): Promise<Result<DrawingView[]>>

  setDrawingVisibility(id: string, userId: string, input: unknown): Promise<Result<void>>
}

export function createDrawingService(_repository: DrawingRepository): DrawingService {
  return {
    async createDrawing(userId: string, input: unknown): Promise<Result<{ id: string; }>> {
      const parsed = drawingInputSchema.safeParse(input);

      if (!parsed.success) {
        return ResultHandler.failure(
          "Ugyldig format",
          Errors.BAD_REQUEST,
          z.flattenError(parsed.error).fieldErrors
        )
      }

      const result = await _repository.createDrawing(userId, parsed.data)

      if (!result.ok) {
        return result
      }

      if (!result.data) {
        return ResultHandler.failure(
          "ID ble ikke opprettet",
          Errors.NOT_FOUND
        )
      }

      return ResultHandler.success(
        result.data
      )
    },
    async getDrawing(id: string, userId: string | null): Promise<Result<DrawingView>> {
      const result = await _repository.getDrawing(id)

      if (!result.ok || !result.data || (!result.data.isPublic && result.data.userId !== userId)) {
        return ResultHandler.failure(
          "Tegningen finnes ikke",
          Errors.NOT_FOUND
        )
      }

      return ResultHandler.success(
        toDrawingView(result.data)
      )
    },

        /* Lager en egen kopi av en publisert tegning.

       Originalen må være offentlig, ellers svarer vi NOT_FOUND slik som
       getDrawing, så private tegninger ikke kan avsløres gjennom remiks.
       Eieren kan slå av remiks med allowRemix, og da er tegningen synlig
       men ikke kopierbar, altså FORBIDDEN. */
    async remixDrawing(id: string, userId: string): Promise<Result<{ id: string }>> {
      const original = await _repository.getDrawing(id)

      if (!original.ok) return original

      if (!original.data || !original.data.isPublic) {
        return ResultHandler.failure(
          "Tegningen finnes ikke",
          Errors.NOT_FOUND
        )
      }

      if (!original.data.allowRemix) {
        return ResultHandler.failure(
          "Denne tegningen kan ikke remikses",
          Errors.FORBIDDEN
        )
      }

      const result = await _repository.createRemix(userId, original.data)

      if (!result.ok) return result

      if (!result.data) {
        return ResultHandler.failure(
          "ID ble ikke opprettet",
          Errors.NOT_FOUND
        )
      }

      return ResultHandler.success(result.data)
    },
    
    async updateDrawing(id: string, userId: string, input: unknown): Promise<Result<void>> {
      const parsed = drawingInputSchema.safeParse(input);
      if (!parsed.success) {
        return ResultHandler.failure(
          "Ugyldig format",
          Errors.BAD_REQUEST,
          z.flattenError(parsed.error).fieldErrors
        )
      }

      const result = await _repository.updateDrawing(id, userId, parsed.data)

      if (!result.ok) return result

      if (!result.data) {
        return ResultHandler.failure(
          "Tegningen finnes ikke",
          Errors.NOT_FOUND
        )
      }

      return ResultHandler.success(undefined)
    },
    async deleteDrawing(id: string, userId: string): Promise<Result<void>> {
      const drawingExist = await _repository.getDrawing(id)

      if (!drawingExist.ok) return drawingExist

      if (!drawingExist.data || (drawingExist.data.userId !== userId)) {
        return ResultHandler.failure(
          "Tegningen finnes ikke",
          Errors.NOT_FOUND
        )
      }

      const result = await _repository.deleteDrawing(id, userId)

      if (!result.ok) return result

      return ResultHandler.success(undefined)
    },
    async listPublicDrawings(page = 1, limit = DEFAULT_PAGE_SIZE): Promise<Result<PublicDrawingPage>> {
      const trygtAntall = clamp(limit, 1, MAX_PAGE_SIZE)
      const trygtSidetall = Math.max(1, Math.floor(page) || 1)

      const total = await _repository.countPublicDrawings()
      if (!total.ok) return total

      const totalPages = Math.max(1, Math.ceil(total.data / trygtAntall))
      const side = Math.min(trygtSidetall, totalPages)

      const result = await _repository.listPublicDrawings(
        trygtAntall,
        (side - 1) * trygtAntall
      )

      if (!result.ok) return result

      return ResultHandler.success({
        items: result.data,
        page: side,
        limit: trygtAntall,
        total: total.data,
        totalPages,
      })
    },
    async listPublicDrawingsByUser(userId: string): Promise<Result<DrawingView[]>> {
      const result = await _repository.listPublicDrawingsByUser(userId)

      if (!result.ok) return result
      
      return ResultHandler.success(result.data)
    },
    async listAllDrawingsByUser(userId: string): Promise<Result<DrawingView[]>> {
      const result = await _repository.listAllDrawingsByUser(userId)

      if (!result.ok) return result
      
      return ResultHandler.success(result.data)
    },
    async setDrawingVisibility(id: string, userId: string, input: unknown): Promise<Result<void>> {
      const parsed = drawingVisibilitySchema.safeParse(input);
      if (!parsed.success) {
        return ResultHandler.failure(
          "Ugyldig format",
          Errors.BAD_REQUEST,
          z.flattenError(parsed.error).fieldErrors
        )
      }

      const result = await _repository.setDrawingVisibility(id, userId, parsed.data.isPublic)

      if (!result.ok) return result

      if (!result.data) {
        return ResultHandler.failure(
          "Tegningen finnes ikke",
          Errors.NOT_FOUND
        )
      }

      return ResultHandler.success(undefined)
    }
  }
}

export const service = createDrawingService(repository);



// export async function updateDrawing(
//   db: DB,
//   userId: string,
//   id: string,
//   input: unknown
// ): Promise<Result<null>> {
//   const existing = await db.query.drawings.findFirst({ where: { id } });
//   if (!existing) {
//     return { ok: false, error: "Tegningen finnes ikke", status: 404 };
//   }
//   if (existing.userId !== userId) {
//     return { ok: false, error: "Ikke din tegning", status: 403 };
//   }

//   const parsed = drawingInputSchema.safeParse(input);
//   if (!parsed.success) {
//     return { ok: false, error: firstIssue(parsed.error), status: 400 };
//   }

//   await db
//     .update(drawings)
//     .set({
//       title: parsed.data.title,
//       width: parsed.data.width,
//       height: parsed.data.height,
//       pixels: serializePixels(parsed.data.pixels),
//       updatedAt: new Date(),
//     })
//     .where(eq(drawings.id, id));

//   return { ok: true, data: null };
// }

/* */

// export async function deleteDrawing(
//   db: DB,
//   userId: string,
//   id: string,
//   isAdmin = false
// ): Promise<Result<null>> {
//   const existing = await db.query.drawings.findFirst({ where: { id } });
//   if (!existing) {
//     return { ok: false, error: "Tegningen finnes ikke", status: 404 };
//   }
//   if (existing.userId !== userId && !isAdmin) {
//     return { ok: false, error: "Ikke din tegning", status: 403 };
//   }

//   await db.delete(drawings).where(eq(drawings.id, id));

//   return { ok: true, data: null };
// }



 /* Henter én tegning.
  Offentlige tegninger er åpne for alle, også gjester. Private er bare for
  eieren, og svaret er 404 og ikke 403, så ingen får vite at en privat
  tegning finnes.
 */
// export async function getDrawing(
//   db: DB,
//   id: string,
//   userId: string | null
// ): Promise<Result<DrawingView>> {
//   const row = await db.query.drawings.findFirst({ where: { id } });

//   if (!row || (!row.isPublic && row.userId !== userId)) {
//     return { ok: false, error: "Tegningen finnes ikke", status: 404 };
//   }

//  return { ok: true, data: toDrawingView(row) };
// }

/*Henter alle tegningene til én bruker, nyeste først.
  Brukes på profilsiden, der eieren skal se både private og offentlige.
 */
// export async function listMyDrawings(
//   db: DB,
//   userId: string
// ): Promise<Result<DrawingView[]>> {
//   const rows = await db.query.drawings.findMany({
//     where: { userId },
//     orderBy: { createdAt: "desc" },
//   });

//   return { ok: true, data: rows.map(toDrawingView) };
// }
/* Henter offentlige tegninger til feeden, nyeste først.
  Ingen innlogging kreves. `limit` holder svaret lite når det blir mange
  tegninger.
 */
// export async function listPublicDrawings(
//   db: DB,
//   limit = 20
// ): Promise<Result<DrawingView[]>> {
//   const rows = await db.query.drawings.findMany({
//     where: { isPublic: true },
//     orderBy: { createdAt: "desc" },
//     limit,
//   });

//   return { ok: true, data: rows.map(toDrawingView) };
// }

/* */
// export async function listUserDrawings(
//   db: DB,
//   profileUserId: string,
//   viewerUserId: string | null = null
// ): Promise<Result<DrawingView[]>> {
//   const isOwner = profileUserId === viewerUserId;

//   const rows = await db.query.drawings.findMany({
//     where: isOwner
//       ? { userId: profileUserId }
//       : { userId: profileUserId, isPublic: true },
//     orderBy: { createdAt: "desc" },
//   });

//   return { ok: true, data: rows.map(toDrawingView) };
// }

/* Setter om en tegning er offentlig. Felles kropp for publisering og
   avpublisering, så eierskapssjekken bare finnes ett sted. */
// async function setPublic(
//   db: DB,
//   userId: string,
//   id: string,
//   isPublic: boolean
// ): Promise<Result<null>> {
//   const existing = await db.query.drawings.findFirst({ where: { id } });
//   if (!existing) {
//     return { ok: false, error: "Tegningen finnes ikke", status: 404 };
//   }
//   if (existing.userId !== userId) {
//     return { ok: false, error: "Ikke din tegning", status: 403 };
//   }

//   await db
//     .update(drawings)
//     .set({ isPublic, updatedAt: new Date() })
//     .where(eq(drawings.id, id));

//   return { ok: true, data: null };
// }

/* Gjør tegningen synlig i feeden og på profilen. */
// export async function publishDrawing(db: DB, userId: string, id: string) {
//   return setPublic(db, userId, id, true);
// }

/* Tar tegningen ut av feeden igjen. Raden slettes ikke. */
// export async function unpublishDrawing(db: DB, userId: string, id: string) {
//   return setPublic(db, userId, id, false);
// }

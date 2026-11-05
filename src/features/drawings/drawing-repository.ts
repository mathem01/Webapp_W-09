import { type DB, db } from "@/db";
import { type Drawing, drawings, user } from "@/db/schema";
import { eq, desc, and, or, count } from "drizzle-orm";
import { drawingInputSchema, type DrawingInput } from "@/features/drawings/drawing-schema";
import { serializePixels, deserializePixels } from "@/features/drawings/utils/pixels";
import { executeDbOperation, type Result } from "@/lib/result";
import { toDrawingView } from "./drawing-mapper";
import { DrawingView, type PublicDrawingView } from "./drawing-types";

export interface DrawingRepository {
    createDrawing(userId: string, drawingInput: DrawingInput): Promise<Result<{ id: string }>>;
    getDrawing(id: string): Promise<Result<Drawing | null>>
        createRemix(userId: string, original: Drawing): Promise<Result<{ id: string }>>
    updateDrawing(id: string, userId: string, drawingInput: DrawingInput): Promise<Result<{ id: string } | null>>
    deleteDrawing(id: string, userId: string): Promise<Result<boolean>>

    listPublicDrawings(limit: number, offset: number): Promise<Result<PublicDrawingView[]>>
    countPublicDrawings(): Promise<Result<number>>
    listPublicDrawingsByUser(userId: string, limit: number, offset: number): Promise<Result<DrawingView[]>>
    countPublicDrawingsByUser(userId: string): Promise<Result<number>>
    listAllDrawingsByUser(userId: string, limit: number, offset: number): Promise<Result<DrawingView[]>>
    countAllDrawingsByUser(userId: string): Promise<Result<number>>

    setDrawingVisibility(id: string, userId: string, visibility: boolean): Promise<Result<{ id: string } | null>>
}

export function createDrawingRepository(_db: DB): DrawingRepository {
    return {
        async createDrawing(userId: string, drawingInput: DrawingInput) {
            return executeDbOperation(async () => {
                const [row] = await _db
                    .insert(drawings)
                    .values({
                        userId,
                        title: drawingInput.title,
                        width: drawingInput.width,
                        height: drawingInput.height,
                        pixels: serializePixels(drawingInput.pixels),
                    })
                    .returning({ id: drawings.id });

                return row
            })
        },
                /* Lagrer en kopi av en tegning, eid av den som remikser.
           remixOfId peker tilbake på originalen, og kopien starter privat. */
        async createRemix(userId: string, original: Drawing) {
            return executeDbOperation(async () => {
                const [row] = await _db
                    .insert(drawings)
                    .values({
                        userId,
                        title: original.title,
                        width: original.width,
                        height: original.height,
                        pixels: original.pixels,
                        remixOfId: original.id,
                    })
                    .returning({ id: drawings.id });

                return row
            })
        },
        async getDrawing(id: string) {
            return executeDbOperation(async () => {
                const [row] = await _db
                    .select()
                    .from(drawings)
                    .where(eq(drawings.id, id))
                    .limit(1)

                return row ?? null
            })
        },
        async updateDrawing(id: string, userId: string, drawingInput: DrawingInput) {
            return executeDbOperation(async () => {
                const [row] = await _db
                    .update(drawings)
                    .set({
                        title: drawingInput.title,
                        width: drawingInput.width,
                        height: drawingInput.height,
                        pixels: serializePixels(drawingInput.pixels),
                        updatedAt: new Date(),
                    })
                    .where(
                        and(
                            eq(drawings.id, id), 
                            eq(drawings.userId, userId)
                        )
                    )
                    .returning({ id: drawings.id })

                return row ?? null
            })
        },
        async deleteDrawing(id: string, userId: string) {
            return executeDbOperation(async () => {
                const rows = await _db
                    .delete(drawings)
                    .where(
                        and(
                            eq(drawings.id, id), 
                            eq(drawings.userId, userId)
                        )
                    )
                    .returning({ id: drawings.id });
                
                return rows.length > 0
            })
        },
        async listPublicDrawings(limit: number, offset: number) {
            return executeDbOperation(async () => {
                const rows = await _db
                    .select({ drawing: drawings, owner: { id: user.id, username: user.username } })
                    .from(drawings)
                    .innerJoin(user, eq(drawings.userId, user.id))
                    .where(eq(drawings.isPublic, true))
                    .orderBy(desc(drawings.createdAt))
                    .limit(limit)
                    .offset(offset)

                return rows.map(({ drawing, owner }) => ({ ...toDrawingView(drawing), owner }))
            })
        },
        
          /* Teller alle offentlige tegninger, så siden vet hvor mange sider
           det finnes. Egen spørring, fordi listen bare henter én side. */
        async countPublicDrawings() {
            return executeDbOperation(async () => {
                const [row] = await _db
                    .select({ value: count() })
                    .from(drawings)
                    .where(eq(drawings.isPublic, true))

                return row?.value ?? 0
            })
        },
        async listPublicDrawingsByUser(userId: string, limit: number, offset: number) {
            return executeDbOperation(async () => {
                const rows = await _db
                    .select()
                    .from(drawings)
                    .where(
                        and(
                            eq(drawings.userId, userId),
                            eq(drawings.isPublic, true)
                        )
                    )
                    .orderBy(desc(drawings.createdAt))
                    .limit(limit)
                    .offset(offset)

                return rows.map(toDrawingView)
            })
        },
        async countPublicDrawingsByUser(userId: string) {
            return executeDbOperation(async () => {
                const [row] = await _db
                    .select({ value: count() })
                    .from(drawings)
                    .where(
                        and(
                            eq(drawings.userId, userId),
                            eq(drawings.isPublic, true)
                        )
                    )

                return row?.value ?? 0
            })
        },
        async listAllDrawingsByUser(userId: string, limit: number, offset: number) {
            return executeDbOperation(async () => {
                const rows = await _db
                    .select()
                    .from(drawings)
                    .where(eq(drawings.userId, userId))
                    .orderBy(desc(drawings.createdAt))
                    .limit(limit)
                    .offset(offset)

                return rows.map(toDrawingView)
            })
        },
        async countAllDrawingsByUser(userId: string) {
            return executeDbOperation(async () => {
                const [row] = await _db
                    .select({ value: count() })
                    .from(drawings)
                    .where(eq(drawings.userId, userId))

                return row?.value ?? 0
            })
        },
        async setDrawingVisibility(id: string, userId: string, visibility: boolean) {
            return executeDbOperation(async () => {
                const [row] = await _db
                    .update(drawings)
                    .set({ isPublic: visibility, updatedAt: new Date() })
                    .where(
                        and(
                            eq(drawings.id, id),
                            eq(drawings.userId, userId)
                        )
                    )
                    .returning({ id: drawings.id })
                
                return row ?? null
            })
        },
    };
}

export const repository = createDrawingRepository(db);

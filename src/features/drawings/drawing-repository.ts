import { type DB, db } from "@/db";
import { type Drawing, drawings } from "@/db/schema";
import { eq, desc, and, or } from "drizzle-orm";
import { drawingInputSchema, type DrawingInput } from "@/features/drawings/drawing-schema";
import { serializePixels, deserializePixels } from "@/features/drawings/utils/pixels";
import { executeDbOperation, type Result } from "@/lib/result";
import { toDrawingView } from "./drawing-mapper";
import { DrawingView } from "./drawing-types";

export interface DrawingRepository {
    createDrawing(userId: string, drawingInput: DrawingInput): Promise<Result<{ id: string }>>;
    getDrawing(id: string): Promise<Result<Drawing | null>>
    updateDrawing(id: string, userId: string, drawingInput: DrawingInput): Promise<Result<void>>
    deleteDrawing(id: string, userId: string): Promise<Result<void>>

    listPublicDrawings(limit: number): Promise<Result<DrawingView[]>>
    listPublicDrawingsByUser(userId: string): Promise<Result<DrawingView[]>>
    listAllDrawingsByUser(userId: string): Promise<Result<DrawingView[]>>

    setDrawingVisibility(id: string, userId: string, visibility: boolean): Promise<Result<void>>
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
                await _db
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
                    .limit(1)
            })
        },
        async deleteDrawing(id: string, userId: string) {
            return executeDbOperation(async () => {
                await _db
                    .delete(drawings)
                    .where(
                        and(
                            eq(drawings.id, id), 
                            eq(drawings.userId, userId)
                        )
                    )
                    .limit(1)
            })
        },
        async listPublicDrawings(limit: number) {
            return executeDbOperation(async () => {
                const rows = await _db
                    .select()
                    .from(drawings)
                    .where(eq(drawings.isPublic, true))
                    .orderBy(desc(drawings.createdAt))
                    .limit(limit)

                return rows.map(toDrawingView)
            })
        },
        async listPublicDrawingsByUser(userId: string) {
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

                return rows.map(toDrawingView)
            })
        },
        async listAllDrawingsByUser(userId: string) {
            return executeDbOperation(async () => {
                const rows = await _db
                    .select()
                    .from(drawings)
                    .where(eq(drawings.userId, userId))
                    .orderBy(desc(drawings.createdAt))

                return rows.map(toDrawingView)
            })
        },
        async setDrawingVisibility(id: string, userId: string, visibility: boolean) {
            return executeDbOperation(async () => {
                await _db
                    .update(drawings)
                    .set({ isPublic: visibility, updatedAt: new Date() })
                    .where(
                        and(
                            eq(drawings.id, id),
                            eq(drawings.userId, userId)
                        )
                    )
                }   
            )
        },
    };
}

export const repository = createDrawingRepository(db);
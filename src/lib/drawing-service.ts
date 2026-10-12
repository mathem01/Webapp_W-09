import { eq } from "drizzle-orm";

import type { DB } from "@/db";
import { drawings } from "@/db/schema";
import { drawingInputSchema } from "@/lib/drawing-validation";
import { serializePixels } from "@/lib/drawing-pixels";
import { firstIssue } from "@/auth/schemas";

export type Result<T> =
  | { ok: true; data: T }
  | { ok: false; error: string; status: number };

export async function createDrawing(
  db: DB,
  userId: string,
  input: unknown
): Promise<Result<{ id: string }>> {
  const parsed = drawingInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error), status: 400 };
  }

  const [row] = await db
    .insert(drawings)
    .values({
      userId,
      title: parsed.data.title,
      width: parsed.data.width,
      height: parsed.data.height,
      pixels: serializePixels(parsed.data.pixels),
    })
    .returning({ id: drawings.id });

  return { ok: true, data: { id: row.id } };
}

export async function updateDrawing(
  db: DB,
  userId: string,
  id: string,
  input: unknown
): Promise<Result<null>> {
  const existing = await db.query.drawings.findFirst({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Tegningen finnes ikke", status: 404 };
  }
  if (existing.userId !== userId) {
    return { ok: false, error: "Ikke din tegning", status: 403 };
  }

  const parsed = drawingInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: firstIssue(parsed.error), status: 400 };
  }

  await db
    .update(drawings)
    .set({
      title: parsed.data.title,
      width: parsed.data.width,
      height: parsed.data.height,
      pixels: serializePixels(parsed.data.pixels),
      updatedAt: new Date(),
    })
    .where(eq(drawings.id, id));

  return { ok: true, data: null };
}

export async function deleteDrawing(
  db: DB,
  userId: string,
  id: string,
  isAdmin = false
): Promise<Result<null>> {
  const existing = await db.query.drawings.findFirst({ where: { id } });
  if (!existing) {
    return { ok: false, error: "Tegningen finnes ikke", status: 404 };
  }
  if (existing.userId !== userId && !isAdmin) {
    return { ok: false, error: "Ikke din tegning", status: 403 };
  }

  await db.delete(drawings).where(eq(drawings.id, id));

  return { ok: true, data: null };
}
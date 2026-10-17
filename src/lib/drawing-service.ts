import { eq } from "drizzle-orm";

import type { DB } from "@/db";
import { drawings } from "@/db/schema";
import { drawingInputSchema, type DrawingInput } from "@/lib/drawing-validation";
import { serializePixels, deserializePixels } from "@/lib/drawing-pixels";
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

/** Tegningen slik API-et viser den utad. Pikslene er pakket ut av JSON. */
export type DrawingView = {
  id: string;
  userId: string;
  title: string;
  width: number;
  height: number;
  pixels: DrawingInput["pixels"];
  isPublic: boolean;
  allowRemix: boolean;
  remixOfId: string | null;
  createdAt: Date;
  updatedAt: Date;
};

/** Gjør en databaserad om til utadrettet form ved å pakke ut pikslene. */
function toDrawingView(row: typeof drawings.$inferSelect): DrawingView {
  return { ...row, pixels: deserializePixels(row.pixels) };
}

/**
 * Henter én tegning.
 *
 * Offentlige tegninger er åpne for alle, også gjester. Private er bare for
 * eieren, og svaret er 404 og ikke 403, så ingen får vite at en privat
 * tegning finnes.
 */
export async function getDrawing(
  db: DB,
  id: string,
  userId: string | null
): Promise<Result<DrawingView>> {
  const row = await db.query.drawings.findFirst({ where: { id } });

  if (!row || (!row.isPublic && row.userId !== userId)) {
    return { ok: false, error: "Tegningen finnes ikke", status: 404 };
  }

 return { ok: true, data: toDrawingView(row) };
}

/**
 * Henter alle tegningene til én bruker, nyeste først.
 *
 * Brukes på profilsiden, der eieren skal se både private og offentlige.
 */
export async function listMyDrawings(
  db: DB,
  userId: string
): Promise<Result<DrawingView[]>> {
  const rows = await db.query.drawings.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  return { ok: true, data: rows.map(toDrawingView) };
}
/*
 * Henter offentlige tegninger til feeden, nyeste først.
 *
 * Ingen innlogging kreves. `limit` holder svaret lite når det blir mange
 * tegninger.
 */
export async function listPublicDrawings(
  db: DB,
  limit = 20
): Promise<Result<DrawingView[]>> {
  const rows = await db.query.drawings.findMany({
    where: { isPublic: true },
    orderBy: { createdAt: "desc" },
    limit,
  });

  return { ok: true, data: rows.map(toDrawingView) };
}
export async function listUserDrawings(
  db: DB,
  profileUserId: string,
  viewerUserId: string | null
): Promise<Result<DrawingView[]>> {
  const isOwner = profileUserId === viewerUserId;

  const rows = await db.query.drawings.findMany({
    where: isOwner
      ? { userId: profileUserId }
      : { userId: profileUserId, isPublic: true },
    orderBy: { createdAt: "desc" },
  });

  return { ok: true, data: rows.map(toDrawingView) };
}
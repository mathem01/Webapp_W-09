"use server";

import { ErrorResponse } from "rwsdk/worker";

import { db } from "@/db";
import { requireUser } from "@/middleware/guards";
import * as service from "@/lib/drawing-service";

/** Henter innlogget bruker, og smalner typen slik at userId er en string. */
function currentUser() {
  const session = requireUser();
  if (!session.userId) throw new ErrorResponse(401, "Login required");
  return { id: session.userId, isAdmin: session.role === "admin" };
}

export async function createDrawing(input: unknown) {
  const user = currentUser();
  return service.createDrawing(db, user.id, input);
}

export async function updateDrawing(id: string, input: unknown) {
  const user = currentUser();
  return service.updateDrawing(db, user.id, id, input);
}

export async function deleteDrawing(id: string) {
  const user = currentUser();
  return service.deleteDrawing(db, user.id, id, user.isAdmin);
}

export async function publishDrawing(id: string) {
  const user = currentUser();
  return service.publishDrawing(db, user.id, id);
}

export async function unpublishDrawing(id: string) {
  const user = currentUser();
  return service.unpublishDrawing(db, user.id, id);
}
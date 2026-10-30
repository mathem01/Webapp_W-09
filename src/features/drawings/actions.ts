"use server";

import { ErrorResponse } from "rwsdk/worker";

import { requireUser } from "@/middleware/guards";
import { service } from "@/features/drawings/drawing-service";

/** Henter innlogget bruker, og smalner typen slik at userId er en string. */
function currentUser() {
  const session = requireUser();
  if (!session.userId) throw new ErrorResponse(401, "Login required");
  return { id: session.userId, isAdmin: session.role === "admin" };
}

export async function createDrawing(input: unknown) {
  const user = currentUser();
  return service.createDrawing(user.id, input);
}

export async function updateDrawing(id: string, input: unknown) {
  const user = currentUser();
  return service.updateDrawing(id, user.id, input);
}

export async function deleteDrawing(id: string) {
  const user = currentUser();
  return service.deleteDrawing(id, user.id);
}

export async function publishDrawing(id: string) {
  const user = currentUser();
  return service.setDrawingVisibility(id, user.id, {isPublic:true});
}

export async function unpublishDrawing(id: string) {
  const user = currentUser();
  return service.setDrawingVisibility(id, user.id, {isPublic:false});
}
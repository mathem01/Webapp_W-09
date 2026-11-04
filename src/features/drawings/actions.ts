"use server";

import { ErrorResponse, requestInfo } from "rwsdk/worker";

import { requireUser } from "@/middleware/guards";
import { service } from "@/features/drawings/drawing-service";
import { Errors, ServerResult, ResultError, ResultHandler, ServerResultHandler } from "@/lib/result";
import { DrawingInput } from "./drawing-schema";
import { demoDelay } from "@/lib/demo-chaos";

export type SaveDrawingState = {
  id: string | null;
  savedRevision: number;
  failedRevision: number | null;
}

export type SaveDrawingData = {
  drawing: DrawingInput;
  revision: number;
}

export type SaveDrawingResult = ServerResult<SaveDrawingState, SaveDrawingState>

export async function saveDrawingAction(
  prevState: SaveDrawingResult,
  payload: SaveDrawingData,
): Promise<SaveDrawingResult> {
  const previous = prevState.ok ? prevState.data : prevState.state

  const session = requireUser();

  if (!session.userId) {
    return ServerResultHandler.failure(
      "Du må være logget inn",
      Errors.UNAUTHORIZED,
      previous
    );
  }

  const { request } = requestInfo;
  await demoDelay(request, 1200);

  const { drawing, revision } = payload;

  if (previous.id !== null) {
    const result = await service.updateDrawing(
      previous.id,
      session.userId,
      drawing,
    );

    if (!result.ok) {
      const { message, code, fieldErrors } = result.error

      return ServerResultHandler.failure(
        message,
        code,
        {
          ...previous,
          failedRevision: payload.revision
        },
        fieldErrors
      )
    }

    return ServerResultHandler.success({
      id: previous.id,
      savedRevision: revision,
      failedRevision: null,
    })
  }

  const result = await service.createDrawing(
    session.userId,
    drawing,
  );

  if (!result.ok) {
    return ServerResultHandler.failure(
      result.error.message,
      result.error.code,
      {
          ...previous,
          failedRevision: payload.revision
        },
      result.error.fieldErrors,
    );
  }

  return ServerResultHandler.success({
    id: result.data.id,
    savedRevision: revision,
    failedRevision: null,
  });
}

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
  return service.setDrawingVisibility(id, user.id, true);
}

export async function unpublishDrawing(id: string) {
  const user = currentUser();
  return service.setDrawingVisibility(id, user.id, false);
}
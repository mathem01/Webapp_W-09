"use server";

import { ErrorResponse, requestInfo } from "rwsdk/worker";


import { requireUser } from "@/middleware/guards";
import { service } from "@/features/drawings/drawing-service";
import { Errors, ServerResult, ServerResultHandler } from "@/lib/result";
import { createDrawingFormSchema, type DrawingInput, visibilityFormSchema } from "./drawing-schema";
import { demoDelay } from "@/lib/demo-chaos";
import { createEmptyPixels } from "./utils/pixels";

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

  const result = await service.createDrawing(session.userId, drawing);

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

export type CreateDrawingFormValues = {
  title: string;
  width: number;
  height: number;
};

export type CreateDrawingResult = ServerResult<{ id: string | null }, CreateDrawingFormValues>

export async function createDrawingFromForm(
  previousState: CreateDrawingResult,
  formData: FormData
): Promise<CreateDrawingResult> {
  const values: CreateDrawingFormValues = {
    title: String(formData.get("title") ?? " "),
    width: Number(formData.get("width") ?? 0),
    height: Number(formData.get("height") ?? 0),
  }

  const session = requireUser();

  if (!session.userId) {
    return ServerResultHandler.failure(
      "Du må være logget inn",
      Errors.UNAUTHORIZED,
      values
    );
  }

  const { title, width, height } = values;
  const result = await service.createDrawing(session.userId, {
    title,
    width,
    height,
    pixels: createEmptyPixels(width, height),
  });

  if (!result.ok) {
    return ServerResultHandler.failure(
      result.error.message,
      result.error.code,
      values,
      result.error.fieldErrors,
    )
  }

  return ServerResultHandler.success(result.data)
}

// export async function deleteDrawing(id: string) {
//   const user = requireUser();
//   return service.deleteDrawing(id, user.id);
// }

export type ChangeVisiblityFormValues = {
  id: string;
  visibility: boolean;
};

export type ChangeVisibilityResult = ServerResult<{ visibility: boolean }, ChangeVisiblityFormValues>

export async function changeVisibility(
  previousState: ChangeVisibilityResult,
  formData: FormData
): Promise<ChangeVisibilityResult> {
  const values: ChangeVisiblityFormValues = {
    id: String(formData.get("drawingId") ?? " "),
    visibility: String(formData.get("isPublic")) === "true" ? true : false,
  }

  const session = requireUser();

  if (!session.userId) {
    return ServerResultHandler.failure(
      "Du må være logget inn",
      Errors.UNAUTHORIZED,
      values
    );
  }

  const { id, visibility } = values

  const result = await service.setDrawingVisibility(id, session.userId, { isPublic: visibility });

  if (!result.ok) {
    return ServerResultHandler.failure(
      result.error.message,
      result.error.code,
      values,
      result.error.fieldErrors,
    )
  }

  return ServerResultHandler.success({ visibility })
}


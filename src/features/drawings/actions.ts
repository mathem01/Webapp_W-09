"use server";

import { ErrorResponse } from "rwsdk/worker";
import { z } from "zod";

import { requireUser } from "@/middleware/guards";
import { service } from "@/features/drawings/drawing-instances";

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

export async function setDrawingVisibility(drawingId: string, isPublic: boolean) {
  const user = currentUser();
  return service.setDrawingVisibility(drawingId, user.id, { isPublic });
}

type VisibilityState = {
  visibility: boolean;
  error: string | null;
};

const visibilityFormSchema = z.object({
  drawingId: z.string().min(1),
  isPublic: z.enum(["true", "false"]),
});

export async function changeVisibility(
  previousState: VisibilityState,
  formData: FormData
): Promise<VisibilityState> {
  try {
    const user = currentUser();
    const parsed = visibilityFormSchema.safeParse({
      drawingId: formData.get("drawingId"),
      isPublic: formData.get("isPublic"),
    });

    if (!parsed.success) {
      return { visibility: previousState.visibility, error: "Ugyldige skjemadata." };
    }

    const isPublic = parsed.data.isPublic === "true";
    const result = await service.setDrawingVisibility(
      parsed.data.drawingId,
      user.id,
      { isPublic }
    );

    if (!result.ok) {
      return { visibility: previousState.visibility, error: result.error.message };
    }

    return { visibility: isPublic, error: null };
  } catch {
    return {
      visibility: previousState.visibility,
      error: "Kunne ikke lagre endringen. Prøv igjen.",
    };
  }
}

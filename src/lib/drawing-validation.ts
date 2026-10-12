import {z} from "zod";


export const MIN_SIZE = 10;
export const MAX_SIZE = 500;
export const MAX_TITLE_LENGTH = 100;

const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export const drawingInputSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Tittelen kan ikke være tom")
      .max(MAX_TITLE_LENGTH, `Tittelen kan være maks ${MAX_TITLE_LENGTH} tegn`),

    width: z.number().int().min(MIN_SIZE).max(MAX_SIZE),
    height: z.number().int().min(MIN_SIZE).max(MAX_SIZE),

    // Én farge per piksel, radvis. null betyr gjennomsiktig.
    pixels: z.array(z.string().regex(HEX_COLOR).nullable()),
  })
  .refine((d) => d.pixels.length === d.width * d.height, {
    message: "Antall piksler stemmer ikke med bredde ganger høyde",
    path: ["pixels"],
  });

export type DrawingInput = z.infer<typeof drawingInputSchema>;
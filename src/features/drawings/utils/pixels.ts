import type { DrawingInput } from "@/features/drawings/drawing-schema";
/**
 * Pikslene lagres som JSON-tekst i databasen. Disse to funksjonene er det
 * eneste stedet formatet er kjent, så det kan byttes til noe mer kompakt
 * uten at resten av koden endres.
 */

export function serializePixels (pixels: DrawingInput["pixels"]): string {
    return JSON.stringify(pixels);
}
export function deserializePixels (stored: string): DrawingInput["pixels"] {
    return JSON.parse(stored);
}
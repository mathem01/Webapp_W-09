// Enhetstest av rene funksjoner. Ingen DOM og ingen database, så den kjører i
// node-miljøet, som er standard i vitest.config.ts.
import { describe, it, expect } from "vitest";
import {
  drawingInputSchema,
  MIN_SIZE,
  MAX_SIZE,
  MAX_TITLE_LENGTH,
} from "@/lib/drawing-validation";

// Bygger en gyldig tegning med riktig antall piksler, så hver test bare
// trenger å endre det ene den handler om.
function drawing(width = 10, height = 10, overrides = {}) {
  return {
    title: "Min tegning",
    width,
    height,
    pixels: Array(width * height).fill("#ffffff"),
    ...overrides,
  };
}

// Hvilke felter feilet? Gjør at testene kan sjekke HVORFOR noe ble avvist,
// ikke bare at det ble avvist.
function paths(result: ReturnType<typeof drawingInputSchema.safeParse>) {
  return result.success ? [] : result.error.issues.map((i) => i.path.join("."));
}

describe("tittel", () => {
  it("godtar en gyldig tegning", () => {
    expect(drawingInputSchema.safeParse(drawing()).success).toBe(true);
  });

  it("avviser tom tittel", () => {
    const result = drawingInputSchema.safeParse(drawing(10, 10, { title: "" }));

    expect(result.success).toBe(false);
    expect(paths(result)).toContain("title");
  });

  it("avviser tittel som bare er mellomrom", () => {
    const result = drawingInputSchema.safeParse(
      drawing(10, 10, { title: "   " })
    );

    expect(paths(result)).toContain("title");
  });

  it("avviser for lang tittel", () => {
    const result = drawingInputSchema.safeParse(
      drawing(10, 10, { title: "a".repeat(MAX_TITLE_LENGTH + 1) })
    );

    expect(paths(result)).toContain("title");
  });
});

describe("størrelse", () => {
  it("godtar minste lovlige lerret", () => {
    const result = drawingInputSchema.safeParse(drawing(MIN_SIZE, MIN_SIZE));

    expect(result.success).toBe(true);
  });

  it("godtar ulik bredde og høyde", () => {
    const result = drawingInputSchema.safeParse(drawing(10, 20));

    expect(result.success).toBe(true);
  });

  it("avviser bredde under minimum", () => {
    const result = drawingInputSchema.safeParse(
      drawing(10, 10, { width: MIN_SIZE - 1 })
    );

    expect(paths(result)).toContain("width");
  });

  it("avviser høyde over maksimum", () => {
    const result = drawingInputSchema.safeParse(
      drawing(10, 10, { height: MAX_SIZE + 1 })
    );

    expect(paths(result)).toContain("height");
  });

  it("avviser desimaltall", () => {
    const result = drawingInputSchema.safeParse(
      drawing(10, 10, { width: 10.5 })
    );

    expect(paths(result)).toContain("width");
  });
});

describe("piksler", () => {
  it("avviser for få piksler", () => {
    const result = drawingInputSchema.safeParse(
      drawing(10, 10, { pixels: Array(50).fill("#ffffff") })
    );

    expect(paths(result)).toContain("pixels");
  });

  it("avviser for mange piksler", () => {
    const result = drawingInputSchema.safeParse(
      drawing(10, 10, { pixels: Array(200).fill("#ffffff") })
    );

    expect(paths(result)).toContain("pixels");
  });

  it("godtar null som gjennomsiktig piksel", () => {
    const pixels = Array(100).fill("#ffffff");
    pixels[0] = null;

    const result = drawingInputSchema.safeParse(drawing(10, 10, { pixels }));

    expect(result.success).toBe(true);
  });

  it("godtar store bokstaver i hex", () => {
    const result = drawingInputSchema.safeParse(
      drawing(10, 10, { pixels: Array(100).fill("#FF00AA") })
    );

    expect(result.success).toBe(true);
  });

  it("avviser ugyldig fargekode", () => {
    const result = drawingInputSchema.safeParse(
      drawing(10, 10, { pixels: Array(100).fill("blå") })
    );

    expect(paths(result)).toContain("pixels.0");
  });

  it("avviser hex uten firkanttegn", () => {
    const result = drawingInputSchema.safeParse(
      drawing(10, 10, { pixels: Array(100).fill("ffffff") })
    );

    expect(result.success).toBe(false);
  });
});
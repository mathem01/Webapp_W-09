import { describe, expect, it } from "vitest";
import {
    serializePixels,
    deserializePixels,
    getPixelIndex,
    createEmptyPixels,
    isInsideArea,
    getLinePixels,
    floodFill,
} from "../../utils/pixels";


describe("serializePixels and deserializePixels", () => {
    it("serializes pixel data to JSON", () => {
        const pixels = ["#ff0000", null, "#0000ff"];

        expect(serializePixels(pixels)).toBe(
            '["#ff0000",null,"#0000ff"]'
        );
    });

    it("deserializes JSON into pixel data", () => {
        const stored = '["#ff0000",null,"#0000ff"]';

        expect(deserializePixels(stored)).toEqual([
            "#ff0000",
            null,
            "#0000ff",
        ]);
    });

    it("preserves pixel data through serialization and deserialization", () => {
        const pixels = [null, "#ffffff", "#000000", null];

        expect(deserializePixels(serializePixels(pixels))).toEqual(
            pixels
        );
    });

    it("throws an error for invalid JSON", () => {
        expect(() => deserializePixels("invalid JSON")).toThrow();
    });
});

describe("getPixelIndex", () => {
    it.each([
        { x: 0, y: 0, width: 4, expected: 0 },
        { x: 3, y: 0, width: 4, expected: 3 },
        { x: 0, y: 2, width: 4, expected: 8 },
        { x: 2, y: 2, width: 4, expected: 10 },
    ])(
        "returns $expected for ($x, $y) with width $width",
        ({ x, y, width, expected }) => {
            expect(getPixelIndex(x, y, width)).toBe(expected);
        }
    );
});

describe("createEmptyPixels", () => {
    it("creates a canvas with the correct number of pixels", () => {
        expect(createEmptyPixels(3, 2)).toEqual([
            null, null, null,
            null, null, null,
        ]);
    });

    it("returns an empty array for a canvas with zero width", () => {
        expect(createEmptyPixels(0, 5)).toEqual([]);
    });
});

describe("isInsideArea", () => {
    it.each([
        { x: 0, y: 0, expected: true },
        { x: 4, y: 4, expected: true },
        { x: -1, y: 0, expected: false },
        { x: 0, y: -1, expected: false },
        { x: 5, y: 0, expected: false },
        { x: 0, y: 5, expected: false },
    ])(
        "returns $expected for coordinates ($x, $y)",
        ({ x, y, expected }) => {
            expect(isInsideArea(x, y, 5, 5)).toBe(expected);
        }
    );
});

describe("getLinePixels", () => {
    it("returns a single point when start and end are the same", () => {
        expect(
            getLinePixels({ x: 2, y: 2 }, { x: 2, y: 2 })
        ).toEqual([{ x: 2, y: 2 }]);
    });

    it("returns the pixels in a horizontal line", () => {
        expect(
            getLinePixels({ x: 0, y: 1 }, { x: 3, y: 1 })
        ).toEqual([
            { x: 0, y: 1 },
            { x: 1, y: 1 },
            { x: 2, y: 1 },
            { x: 3, y: 1 },
        ]);
    });

    it("returns the pixels in a vertical line", () => {
        expect(
            getLinePixels({ x: 1, y: 0 }, { x: 1, y: 3 })
        ).toEqual([
            { x: 1, y: 0 },
            { x: 1, y: 1 },
            { x: 1, y: 2 },
            { x: 1, y: 3 },
        ]);
    });

    it("returns the pixels in a diagonal line", () => {
        expect(
            getLinePixels({ x: 0, y: 0 }, { x: 3, y: 3 })
        ).toEqual([
            { x: 0, y: 0 },
            { x: 1, y: 1 },
            { x: 2, y: 2 },
            { x: 3, y: 3 },
        ]);
    });

    it("supports lines drawn in reverse direction", () => {
        expect(
            getLinePixels({ x: 3, y: 0 }, { x: 0, y: 0 })
        ).toEqual([
            { x: 3, y: 0 },
            { x: 2, y: 0 },
            { x: 1, y: 0 },
            { x: 0, y: 0 },
        ]);
    });
});

describe("floodFill", () => {
    it("finds all connected pixels with the same color", () => {
        const pixels = [
            "red", "red", "blue",
            "red", "blue", "blue",
            "blue", "blue", "red",
        ];

        const result = floodFill(
            pixels, 3, 3, { x: 0, y: 0 }, "green"
        );

        expect(result.sort((a, b) => a - b)).toEqual([0, 1, 3]);
    });

    it("returns an empty array when the color is already the same", () => {
        const pixels = ["red", "red", "blue", "blue"];

        expect(
            floodFill(pixels, 2, 2, { x: 0, y: 0 }, "red")
        ).toEqual([]);
    });

    it("returns an empty array when the starting point is outside the canvas", () => {
        const pixels = [null, null, null, null];

        expect(
            floodFill(pixels, 2, 2, { x: -1, y: 0 }, "red")
        ).toEqual([]);
    });

    it("fills the entire canvas when all pixels have the same color", () => {
        const pixels = createEmptyPixels(2, 2);

        const result = floodFill(
            pixels, 2, 2, { x: 0, y: 0 }, "red"
        );

        expect(result.sort((a, b) => a - b)).toEqual([
            0, 1, 2, 3,
        ]);
    });

    it("does not modify the original pixel array", () => {
        const pixels = ["red", "red", "blue", "blue"];
        const original = [...pixels];

        floodFill(pixels, 2, 2, { x: 0, y: 0 }, "green");

        expect(pixels).toEqual(original);
    });

    it("does not treat diagonal pixels as connected", () => {
        const pixels = [
            "red", "blue",
            "blue", "red",
        ];

        expect(
            floodFill(pixels, 2, 2, { x: 0, y: 0 }, "green")
        ).toEqual([0]);
    });
});

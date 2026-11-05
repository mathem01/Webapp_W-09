import { describe, expect, it } from "vitest";
import { DRAWING_TOOLS } from "../../utils/drawing-tools";


describe("DRAWING_TOOLS", () => {
    it("contains all five drawing tools", () => {
        expect(DRAWING_TOOLS.map((tool) => tool.id)).toEqual([
            "pencil",
            "eraser",
            "fill",
            "colorpicker",
            "pan",
        ]);
    });

    it("has a descriptive label for each tool", () => {
        for (const tool of DRAWING_TOOLS) {
            expect(tool.label.trim().length).toBeGreaterThan(0);
        }
    });

    it("has unique tool IDs", () => {
        const ids = DRAWING_TOOLS.map((tool) => tool.id);

        expect(new Set(ids).size).toBe(ids.length);
    });
});

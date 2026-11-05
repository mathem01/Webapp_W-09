// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import type { DrawingView } from "../drawing-types";
import { DrawingGrid } from "../components/DrawingGrid";

vi.mock("../components/PixelPreview", () => ({
  PixelPreview: ({width, height}: {
    width: number;
    height: number;
  }) => (<div data-testid="pixel-preview" data-width={width} data-height={height} />),
}));

vi.mock("../components/DrawingOptions", () => ({
  DrawingOptions: ({drawingId, title, isPublic}: {
    drawingId: string;
    title: string;
    isPublic: boolean;
  }) => (
    <div data-testid="drawing-options" data-drawing-id={drawingId} data-is-public={String(isPublic)}>
      {title}
    </div>
  ),
}));

const drawings: DrawingView[] = [
  {
    id: "drawing-1",
    userId: "user-1",
    title: "First drawing",
    width: 2,
    height: 2,
    pixels: [null, null, null, null],
    isPublic: true,
    allowRemix: false,
    remixOfId: null,
    createdAt: new Date("2026-01-01"),
    updatedAt: new Date("2026-01-01"),
  },
  {
    id: "drawing-2",
    userId: "user-1",
    title: "Second drawing",
    width: 3,
    height: 3,
    pixels: Array(9).fill(null),
    isPublic: false,
    allowRemix: false,
    remixOfId: null,
    createdAt: new Date("2026-01-02"),
    updatedAt: new Date("2026-01-02"),
  },
];

describe("DrawingGrid", () => {
  it("displays the default message when there are no drawings", () => {
    render(<DrawingGrid drawings={[]} />);

    expect(screen.getByText("Ingen tegninger ennå.")).toBeInTheDocument();
  });

  it("displays a custom message when there are no drawings", () => {
    render(<DrawingGrid drawings={[]} emptyText="No drawings found." />);

    expect(screen.getByText("No drawings found.")).toBeInTheDocument();
  });

  it("renders all drawings", () => {
    render(<DrawingGrid drawings={drawings} />);

    const list = screen.getByRole("list");
    const items = within(list).getAllByRole("listitem");

    expect(items).toHaveLength(2);
    expect(screen.getByText("First drawing")).toBeInTheDocument();
    expect(screen.getByText("Second drawing")).toBeInTheDocument();
  });

  it("renders a pixel preview for each drawing", () => {
    render(<DrawingGrid drawings={drawings} />);

    const previews = screen.getAllByTestId("pixel-preview");

    expect(previews).toHaveLength(2);

    expect(previews[0]).toHaveAttribute("data-width", "2");
    expect(previews[0]).toHaveAttribute("data-height", "2");

    expect(previews[1]).toHaveAttribute("data-width", "3");
    expect(previews[1]).toHaveAttribute("data-height", "3");
  });

  it("renders drawing titles as plain text when not editable", () => {
    render(<DrawingGrid drawings={drawings} />);

    expect(screen.getByText("First drawing")).toBeInTheDocument();
    expect(screen.getByText("Second drawing")).toBeInTheDocument();

    expect(screen.queryByRole("link")).not.toBeInTheDocument();
    expect(screen.queryByTestId("drawing-options")).not.toBeInTheDocument();
  });

  it("renders drawing options when editable", () => {
    render(<DrawingGrid drawings={drawings} editable />);

    const options = screen.getAllByTestId("drawing-options");

    expect(options).toHaveLength(2);

    expect(options[0]).toHaveAttribute("data-drawing-id", "drawing-1");
    expect(options[0]).toHaveAttribute("data-is-public", "true");

    expect(options[1]).toHaveAttribute("data-drawing-id", "drawing-2");
    expect(options[1]).toHaveAttribute("data-is-public", "false");
  });

  it("does not render drawing options when not editable", () => {
    render(<DrawingGrid drawings={drawings} />);

    expect(screen.queryByTestId("drawing-options")).not.toBeInTheDocument();
  });

  it("does not render drawing options for an empty list", () => {
    render(<DrawingGrid drawings={[]} editable />);

    expect(screen.queryByTestId("drawing-options")).not.toBeInTheDocument();
    expect(screen.queryByRole("list")).not.toBeInTheDocument();
  });
});

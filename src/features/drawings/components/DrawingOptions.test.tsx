// @vitest-environment happy-dom
import { beforeEach, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DrawingOptions } from "./DrawingOptions";

const mocks = vi.hoisted(() => ({
  changeVisibility: vi.fn(),
}));

vi.mock("@/features/drawings/actions", () => ({
  changeVisibility: mocks.changeVisibility,
}));

vi.mock("@/features/drawings/components/DeleteDrawing", () => ({
  DeleteDrawing: ({ drawingId }: { drawingId: string }) => (
    <button type="button" aria-label={`Slett tegning ${drawingId}`}>
      🗑️ Slett tegning
    </button>
  ),
}));

beforeEach(() => {
  mocks.changeVisibility.mockReset();
  mocks.changeVisibility.mockImplementation(
    async (_previousState: unknown, formData: FormData) => ({
      ok: true,
      data: {
        visibility: formData.get("isPublic") === "true",
      },
    }),
  );
});

it("åpner valgmenyen og viser tegningens nåværende status", async () => {
  const user = userEvent.setup();
  render(
    <DrawingOptions
      drawingId="drawing-123"
      title="Min tegning"
      isPublic={false}
    />,
  );

  const toggle = screen.getByRole("button", {
    name: "Valg for Min tegning",
  });

  expect(toggle).toHaveAttribute("aria-expanded", "false");
  expect(screen.getByText("Privat", { selector: "p" })).toBeInTheDocument();

  await user.click(toggle);

  expect(toggle).toHaveAttribute("aria-expanded", "true");
  expect(screen.getByRole("button", { name: "Privat" })).toHaveAttribute(
    "aria-pressed",
    "true",
  );
  expect(
    screen.getByRole("button", { name: "Slett tegning drawing-123" }),
  ).toBeInTheDocument();
});

it("sender riktig tegnings-id og offentlig status til server actionen", async () => {
  const user = userEvent.setup();
  render(
    <DrawingOptions
      drawingId="drawing-123"
      title="Min tegning"
      isPublic={false}
    />,
  );

  await user.click(
    screen.getByRole("button", { name: "Valg for Min tegning" }),
  );
  await user.click(screen.getByRole("button", { name: "Offentlig" }));

  await waitFor(() => {
    expect(mocks.changeVisibility).toHaveBeenCalledTimes(1);
  });

  const formData = mocks.changeVisibility.mock.calls[0][1] as FormData;
  expect(formData.get("drawingId")).toBe("drawing-123");
  expect(formData.get("isPublic")).toBe("true");

  await waitFor(() => {
    expect(screen.getByRole("button", { name: "Offentlig" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
});

it("sender false når en offentlig tegning gjøres privat", async () => {
  const user = userEvent.setup();
  render(
    <DrawingOptions
      drawingId="drawing-456"
      title="Offentlig tegning"
      isPublic
    />,
  );

  await user.click(
    screen.getByRole("button", { name: "Valg for Offentlig tegning" }),
  );
  await user.click(screen.getByRole("button", { name: "Privat" }));

  await waitFor(() => {
    expect(mocks.changeVisibility).toHaveBeenCalledTimes(1);
  });

  const formData = mocks.changeVisibility.mock.calls[0][1] as FormData;
  expect(formData.get("drawingId")).toBe("drawing-456");
  expect(formData.get("isPublic")).toBe("false");
});

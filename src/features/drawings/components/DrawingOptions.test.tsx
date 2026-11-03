// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DrawingOptions } from "./DrawingOptions";

afterEach(() => vi.unstubAllGlobals());

it("sender true for Offentlig og false for Privat", async () => {
  const fetchMock = vi.fn().mockImplementation(async () => Response.json({ ok: true }));
  vi.stubGlobal("fetch", fetchMock);
  const user = userEvent.setup();
  render(<DrawingOptions drawingId="drawing-123" title="Min tegning" isPublic={false} />);
  await user.click(screen.getByRole("button", { name: "Valg for Min tegning" }));
  await user.click(screen.getByRole("button", { name: "Offentlig" }));
  expect(fetchMock).toHaveBeenLastCalledWith("/api/v1/drawings/drawing-123/visibility", {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublic: true }),
  });
  expect(screen.getByRole("button", { name: "Offentlig" })).toHaveAttribute("aria-pressed", "true");
  await user.click(screen.getByRole("button", { name: "Privat" }));
  expect(fetchMock.mock.calls[1][1].body).toBe(JSON.stringify({ isPublic: false }));
  expect(screen.getByRole("button", { name: "Privat" })).toHaveAttribute("aria-pressed", "true");
});

it.each([
  [401, "Du må logge inn igjen"],
  [500, "Kunne ikke endre synligheten"],
])("beholder status og lar brukeren prøve igjen ved HTTP %s", async (status, message) => {
  vi.stubGlobal("fetch", vi.fn().mockImplementation(async () => new Response(null, { status })));
  const user = userEvent.setup();
  render(<DrawingOptions drawingId="one" title="Hjerte" isPublic={false} />);
  await user.click(screen.getByRole("button", { name: "Valg for Hjerte" }));
  await user.click(screen.getByRole("button", { name: "Offentlig" }));
  expect(screen.getByRole("alert")).toHaveTextContent(message);
  expect(screen.getByRole("button", { name: "Privat" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Offentlig" })).toBeEnabled();
});

it("viser nettverksfeil og lukker menyen med Escape", async () => {
  vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Offline")));
  const user = userEvent.setup();
  render(<DrawingOptions drawingId="one" title="Hjerte" isPublic={false} />);
  const menu = screen.getByRole("button", { name: "Valg for Hjerte" });
  await user.click(menu);
  await user.click(screen.getByRole("button", { name: "Offentlig" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Kunne ikke kontakte serveren");
  await user.keyboard("{Escape}");
  expect(menu).toHaveAttribute("aria-expanded", "false");
  expect(menu).toHaveFocus();
});

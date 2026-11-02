// @vitest-environment happy-dom
import { afterEach, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DrawingOptions } from "./DrawingOptions";

afterEach(() => vi.unstubAllGlobals());

it("lagrer offentlig og privat med riktig id og oppdaterer valgt status", async () => {
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
  expect(fetchMock).toHaveBeenLastCalledWith("/api/v1/drawings/drawing-123/visibility", {
    method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ isPublic: false }),
  });
  expect(screen.getByRole("button", { name: "Privat" })).toHaveAttribute("aria-pressed", "true");
});

it("beholder privat status og viser feil når serveren avviser lagringen", async () => {
  vi.stubGlobal("fetch", vi.fn().mockResolvedValue(Response.json({ ok: false }, { status: 403 })));
  const user = userEvent.setup();
  render(<DrawingOptions drawingId="private" title="Privat tegning" isPublic={false} />);
  await user.click(screen.getByRole("button", { name: "Valg for Privat tegning" }));
  await user.click(screen.getByRole("button", { name: "Offentlig" }));
  expect(screen.getByRole("alert")).toHaveTextContent("Kunne ikke endre synligheten");
  expect(screen.getByRole("button", { name: "Privat" })).toHaveAttribute("aria-pressed", "true");
  expect(screen.getByRole("button", { name: "Offentlig" })).toBeEnabled();
});

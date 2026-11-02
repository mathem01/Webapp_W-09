// @vitest-environment happy-dom
import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ProfileDrawings } from "./ProfileDrawings";

it("viser tom offentlig profil uten redigeringsvalg", () => {
  render(<ProfileDrawings result={{ ok: true, data: [] }} />);
  expect(screen.getByText("Ingen offentlige tegninger ennå")).toBeInTheDocument();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

it("viser publiserte tegninger uten valg for å endre synlighet", () => {
  render(<ProfileDrawings result={{ ok: true, data: [{
    id: "public-drawing", userId: "artist", title: "Hjerte", width: 10, height: 10,
    pixels: Array(100).fill("#ffffff"), isPublic: true, allowRemix: true,
    remixOfId: null, createdAt: new Date(), updatedAt: new Date(),
  }] }} />);
  expect(screen.getByText("Hjerte")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Åpne" })).toHaveAttribute("href", "/drawing/public-drawing");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

it("skiller feil ved henting fra en tom profil", () => {
  render(<ProfileDrawings result={{ ok: false, error: { code: "INTERNAL_SERVER_ERROR", message: "Databasefeil" } }} />);
  expect(screen.getByRole("alert")).toHaveTextContent("Kunne ikke hente tegningene");
  expect(screen.queryByText("Ingen offentlige tegninger ennå")).not.toBeInTheDocument();
});

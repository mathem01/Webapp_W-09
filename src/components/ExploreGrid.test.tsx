// @vitest-environment happy-dom
import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ExploreGrid } from "./ExploreGrid";
import type { PublicDrawingView } from "@/features/drawings/drawing-types";

const drawing: PublicDrawingView = {
  id: "drawing-1", userId: "owner-1", title: "Mitt hjerte", width: 10, height: 10,
  pixels: Array(100).fill("#ff0000"), isPublic: true, allowRemix: true,
  remixOfId: null, createdAt: new Date(), updatedAt: new Date(),
  owner: { id: "owner-1", username: "lebron" },
};

it("viser tegningen og lenker avatar og brukernavn til eierens profil for gjester", () => {
  render(<ExploreGrid drawings={[drawing]} viewerUserId={null} />);
  expect(screen.getByRole("img", { name: "Mitt hjerte" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Se profilen til lebron" })).toHaveAttribute("href", "/profile/lebron");
  expect(screen.getByRole("link", { name: "@lebron" })).toHaveAttribute("href", "/profile/lebron");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();
});

it("sender en annen innlogget bruker til eierens offentlige profil", () => {
  render(<ExploreGrid drawings={[drawing]} viewerUserId="another-user" />);
  expect(screen.getByRole("link", { name: "Se profilen til lebron" })).toHaveAttribute("href", "/profile/lebron");
});

it("sender eieren til MyPage", () => {
  render(<ExploreGrid drawings={[drawing]} viewerUserId="owner-1" />);
  expect(screen.getByRole("link", { name: "Se profilen til lebron" })).toHaveAttribute("href", "/myPage");
  expect(screen.getByRole("link", { name: "@lebron" })).toHaveAttribute("href", "/myPage");
});

it("viser en tommelding når ingen tegninger er publisert", () => {
  render(<ExploreGrid drawings={[]} viewerUserId={null} />);
  expect(screen.getByText("Ingen offentlige tegninger ennå.")).toBeInTheDocument();
});

// @vitest-environment happy-dom
import { expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExploreGrid } from "../components/ExploreGrid";
import type { PublicDrawingView } from "@/features/drawings/drawing-types";

const drawing: PublicDrawingView = {
  id: "drawing-1", userId: "owner-1", title: "Mitt hjerte", width: 10, height: 10,
  pixels: Array(100).fill("#ff0000"), isPublic: true, allowRemix: true,
  remixOfId: null, createdAt: new Date(), updatedAt: new Date(),
  owner: { id: "owner-1", username: "lebron" },
};

it("viser tegningen, åpner detaljene og lenker til eierens profil", async () => {
  const user = userEvent.setup();
  render(<ExploreGrid drawings={[drawing]} viewerUserId={null} />);

  const openButton = screen.getByRole("button", { name: "Åpne Mitt hjerte" });
  expect(openButton).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Se profilen til lebron" })).toHaveAttribute("href", "/profile/lebron");
  expect(screen.getByRole("link", { name: "@lebron" })).toHaveAttribute("href", "/profile/lebron");
  expect(screen.queryByRole("textbox")).not.toBeInTheDocument();

  await user.click(openButton);

  expect(screen.getByRole("dialog", { name: "Mitt hjerte" })).toBeInTheDocument();
  expect(screen.getByRole("textbox", { name: "Skriv en kommentar" })).toBeEnabled();
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

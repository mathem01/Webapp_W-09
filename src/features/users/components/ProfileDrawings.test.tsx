// @vitest-environment happy-dom
import { beforeEach, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { service } from "@/features/drawings/drawing-service";
import { ProfileDrawings } from "./ProfileDrawings";

vi.mock("@/features/drawings/drawing-service", () => ({
  service: {
    listPublicDrawingsByUser: vi.fn(),
  },
}));

vi.mock("@/features/drawings/components/DrawingGrid", () => ({
  DrawingGrid: ({ drawings }: {
    drawings: Array<{ id: string; title: string }>;
  }) => (
    <ul>
      {drawings.map((drawing) => (
        <li key={drawing.id}>
          <span>{drawing.title}</span>
          <a href={`/drawing/${drawing.id}`}>Åpne</a>
        </li>
      ))}
    </ul>
  ),
}));

vi.mock("@/features/drawings/components/Pagination", () => ({
  Pagination: () => null,
}));

const listPublicDrawingsByUser = vi.mocked(
  service.listPublicDrawingsByUser,
);

beforeEach(() => {
  listPublicDrawingsByUser.mockReset();
});

it("viser tom offentlig profil uten redigeringsvalg", async () => {
  listPublicDrawingsByUser.mockResolvedValue({
    ok: true,
    data: {
      items: [],
      page: 1,
      limit: 12,
      total: 0,
      totalPages: 1,
    },
  });

  render(await ProfileDrawings({
    userId: "artist",
    page: 1,
    basePath: "/profile/artist",
  }));

  expect(screen.getByText("Ingen offentlige tegninger ennå")).toBeInTheDocument();
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

it("viser publiserte tegninger uten redigeringsvalg", async () => {
  listPublicDrawingsByUser.mockResolvedValue({
    ok: true,
    data: {
      items: [{
        id: "public-drawing",
        userId: "artist",
        title: "Hjerte",
        width: 10,
        height: 10,
        pixels: Array(100).fill("#ffffff"),
        isPublic: true,
        allowRemix: true,
        remixOfId: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }],
      page: 1,
      limit: 12,
      total: 1,
      totalPages: 1,
    },
  });

  render(await ProfileDrawings({
    userId: "artist",
    page: 1,
    basePath: "/profile/artist",
  }));

  expect(screen.getByText("Hjerte")).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Åpne" })).toHaveAttribute("href", "/drawing/public-drawing");
  expect(screen.queryByRole("button")).not.toBeInTheDocument();
});

it("skiller feil ved henting fra en tom profil", async () => {
  listPublicDrawingsByUser.mockResolvedValue({
    ok: false,
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Databasefeil",
    },
  });

  render(await ProfileDrawings({
    userId: "artist",
    page: 1,
    basePath: "/profile/artist",
  }));

  expect(screen.getByRole("alert")).toHaveTextContent("Kunne ikke hente tegningene");
  expect(screen.queryByText("Ingen offentlige tegninger ennå")).not.toBeInTheDocument();
});

import { DrawingInput } from "./drawing-schema";

export type DrawingView = {
  id: string;
  userId: string;
  title: string;
  width: number;
  height: number;
  pixels: DrawingInput["pixels"];
  isPublic: boolean;
  allowRemix: boolean;
  remixOfId: string | null;
  createdAt: Date;
  updatedAt: Date;
};
export type PublicDrawingView = DrawingView & {
  owner: { id: string; username: string };
};

/* Én side med resultater, pluss det siden trenger for å tegne
   neste og forrige. Generisk, så den kan brukes på både feeden og
   profilsidene uten å gjenta formen. */
export type Page<T> = {
  items: T[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export type PublicDrawingPage = Page<PublicDrawingView>;
export type DrawingPage = Page<DrawingView>;

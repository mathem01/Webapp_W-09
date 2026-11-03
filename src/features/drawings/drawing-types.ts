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

/* Én side med tegninger, pluss det siden trenger for å tegne
   neste og forrige. */
export type PublicDrawingPage = {
  items: PublicDrawingView[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

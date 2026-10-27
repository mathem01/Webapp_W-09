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
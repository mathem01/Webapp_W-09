import { route } from "rwsdk/router";
import { controller } from "./user-controller";

export const userRoutes = [
  route("/api/v1/users/:username", {
    get: controller.find,
  }),
];
import type { RequestInfo } from "rwsdk/worker";
import { ErrorHttpStatus } from "@/lib/result";
import {
  type UserService,
  service,
} from "./user-service";

export interface UserController {
  find(requestInfo: RequestInfo): Promise<Response>;
}

export function createUserController(_service: UserService): UserController {
  return {
    async find({ params, ctx }: RequestInfo) {
      const result = await _service.findByUsername(params.username);

      return Response.json(result, {
        status: result.ok
        ? 200
        : ErrorHttpStatus[result.error.code]
      })
    },
  };
}

export const controller = createUserController(service);
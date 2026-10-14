import { Errors, ResultHandler, type Result } from "@/lib/result";
import { toUserDTO, type UserDTO } from "./user-mapper";
import {
  type UserRepository,
  repository,
} from "./user-repository";

export interface UserService {
  findByUsername(username: string): Promise<Result<UserDTO>>;
}

export function createUserService(_repository: UserRepository): UserService {
  return {
    async findByUsername(username) {
        const normalizedUsername = username.trim()

        if (!normalizedUsername) {
            return ResultHandler.failure(
                "Ugyldig brukernavn",
                Errors.BAD_REQUEST,
                {
                    username: ["Brukernavn kan ikke være tomt"],
                }
            )
        }

      const result = await _repository.findByUsername(normalizedUsername)

      if (!result.ok) {
        return result
      }

      if (!result.data) {
        return ResultHandler.failure(
            "Brukeren finnes ikke",
            Errors.NOT_FOUND
        )
      }

      return ResultHandler.success(
        toUserDTO(result.data)
      )
    },
  }
}

export const service = createUserService(repository);
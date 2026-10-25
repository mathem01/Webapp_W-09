export type UserDTO = {
  id: string;
  name: string;
  username: string;
  image: string | null;
  createdAt: string;
};

type PublicUserRecord = {
  id: string;
  name: string;
  username: string;
  image: string | null;
  createdAt: Date;
};

export function toUserDTO(user: PublicUserRecord): UserDTO {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    image: user.image,
    createdAt: user.createdAt.toISOString(),
  };
}
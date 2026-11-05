interface Session {
  userId: string | null;
  isAuthenticated: boolean;
}

export const requestInfo: { ctx: { session: Session } } = {
  ctx: { session: { userId: null, isAuthenticated: false } },
};

export function setActor(user: { id: string }): void {
  requestInfo.ctx = { session: { userId: user.id, isAuthenticated: true } };
}
export function clearActor(): void {
  requestInfo.ctx = { session: { userId: null, isAuthenticated: false } };
}

export class ErrorResponse extends Error {
  constructor(
    public code: number,
    message: string,
  ) {
    super(message);
    this.name = "ErrorResponse";
  }
}
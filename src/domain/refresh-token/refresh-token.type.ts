export interface RefreshToken {
  uuid?: string;
  tokenHash: string;
  userId: number;
  expiresAt: Date;
  revokedAt: Date | null;
}

export type RefreshTokenWithId = Omit<RefreshToken, "uuid"> & { uuid: string };

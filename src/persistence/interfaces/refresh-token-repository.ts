import { RefreshTokenWithId } from "../../domain/refresh-token/refresh-token.type.js";
import { Result } from "../../tools/result2.js";

export interface IRefreshTokenRepository {
  createRefreshToken(
    tokenHash: string,
    userId: number,
    expiresAt: Date,
  ): Promise<Result<RefreshTokenWithId>>;
  updateRefreshToken(refreshToken: RefreshTokenWithId): Promise<Result<void>>;
  findRefreshTokenByHash(
    tokenHash: string,
  ): Promise<Result<RefreshTokenWithId | null>>;
}

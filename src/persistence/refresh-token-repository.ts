import { v4 as uuidv4 } from "uuid";

import { RefreshTokenWithId } from "../domain/refresh-token/refresh-token.type.js";
import { prisma } from "../tools/prisma.js";
import { Result, resultFailure, resultSuccess } from "../tools/result2.js";
import { IRefreshTokenRepository } from "./interfaces/refresh-token-repository.js";

const RefreshTokenRepository: IRefreshTokenRepository = {
  async createRefreshToken(
    tokenHash: string,
    userId: number,
    expiresAt: Date,
  ): Promise<Result<RefreshTokenWithId>> {
    let createdRefreshToken:
      | Awaited<ReturnType<typeof prisma.tokenRefresh.create>>
      | undefined;
    try {
      createdRefreshToken = await prisma.tokenRefresh.create({
        data: {
          id_tokenrefresh: uuidv4(),
          hash_token: new TextEncoder().encode(tokenHash),
          usuario_id: userId,
          expirado_em: expiresAt,
        },
      });
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      return resultFailure("Erro ao criar usuário");
    }
    const refreshTokenReturn = {
      uuid: createdRefreshToken.id_tokenrefresh,
      tokenHash: tokenHash,
      userId: createdRefreshToken.usuario_id,
      expiresAt: createdRefreshToken.expirado_em,
      revokedAt: createdRefreshToken.revogado_em,
    };
    return resultSuccess(refreshTokenReturn);
  },
};

export { RefreshTokenRepository };

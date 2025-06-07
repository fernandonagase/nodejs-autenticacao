import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { Result } from "../../tools/result.js";
import { IEmailConfirmationAuthority } from "../interfaces/email-confirmation-authority.js";
import { EmailConfirmation } from "./email-confirmation.type.js";

const JwtEmailConfirmationAuthority: IEmailConfirmationAuthority = {
  issueToken(userId: number, secret: string): Result<EmailConfirmation> {
    const payload = {
      sub: userId,
      jti: uuidv4(),
    };
    try {
      return Result.success({
        token: jwt.sign(payload, secret, { expiresIn: "1h" }),
        tokenId: payload.jti,
        userId: payload.sub,
      });
    } catch (error) {
      console.error("Erro ao gerar token de confirmação: ", error);
      return Result.failure("Erro ao gerar token de confirmação");
    }
  },
  validateToken(
    token: string,
    secret: string,
  ): Result<{ isValid: boolean; payload?: EmailConfirmation }> {
    let decoded: jwt.JwtPayload;
    try {
      decoded = jwt.verify(token, secret) as jwt.JwtPayload;
    } catch (error) {
      console.error("Erro ao validar token de confirmação: ", error);
      return Result.failure("Token de confirmação inválido");
    }
    if (decoded && decoded.jti && !isNaN(Number(decoded.sub))) {
      return Result.success({
        isValid: true,
        payload: {
          token,
          tokenId: decoded.jti,
          userId: Number(decoded.sub),
        },
      });
    }
    return Result.success({ isValid: false });
  },
};

export { JwtEmailConfirmationAuthority };

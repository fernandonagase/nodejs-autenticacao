import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

import { Result } from "../../tools/result.js";
import { IEmailConfirmationAuthority } from "../interfaces/email-confirmation-authority.js";
import { EmailConfirmation } from "./email-confirmation.type.js";

const JwtEmailConfirmationAuthority: IEmailConfirmationAuthority = {
  issue(email: string, secret: string): Result<EmailConfirmation> {
    const payload = {
      sub: email,
      jti: uuidv4(),
    };
    try {
      return Result.success({
        token: jwt.sign(payload, secret, { expiresIn: "1h" }),
        tokenId: payload.jti,
        email: payload.sub,
      });
    } catch (error) {
      console.error("Erro ao gerar token de confirmação: ", error);
      return Result.failure("Erro ao gerar token de confirmação");
    }
  },
  validate(
    token: string,
    secret: string,
  ): Result<{ isValid: boolean; payload?: EmailConfirmation }> {
    try {
      const decoded = jwt.verify(token, secret) as jwt.JwtPayload;
      if (decoded && decoded.sub && decoded.jti) {
        return Result.success({
          isValid: true,
          payload: {
            token,
            tokenId: decoded.jti,
            email: decoded.sub,
          },
        });
      }
      return Result.success({ isValid: false });
    } catch (error) {
      console.error("Erro ao validar token de confirmação: ", error);
      return Result.failure("Token de confirmação inválido");
    }
  },
};

export { JwtEmailConfirmationAuthority };

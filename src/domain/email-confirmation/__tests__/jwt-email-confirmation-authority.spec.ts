import { describe, expect, it } from "@jest/globals";
import jwt from "jsonwebtoken";

import { JwtEmailConfirmationAuthority } from "../jwt-email-confirmation-authority.js";

describe("JWT Email Confirmation Authority", () => {
  const { issueToken, validateToken } = JwtEmailConfirmationAuthority;

  const userId = 123;
  const secret = "mysecretkey-12345678-hello-jwt-testing";

  it("deve emitir um token de confirmação de e-mail ", () => {
    const result = issueToken(userId, secret);
    expect(result.ok).toBe(true);
    if (!result.data) {
      throw new Error("Token de confirmação não foi emitido");
    }
    const decoded = jwt.verify(result.data.token, secret) as jwt.JwtPayload;
    expect(decoded).toHaveProperty("jti");
    expect(decoded).toHaveProperty("sub", userId);
    expect(decoded).toHaveProperty("exp");
    expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
  });

  it("deve aprovar um token de confirmação de e-mail válido", () => {
    const issueResult = issueToken(userId, secret);
    if (!issueResult.ok || !issueResult.data) {
      throw new Error("Token de confirmação não foi emitido");
    }
    const validateResult = validateToken(issueResult.data.token, secret);
    expect(validateResult.ok).toBe(true);
    if (!validateResult.data) {
      throw new Error("Resposta de validação vazia");
    }
    expect(validateResult.data.isValid).toBe(true);
    expect(validateResult.data.payload).toEqual(issueResult.data);
  });

  it("deve rejeitar um token de confirmação de e-mail mal-formado", () => {
    const invalidToken = "invalid.token.here";
    const validateResult = validateToken(invalidToken, secret);
    expect(validateResult.ok).toBe(false);
    expect(validateResult.data).toBeUndefined();
    expect(typeof validateResult.error).toBe("string");
    expect((validateResult.error as string).length).toBeGreaterThan(0);
  });

  it("deve rejeitar um token de confirmação semanticamente inválido", () => {
    const tokenWithoutJti =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJqb2huQGV4YW1wbGUuY29tIn0.8s3vI0sVDXTyC0Elw4bS3dgJmAonSDuyoN5uoeS90ac";
    let validateResult = validateToken(tokenWithoutJti, secret);
    expect(validateResult.ok).toBe(true);
    expect(validateResult.data?.isValid).toBe(false);
    const tokenWithoutSub =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJlNWU3YzJiNi03YjNhLTRjMmUtOWIyYS0yZThlNWUyYzdhMWYifQ.2aV5YgHo-zaPcCWzW4GpHycrLG3NUUpCudLtaGLYldI";
    validateResult = validateToken(tokenWithoutSub, secret);
    expect(validateResult.ok).toBe(true);
    expect(validateResult.data?.isValid).toBe(false);
  });
});

import { describe, expect, it } from "@jest/globals";
import jwt from "jsonwebtoken";

import { JwtEmailConfirmationAuthority } from "../jwt-email-confirmation-authority.js";

describe("JWT Email Confirmation Authority", () => {
  const { issue } = JwtEmailConfirmationAuthority;

  const email = "john@example.com";
  const secret = "mysecretkey-12345678-hello-jwt-testing";

  it("deve emitir um token de confirmação de e-mail ", () => {
    const result = issue(email, secret);
    expect(result.ok).toBe(true);
    if (!result.data) {
      throw new Error("Token de confirmação não foi emitido");
    }
    const decoded = jwt.verify(result.data.token, secret) as jwt.JwtPayload;
    expect(decoded).toHaveProperty("jti");
    expect(decoded).toHaveProperty("sub", email);
    expect(decoded).toHaveProperty("exp");
    expect(decoded.exp).toBeGreaterThan(Date.now() / 1000);
  });
});

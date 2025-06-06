import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import jwt from "jsonwebtoken";

import { User } from "../user.js";
import { Argon2idHasher } from "../../../tools/argon2idHasher.js";

describe("Modelo de Usuario", () => {
  let user: User;

  beforeEach(() => {
    const now = new Date();
    user = new User(
      "johndoe",
      "John",
      "johndoe@example.com",
      now,
      now,
      new Argon2idHasher(),
    );
  });

  it("deve criar um usuário com os dados necessários", () => {
    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = new User(
      "johndoe",
      "John",
      "johndoe@example.com",
      now,
      now,
      new Argon2idHasher(),
    );
  });

  it("deve criar o hash de uma senha", async () => {
    const hashedPassword = await user.hashPassword("password123");

    expect(hashedPassword.ok).toBe(true);
    expect(typeof hashedPassword.data).toBe("string");
    if (hashedPassword.data) {
      expect(hashedPassword.data.length).toBeGreaterThan(0);
    }
  });

  it("deve criar o hash de uma senha", async () => {
    await user.setPassword("password123");

    expect(user.password).toBeDefined();
    expect(typeof user.password).toBe("string");
    if (user.password) {
      const isValid = await user.validatePassword("password123");
      expect(isValid.ok).toBe(true);
      expect(isValid.data).toBe(true);
    }
  });

  it("deve definir a senha do usuário com hash", async () => {
    const spy = jest.spyOn(user, "hashPassword");

    const result = await user.setPassword("password123");
    expect(result.ok).toBe(true);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith("password123");
    expect(user.password).toBeDefined();
  });

  it("deve gerar um token JWT", async () => {
    user.id = 1; // Definindo um ID fictício para o usuário
    const secret = "mysecretkey-12345678-hello-jwt-testing";
    const user1Result = user.issueJWT(secret);
    expect(user1Result.ok).toBe(true);
    if (!user1Result.data) {
      throw new Error("Primeiro Token JWT não foi gerado");
    }
    const user1Decoded = jwt.verify(user1Result.data, secret) as jwt.JwtPayload;
    expect(user1Decoded).toHaveProperty("sub", user.id);
    expect(user1Decoded).toHaveProperty("exp");
    if (typeof user1Decoded.exp === "number") {
      expect(user1Decoded.exp * 1000).toBeGreaterThan(Date.now());
    } else {
      throw new Error("exp não está presente no payload do JWT");
    }
    user.id = 2;
    const user2Result = user.issueJWT(secret);
    expect(user2Result.ok).toBe(true);
    if (!user2Result.data) {
      throw new Error("Segundo Token JWT não foi gerado");
    }
    expect(user2Result.data).not.toBe(user1Result.data);
  });

  it("falha se segredo não for informado", () => {
    user.id = 1; // Definindo um ID fictício para o usuário
    const result = user.issueJWT("");
    expect(result.ok).toBe(false);
  });

  it("gera um token de confirmação de e-mail", () => {
    const secret = "mysecretkey-12345678-confirmation-jwt-testing";
    const result = user.generateConfirmationToken(secret);
    expect(result.ok).toBe(true);
    if (!result.data || typeof result.data !== "string") {
      throw new Error("Token de confirmação vazio");
    }
    const decoded = jwt.verify(result.data, secret) as jwt.JwtPayload;
    expect(decoded).toHaveProperty("jti");
    expect(decoded).toHaveProperty("sub");
    expect(decoded).toHaveProperty("exp");
    if (typeof decoded.exp === "number") {
      expect(decoded.exp * 1000).toBeGreaterThan(Date.now());
    } else {
      throw new Error("exp não está presente no payload do JWT");
    }
  });

  it("deve falhar ao gerar token de confirmação se email não estiver definido", () => {
    const secret = "mysecretkey-12345678-confirmation-jwt-testing";
    user.email = ""; // Simulando email não definido
    const result = user.generateConfirmationToken(secret);
    expect(result.ok).toBe(false);
  });

  it("should generate different tokens for users with different emails", () => {
    const secret = "mysecretkey-12345678-confirmation-jwt-testing";
    const now = new Date();
    const userA = new User(
      "userA",
      "UserA",
      "userA@example.com",
      now,
      now,
      new Argon2idHasher(),
    );
    const userB = new User(
      "userB",
      "UserB",
      "userB@example.com",
      now,
      now,
      new Argon2idHasher(),
    );

    const tokenA = userA.generateConfirmationToken(secret);
    const tokenB = userB.generateConfirmationToken(secret);

    expect(tokenA.ok).toBe(true);
    expect(tokenB.ok).toBe(true);
    expect(tokenA.data).not.toBe(tokenB.data);

    const decodedA = jwt.verify(
      tokenA.data as string,
      secret,
    ) as jwt.JwtPayload;
    const decodedB = jwt.verify(
      tokenB.data as string,
      secret,
    ) as jwt.JwtPayload;

    expect(decodedA.sub).toBe("userA@example.com");
    expect(decodedB.sub).toBe("userB@example.com");
    expect(decodedA.jti).not.toBe(decodedB.jti);
  });
});

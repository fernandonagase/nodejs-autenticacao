import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";
import crypto from "crypto";

import { Hasher } from "../../tools/interfaces/hasher.js";
import { Result, resultFailure, resultSuccess } from "../../tools/result2.js";

export class User {
  id?: number;
  username: string;
  firstName: string;
  email: string;
  #password?: string;
  createdAt: Date;
  updatedAt: Date;
  hasher: Hasher;
  verifiedEmail = false;

  constructor(
    username: string,
    firstName: string,
    email: string,
    createdAt: Date,
    updatedAt: Date,
    hasher: Hasher,
  ) {
    this.username = username;
    this.firstName = firstName;
    this.email = email;
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
    this.hasher = hasher;
  }

  get password(): string | undefined {
    return this.#password;
  }

  set password(value: string) {
    this.#password = value;
  }

  async hashPassword(password: string): Promise<Result<string>> {
    const result = await this.hasher.hash(password);
    return result.ok
      ? resultSuccess(result.data)
      : resultFailure("Erro ao criar o hash da senha");
  }

  async validatePassword(password: string): Promise<Result<boolean>> {
    if (!this.#password) {
      return resultSuccess(false);
    }
    const result = await this.hasher.validate(password, this.#password);
    if (result.ok) {
      return resultSuccess(result.data);
    }
    return resultFailure("Erro ao validar a senha");
  }

  // Define a senha do usuário passando por função de hash
  // ao contrário do setter password, que só define a senha
  async setPassword(password: string): Promise<Result<void>> {
    const result = await this.hashPassword(password);
    if (!result.ok) {
      return resultFailure(result.error || "Erro ao criar hash da senha");
    }
    this.#password = result.data;
    return resultSuccess();
  }

  issueJWT(secret: string): Result<string> {
    let token: string;
    try {
      token = jwt.sign({ sub: this.id }, secret, { expiresIn: "1h" });
    } catch (error) {
      console.error("Erro ao gerar token JWT: ", error);
      return resultFailure("Erro ao gerar token JWT");
    }
    return resultSuccess(token);
  }

  issueRefreshToken(): Result<string> {
    try {
      // Gera 32 bytes aleatórios (256 bits)
      const buffer = crypto.randomBytes(32);
      const token = buffer.toString("hex");
      return resultSuccess(token);
    } catch (error) {
      console.error("Erro ao gerar refresh token: ", error);
      return resultFailure("Erro ao gerar refresh token");
    }
  }

  generateConfirmationToken(secret: string): Result<string> {
    if (!this.email) {
      return resultFailure("Email do usuário não definido");
    }
    let token: string;
    try {
      token = jwt.sign({ sub: this.email, jti: uuidv4() }, secret, {
        expiresIn: "15m",
      });
    } catch (error) {
      console.error("Erro ao gerar token de confirmação: ", error);
      return resultFailure("Erro ao gerar token de confirmação");
    }
    return resultSuccess(token);
  }
}

export type UserWithId = Omit<User, "id"> & { id: number };

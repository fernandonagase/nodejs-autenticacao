import jwt from "jsonwebtoken";

import { Hasher } from "../../tools/interfaces/hasher.js";
import { Result } from "../../tools/result.js";

export class User {
  id?: number;
  username: string;
  firstName: string;
  email: string;
  #password?: string;
  createdAt: Date;
  updatedAt: Date;
  hasher: Hasher;

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
    return result.ok && result.data
      ? Result.success(result.data)
      : Result.failure("Erro ao criar o hash da senha");
  }

  async validatePassword(password: string): Promise<Result<boolean>> {
    if (!this.#password) {
      return Result.success(false);
    }
    const result = await this.hasher.validate(password, this.#password);
    if (result.ok && typeof result.data === "boolean") {
      return Result.success(result.data);
    }
    return Result.failure("Erro ao validar a senha");
  }

  // Define a senha do usuário passando por função de hash
  // ao contrário do setter password, que só define a senha
  async setPassword(password: string): Promise<Result<void>> {
    const result = await this.hashPassword(password);
    if (!result.ok || !result.data) {
      return Result.failure(result.error || "Erro ao criar hash da senha");
    }
    this.#password = result.data;
    return Result.success();
  }

  issueJWT(secret: string): Result<string> {
    let token: string;
    try {
      token = jwt.sign({ sub: this.id }, secret, { expiresIn: "1h" });
    } catch (error) {
      console.error("Erro ao gerar token JWT: ", error);
      return Result.failure("Erro ao gerar token JWT");
    }
    return Result.success(token);
  }
}

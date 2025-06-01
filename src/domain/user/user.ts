import { Hasher } from "../../tools/interfaces/hasher.js";
import { Result } from "../../tools/result.js";

export class User {
  // id: string;
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

  async hashPassword(password: string): Promise<Result<string>> {
    const result = await this.hasher.hash(password);
    return result.ok && result.data
      ? Result.success(result.data)
      : Result.failure("Erro ao criar o hash da senha");
  }

  async validatePassword(
    password: string,
    hashed: string,
  ): Promise<Result<boolean>> {
    const result = await this.hasher.validate(password, hashed);
    return result.ok && result.data
      ? Result.success(result.data)
      : Result.failure("Erro ao validar a senha");
  }

  async setPassword(password: string): Promise<Result<void>> {
    const result = await this.hashPassword(password);
    if (!result.ok || !result.data) {
      return Result.failure(result.error || "Erro ao criar hash da senha");
    }
    this.#password = result.data;
    return Result.success();
  }
}

import { Hasher } from "../../tools/interfaces/hasher.js";
import { Result } from "../../tools/result.js";

export class User {
  // id: string;
  username: string;
  firstName: string;
  email: string;
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

  async hashPassword(password: string): Promise<Result<string>> {
    const result = await this.hasher.hash(password);
    return result.ok && result.data
      ? Result.success(result.data)
      : Result.failure("Erro ao criar o hash da senha");
  }
}

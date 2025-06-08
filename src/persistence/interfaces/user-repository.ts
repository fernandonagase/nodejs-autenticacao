import { User } from "../../domain/user/user.js";
import { Result } from "../../tools/result.js";

export type UserWithId = Omit<User, "id"> & { id: number };

export interface IUserRepository {
  create(user: User): Promise<Result<UserWithId>>;
  update(user: User): Promise<Result<void>>;
  findByUsername(username: string): Promise<Result<UserWithId | null>>;
  findById(userId: number): Promise<Result<UserWithId | null>>;
}

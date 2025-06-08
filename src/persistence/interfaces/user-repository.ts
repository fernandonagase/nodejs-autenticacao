import { User } from "../../domain/user/user.js";
import { Result } from "../../tools/result.js";

export interface IUserRepository {
  create(user: User): Promise<Result<User>>;
  update(user: User): Promise<Result<void>>;
  findByUsername(username: string): Promise<Result<User | null>>;
  findById(userId: number): Promise<Result<User | null>>;
}

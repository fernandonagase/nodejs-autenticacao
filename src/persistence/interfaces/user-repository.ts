import { User, UserWithId } from "../../domain/user/user.js";
import { Result } from "../../tools/result.js";

export interface IUserRepository {
  create(user: User): Promise<Result<UserWithId>>;
  update(user: User): Promise<Result<void>>;
  findByUsername(username: string): Promise<Result<UserWithId | null>>;
  findById(userId: number): Promise<Result<UserWithId | null>>;
  confirmEmail(userId: number, tokenId: string): Promise<Result<void>>;
}

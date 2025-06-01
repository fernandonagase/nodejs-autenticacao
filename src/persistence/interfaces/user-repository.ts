import { User } from "../../domain/user/user.js";
import { Result } from "../../tools/result.js";

export interface IUserRepository {
  create(user: User): Promise<Result<User>>;
}

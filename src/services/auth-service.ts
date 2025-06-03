import { User } from "../domain/user/user.js";
import { UserRepository } from "../persistence/user-repository.js";
import { Argon2idHasher } from "../tools/argon2idHasher.js";
import { Result } from "../tools/result.js";

async function signup(
  username: string,
  firstname: string,
  email: string,
  password: string,
): Promise<Result<User>> {
  const now = new Date();
  const user = new User(
    username,
    firstname,
    email,
    now,
    now,
    new Argon2idHasher(),
  );
  const result = await user.setPassword(password);
  if (!result.ok) {
    return Result.failure(result.error ?? "Falha ao criar usuário");
  }
  const userRepository = new UserRepository();
  const userResult = await userRepository.create(user);
  if (!userResult.ok) {
    return Result.failure(userResult.error ?? "Falha ao criar usuário");
  }
  return Result.success(userResult.data);
}

export { signup };

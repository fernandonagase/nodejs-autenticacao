import { hash, verify } from "argon2";

import { Hasher } from "./interfaces/hasher.js";
import { Result } from "./result.js";

export class Argon2idHasher implements Hasher {
  async hash(data: string): Promise<Result<string>> {
    if (!data) {
      return Result.failure("Data cannot be empty");
    }

    try {
      return Result.success(await hash(data));
    } catch (err) {
      return Result.failure(
        `Error hashing data: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async validate(data: string, hashed: string): Promise<Result<boolean>> {
    try {
      return Result.success((await verify(hashed, data)) ? true : false);
    } catch (err) {
      return Result.failure(
        `Error validating data: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

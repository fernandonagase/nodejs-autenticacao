import { hash, verify } from "argon2";

import { Hasher } from "./interfaces/hasher.js";
import { Result, resultFailure, resultSuccess } from "./result.js";

export class Argon2idHasher implements Hasher {
  async hash(data: string): Promise<Result<string>> {
    if (!data) {
      return resultFailure("Data cannot be empty");
    }

    try {
      return resultSuccess(await hash(data));
    } catch (err) {
      return resultFailure(
        `Error hashing data: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  async validate(data: string, hashed: string): Promise<Result<boolean>> {
    try {
      return resultSuccess((await verify(hashed, data)) ? true : false);
    } catch (err) {
      return resultFailure(
        `Error validating data: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }
}

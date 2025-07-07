import { Result } from "../result.js";

export interface Hasher {
  hash(data: string): Promise<Result<string>>;
  validate(data: string, hashed: string): Promise<Result<boolean>>;
}

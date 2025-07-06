import { describe, expect, it } from "@jest/globals";
import { Argon2idHasher } from "../argon2idHasher.js";

describe("Argon2idHasher", () => {
  it("deve fazer o hash de uma senha", async () => {
    const hasher = new Argon2idHasher();
    const password = "password123";
    const hashResult = await hasher.hash(password);

    expect(hashResult.ok).toBe(true);
    if (hashResult.ok) {
      expect(typeof hashResult.data).toBe("string");
      expect(hashResult.data.length).toBeGreaterThan(0);
    }
  });

  it("deve verificar uma senha em relação a um hash", async () => {
    const hasher = new Argon2idHasher();
    const password = "password123";
    const hashResult = await hasher.hash(password);

    expect(hashResult.ok).toBe(true);
    if (hashResult.ok) {
      expect(hashResult.data).not.toBeUndefined();
      const result = await hasher.validate(password, hashResult.data);
      expect(result.ok).toBe(true);
      if (result.ok) {
        expect(result.data).toBe(true);
      }
    }
  });

  it("deve devolver ok = false se a senha estiver vazia ao fazer hash", async () => {
    const hasher = new Argon2idHasher();
    const hashResult = await hasher.hash("");
    expect(hashResult.ok).toBe(false);
  });
});

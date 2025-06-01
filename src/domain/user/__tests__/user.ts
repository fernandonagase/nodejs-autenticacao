import { describe, expect, it } from "@jest/globals";
import { User } from "../user.js";
import { Argon2idHasher } from "../../../tools/argon2idHasher.js";

describe("Modelo de Usuario", () => {
  it("deve criar um usuário com os dados necessários", () => {
    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = new User(
      "johndoe",
      "John",
      "johndoe@example.com",
      now,
      now,
      new Argon2idHasher(),
    );
  });

  it("deve criar o hash de uma senha", async () => {
    const now = new Date();
    const user = new User(
      "johndoe",
      "John",
      "johndoe@example.com",
      now,
      now,
      new Argon2idHasher(),
    );
    const hashedPassword = await user.hashPassword("password123");

    expect(hashedPassword.ok).toBe(true);
    expect(typeof hashedPassword.data).toBe("string");
    if (hashedPassword.data) {
      expect(hashedPassword.data.length).toBeGreaterThan(0);
    }
  });
});

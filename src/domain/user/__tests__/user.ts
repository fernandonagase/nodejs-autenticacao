import { beforeEach, describe, expect, it, jest } from "@jest/globals";
import { User } from "../user.js";
import { Argon2idHasher } from "../../../tools/argon2idHasher.js";

describe("Modelo de Usuario", () => {
  let user: User;

  beforeEach(() => {
    const now = new Date();
    user = new User(
      "johndoe",
      "John",
      "johndoe@example.com",
      now,
      now,
      new Argon2idHasher(),
    );
  });

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
    const hashedPassword = await user.hashPassword("password123");

    expect(hashedPassword.ok).toBe(true);
    expect(typeof hashedPassword.data).toBe("string");
    if (hashedPassword.data) {
      expect(hashedPassword.data.length).toBeGreaterThan(0);
    }
  });

  it("deve criar o hash de uma senha", async () => {
    await user.setPassword("password123");

    expect(user.password).toBeDefined();
    expect(typeof user.password).toBe("string");
    if (user.password) {
      const isValid = await user.validatePassword("password123");
      expect(isValid.ok).toBe(true);
      expect(isValid.data).toBe(true);
    }
  });

  it("deve definir a senha do usuário com hash", async () => {
    const spy = jest.spyOn(user, "hashPassword");

    const result = await user.setPassword("password123");
    expect(result.ok).toBe(true);
    expect(spy).toHaveBeenCalled();
    expect(spy).toHaveBeenCalledWith("password123");
    expect(user.password).toBeDefined();
  });
});

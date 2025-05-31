import { describe, it } from "@jest/globals";
import { User } from "../user.js";

describe("Modelo de Usuario", () => {
  it("Deve criar um usuário com os dados necessários", () => {
    const now = new Date();
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const user = new User(
      "johndoe",
      "John",
      "johndoe@example.com",
      "password123",
      now,
      now,
    );
  });
});

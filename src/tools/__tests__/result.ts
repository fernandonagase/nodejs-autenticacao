import { describe, expect, it } from "@jest/globals";

import { Result } from "../result.js";

describe("Resultado", () => {
  it("deve criar um resultado de sucesso", () => {
    const result = Result.success("Dados do usuário");
    expect(result.ok).toBe(true);
    expect(result.data).toBe("Dados do usuário");
  });

  it("permite devolver sucesso sem dados", () => {
    const result = Result.success<undefined>();
    expect(result.ok).toBe(true);
    expect(result.data).toBeUndefined();
  });

  it("deve criar um resultado de falha", () => {
    const result = Result.failure("Erro ao criar usuário");
    expect(result.ok).toBe(false);
    expect(result.error).toBe("Erro ao criar usuário");
  });
});

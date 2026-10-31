import { describe, expect, it } from "vitest";
import { nameSchema, passwordSchema, validateName, validatePassword } from "./account";

describe("nombre público", () => {
  it.each(["María José", "Nuria_Profe", "O'Brien", "Zoë", "Ñandú 2", "李小龍"])("acepta «%s»", (name) => {
    expect(validateName(name)).toBeUndefined();
    expect(nameSchema.safeParse(name).success).toBe(true);
  });

  it.each(["", "a", "--", " .Ana", "Ana..Mar", "😀😀"])("rechaza «%s»", (name) => {
    expect(validateName(name)).toBeDefined();
  });

  it("colapsa espacios repetidos al guardar", () => {
    expect(nameSchema.parse("  Ana   María ")).toBe("Ana María");
  });
});

describe("contraseña", () => {
  it("una sola regla: longitud, cualquier carácter", () => {
    expect(validatePassword("palomitas de maíz")).toBeUndefined();
    expect(validatePassword("abc#.-12")).toBeUndefined();
    expect(passwordSchema.safeParse("corta").success).toBe(false);
    expect(passwordSchema.safeParse("x".repeat(129)).success).toBe(false);
  });
});

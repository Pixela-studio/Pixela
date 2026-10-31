import { describe, expect, it } from "vitest";
import { loginHref, registerHref, safeCallbackUrl } from "./authRedirect";

describe("safeCallbackUrl", () => {
  it.each([
    ["/movies/550", "/movies/550"],
    ["/categories?q=ladri", "/categories?q=ladri"],
    [null, "/"],
    ["", "/"],
    ["https://evil.example", "/"],
    ["//evil.example", "/"],
    ["/\\evil.example", "/"],
    ["javascript:alert(1)", "/"],
  ])("%s → %s", (input, expected) => {
    expect(safeCallbackUrl(input)).toBe(expected);
  });
});

describe("enlaces de login y registro", () => {
  it("llevan el destino codificado", () => {
    expect(loginHref("/movies/550")).toBe("/login?callbackUrl=%2Fmovies%2F550");
    expect(registerHref("/series/1?x=1")).toBe("/register?callbackUrl=%2Fseries%2F1%3Fx%3D1");
  });

  it("omiten el parámetro si el destino es la portada o no es seguro", () => {
    expect(loginHref("/")).toBe("/login");
    expect(loginHref("https://evil.example")).toBe("/login");
  });
});

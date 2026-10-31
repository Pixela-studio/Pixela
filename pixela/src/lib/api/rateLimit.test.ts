import { describe, expect, it } from "vitest";
import { checkRateLimit, peekRateLimit } from "./rateLimit";

describe("rateLimit", () => {
  const options = { name: "test-register", limit: 2, windowMs: 60_000 };

  it("peek no gasta cupo; check sí", () => {
    const ip = "10.0.0.1";
    expect(peekRateLimit(ip, options).allowed).toBe(true);
    expect(peekRateLimit(ip, options).allowed).toBe(true);
    checkRateLimit(ip, options);
    checkRateLimit(ip, options);
    expect(peekRateLimit(ip, options).allowed).toBe(false);
    expect(peekRateLimit(ip, options).retryAfterSeconds).toBeGreaterThan(0);
  });

  it("cada identificador lleva su propia cuenta", () => {
    checkRateLimit("10.0.0.2", options);
    checkRateLimit("10.0.0.2", options);
    expect(peekRateLimit("10.0.0.3", options).allowed).toBe(true);
  });
});

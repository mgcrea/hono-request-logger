import { describe, it, expect } from "vitest";
import { IN, OUT, DOT, BULLET, supportsUnicode } from "./constants";

describe("constants", () => {
  it("exports all symbols as single-character strings", () => {
    expect(IN).toHaveLength(1);
    expect(OUT).toHaveLength(1);
    expect(DOT).toHaveLength(1);
    expect(BULLET).toHaveLength(1);
  });

  it("uses unicode arrows and punctuation when unicode is supported", () => {
    if (!supportsUnicode) return;
    expect(IN).toBe("←");
    expect(OUT).toBe("→");
    expect(DOT).toBe("·");
    expect(BULLET).toBe("•");
  });

  it("falls back to ASCII when unicode is not supported", () => {
    if (supportsUnicode) return;
    expect(IN).toBe("<");
    expect(OUT).toBe(">");
    expect(DOT).toBe(".");
    expect(BULLET).toBe("-");
  });

  it("IN and OUT are distinct characters", () => {
    expect(IN).not.toBe(OUT);
  });
});

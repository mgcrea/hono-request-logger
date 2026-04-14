import { vi, describe, it, expect } from "vitest";

type FormatArgs = {
  timestamp: string;
  level: string;
  category: string;
  message: string;
  record: { properties: Record<string, unknown> };
};

type FormatterOptions = {
  timestamp: (ts: number) => string;
  level: (level: string) => string;
  category: (cat: string[]) => string;
  format: (args: FormatArgs) => string;
};

const captured = vi.hoisted(() => ({
  opts: null as null | FormatterOptions,
}));

vi.mock("@logtape/logtape", () => ({
  getAnsiColorFormatter: (opts: FormatterOptions) => {
    captured.opts = opts;
    return {};
  },
}));

vi.mock("picocolors", () => ({
  default: {
    magenta: (s: string) => `[m:${s}]`,
    dim: (s: string) => s,
  },
}));

import "./formatter";

function getOpts() {
  if (!captured.opts) throw new Error("options were not captured");
  return captured.opts;
}

function callFormat(overrides: Partial<FormatArgs> = {}) {
  return getOpts().format({
    timestamp: "2024-01-01T00:00:00.000Z",
    level: "debug",
    category: "http",
    message: "hello world",
    record: { properties: {} },
    ...overrides,
  });
}

describe("prettyFormatter", () => {
  describe("timestamp formatter", () => {
    it("converts a numeric timestamp to an ISO string", () => {
      const ts = new Date("2024-06-15T12:34:56.000Z").getTime();
      expect(getOpts().timestamp(ts)).toBe("2024-06-15T12:34:56.000Z");
    });
  });

  describe("level formatter", () => {
    it("pads short levels to 5 characters", () => {
      expect(getOpts().level("info")).toHaveLength(5);
      expect(getOpts().level("warn")).toHaveLength(5);
    });

    it("leaves levels already at 5 characters unchanged", () => {
      expect(getOpts().level("debug")).toBe("debug");
      expect(getOpts().level("error")).toBe("error");
    });
  });

  describe("category formatter", () => {
    it("joins category segments with DOT and pads to 4 characters", () => {
      const result = getOpts().category(["http"]);
      expect(result.length).toBeGreaterThanOrEqual(4);
    });

    it("joins multiple segments with DOT separator", () => {
      const result = getOpts().category(["app", "http"]);
      expect(result).toContain("app");
      expect(result).toContain("http");
    });
  });

  describe("format function", () => {
    it("includes timestamp, level, category and message in output", () => {
      const result = callFormat();
      expect(result).toContain("2024-01-01T00:00:00.000Z");
      expect(result).toContain("debug");
      expect(result).toContain("http");
      expect(result).toContain("hello world");
    });

    it("omits requestId section when record has no requestId", () => {
      const result = callFormat({ record: { properties: {} } });
      expect(result).not.toContain("#");
    });

    it("includes requestId when present in record properties", () => {
      const result = callFormat({ record: { properties: { requestId: "abc12345defg" } } });
      expect(result).toContain("#abc12345");
    });

    it("truncates requestId to 8 characters", () => {
      const result = callFormat({ record: { properties: { requestId: "12345678abcdef" } } });
      expect(result).toContain("#12345678");
      expect(result).not.toContain("#12345678a");
    });

    it("applies magenta color to requestId", () => {
      const result = callFormat({ record: { properties: { requestId: "abcdef12" } } });
      expect(result).toContain("[m:#abcdef12]");
    });
  });
});

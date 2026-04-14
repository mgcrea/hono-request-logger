import { vi, describe, it, expect, beforeEach } from "vitest";

const { mockDebug, mockWarn, mockError } = vi.hoisted(() => ({
  mockDebug: vi.fn(),
  mockWarn: vi.fn(),
  mockError: vi.fn(),
}));

vi.mock("@logtape/logtape", () => ({
  getLogger: () => ({ debug: mockDebug, warn: mockWarn, error: mockError }),
}));

vi.mock("picocolors", () => ({
  default: {
    yellow: (s: unknown) => String(s),
    green: (s: unknown) => String(s),
    red: (s: unknown) => String(s),
    dim: (s: unknown) => String(s),
    magenta: (s: unknown) => String(s),
  },
}));

import { httpLogger } from "./logger";

function makeCtx(path: string, method = "GET", status = 200) {
  return { req: { path, method }, res: { status } };
}

describe("httpLogger", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("skip paths", () => {
    it("skips logging entirely for /metrics", async () => {
      const next = vi.fn().mockResolvedValue(undefined);
      await httpLogger()(makeCtx("/metrics") as never, next);
      expect(next).toHaveBeenCalledOnce();
      expect(mockDebug).not.toHaveBeenCalled();
      expect(mockWarn).not.toHaveBeenCalled();
      expect(mockError).not.toHaveBeenCalled();
    });

    it("skips logging entirely for /healthz", async () => {
      const next = vi.fn().mockResolvedValue(undefined);
      await httpLogger()(makeCtx("/healthz") as never, next);
      expect(next).toHaveBeenCalledOnce();
      expect(mockDebug).not.toHaveBeenCalled();
    });
  });

  describe("request logging", () => {
    it("logs incoming request as debug before next by default", async () => {
      const next = vi.fn().mockResolvedValue(undefined);
      await httpLogger()(makeCtx("/api/users", "POST") as never, next);
      const firstCall = mockDebug.mock.calls[0][0] as string;
      expect(firstCall).toContain("POST");
      expect(firstCall).toContain("/api/users");
    });

    it("skips incoming log when logIncoming is false", async () => {
      await httpLogger({ logIncoming: false })(makeCtx("/api/users", "POST") as never, vi.fn().mockResolvedValue(undefined));
      // only the response debug log, no request log
      expect(mockDebug).toHaveBeenCalledOnce();
    });
  });

  describe("response logging by status code", () => {
    it("logs 2xx response as debug", async () => {
      await httpLogger()(makeCtx("/api/data", "GET", 200) as never, vi.fn().mockResolvedValue(undefined));
      expect(mockDebug).toHaveBeenCalledTimes(2); // request + response
      expect(mockWarn).not.toHaveBeenCalled();
      expect(mockError).not.toHaveBeenCalled();
    });

    it("logs 4xx response as warn", async () => {
      await httpLogger()(makeCtx("/api/missing", "GET", 404) as never, vi.fn().mockResolvedValue(undefined));
      expect(mockWarn).toHaveBeenCalledOnce();
      expect(mockDebug).toHaveBeenCalledOnce(); // request only
      expect(mockError).not.toHaveBeenCalled();
    });

    it("logs 5xx response as error", async () => {
      await httpLogger()(makeCtx("/api/crash", "GET", 500) as never, vi.fn().mockResolvedValue(undefined));
      expect(mockError).toHaveBeenCalledOnce();
      expect(mockDebug).toHaveBeenCalledOnce(); // request only
      expect(mockWarn).not.toHaveBeenCalled();
    });

    it("includes method and path in response log", async () => {
      await httpLogger()(makeCtx("/api/test", "DELETE", 204) as never, vi.fn().mockResolvedValue(undefined));
      const responseLog = mockDebug.mock.calls[1][0] as string;
      expect(responseLog).toContain("DELETE");
      expect(responseLog).toContain("/api/test");
    });

    it("includes status code in response log", async () => {
      await httpLogger()(makeCtx("/api/test", "GET", 201) as never, vi.fn().mockResolvedValue(undefined));
      const responseLog = mockDebug.mock.calls[1][0] as string;
      expect(responseLog).toContain("201");
    });
  });

  describe("status boundary conditions", () => {
    it("treats 399 as debug (below 4xx threshold)", async () => {
      await httpLogger()(makeCtx("/", "GET", 399) as never, vi.fn().mockResolvedValue(undefined));
      expect(mockDebug).toHaveBeenCalledTimes(2);
      expect(mockWarn).not.toHaveBeenCalled();
    });

    it("treats 400 as warn", async () => {
      await httpLogger()(makeCtx("/", "GET", 400) as never, vi.fn().mockResolvedValue(undefined));
      expect(mockWarn).toHaveBeenCalledOnce();
    });

    it("treats 499 as warn", async () => {
      await httpLogger()(makeCtx("/", "GET", 499) as never, vi.fn().mockResolvedValue(undefined));
      expect(mockWarn).toHaveBeenCalledOnce();
    });

    it("treats 500 as error", async () => {
      await httpLogger()(makeCtx("/", "GET", 500) as never, vi.fn().mockResolvedValue(undefined));
      expect(mockError).toHaveBeenCalledOnce();
    });
  });
});

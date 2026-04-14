
import { getLogger } from "@logtape/logtape";
import type { MiddlewareHandler } from "hono";
import { IN, OUT } from "./constants";
import pc from "picocolors";

export const httpLog = getLogger(["http"]);

export const httpLogger: MiddlewareHandler = async (c, next) => {
  if (c.req.path === "/metrics" || c.req.path === "/healthz") {
    await next();
    return;
  }
  httpLog.debug(`${pc.yellow(`${IN}${c.req.method}`)} ${c.req.path}`);
  const start = Date.now();
  await next();
  const status = c.res.status;
  const ms = Date.now() - start;
  const colorStatus = status >= 500 ? pc.red(status) : status >= 400 ? pc.yellow(status) : pc.green(status);
  const msg = `${pc.yellow(`${OUT}${c.req.method}`)} ${c.req.path} ${colorStatus} ${pc.dim(`${ms}ms`)}`;
  if (status >= 500) {
    httpLog.error(msg);
  } else if (status >= 400) {
    httpLog.warn(msg);
  } else {
    httpLog.debug(msg);
  }
};

import { AsyncLocalStorage } from "node:async_hooks";

import { configure, getConsoleSink } from "@logtape/logtape";
import { formatter } from "./formatter";

export async function configureLogger() {
  await configure({
    sinks: { console: getConsoleSink({ formatter }) },
    contextLocalStorage: new AsyncLocalStorage(),
    loggers: [
      { category: ["logtape", "meta"], sinks: ["console"], lowestLevel: "warning" },
      { category: [], sinks: ["console"], lowestLevel: "debug" },
    ],
  });
}
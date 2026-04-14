import { getAnsiColorFormatter } from "@logtape/logtape";
import { DOT, BULLET } from "./constants";
import pc from "picocolors";

export const formatter = getAnsiColorFormatter({
  timestamp: (ts) => new Date(ts).toISOString(),
  timestampStyle: "dim",
  level: (level) => level.padEnd(5),
  levelStyle: "bold",
  category: (cat) => cat.join(DOT).padEnd(4),
  categoryStyle: "dim",
  format: ({ timestamp, level, category, message, record }) => {
    const reqId = record.properties.requestId as string | undefined;
    const reqIdStr = reqId ? ` ${pc.magenta(`#${reqId.slice(0, 8)}`)}` : "";
    return `${timestamp} ${BULLET} ${level} ${category}${reqIdStr} ${message}`;
  },
});
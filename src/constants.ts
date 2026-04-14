
export const lang = process.env.LC_ALL || process.env.LANG || "";
export const supportsUnicode = lang.includes("UTF-8") || lang.includes("utf-8") || process.platform === "darwin";

export const IN = supportsUnicode ? "←" : "<";
export const OUT = supportsUnicode ? "→" : ">";
export const DOT = supportsUnicode ? "·" : ".";
export const BULLET = supportsUnicode ? "•" : "-";
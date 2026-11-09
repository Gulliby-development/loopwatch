import { MAX_STEPS } from "./constants.js";

const TOOL_PATTERN = /^[A-Za-z0-9_.-]{1,24}$/;
const KEY_PATTERN = /^[A-Za-z0-9_-]{1,16}$/;

function lineError(display, line, message) {
  return `loopwatch: ${display}:${line}: ${message}`;
}

function parseLine(display, text, line) {
  const fields = text.split(/[ \t]+/).filter(Boolean);
  if (fields.length === 0 || fields[0].startsWith("#")) return null;

  const delimiters = fields.reduce((count, field) => count + (field === "=>" ? 1 : 0), 0);
  if (delimiters === 0) return { error: lineError(display, line, 'missing "=>"') };
  if (delimiters > 1) return { error: lineError(display, line, 'too many "=>"') };

  const delimiter = fields.indexOf("=>");
  if (delimiter === 0) return { error: lineError(display, line, "missing tool name") };
  if (delimiter === fields.length - 1) return { error: lineError(display, line, "missing status") };
  if (delimiter !== fields.length - 2) return { error: lineError(display, line, "too many fields") };

  const tool = fields[0];
  if (!TOOL_PATTERN.test(tool)) {
    return { error: lineError(display, line, `invalid tool "${tool}"`) };
  }

  const args = {};
  const seen = new Set();
  for (const field of fields.slice(1, delimiter)) {
    const equals = field.indexOf("=");
    if (equals < 0) {
      return { error: lineError(display, line, `invalid argument "${field}"`) };
    }
    const key = field.slice(0, equals);
    const value = field.slice(equals + 1);
    if (!KEY_PATTERN.test(key) || value.length > 40) {
      return { error: lineError(display, line, `invalid argument "${field}"`) };
    }
    if (seen.has(key)) {
      return { error: lineError(display, line, `duplicate argument "${key}"`) };
    }
    seen.add(key);
    Object.defineProperty(args, key, { value, enumerable: true, writable: true, configurable: true });
  }

  const status = fields[delimiter + 1];
  if (status !== "ok" && status !== "fail") {
    return { error: lineError(display, line, `invalid status "${status}"`) };
  }

  const signatureArgs = Object.keys(args)
    .sort((left, right) => (left < right ? -1 : left > right ? 1 : 0))
    .map((key) => `${key}=${args[key]}`);
  return { tool, args, status, line, sig: [tool, ...signatureArgs].join(" ") };
}

/**
 * Parses a trace into canonical steps or returns its first diagnostic.
 */
export function parseTrace(display, text) {
  const normalized = text.startsWith("\ufeff") ? text.slice(1) : text;
  const lines = normalized.split("\n");
  const steps = [];

  for (let index = 0; index < lines.length; index += 1) {
    let lineText = lines[index];
    if (index < lines.length - 1 && lineText.endsWith("\r")) {
      lineText = lineText.slice(0, -1);
    }
    const parsed = parseLine(display, lineText, index + 1);
    if (parsed?.error) return { error: parsed.error };
    if (parsed) steps.push(parsed);
  }

  if (steps.length === 0) return { error: `loopwatch: ${display}: no steps` };
  if (steps.length > MAX_STEPS) {
    return { error: `loopwatch: ${display}: more than ${MAX_STEPS} steps` };
  }
  return { steps };
}

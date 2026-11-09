import { DEFAULTS, OPTION_NAMES, USAGE } from "./constants.js";
import { parseTrace } from "./parse.js";
import { detect, toolStats } from "./detect.js";

function failure(message) {
  return { code: 2, out: "", err: `loopwatch: ${message}\n` };
}

function validate(args) {
  if (args.length === 1 && args[0] === "--help") {
    return { help: true };
  }
  if (args.length === 0) {
    return { error: "missing command (scan, check or stats)" };
  }

  const command = args[0];
  if (command !== "scan" && command !== "check" && command !== "stats") {
    return { error: `unknown command "${command}"` };
  }

  const options = { ...DEFAULTS };
  let file;
  for (let index = 1; index < args.length; index += 1) {
    const arg = args[index];
    const equals = arg.indexOf("=");
    const name = equals >= 0 ? arg.slice(2, equals) : arg.slice(2);
    const isLongOption = arg.startsWith("--");
    const recognized = isLongOption && OPTION_NAMES.includes(name);

    if (command === "stats" && recognized) {
      return { error: `unknown option "--${name}"` };
    }

    if (command !== "stats" && recognized) {
      let value;
      if (equals >= 0) {
        value = arg.slice(equals + 1);
      } else {
        if (index + 1 >= args.length) return { error: `--${name} needs a value` };
        value = args[index + 1];
        index += 1;
      }
      if (!/^(?:[2-9]|[1-4][0-9]|50)$/.test(value)) {
        return { error: `invalid --${name} "${value}" (expected a whole number from 2 to 50)` };
      }
      options[name] = Number(value);
      continue;
    }

    if (arg.startsWith("-") && arg !== "-") {
      return { error: `unknown option "${arg}"` };
    }
    if (file !== undefined) return { error: "too many arguments" };
    file = arg;
  }

  if (file === undefined) return { error: "missing FILE" };
  return { command, file, options };
}

function statsOutput(steps) {
  const rows = toolStats(steps);
  const headers = ["TOOL", "CALLS", "FAILS", "DISTINCT"];
  const widths = headers.map((header, column) =>
    Math.max(
      header.length,
      ...rows.map((row) => String([row.tool, row.calls, row.fails, row.distinct][column]).length),
    ),
  );
  const format = (cells) =>
    cells
      .map((cell, index) => (index === 0 ? String(cell).padEnd(widths[index]) : String(cell).padStart(widths[index])))
      .join("  ")
      .trimEnd();
  const lines = [format(headers)];
  for (const row of rows) lines.push(format([row.tool, row.calls, row.fails, row.distinct]));
  const failed = steps.filter((step) => step.status === "fail").length;
  const stepLabel = steps.length === 1 ? "step" : "steps";
  lines.push(`${steps.length} ${stepLabel}, ${failed} failed (${Math.floor((100 * failed) / steps.length)}%)`);
  return `${lines.join("\n")}\n`;
}

export function main(args, io) {
  const validated = validate(args);
  if (validated.help) return { code: 0, out: USAGE, err: "" };
  if (validated.error) return failure(validated.error);

  const { command, file, options } = validated;
  const display = file === "-" ? "<stdin>" : file.replace(/\\/g, "/");
  const input = file === "-" ? io.readStdin() : io.readFile(file);
  if (input?.error) return failure(`${display}: ${input.error}`);

  const parsed = parseTrace(display, input.text);
  if (parsed.error) return { code: 2, out: "", err: `${parsed.error}\n` };
  if (command === "stats") {
    return { code: 0, out: statsOutput(parsed.steps), err: "" };
  }

  const findings = detect(parsed.steps, options);
  const stepLabel = parsed.steps.length === 1 ? "step" : "steps";
  const findingLabel = findings.length === 1 ? "finding" : "findings";
  const lines = [`${parsed.steps.length} ${stepLabel}, ${findings.length} ${findingLabel}`];
  for (const finding of findings) lines.push(`step ${finding.step}: ${finding.text}`);
  return {
    code: command === "check" && findings.length > 0 ? 1 : 0,
    out: `${lines.join("\n")}\n`,
    err: "",
  };
}

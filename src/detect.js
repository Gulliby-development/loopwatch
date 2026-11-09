import { DEFAULTS, MAX_PERIOD } from "./constants.js";

const KIND_ORDER = { repeat: 0, cycle: 1, fail: 2 };

export function detect(steps, options = {}) {
  const thresholds = { ...DEFAULTS, ...options };
  const findings = [];

  for (let start = 0; start < steps.length;) {
    let end = start + 1;
    while (end < steps.length && steps[end].sig === steps[start].sig) end += 1;
    const length = end - start;
    if (length >= thresholds.repeat) {
      findings.push({
        step: start + 1,
        kind: "repeat",
        text: `repeat of ${steps[start].sig} x ${length}`,
      });
    }
    start = end;
  }

  for (let start = 0; start < steps.length;) {
    if (steps[start].status !== "fail") {
      start += 1;
      continue;
    }
    let end = start + 1;
    while (end < steps.length && steps[end].status === "fail") end += 1;
    const length = end - start;
    if (length >= thresholds.fails) {
      findings.push({
        step: start + 1,
        kind: "fail",
        text: `fail streak of ${length}`,
      });
    }
    start = end;
  }

  for (let start = 0; start < steps.length;) {
    let selected = null;
    for (let period = 2; period <= MAX_PERIOD; period += 1) {
      if (start + period > steps.length) continue;
      const pattern = steps.slice(start, start + period).map((step) => step.sig);
      if (pattern.every((signature) => signature === pattern[0])) continue;

      let copies = 1;
      while (start + (copies + 1) * period <= steps.length) {
        let matches = true;
        for (let offset = 0; offset < period; offset += 1) {
          if (steps[start + copies * period + offset].sig !== pattern[offset]) {
            matches = false;
            break;
          }
        }
        if (!matches) break;
        copies += 1;
      }

      if (copies >= thresholds.cycles) {
        selected = { period, pattern, copies };
        break;
      }
    }

    if (selected) {
      const { period, pattern, copies } = selected;
      findings.push({
        step: start + 1,
        kind: "cycle",
        text: `cycle of ${period} steps (${pattern.join(" > ")}) x ${copies}`,
      });
      start += period * copies;
    } else {
      start += 1;
    }
  }

  findings.sort((left, right) => left.step - right.step || KIND_ORDER[left.kind] - KIND_ORDER[right.kind]);
  return findings;
}

export function toolStats(steps) {
  const byTool = new Map();
  for (const step of steps) {
    let stats = byTool.get(step.tool);
    if (!stats) {
      stats = { tool: step.tool, calls: 0, fails: 0, signatures: new Set() };
      byTool.set(step.tool, stats);
    }
    stats.calls += 1;
    if (step.status === "fail") stats.fails += 1;
    stats.signatures.add(step.sig);
  }

  return [...byTool.values()]
    .sort((left, right) => (left.tool < right.tool ? -1 : left.tool > right.tool ? 1 : 0))
    .map(({ tool, calls, fails, signatures }) => ({
      tool,
      calls,
      fails,
      distinct: signatures.size,
    }));
}

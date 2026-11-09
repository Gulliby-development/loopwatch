#!/usr/bin/env node
// Command-line entry of loopwatch: reads files and standard input as UTF-8 text and hands them to main().
import { readFileSync } from "node:fs";
import { main } from "../src/main.js";

function decode(bytes) {
  try {
    return { text: new TextDecoder("utf-8", { fatal: true }).decode(bytes) };
  } catch {
    return { error: "input is not valid UTF-8" };
  }
}

const io = {
  readFile(path) {
    try {
      return decode(readFileSync(path));
    } catch {
      return { error: "cannot read the file" };
    }
  },
  readStdin() {
    try {
      return decode(readFileSync(0));
    } catch {
      return { error: "cannot read the file" };
    }
  },
};

const outcome = main(process.argv.slice(2), io);
process.stdout.write(outcome.out);
process.stderr.write(outcome.err);
process.exitCode = outcome.code;

import { main } from "../../src/main.js";

/**
 * Runs the program on a row's arguments and files and returns the row it actually produced.
 * A row is { args, files, code, out, err }; `files` maps a file name to its text, and the name "-" is standard input.
 * A name that is not in `files` cannot be read.
 */
export function check(row) {
  const unreadable = { error: "cannot read the file" };
  const io = {
    readFile: (path) => (path in row.files && path !== "-" ? { text: row.files[path] } : unreadable),
    readStdin: () => ("-" in row.files ? { text: row.files["-"] } : unreadable),
  };
  const outcome = main(row.args, io);
  return { args: row.args, files: row.files, code: outcome.code, out: outcome.out, err: outcome.err };
}

import { expect, test } from "vitest";
import { check } from "./helpers/run.js";

// prettier-ignore
const rows = [
  { args: ["check", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\n" }, code: 0, out: "5 steps, 0 findings\n", err: "" },
  { args: ["check", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\n" }, code: 1, out: "6 steps, 1 finding\nstep 1: cycle of 2 steps (read_file path=a.js > run_tests) x 3\n", err: "" },
  { args: ["check", "-"], files: { "-": "ls => ok\nls => ok\nls => ok\n" }, code: 1, out: "3 steps, 1 finding\nstep 1: repeat of ls x 3\n", err: "" },
  { args: ["check", "--repeat", "4", "-"], files: { "-": "ls => ok\nls => ok\nls => ok\n" }, code: 0, out: "3 steps, 0 findings\n", err: "" },
  { args: ["check", "--fails", "2", "-"], files: { "-": "run_tests => fail\nrun_tests => fail\n" }, code: 1, out: "2 steps, 1 finding\nstep 1: fail streak of 2\n", err: "" },
  { args: ["check", "--cycles", "2", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\n" }, code: 1, out: "4 steps, 1 finding\nstep 1: cycle of 2 steps (read_file path=a.js > run_tests) x 2\n", err: "" },
  { args: ["check", "-"], files: { "-": "ls => ok\nls => ok\nls => ok\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\n" }, code: 1, out: "6 steps, 1 finding\nstep 1: repeat of ls x 3\n", err: "" },
];

for (const [index, row] of rows.entries()) {
  test(`row ${index + 1}`, () => {
    expect(check(row)).toEqual(row);
  });
}

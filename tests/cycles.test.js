import { expect, test } from "vitest";
import { check } from "./helpers/run.js";

// prettier-ignore
const rows = [
  { args: ["scan", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\n" }, code: 0, out: "6 steps, 1 finding\nstep 1: cycle of 2 steps (read_file path=a.js > run_tests) x 3\n", err: "" },
  { args: ["scan", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\n" }, code: 0, out: "4 steps, 0 findings\n", err: "" },
  { args: ["scan", "-"], files: { "-": "read_file path=a.js => ok\nedit path=a.js => ok\ngrep q=todo => ok\nread_file path=a.js => ok\nedit path=a.js => ok\ngrep q=todo => ok\nread_file path=a.js => ok\nedit path=a.js => ok\ngrep q=todo => ok\n" }, code: 0, out: "9 steps, 1 finding\nstep 1: cycle of 3 steps (read_file path=a.js > edit path=a.js > grep q=todo) x 3\n", err: "" },
  { args: ["scan", "-"], files: { "-": "read_file path=a.js => ok\nedit path=a.js => ok\ngrep q=todo => ok\nls => ok\nread_file path=a.js => ok\nedit path=a.js => ok\ngrep q=todo => ok\nls => ok\nread_file path=a.js => ok\nedit path=a.js => ok\ngrep q=todo => ok\nls => ok\n" }, code: 0, out: "12 steps, 1 finding\nstep 1: cycle of 4 steps (read_file path=a.js > edit path=a.js > grep q=todo > ls) x 3\n", err: "" },
  { args: ["scan", "-"], files: { "-": "read_file path=a.js => ok\nedit path=a.js => ok\ngrep q=todo => ok\nls => ok\nbash cmd=make => fail\nread_file path=a.js => ok\nedit path=a.js => ok\ngrep q=todo => ok\nls => ok\nbash cmd=make => fail\nread_file path=a.js => ok\nedit path=a.js => ok\ngrep q=todo => ok\nls => ok\nbash cmd=make => fail\n" }, code: 0, out: "15 steps, 0 findings\n", err: "" },
  { args: ["scan", "-"], files: { "-": "grep q=todo => ok\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nls => ok\n" }, code: 0, out: "8 steps, 1 finding\nstep 2: cycle of 2 steps (read_file path=a.js > run_tests) x 3\n", err: "" },
  { args: ["scan", "-"], files: { "-": "read_file path=a.js => ok\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nread_file path=a.js => ok\nrun_tests => fail\n" }, code: 0, out: "9 steps, 1 finding\nstep 1: cycle of 3 steps (read_file path=a.js > read_file path=a.js > run_tests) x 3\n", err: "" },
  { args: ["scan", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nrun_tests => fail\n" }, code: 0, out: "9 steps, 1 finding\nstep 1: cycle of 3 steps (read_file path=a.js > run_tests > run_tests) x 3\n", err: "" },
  { args: ["scan", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => fail\nrun_tests => ok\nread_file path=a.js => ok\nrun_tests => ok\n" }, code: 0, out: "6 steps, 1 finding\nstep 1: cycle of 2 steps (read_file path=a.js > run_tests) x 3\n", err: "" },
  { args: ["scan", "-"], files: { "-": "ls => ok\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nls => ok\nls => ok\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\n" }, code: 0, out: "11 steps, 0 findings\n", err: "" },
  { args: ["scan", "--cycles", "2", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\n" }, code: 0, out: "4 steps, 1 finding\nstep 1: cycle of 2 steps (read_file path=a.js > run_tests) x 2\n", err: "" },
  { args: ["scan", "--cycles=4", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\n" }, code: 0, out: "6 steps, 0 findings\n", err: "" },
  { args: ["scan", "--cycles=4", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\n" }, code: 0, out: "8 steps, 1 finding\nstep 1: cycle of 2 steps (read_file path=a.js > run_tests) x 4\n", err: "" },
  { args: ["scan", "--cycles", "2", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nedit path=a.js => ok\ngrep q=todo => ok\nread_file path=a.js => ok\nrun_tests => fail\nedit path=a.js => ok\ngrep q=todo => ok\nls => ok\n" }, code: 0, out: "9 steps, 1 finding\nstep 1: cycle of 4 steps (read_file path=a.js > run_tests > edit path=a.js > grep q=todo) x 2\n", err: "" },
];

for (const [index, row] of rows.entries()) {
  test(`row ${index + 1}`, () => {
    expect(check(row)).toEqual(row);
  });
}

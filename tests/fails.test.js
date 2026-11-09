import { expect, test } from "vitest";
import { check } from "./helpers/run.js";

// prettier-ignore
const rows = [
  { args: ["scan", "-"], files: { "-": "run_tests => fail\nrun_tests => fail\n" }, code: 0, out: "2 steps, 0 findings\n", err: "" },
  { args: ["scan", "-"], files: { "-": "run_tests => fail\nrun_tests => fail\nrun_tests => fail\n" }, code: 0, out: "3 steps, 2 findings\nstep 1: repeat of run_tests x 3\nstep 1: fail streak of 3\n", err: "" },
  { args: ["scan", "-"], files: { "-": "run_tests => fail\nrun_tests => fail\nrun_tests => fail\nrun_tests => fail\n" }, code: 0, out: "4 steps, 2 findings\nstep 1: repeat of run_tests x 4\nstep 1: fail streak of 4\n", err: "" },
  { args: ["scan", "-"], files: { "-": "run_tests => fail\nrun_tests => fail\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nrun_tests => fail\nrun_tests => fail\n" }, code: 0, out: "7 steps, 4 findings\nstep 1: repeat of run_tests x 3\nstep 1: fail streak of 3\nstep 5: repeat of run_tests x 3\nstep 5: fail streak of 3\n", err: "" },
  { args: ["scan", "-"], files: { "-": "run_tests => fail\nbash cmd=make => fail\nrun_tests => fail\n" }, code: 0, out: "3 steps, 1 finding\nstep 1: fail streak of 3\n", err: "" },
  { args: ["scan", "-"], files: { "-": "ls => ok\nbash cmd=make => fail\nls => ok\nbash cmd=make => fail\nls => ok\nbash cmd=make => fail\n" }, code: 0, out: "6 steps, 1 finding\nstep 1: cycle of 2 steps (ls > bash cmd=make) x 3\n", err: "" },
  { args: ["scan", "--fails", "2", "-"], files: { "-": "run_tests => fail\nrun_tests => fail\nread_file path=a.js => ok\n" }, code: 0, out: "3 steps, 1 finding\nstep 1: fail streak of 2\n", err: "" },
  { args: ["scan", "--fails=5", "-"], files: { "-": "run_tests => fail\nrun_tests => fail\nrun_tests => fail\nrun_tests => fail\n" }, code: 0, out: "4 steps, 1 finding\nstep 1: repeat of run_tests x 4\n", err: "" },
  { args: ["scan", "--fails=5", "-"], files: { "-": "run_tests => fail\nbash cmd=make => fail\nrun_tests => fail\nbash cmd=make => fail\nrun_tests => fail\n" }, code: 0, out: "5 steps, 1 finding\nstep 1: fail streak of 5\n", err: "" },
  { args: ["scan", "--repeat", "2", "--fails", "2", "--cycles", "2", "-"], files: { "-": "run_tests => fail\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\n" }, code: 0, out: "6 steps, 3 findings\nstep 1: repeat of run_tests x 2\nstep 1: fail streak of 2\nstep 2: cycle of 2 steps (run_tests > read_file path=a.js) x 2\n", err: "" },
];

for (const [index, row] of rows.entries()) {
  test(`row ${index + 1}`, () => {
    expect(check(row)).toEqual(row);
  });
}

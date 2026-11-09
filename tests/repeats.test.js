import { expect, test } from "vitest";
import { check } from "./helpers/run.js";

// prettier-ignore
const rows = [
  { args: ["scan", "-"], files: { "-": "read_file path=a.js => ok\nread_file path=a.js => ok\n" }, code: 0, out: "2 steps, 0 findings\n", err: "" },
  { args: ["scan", "-"], files: { "-": "read_file path=a.js => ok\nread_file path=a.js => ok\nread_file path=a.js => ok\n" }, code: 0, out: "3 steps, 1 finding\nstep 1: repeat of read_file path=a.js x 3\n", err: "" },
  { args: ["scan", "-"], files: { "-": "read_file path=a.js => ok\nread_file path=a.js => ok\nread_file path=a.js => ok\nread_file path=a.js => ok\n" }, code: 0, out: "4 steps, 1 finding\nstep 1: repeat of read_file path=a.js x 4\n", err: "" },
  { args: ["scan", "-"], files: { "-": "read_file path=a.js => ok\nread_file path=a.js => ok\nread_file path=a.js => ok\nrun_tests => fail\nrun_tests => fail\nrun_tests => fail\n" }, code: 0, out: "6 steps, 3 findings\nstep 1: repeat of read_file path=a.js x 3\nstep 4: repeat of run_tests x 3\nstep 4: fail streak of 3\n", err: "" },
  { args: ["scan", "-"], files: { "-": "read_file path=a.js => ok\nread_file path=a.js => fail\nread_file path=a.js => ok\n" }, code: 0, out: "3 steps, 1 finding\nstep 1: repeat of read_file path=a.js x 3\n", err: "" },
  { args: ["scan", "-"], files: { "-": "read_file mode=r path=a.js => ok\nread_file path=a.js mode=r => ok\nread_file path=a.js mode=r => ok\n" }, code: 0, out: "3 steps, 1 finding\nstep 1: repeat of read_file mode=r path=a.js x 3\n", err: "" },
  { args: ["scan", "-"], files: { "-": "read_file path=a.js => ok\nread_file path=b.js => ok\nread_file path=a.js => ok\nread_file path=a.js => ok\n" }, code: 0, out: "4 steps, 0 findings\n", err: "" },
  { args: ["scan", "-"], files: { "-": "ls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\n" }, code: 0, out: "7 steps, 1 finding\nstep 1: repeat of ls x 7\n", err: "" },
  { args: ["scan", "-"], files: { "-": "ls => ok\ngrep q=todo => ok\nls => ok\nls => ok\nls => ok\ngrep q=todo => ok\ngrep q=todo => ok\ngrep q=todo => ok\ngrep q=todo => ok\n" }, code: 0, out: "9 steps, 2 findings\nstep 3: repeat of ls x 3\nstep 6: repeat of grep q=todo x 4\n", err: "" },
  { args: ["scan", "-"], files: { "-": "grep q=a => ok\ngrep q=a => ok\ngrep q=b => ok\ngrep q=b => ok\ngrep q=b => ok\n" }, code: 0, out: "5 steps, 1 finding\nstep 3: repeat of grep q=b x 3\n", err: "" },
  { args: ["scan", "--repeat", "2", "-"], files: { "-": "read_file path=a.js => ok\nread_file path=a.js => ok\ngrep q=todo => ok\n" }, code: 0, out: "3 steps, 1 finding\nstep 1: repeat of read_file path=a.js x 2\n", err: "" },
  { args: ["scan", "--repeat=5", "-"], files: { "-": "ls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\n" }, code: 0, out: "7 steps, 1 finding\nstep 1: repeat of ls x 7\n", err: "" },
  { args: ["scan", "--repeat=5", "-"], files: { "-": "ls => ok\nls => ok\nls => ok\nls => ok\n" }, code: 0, out: "4 steps, 0 findings\n", err: "" },
];

for (const [index, row] of rows.entries()) {
  test(`row ${index + 1}`, () => {
    expect(check(row)).toEqual(row);
  });
}

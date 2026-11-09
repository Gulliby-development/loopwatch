import { expect, test } from "vitest";
import { check } from "./helpers/run.js";

// prettier-ignore
const rows = [
  { args: ["stats", "-"], files: { "-": "ls => ok\n" }, code: 0, out: "TOOL  CALLS  FAILS  DISTINCT\nls        1      0         1\n1 step, 0 failed (0%)\n", err: "" },
  { args: ["stats", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\n" }, code: 0, out: "TOOL       CALLS  FAILS  DISTINCT\nread_file      3      0         1\nrun_tests      2      2         1\n5 steps, 2 failed (40%)\n", err: "" },
  { args: ["stats", "-"], files: { "-": "read_file path=a.js => ok\nread_file path=a.js => ok\nread_file path=b.js => fail\nread_file path=a.js mode=r => fail\n" }, code: 0, out: "TOOL       CALLS  FAILS  DISTINCT\nread_file      4      2         3\n4 steps, 2 failed (50%)\n", err: "" },
  { args: ["stats", "-"], files: { "-": "zeta => ok\nAlpha => fail\nalpha => ok\n" }, code: 0, out: "TOOL   CALLS  FAILS  DISTINCT\nAlpha      1      1         1\nalpha      1      0         1\nzeta       1      0         1\n3 steps, 1 failed (33%)\n", err: "" },
  { args: ["stats", "-"], files: { "-": "web.search q=x => ok\nweb.search q=y => fail\nweb.search q=x => ok\na => ok\n" }, code: 0, out: "TOOL        CALLS  FAILS  DISTINCT\na               1      0         1\nweb.search      3      1         2\n4 steps, 1 failed (25%)\n", err: "" },
  { args: ["stats", "-"], files: { "-": "run_tests => fail\nrun_tests => fail\nrun_tests => fail\n" }, code: 0, out: "TOOL       CALLS  FAILS  DISTINCT\nrun_tests      3      3         1\n3 steps, 3 failed (100%)\n", err: "" },
  { args: ["stats", "-"], files: { "-": "ls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nls => ok\nrun_tests => fail\n" }, code: 0, out: "TOOL       CALLS  FAILS  DISTINCT\nls            99      0         1\nrun_tests      1      1         1\n100 steps, 1 failed (1%)\n", err: "" },
];

for (const [index, row] of rows.entries()) {
  test(`row ${index + 1}`, () => {
    expect(check(row)).toEqual(row);
  });
}

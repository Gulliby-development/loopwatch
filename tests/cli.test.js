import { expect, test } from "vitest";
import { check } from "./helpers/run.js";

// prettier-ignore
const rows = [
  { args: [], files: {}, code: 2, out: "", err: "loopwatch: missing command (scan, check or stats)\n" },
  { args: ["bogus"], files: {}, code: 2, out: "", err: "loopwatch: unknown command \"bogus\"\n" },
  { args: ["scan"], files: {}, code: 2, out: "", err: "loopwatch: missing FILE\n" },
  { args: ["scan", "-x", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\n" }, code: 2, out: "", err: "loopwatch: unknown option \"-x\"\n" },
  { args: ["stats", "--repeat", "3", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\n" }, code: 2, out: "", err: "loopwatch: unknown option \"--repeat\"\n" },
  { args: ["--help"], files: {}, code: 0, out: "usage: loopwatch scan [OPTIONS] FILE\n       loopwatch check [OPTIONS] FILE\n       loopwatch stats FILE\noptions: --repeat N, --cycles N, --fails N (whole numbers from 2 to 50)\n", err: "" },
  { args: ["scan", "/no/such/loopwatch-file.txt"], files: {}, code: 2, out: "", err: "loopwatch: /no/such/loopwatch-file.txt: cannot read the file\n" },
  { args: ["scan", "--repeat"], files: {}, code: 2, out: "", err: "loopwatch: --repeat needs a value\n" },
  { args: ["scan", "--repeat", "1", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\n" }, code: 2, out: "", err: "loopwatch: invalid --repeat \"1\" (expected a whole number from 2 to 50)\n" },
  { args: ["scan", "--repeat", "51", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\n" }, code: 2, out: "", err: "loopwatch: invalid --repeat \"51\" (expected a whole number from 2 to 50)\n" },
  { args: ["scan", "--cycles=x", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\n" }, code: 2, out: "", err: "loopwatch: invalid --cycles \"x\" (expected a whole number from 2 to 50)\n" },
  { args: ["scan", "--fails=02", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\n" }, code: 2, out: "", err: "loopwatch: invalid --fails \"02\" (expected a whole number from 2 to 50)\n" },
  { args: ["scan", "--repeats=3", "-"], files: { "-": "read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\n" }, code: 2, out: "", err: "loopwatch: unknown option \"--repeats=3\"\n" },
  { args: ["scan", "--repeat", "2", "--repeat=50", "-"], files: { "-": "read_file path=a.js => ok\nread_file path=a.js => ok\nread_file path=a.js => ok\n" }, code: 0, out: "3 steps, 0 findings\n", err: "" },
  { args: ["check", "--repeat", "2", "--cycles", "2", "--fails=2", "-"], files: { "-": "read_file path=a.js => ok\nread_file path=a.js => ok\nrun_tests => fail\nrun_tests => fail\n" }, code: 1, out: "4 steps, 3 findings\nstep 1: repeat of read_file path=a.js x 2\nstep 3: repeat of run_tests x 2\nstep 3: fail streak of 2\n", err: "" },
];

for (const [index, row] of rows.entries()) {
  test(`row ${index + 1}`, () => {
    expect(check(row)).toEqual(row);
  });
}

<p align="center"><img src="docs/logo.svg" width="96" alt="" /></p>

# loopwatch

[![CI](https://github.com/Gulliby-development/loopwatch/actions/workflows/ci.yml/badge.svg)](https://github.com/Gulliby-development/loopwatch/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

loopwatch finds repeated tool calls, short repeating call sequences, and long failure streaks in an AI agent's text trace. It is an offline command-line aid for people debugging agent runs and for teams supervising unattended agents. It uses exact string comparisons and whole-number counts; it does not use a model, network, or clock.

## Requirements and setup

loopwatch supports Windows, macOS, and Linux. Install Node.js 20 or newer and Bun, then install the repository's pinned development dependencies:

```sh
bun install
```

From the repository directory, run the program with `bun run --silent loopwatch`. The examples below use POSIX shell syntax; the application itself is cross-platform.

## Commands

```text
usage: loopwatch scan [OPTIONS] FILE
       loopwatch check [OPTIONS] FILE
       loopwatch stats FILE
options: --repeat N, --cycles N, --fails N (whole numbers from 2 to 50)
```

`--help` by itself prints that usage and exits successfully. Each command takes a trace file path or `-` to read standard input. `scan` reports findings and exits 0. `check` prints the same report, but exits 1 if it found anything and 0 otherwise. `stats` prints tool usage totals and exits 0.

For `scan` and `check`, the repeat, cycle, and failure-streak thresholds default to 3. Set them with either `--repeat N` or `--repeat=N` (and likewise for `cycles` and `fails`). Values must be whole numbers from 2 through 50, without a sign or leading zeros. Options may appear among the arguments; when a threshold is given more than once, its last value applies. `stats` does not accept threshold options.

Command-line validation happens before any input is read. Errors use exit code 2, write a diagnostic to standard error, and leave standard output empty. The CLI checks for a missing or unknown command first, then processes later arguments from left to right (including option values), then checks for a missing file. Once input is opened, unreadable files report `cannot read the file` and malformed UTF-8 reports `input is not valid UTF-8`. Diagnostics show the provided filename with backslashes displayed as forward slashes; stdin is displayed as `<stdin>`. CLI diagnostics include `missing command (scan, check or stats)`, `unknown command "X"`, `unknown option "ARG"`, `--NAME needs a value`, `invalid --NAME "N" (expected a whole number from 2 to 50)`, `too many arguments`, and `missing FILE`. Trace diagnostics identify a line and report missing or multiple `=>` fields, missing tool or status, extra fields, invalid tool, argument, or status, and duplicate arguments; file-wide diagnostics are `no steps` and `more than 200 steps`. All diagnostics use the `loopwatch:` prefix, and trace errors include the displayed filename and physical line where applicable.

## Trace format

A trace is UTF-8 text, with one tool call per line:

```text
TOOL [KEY=VALUE ...] => STATUS
```

A leading UTF-8 byte order mark is ignored. Lines split at LF; a CR immediately before LF is removed. Blank lines and lines whose first nonblank field starts with `#` are ignored. Fields are separated by one or more spaces or tabs, and leading or trailing whitespace is allowed.

Each non-comment line needs exactly one standalone `=>` field, a tool name before it, and exactly one status after it. Tool names contain 1–24 ASCII letters, digits, underscores, periods, or hyphens. Arguments are optional and precede the delimiter. Each is split at its first equals sign: keys contain 1–16 ASCII letters, digits, underscores, or hyphens; values may be empty, may contain more equals signs, and may be up to 40 non-whitespace characters. A key cannot occur twice in one call. Status is lowercase `ok` or `fail`. Traces must contain 1–200 steps.

The first error in file order is reported. Within a line, validation checks delimiter structure first (missing or multiple delimiters, missing tool, missing status, or extra fields), then the tool name, arguments from left to right (invalid or duplicate), and status. After all lines are parsed, an empty trace reports `no steps`; more than 200 calls reports `more than 200 steps`. Line numbers count physical input lines, including ignored lines.

A step records its tool, argument object, status, physical line number, and canonical signature. A signature consists of the tool followed by its arguments sorted by key in byte order and joined with single spaces. The status is not included, so calls with the same tool and arguments match even when their outcomes differ.

## Detection and statistics

The three detectors operate independently over step numbers, which start at 1. Each reports maximal qualifying blocks; their thresholds are controlled independently by the options above.

- A **repeat** is a maximal adjacent run of identical signatures, reported when it meets the repeat threshold.
- A **fail streak** is a maximal adjacent run of failed steps, reported when it meets the fails threshold.
- A **cycle** scan moves from left to right and tries periods of 2, 3, then 4 steps at each position. A pattern with all identical signatures is excluded. A period qualifies only when complete copies repeat consecutively at least the cycles threshold; the first qualifying period is reported. The scan then advances past all copies of that cycle. If none qualifies, it advances one step. This is a greedy scan, not an exhaustive search.

Findings are ordered by starting step, with repeats before cycles before failure streaks when they start at the same step. Each finding is printed as `step S: TEXT`; the report begins with the number of steps and findings. Singular counts use `step` and `finding`.

`stats` lists one row per tool, sorted by tool name in byte order. Its CALLS, FAILS, and DISTINCT columns count that tool's steps, failed steps, and unique signatures respectively. Columns are aligned to their widest cell, separated by two spaces, with trailing spaces removed. The final summary gives total steps, failures, and the failure percentage rounded down to a whole number.

## Examples

These four transcripts use a POSIX shell in the repository directory:

```text
$ printf 'read_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\nread_file path=a.js => ok\nrun_tests => fail\n' | bun run --silent loopwatch scan -
6 steps, 1 finding
step 1: cycle of 2 steps (read_file path=a.js > run_tests) x 3
$ printf 'ls => ok\nls => ok\nls => ok\n' | bun run --silent loopwatch check -; echo "exit $?"
3 steps, 1 finding
step 1: repeat of ls x 3
exit 1
$ printf 'grep q=todo => ok\nbash cmd=make => fail\ngrep q=fixme => ok\ngrep q=todo => ok\n' | bun run --silent loopwatch stats -
TOOL  CALLS  FAILS  DISTINCT
bash      1      1         1
grep      3      0         2
4 steps, 1 failed (25%)
$ printf 'ls => ok\nrun_tests =>\n' | bun run --silent loopwatch scan - 2>&1; echo "exit $?"
loopwatch: <stdin>:2: missing status
exit 2
```

## Developer interfaces

The source modules expose synchronous interfaces for application code and tests:

- `parseTrace(display, text)` returns `{ steps }` on success or `{ error }` on failure. `display` is the label used in diagnostics (the CLI uses the normalized filename or `<stdin>`); `error` is the complete diagnostic string. Each step has the shape `{ tool, args, status, line, sig }`: `args` is an object of key/value strings, `line` is the physical input line number, and `sig` is the canonical signature. This function parses text; byte decoding is the command-line entry point's responsibility.
- `detect(steps, options)` returns findings shaped as `{ step, kind, text }`, where `step` is the 1-based start position, `text` is the report description, and `kind` is `repeat`, `cycle`, or `fail`. The optional options object accepts `{ repeat, cycles, fails }`; omitted values use the defaults `{ repeat: 3, cycles: 3, fails: 3 }`.
- `toolStats(steps)` returns entries shaped as `{ tool, calls, fails, distinct }`, ordered by tool name in byte order.
- `main(args, io)` returns `{ code, out, err }`, containing the exit code and complete stdout/stderr strings. The `io` object supplies `readFile(path)` and `readStdin()`, each returning `{ text }` or `{ error }`; `error` is the read/decode diagnostic text.

Run the development checks from the repository:

```sh
bun run lint
bun run format:check
bun run test
```

See the [MIT License](LICENSE).

---

Built with [BAKED](https://github.com/Gulliby-development/baked), an open-source coding agent (bench round R89).

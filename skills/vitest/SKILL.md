---
name: vitest
description: Use whenever you are about to run vitest — directly (`vitest`, `npx vitest`, `pnpm vitest`), via an npm script (`npm test`, `pnpm test`, `yarn test`), or any command that invokes the vitest binary. Prevents the two most common failure modes — hanging in watch mode, and burning tokens by re-running the full suite repeatedly just to re-filter its output.
---

# Running vitest efficiently

The goal: get a clear picture of what's failing in **one run**, with the smallest possible output, and never block on watch mode. Re-running the suite to change a grep filter is the single most wasteful pattern — it costs minutes per iteration and bloats context with output you already had a moment ago.

## 1. Never enter watch mode

Bare `vitest` defaults to **watch mode** in a TTY and will hang the session until killed. Many `package.json` scripts are wired as `"test": "vitest"`, so `npm test` hangs too.

- Direct invocation: `npx vitest run <args>` (the `run` subcommand is non-watch).
- Through an npm script: `npm test -- --run` (the `--` forwards the flag to vitest). If the script does anything besides invoke vitest, prefer calling vitest directly via `npx vitest run` so you know exactly what's happening.
- Equivalent: `vitest --run` also works if you prefer the flag form.

If a command appears to hang for more than ~10s with no output, assume watch mode and kill it rather than waiting.

## 2. Use the `agent` reporter — don't grep vitest output

Since **vitest v4.1.0**, an `agent` reporter auto-activates when vitest detects it is running inside an AI coding agent. It prints **only failed tests and their error messages** — no console logs from passing tests, no summary block, no decorative output. This is exactly the signal you need.

- If the project has no custom `reporters` configured, the agent reporter is already on. Just run `npx vitest run <file>`.
- If the project **does** configure custom reporters (check `vitest.config.*`), auto-detection is bypassed. Force it: `npx vitest run --reporter=agent <file>`.
- Vitest is older than 4.1.0? Use `--reporter=dot` to suppress passing-test noise, and consider suggesting the user upgrade.

**Stop piping vitest into `grep`.** The agent reporter already filters to failures. If you find yourself reaching for `| grep "×"`, `| grep "FAIL"`, `| grep -E "Test Files|Tests "`, or `| head -N`, that's a sign you didn't use the right reporter — fix the reporter, don't paper over the output.

## 3. Never re-run tests just to change how you slice the output

This is the cardinal sin. If you ran the suite and want a different view of the same failures, **re-read the output you already captured** — do not run the suite again.

The pattern to avoid (real example, ~5 minutes wasted):

```
npx vitest run client.test.ts | grep "Test Files|Tests"   # counts
npx vitest run client.test.ts | grep "× " | head -20      # names — RE-RAN
npx vitest run client.test.ts -t "..."                    # one test — RE-RAN
npx vitest run client.test.ts | grep "× " | head -15      # names again — RE-RAN
```

The fix: capture once, inspect many.

```bash
npx vitest run client.test.ts > /tmp/vitest.out 2>&1
# now read /tmp/vitest.out as many times as you want with Read, grep, etc.
```

Only re-run when something has actually changed: you edited code, you want to verify a fix, or you legitimately suspect flake. "I want to see a different subset of the same failures" is **not** a reason to re-run.

## 4. Scope the run before you start

Running the entire test suite when you know which file is affected is slow and noisy. Scope tightly from the first invocation:

- **By file**: `npx vitest run path/to/foo.test.ts` — pass one or more file paths positionally.
- **By test name**: `-t "regex"` filters by test/describe name (it's a regex, not a glob — `|` is alternation, no backslash needed).
- **Combined**: `npx vitest run path/to/foo.test.ts -t "handles HTTP errors"` is the tightest, fastest signal.

Only widen the scope (drop the `-t`, then drop the file path) when narrow runs pass and you need to confirm nothing else regressed.

## 5. Other defaults worth keeping

- **No coverage unless asked.** `--coverage` floods output. Skip it.
- **`--bail` — default to omitting it.** The agent reporter already keeps failure output small, so a full run gives you the complete failure inventory at roughly the cost of a bailed run, and lets you fix multiple unrelated failures in one editing pass. Reflexively reaching for `--bail 1` causes the opposite of what it promises: fix one → rerun → fix next → rerun, repeated until done. That's the same re-run waste as section 3, just dressed up as "fast feedback." Only use `--bail 1` when (a) you genuinely expect all current failures to share one root cause and you want to confirm the smoke clears, or (b) a single failure is producing so much output that a full run is unreadable even with the agent reporter. Otherwise: run all, fix all, rerun once to confirm.
- **Workspace/monorepo invocations**: prefer running vitest from the package directory (`cd packages/foo && npx vitest run`) rather than orchestrating through the workspace root unless the project's scripts specifically require the root path.

## Quick reference

| Goal                                                                   | Command                                                   |
| ---------------------------------------------------------------------- | --------------------------------------------------------- |
| Run a single file, fail-only output                                    | `npx vitest run path/to/foo.test.ts`                      |
| Force agent reporter (custom reporters configured)                     | `npx vitest run --reporter=agent path/to/foo.test.ts`     |
| Run one named test                                                     | `npx vitest run path/to/foo.test.ts -t "test name regex"` |
| Capture full output for repeated inspection                            | `npx vitest run <args> > /tmp/vitest.out 2>&1`            |
| Through an npm script without entering watch                           | `npm test -- --run`                                       |
| Stop at first failure (only when failures share a root cause — see §5) | `npx vitest run --bail 1 <args>`                          |

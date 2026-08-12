---
name: vitest
description: Use before running vitest — `vitest`, `npx vitest`, `pnpm vitest`, `npm test`/`pnpm test`/`yarn test`, or any command that invokes the vitest binary — and when writing or editing vitest tests that touch env vars, globals, or assert on a captured error. Prevents hanging in watch mode, re-running the suite just to re-filter its output, mutating `process.env` across parallel workers, and assertions that hide the error that actually broke the test.
metadata:
  author: Espen Hovlandsdal
  version: "2026.08.12"
---

# Running vitest efficiently

Goal: the full failure picture in **one run**, with minimal output, never blocking on watch mode.

## 1. Never enter watch mode

Bare `vitest` watches in a TTY and hangs until killed. Scripts wired as `"test": "vitest"` mean `npm test` hangs too.

- Use `npx vitest run <args>` (or `vitest --run`).
- Via an npm script: `npm test -- --run`. If the script does more than invoke vitest, call `npx vitest run` directly so you know what's happening.
- No output after ~10s? Assume watch mode and kill it rather than waiting.

## 2. Use the `agent` reporter, don't grep

Vitest ≥4.1.0 auto-enables an `agent` reporter when it detects it's running inside an AI coding agent: only failed tests and their errors, no passing-test logs, no summary block.

- No custom `reporters` in `vitest.config.*` → already on, just `npx vitest run <file>`.
- Custom reporters configured → auto-detection is bypassed; force it with `--reporter=agent`.
- Older than 4.1.0 → `--reporter=dot`, and suggest upgrading.

Reaching for `| grep "×"`, `| grep FAIL`, or `| head -N` means the reporter is wrong. Fix the reporter instead of papering over the output.

## 3. Never re-run just to re-slice the output

Want a different view of the same failures? Re-read the output you already have. Capture once, inspect many:

```bash
npx vitest run client.test.ts > /tmp/vitest.out 2>&1
```

Re-run only when something actually changed: you edited code, you're verifying a fix, or you suspect flake.

## 4. Scope tightly from the first invocation

- By file: `npx vitest run path/to/foo.test.ts` — one or more paths, positional.
- By name: `-t "regex"` matches test/describe names as a regex, so `|` is alternation.
- Both, for the fastest signal: `npx vitest run path/to/foo.test.ts -t "handles HTTP errors"`.

Widen (drop `-t`, then the path) only once the narrow runs pass.

## 5. Stub env and globals, never mutate

Test files run in parallel workers, so assigning `process.env.FOO`, `import.meta.env.FOO`, or any global races other tests, leaks across files, and clobbers pre-existing values. `vi.stubEnv` / `vi.stubGlobal` record and restore prior state; use `vi.spyOn` for methods.

```ts
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test("reads PROJECT_ID", () => {
  vi.stubEnv("PROJECT_ID", "abc123");
});
```

`unstubEnvs: true` + `unstubGlobals: true` in `vitest.config.ts` replaces that `afterEach`.

## 6. Assert on captured errors so failures stay debuggable

When a test captures an error instead of letting it throw — CLI helpers returning `{error, exitCode, stdout, stderr}`, or a `try`/`catch` around the call under test:

- **Success tests: `if (error) throw error`.** Never `expect(error).toBeUndefined()` — it reports only "expected undefined, received Error" and throws away the message and stack that tell you what broke.
- **Error tests: `expect(error).toBeInstanceOf(Error)`**, plus exit code and message. `toBeDefined()` passes on a stray string and proves nothing about which failure fired.

```ts
test("lists datasets", async () => {
  const {error, stdout} = await runCli(["dataset", "list"]);
  if (error) throw error;
  expect(stdout).toContain("production");
});

test("rejects an unknown dataset", async () => {
  const {error, exitCode, stderr} = await runCli(["dataset", "delete", "nope"]);
  expect(error).toBeInstanceOf(Error);
  expect(exitCode).toBe(1);
  expect(stderr).toContain("Dataset not found");
});
```

## 7. Other defaults

- **No `--coverage`** unless asked; it floods the output.
- **Omit `--bail`.** The agent reporter keeps a full run's output small, so: run all → fix all → rerun once to confirm. `--bail 1` turns that into fix-one-rerun-repeat, the same waste as §3. Use it only when you expect every failure to share one root cause, or when a single failure's output drowns the run.
- **Monorepos**: run from the package directory (`cd packages/foo && npx vitest run`) unless the project's scripts require the root.

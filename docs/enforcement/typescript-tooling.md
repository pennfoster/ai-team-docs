# TypeScript Tooling

How to make the [TypeScript dialect](../dialects/typescript.md) automatic. Everything here is free and runs in the existing toolchain and in GitHub Actions. Tools are recommendations for meeting the [gate contract](overview.md#the-gate-as-a-contract); the contract is the standard.

## Layer 1 — Architecture / boundaries

The rules that protect [readiness for change](../principles/01-readiness-for-change.md): no wrong-direction dependencies, no cycles, layers kept apart.

- **`dependency-cruiser`** — declares allowed/forbidden dependencies as rules and validates (and visualizes) the import graph. Use it to forbid the core importing transport, to forbid cross-feature imports, and to detect cycles. Runs as a CLI in CI.
- **`eslint-plugin-boundaries`** — defines "element types" (e.g. `data`, `transformation`, `effect`, or `core`/`edge`) by path pattern and declares which may depend on which, enforced inside ESLint.
- **`eslint-plugin-import`** — at minimum enable `import/no-cycle` to ban circular dependencies, plus `import/no-restricted-paths` for coarse boundary rules.

Pick `dependency-cruiser` for graph-wide rules and visualization, or `eslint-plugin-boundaries` if you want boundary rules to live inside the ESLint run. Either satisfies the architecture-test line of the gate.

## Layer 2 — Style + immutability

- **ESLint (flat config)** is the spine. It already enforces much of the dialect; the rest comes from plugins and a few `no-restricted-syntax` rules.
- **`eslint-plugin-functional`** — enforces the functional core of the dialect: `functional/no-let` (the `const`-only rule), immutable-data rules, no parameter reassignment.
- **`no-restricted-syntax`** recipes cover the dialect rules without a custom plugin:
  - ban `SwitchStatement` (dialect uses lookups/strategy),
  - ban `FunctionDeclaration` and `FunctionExpression` (arrow functions only),
  - ban `ForStatement` / `WhileStatement` (expressions over statements),
  - flag a statement beginning with `(` or `[` (the leading-semicolon ASI workaround).
- **Custom rules** for anything project-specific — the same idea as the existing repo's "Style Guardian" hook, promoted into a shared ESLint config so every repo inherits it. Package the org config as a single shareable `eslint-config-*` so a repo opts in with one line.
- **Formatter** — Prettier (`prettier --check` in CI), or ESLint's stylistic rules if you prefer one tool. Either satisfies the formatter line of the gate. Keep the no-semicolons setting here.

## CSS (front-end repos)

- **Stylelint** with a shared config enforces the CSS sub-dialect: a custom/`declaration-property-value-disallowed-list` rule to require `var(--token)` for color/shadow/radius/spacing, a rule banning single-edge `border-*` and zero-blur inset `box-shadow` on box elements, and a ban on `margin` for layout spacing where feasible.

## How it runs (GitHub Actions)

A single workflow runs all four gate checks as required status checks:

```yaml
- run: npm ci
- run: npx depcruise src --config .dependency-cruiser.cjs   # architecture
- run: npm run lint                                          # eslint, error severity
- run: npx prettier --check .                                # formatter
- run: npm test                                              # tests
```

Mark these as **required** in branch protection on the default branch. That is the whole enforcement story for TypeScript: free tools, run in the GitHub Actions we already have, blocking merge on failure.

## Distribution

Publish the org ESLint, Prettier, Stylelint, and dependency-cruiser configs as small shared packages (private npm scope or a git dependency — no paid registry needed). A repo adopts the standard by depending on those configs and extending them, so a rule change ships to every repo through a version bump rather than a copy-paste sweep.

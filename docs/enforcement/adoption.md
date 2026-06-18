# Adoption

These standards are recommended and adopted **incrementally**. Turning every rule to `error` across every repository on day one produces a wall of warnings nobody reads and a gate everyone routes around. The goal is the [gate contract](overview.md#the-gate-as-a-contract); the path is a ratchet that only ever tightens.

## The ratchet

1. **Land the docs and socialize the principles.** Start with Tier 1 — [readiness for change](../principles/01-readiness-for-change.md), [layers](../principles/02-layers.md), [where does this go](../principles/03-where-does-this-go.md). The principles are what people need to *agree* on; the dialect rules follow from them. A team that buys the "minimize change-surface" thesis will accept the syntax rules as consequences rather than fiat.

2. **Conform new code now.** New files follow the dialect immediately. This costs nothing — there is no legacy to fix — and it stops the problem from growing while you deal with the back catalog.

3. **Baseline existing code.** Turn the dialect rules on at **warning**, capture the current violations as an accepted baseline, and let the build stay green:
   - ESLint: run with `--max-warnings` pinned to the current count, or use per-directory overrides.
   - Roslyn: set severities in `.editorconfig`; use an analyzer baseline / `<NoWarn>` scoped to legacy projects.
   The baseline makes the existing debt visible and frozen — it cannot grow — without blocking work.

4. **Ratchet severity over time.** Periodically lower the allowed-warning count or flip specific rules from `warning` to `error` as the codebase catches up. Each tightening is a small, reviewable change. The count only goes down.

5. **Add architecture tests with an exception list.** Encode the intended [boundaries](../principles/02-layers.md) as tests, but allow the *current* violations as a documented, shrinking exception list. The test fails if a **new** violation appears; existing ones are burned down deliberately. This is the highest-value layer — it protects the property that actually delivers readiness-for-change — so it is worth doing even while style rules are still at warning.

6. **Wire the required checks once a repo is green** at the agreed severity. Only then make the four gate checks *required* in branch protection. Until then they run and inform, but do not block.

7. **Put "where does this go?" in code review.** The [reviewer checklist](../principles/03-where-does-this-go.md#reviewer-checklist) catches the structural issues no linter can — layer collapse, duplicated decisions, a discriminator branched on in three places. Make it a standing item in PR review.

## Per-repository onboarding checklist

- [ ] Depend on the shared lint/analyzer/formatter configs (TS: shared ESLint/Prettier/Stylelint packages; C#: shared `.editorconfig` + `Directory.Build.props` + analyzer package).
- [ ] Add the architecture-test setup (dependency-cruiser config, or an ArchUnitNET test project) encoding this repo's intended boundaries, with current violations listed as exceptions.
- [ ] Turn dialect rules on at **warning** and record the baseline count.
- [ ] Add the four gate checks to the GitHub Actions workflow (architecture, lint/analyze, format, test).
- [ ] Once green, mark those checks **required** in branch protection on the default branch.
- [ ] Schedule the ratchet — a recurring small PR that tightens one rule or lowers the warning ceiling.

## What "done" looks like

Every repository, regardless of language, blocks a merge that breaks a layer boundary, violates the dialect at error severity, is unformatted, or fails its tests — and does so using only the team's existing tools and the GitHub we already pay for. New variants are added, not branched in; a rule change ships through a config version bump rather than a copy-paste sweep; and "where does this go?" has the same answer no matter who is asked.

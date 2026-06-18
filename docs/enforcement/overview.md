# Enforcement Overview

Standards that live only in a document decay. These do not have to — almost every rule in the dialect docs can be checked by a machine, on every change, for free. This section describes *what* to enforce and *how*, with two hard constraints:

1. **We standardize the gate, not the vendor.** The standard is an *outcome* every repository must meet, expressed independently of any particular tool. Tools are recommended ways to meet it, not the standard itself. A team may swap a tool as long as the outcome holds.
2. **No paid services beyond GitHub.** Everything here runs on tools already in the toolchain (ESLint, the .NET SDK, NuGet/npm packages) and on **GitHub Actions**, which we already have. No SonarCloud/Codacy/DeepSource subscriptions, no new SaaS. Where a free option has a catch (see CodeQL below), the catch is called out rather than assumed away.

## Posture: recommended, adopted incrementally

These tools are **recommended, not mandated on day one.** A big-bang "turn everything to error across every repo" would just generate noise nobody reads. The [adoption guide](adoption.md) describes the ratchet: conform new code now, baseline existing code, tighten over time. The end state is the gate below; the path there is gradual.

## The three enforcement layers

Enforcement mirrors the two tiers of the standards. Each layer is satisfied by free, in-toolchain tools and runs in CI.

| Layer | What it protects | TypeScript | C# / .NET |
|---|---|---|---|
| **Architecture / boundaries** | the [layer](../principles/02-layers.md) and dependency rules — the part that actually delivers readiness-for-change | `dependency-cruiser` and/or `eslint-plugin-boundaries`; `import/no-cycle` | `ArchUnitNET` (preferred) or `NetArchTest`, run as `dotnet test` |
| **Style + immutability** | the dialect rules | ESLint + `eslint-plugin-functional` + custom rules; Prettier | Roslyn Analyzers via `.editorconfig` (`EnforceCodeStyleInBuild`, `TreatWarningsAsErrors`); StyleCop/Roslynator; CSharpier |
| **Org consistency backbone** | one gate across every repo regardless of language | GitHub Actions **required status checks** + branch protection | same |

Details per language: [TypeScript tooling](typescript-tooling.md) · [C# tooling](csharp-tooling.md).

## The gate as a contract

The org-wide *outcome* — identical across languages — is this. Every repository's CI, on every pull request, runs as **required status checks** that block merge on failure:

- [ ] **Architecture tests pass** — no wrong-direction dependencies, no cycles, layer boundaries intact.
- [ ] **Linter/analyzer passes at error severity** for the agreed rule set (the dialect rules).
- [ ] **Formatter reports no changes** (`prettier --check`, `dotnet format --verify-no-changes`, or CSharpier `--check`).
- [ ] **Test suite passes.**

Branch protection on the default branch requires those checks before merge. That is the entire cross-language consistency mechanism: not a shared dashboard product, but a shared *contract* that each repo satisfies with its own language's tools, enforced by the GitHub we already pay for.

## What we are explicitly NOT buying

- **Sonar / Codacy / DeepSource (paid tiers): out.** We are not committing to any code-quality SaaS or any specific quality-gate vendor right now.
- **A self-hosted SonarQube Community instance** is free of license cost but is *a service someone has to run and maintain.* It is a deferred *option* if we ever want a unified trend dashboard — not part of this recommendation, and not a dependency of the gate above.
- **GitHub CodeQL / code scanning** is free for **public** repositories. On **private** repositories it requires GitHub Advanced Security, which is a paid add-on. So treat CodeQL as available-if-public / conditional-if-private — flag it, don't assume it.

## The honest tradeoff

Without a Sonar-style aggregator we give up a single cross-language dashboard with trend lines and historical quality scores. We do **not** give up enforcement: each repo's gate either passes or blocks the merge, which is the part that changes behavior. A dashboard is a "nice to have later," not a prerequisite — and adding one stays possible without unwinding anything here.

## Leading vs lagging

The gate above is a **leading** indicator: it checks change-surface on every PR, before merge. To confirm that lower change-surface actually pays off downstream, [Delivery metrics](delivery-metrics.md) tracks the **lagging** complement — the four *Accelerate* delivery measures (deployment frequency, lead time, change failure rate, time to restore), computed from GitHub data with the same no-paid-tooling constraint.

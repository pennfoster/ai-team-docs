# Engineering Standards

Org-wide code-quality standards, spanning every language and project we build — currently TypeScript (React/Vue) and C#/.NET.

## The one sentence

> The quality of our code is measured by how ready it is for change.

When a requirement changes, the number of places you must edit should be the smallest the problem allows. Every standard in this set exists to serve that, and is justified by it. If a rule and that sentence ever disagree, the sentence wins. Read [Readiness for Change](principles/01-readiness-for-change.md) first — everything else follows from it.

## How this is organized

The standards are deliberately split into two tiers, so the same ideas can be consistent across the org while still fitting each language honestly.

- **Tier 1 — Principles** *(language-agnostic, the constitution).* What we believe about structuring code, true in any language. Read once; they rarely change.
- **Tier 2 — Dialects** *(per-language).* How each principle is *spelled* in a specific language. The TypeScript and C# dialects realize the **same** principles with different constructs — and where they diverge (e.g. `switch`), the divergence is intentional and explained.
- **Enforcement** *(recommended, free, automated).* How to make the rules machine-checked on every change, using only existing tooling and GitHub — no paid services, no committed vendor.

```
principles/   01 readiness-for-change · 02 layers · 03 where-does-this-go · 04 information-hiding · 05 naming · 06 single-choice
dialects/     typescript · csharp
enforcement/  overview · typescript-tooling · csharp-tooling · adoption · delivery-metrics
```

## Reading order

1. **Everyone:** [Readiness for Change](principles/01-readiness-for-change.md) → [Layers](principles/02-layers.md) → [Where Does This Go?](principles/03-where-does-this-go.md).
2. **Then:** [Information Hiding](principles/04-information-hiding.md), [Naming](principles/05-naming.md), and [Single Choice](principles/06-single-choice.md).
3. **Your language:** the [TypeScript](dialects/typescript.md) or [C#](dialects/csharp.md) dialect.
4. **Setting up a repo:** [Enforcement overview](enforcement/overview.md) and the [adoption guide](enforcement/adoption.md).

## The principles, in brief

- **[Readiness for change](principles/01-readiness-for-change.md)** — quality = minimal change-surface. The named failure mode is *change amplification*; the deeper rule is *decompose by what is likely to change* (Parnas), a.k.a. *one reason to change* (SRP).
- **[Layers](principles/02-layers.md)** — two axes. Data / Transformation / Effect; and business-core vs transport/IO-edge with dependencies pointing inward (Hexagonal / Ports & Adapters, Onion). I/O code holds no decisions.
- **[Where does this go?](principles/03-where-does-this-go.md)** — a decision procedure that places new code the same way every time, plus a reviewer checklist.
- **[Information hiding](principles/04-information-hiding.md)** — draw boundaries around what changes; deep modules over shallow ones; name boundaries for what they decide, not how they work.
- **[Naming](principles/05-naming.md)** — names as a change-surface concern: intent over mechanism, predicate booleans, no abbreviations, no generic placeholders.
- **[Single choice](principles/06-single-choice.md)** — a set of variants has exactly one owner (Meyer's *Single Choice Principle*). Scatter — the same discriminator branched on in many places — is *Repeated Switches* / *Shotgun Surgery*; collapse it to one strategy keyed by the discriminator.

## Enforcement, in brief

We standardize a **gate outcome**, not a tool. Every repo's CI runs four required status checks on every PR — architecture tests, linter/analyzer at error severity, formatter check, test suite — and branch protection blocks merge on failure. That single contract gives cross-language consistency using only each language's free tooling plus the GitHub Actions we already have. No SonarCloud/Codacy/DeepSource, no committed vendor; see [enforcement/overview](enforcement/overview.md) for the (deliberate) tradeoffs.

The gate is a **leading** indicator (change-surface, per PR). [Delivery metrics](enforcement/delivery-metrics.md) are its **lagging** complement — the four *Accelerate* delivery measures, computed from GitHub data alone — so we can confirm that lower change-surface actually ships faster and breaks less.

## Status and changes

This is a living document set. Propose changes by PR. A change to a **principle** is a significant decision and should explain how it affects change-surface; a change to a **dialect** should cite the principle it serves. The standards describe the destination — see [adoption](enforcement/adoption.md) for how existing code ratchets toward it rather than being held to it overnight.

## Relationship to existing project docs

The CMS repo's `docs/CODE_STYLE.md` is effectively the seed of the [TypeScript dialect](dialects/typescript.md) — its `const`-only / no-semicolons / strategy-over-switch rules are the TS *spelling* of these principles, not universal law. As this standards set becomes the source of truth, that file should point here for the principles and keep only any CMS-specific specifics.

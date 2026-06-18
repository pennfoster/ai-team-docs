# Readiness for Change

> The quality of our code is measured by how ready it is for change.

This is the north star. Every other rule in these standards exists to serve it. When a rule and this sentence disagree, this sentence wins.

## The metric

A requirement is never final. It will be added to, refined, reversed. So the question that defines quality is not "is this code clean?" but:

> When this requirement changes, how many places must I edit?

That count is the **change-surface** of the requirement. Lower is better, down to the irreducible minimum the problem itself imposes. Code is high quality when a single conceptual change maps to a single, obvious, local edit — and low quality when one conceptual change forces edits scattered across many files, layers, and authors.

This is not a metaphor. You can measure it. Pick a representative change ("the late-fee grace period moves from 10 days to 14", "we add a third user role", "billing moves from one provider to another") and count the files that must change. If the count is larger than the idea, the code is in the wrong shape.

## The named failure mode: change amplification

When a conceptually small change requires edits in many places, you have **change amplification** (Ousterhout, *A Philosophy of Software Design*). It is the single most reliable symptom of a bad decomposition. Its causes are always one of a short list:

- **Duplicated decisions.** The same rule is expressed in more than one place, so every change must find and update every copy — and missing one is a bug.
- **Decisions tangled with I/O.** A rule that lives inside a database query or an HTTP handler can only change by editing transport code, and can only be tested by standing up transport.
- **A discriminator branched on in N places.** When `type === 'x'` (or its equivalent) drives behavior in three different functions, adding a new type means editing all three and hoping you found them all. This has its own principle — see [Single Choice](06-single-choice.md).
- **Leaked implementation details.** When a module exposes how it works rather than what it decides, every caller is coupled to the mechanism, so changing the mechanism changes every caller.

The rest of these standards are, almost entirely, named defenses against these four causes.

## The deeper principle: decompose by what changes

The foundational statement is Parnas (1972), *On the Criteria To Be Used in Decomposing Systems into Modules*: **a module should hide a decision that is likely to change.** Do not decompose by the steps a process happens to run through (parse, then validate, then save); decompose by the things that vary independently (the storage format, the validation rules, the wire protocol). When you draw boundaries around what changes, a change stays inside one boundary.

Robert Martin's Single Responsibility Principle is the same idea stated from the other side: **a module should have one reason to change** — one actor, one stakeholder, one axis of variation. If two unrelated requirements can both force you to edit the same function, that function is doing two jobs and should be split.

## What this means in practice

- Before writing a function, ask what decision it owns and what would make that decision change. If you cannot name a single such reason, the function is doing too much.
- Prefer a shape where adding a new case means **adding** code, not **editing** existing code (open for extension, closed for modification). A lookup table you add a row to beats a conditional you add a branch to.
- Treat duplication of a *decision* as a defect even when the duplicated lines look harmless. Two copies of a rule are two places a future change can be missed.

## What this is not

This is not an aesthetic standard, and it is not about cleverness or brevity. Every syntactic and structural rule in the dialect documents earns its place by either **reducing change-surface** or **reducing the chance of a silent error** — not by taste. If you ever cannot trace a rule back to one of those two justifications, question the rule, not your judgment.

## Where to go next

- [Layers](02-layers.md) — the primary tool for keeping a change inside one boundary.
- [Where does this go?](03-where-does-this-go.md) — the decision procedure that places new code in the right layer the first time.
- [Information hiding](04-information-hiding.md) — how to draw the boundaries themselves.
- [Single choice](06-single-choice.md) — the defense against a discriminator scattered across many branch sites.

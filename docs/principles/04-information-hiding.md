# Information Hiding

[Layers](02-layers.md) tell you the *kind* of each piece of code. Information hiding tells you where to draw the boundaries *between* modules — and getting those boundaries right is what keeps a change from leaking across them.

## Decompose by what changes, not by what happens

The instinct is to split a system by the steps it performs: a parsing module, a validation module, a saving module. Parnas (1972) showed this is usually wrong. Decompose instead by **the decisions that are likely to change independently**, and hide each one inside a module. The test is not "what does this code do?" but "what decision does this module hide, and what would make that decision change?"

When boundaries follow changeability, a change stays inside one module. When boundaries follow process steps, a single change (say, a new storage format) cuts across parsing, validation, and saving all at once — change amplification by construction.

## Deep modules over shallow ones

A **deep module** (Ousterhout) has a simple interface hiding a substantial implementation: callers learn a little and get a lot, and the implementation can be rewritten without touching a single caller. A **shallow module** exposes nearly as much as it hides — a thin pass-through, a wrapper that leaks its internals — and earns its keep poorly because changing it changes everyone.

Prefer interfaces that are narrow relative to the complexity they conceal. Ask of every module:

> What does this hide? If the answer is "nothing," why does it exist?

## One reason to change

A module should have **one reason to change** — one stakeholder or axis of variation that drives its evolution. If a billing rule change and a report-formatting change both force edits to the same module, it has two responsibilities and two reasons to change; split it so each change has its own home. Conversely, things that always change *together* belong together; splitting them just spreads one change across two files.

## The leak test

The sharpest practical question:

> If an implementation detail changes, does the module's *interface* change, or only its *implementation*?

If a purely internal change (a different algorithm, a different storage layout, a different vendor) forces the interface to change, then that detail is **leaking** through the boundary, and every caller is coupled to it. A good boundary lets the implementation churn freely while the interface holds still. This is exactly the Ports & Adapters discipline from [Layers](02-layers.md): the core defines a port in terms of the domain, and the adapter hides the mechanism behind it.

## Name the boundary by what it decides

Name a module, interface, or function for the decision it owns or the intent it serves — not for the mechanism it currently uses. `GradeCalculator` survives a rewrite; `PostgresGradeLoader` advertises its mechanism and becomes a lie the day the mechanism changes. Naming for intent keeps the name stable across exactly the changes we are trying to be ready for. (Casing and language specifics live in the dialect docs; the principle is *meaning over mechanism*.)

## Where to go next

- [Naming](05-naming.md) — names as a change-surface concern.
- [Where does this go?](03-where-does-this-go.md) — placing code once the boundaries exist.

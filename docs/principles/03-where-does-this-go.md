# Where Does This Go?

This is the most-asked question on any team, and the answer is usually a judgment call that two engineers answer two different ways. That inconsistency *is* change-amplification in slow motion: code accretes in the wrong places, and later changes pay for it. This document turns the question into a procedure that a junior engineer and a reviewer answer the same way.

Run it for every new piece of code, before you write it.

## The procedure

Answer in order. The first "yes" places the code.

**1. Is it a decision expressed as a value?**
A lookup map, a config object, a route table, a set of rules with no behavior of their own. If you could write it down as a table and read the answer off it → **[Data](02-layers.md)**.

**2. Is it a pure derivation?**
Does it compute an output purely from its inputs — no database, no network, no filesystem, no DOM, no clock, no randomness, no reading or mutating external state? If output depends only on arguments → **[Transformation](02-layers.md)**.

**3. Does it touch the outside world?**
Database, network, filesystem, object storage, DOM, environment, time, randomness. If yes → **[Effect](02-layers.md)** — and now apply the constraint: it must hold **no domain decisions**. Any rule, calculation, or branch on a domain value gets lifted out into a Transformation (step 2) and called from here. The Effect is wiring only.

Then, independently, the dependency-direction question:

**4. Is it a business rule or a delivery concern?**
- A statement about what the **domain** means — when a fee applies, what a valid enrollment is, how a score maps to a grade → it belongs in the **business core**, in a module that imports no transport, no ORM, no framework, no vendor SDK.
- A statement about **how** something is transported, stored, or rendered — this endpoint's shape, this table's columns, this component's markup → it belongs at the **transport/IO edge**, which may depend inward on the core but never the reverse.

## Reviewer checklist

A reviewer (human or automated) can run this against any diff:

- [ ] Does any function contain both `await`/I/O **and** a domain decision (a branch on a domain value, a calculation, a rule)? → layer collapse; lift the decision out.
- [ ] Is the same decision expressed in more than one place? → duplicated decision; extract to one Transformation or one Data table.
- [ ] Does a discriminator (`type`, `status`, `role`, `kind`) drive behavior in three or more places? → extract a strategy/lookup keyed by the discriminator ([Single Choice](06-single-choice.md)).
- [ ] Does a core/domain module import a framework, ORM, HTTP client, or vendor SDK? → dependency-rule violation; invert it behind a port.
- [ ] Can you name this function's single reason to change in one phrase? → if not, split it.

## The one-word test

If you cannot answer "which layer is this — Data, Transformation, or Effect?" with a single word, the unit is doing more than one job. Split it until each piece has a one-word answer. The split is almost never wasted: the pure part becomes testable and reusable, and the I/O part shrinks to wiring you barely have to think about.

## Why bother being this mechanical

Because consistency is the whole point. If everyone places code the same way, then everyone *finds* code the same way, and a future change lands in the one obvious place. A procedure that removes judgment from "where does this go" is what makes the change-surface predictable — and a predictable change-surface is [readiness for change](01-readiness-for-change.md).

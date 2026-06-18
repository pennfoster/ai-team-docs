# Why These Documents

> The quality of our code is measured by how ready it is for change.

These standards exist so the whole org pulls in the same direction. But naming *why* matters, because the answer has grown a second half.

## The original reason: agreed, measurable expectations

Before anything else, this is about having expectations that are **written down, agreed on, and checkable**:

- **Documented.** "Good code" stops being a matter of taste or whoever reviewed the PR that day. There is one place to point to, the same in every repo and every language.
- **Measurable.** [Readiness for change](principles/01-readiness-for-change.md) gives a number — change-surface — not a vibe. [Delivery metrics](enforcement/delivery-metrics.md) confirm the leading indicator with lagging ones.
- **Tooled.** [Enforcement](enforcement/overview.md) turns the rules into required CI checks so the standard holds without a human remembering it.

That alone justifies the effort. None of it is new — it is the reason coding standards have always existed.

## The new reason: better generative-AI code

Most code in these repos is now written with AI assistance, and that changes the stakes. Left to a generic prompt, a model optimizes for the **local feature**: make this endpoint work, make this test pass. It does not, by default, ask where the decision belongs, what boundary it crosses, or whether the capability already exists somewhere in the system.

These documents reframe the task. Instead of "add this feature," the model is steered to ask the questions the principles ask:

- Where does this go? ([Where Does This Go?](principles/03-where-does-this-go.md))
- What layer owns this decision, and does it leak I/O? ([Layers](principles/02-layers.md))
- Does this capability already exist, or am I about to duplicate it? ([Information Hiding](principles/04-information-hiding.md), [Single Choice](principles/06-single-choice.md))

This is the difference between **feature-focused** generation and **system-focused** generation — thinking about boundaries, layers, and reuse rather than the narrowest path to a passing test.

## Why that pays off

**Lower token cost.** Generic, feature-focused output spends tokens re-implementing things that already exist and producing fragile or incorrect code that then has to be re-explained and rewritten. System-aware output reuses what's there and lands closer to correct the first time. A large part of this is **planning up front**: spending tokens to locate the right boundary before writing code is far cheaper than discovering it after, across a sprawling diff.

**Higher long-term stability and confidence.** Code that respects the system's boundaries has a small, predictable change-surface — exactly what [Readiness for Change](principles/01-readiness-for-change.md) measures. That means changes stay local, regressions are rarer, and reviewers (human or AI) can trust the shape of what they're looking at. The standards make AI a force that *lowers* entropy over time instead of raising it.

## In one line

The same principles that made human-written code ready for change now make AI-written code cheaper to produce and safer to keep — by moving generation from "make the feature work" to "fit the system."

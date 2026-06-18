# Delivery Metrics

The [gate](overview.md) measures a **leading** indicator: change-surface, checked on every pull request before merge. This document measures the **lagging** indicators that change-surface is supposed to move — the four delivery metrics from *Accelerate* (Forsgren, Humble, Kim) that our [Engineering Deployment Quality](#) note adopts. The gate tells you a change is *safe and small*; these tell you the delivery *system* is actually getting faster and more resilient as a result.

This is enforcement, not a principle: it is an outcome made visible by automation, on the GitHub we already pay for, with no paid tooling — the same two constraints as the rest of this tier (see [overview](overview.md)).

## Why these belong next to the gate

The standards exist to lower change-surface ([readiness for change](../principles/01-readiness-for-change.md)). The claim that this *matters* is a claim about delivery — that smaller, well-placed changes ship faster and break less. That claim is testable, and the four metrics are the test. Each one traces back to a principle:

| Metric | What it measures | The principle that moves it |
|---|---|---|
| **Deployment frequency** | how often a service ships to production | The per-PR [gate](overview.md) makes each small change independently shippable — frequency is what you get when validation is automated per change instead of batched into a release event. |
| **Lead time for changes** | commit → production duration | Low change-surface makes a conceptual change "a single, obvious, local edit" ([01](../principles/01-readiness-for-change.md)). Small local diffs clear review and CI faster than scattered ones. |
| **Change failure rate** | share of deployments needing remediation | The four causes of change amplification ([01](../principles/01-readiness-for-change.md)) *are* the "missed one of N edits" defects. [Single Choice](../principles/06-single-choice.md) turns N silent half-updates into one missing key the compiler catches. |
| **Time to restore service** | failure → recovery duration | Deep modules and Ports & Adapters ([04](../principles/04-information-hiding.md), [02](../principles/02-layers.md)) localize the fix behind a stable interface; pure transformations let it be validated without standing up I/O. |

If change-surface is falling but these four are not improving, question the thesis — that is the honest feedback loop this document exists to provide.

## Measuring on GitHub only

Every metric below is derivable from data GitHub already holds — the Deployments API, Actions run timestamps, PR and issue timestamps — with no external service. The recommended shape is a single scheduled Actions workflow that reads the API, computes the four numbers over a trailing window, and writes them to an artifact (or a small committed JSON the team renders). Same posture as the gate: standardize the *number*, not a vendor dashboard.

- **Deployment frequency.** Count successful production deployments over the window. Source: the [GitHub Deployments API](https://docs.github.com/en/rest/deployments) filtered to the `production` environment (status `success`), or successful runs of the named deploy workflow. One count per service.
- **Lead time for changes.** For each production deployment, take the time from the merged PR's first commit (`authoredDate`) to the deployment's `created_at`, and report the median over the window. Both timestamps come from the REST API; no instrumentation in the app.
- **Change failure rate.** `(deployments that triggered remediation) / (total deployments)`. GitHub cannot *know* a deploy broke production, so this metric requires one piece of human signal — a convention: a `rollback` label on the revert PR, or an `incident` issue linked to the deploy. The workflow counts those against the deployment total.
- **Time to restore service.** From the failure signal (the `incident` issue's `created_at`, or the rollback PR's open time) to the restoring deployment's `created_at`; report the median. Reuses the same convention as the failure-rate metric.

## The honest tradeoff

Two of the four metrics are only as good as a convention. Deployment frequency and lead time are computed from data GitHub records automatically and are trustworthy on day one. **Change failure rate and time to restore depend on humans labeling reverts and opening incident issues** — without that discipline they are guesses. We accept that rather than buy an APM/incident vendor to infer failures: the convention is cheap, in-toolchain, and honest about what it can't see.

This document also stops at *measurement*. Recovery *practices* — rollback strategy, progressive delivery, feature flags, incident runbooks — are operational concerns that live with the service, not code-quality standards. The metrics here tell you whether those practices are working; they do not prescribe them.

## Reviewer / adoption checklist

- [ ] Production deployments go through a named environment or workflow, so they are countable via the Deployments API.
- [ ] A `rollback` PR label and an `incident` issue convention exist, so failure-rate and restore-time have a signal.
- [ ] A scheduled Actions workflow computes the four numbers over a trailing window and publishes them as an artifact or committed JSON.
- [ ] The team reviews the four numbers on a regular cadence and reads them *against* change-surface trends, not in isolation.

## Where to go next

- [Enforcement overview](overview.md) — the per-PR gate these metrics complement.
- [Adoption](adoption.md) — the ratchet; add this measurement once a repo's gate is green.
- [Readiness for change](../principles/01-readiness-for-change.md) — the leading indicator these four lagging indicators are meant to confirm.

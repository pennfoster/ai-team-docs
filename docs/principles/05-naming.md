# Naming

Names are a change-surface concern, not a cosmetic one. A vague name forces every future reader to re-derive intent from the implementation before they can safely change it — and a reader who guesses wrong introduces a bug. A precise name is a cached decision: it tells the next person what this is *for* so they can change it without reverse-engineering it.

These are language-agnostic principles. Casing conventions (camelCase, PascalCase, snake_case) are a dialect concern and live in the per-language docs; what follows is about *meaning*, which is portable.

## Name for intent, not mechanism or type

Name a thing for the role it plays in the domain, not for how it is currently implemented or what type it happens to be. `enrollmentDeadline` survives a refactor; `dateField2` never told you anything and `timestampLong` will lie the moment the representation changes. Naming for intent keeps names stable across exactly the changes we want to be ready for — see [information hiding](04-information-hiding.md).

## Boolean names are yes/no questions

Any name that holds a boolean should read as a question with an obvious yes/no answer. Use a predicate prefix:

`is`, `has`, `can`, `should`, `was`, `did`, `are`, `have`.

`isActive`, `hasOutstandingBalance`, `canEnroll`, `shouldRetry`. A boolean called `active` or `enrollment` forces the reader to discover its type before they can read the logic; a predicate prefix makes the conditional read like prose.

## No abbreviations

Write the whole word. `message`, not `msg`. `context`, not `ctx`. `button`, not `btn`. `module`, not `mod`. `event`, not `evt`. Abbreviations save a few keystrokes once and cost comprehension on every read forever, and they fragment search — half the codebase says `config` and half says `cfg`, and neither find the other. The only exceptions are abbreviations that are genuinely more standard than their expansion in the domain (`id`, `url`, `html`, `api`).

## No generic placeholder names

Ban `data`, `result`, `item`, `info`, `temp`, `val`, `obj`, `thing`. They describe the variable's type-shape, never its meaning, and they are the names most likely to end up holding something other than what they claim. A loop variable over enrollments is `enrollment`, not `item`. The return of a grade calculation is `grade` or `calculatedGrade`, not `result`. If the only honest name you can think of is `data`, you probably haven't decided what the value *is* yet — decide that first.

## Why this is a quality rule, not a style rule

Every one of these reduces the work and the risk of a future change: intent-named symbols don't have to be decoded, predicate booleans don't have to be type-checked by eye, full words are searchable, and specific names resist drifting away from their meaning. That is the same standard every rule here is held to — does it make the code [readier for change](01-readiness-for-change.md)? — and naming is where it pays off on literally every line.

# TypeScript Dialect

This is the TypeScript/Vue/React realization of the [principles](../principles/01-readiness-for-change.md). It is Tier 2: every rule here is a *spelling*, in this language, of a portable idea from Tier 1. Each rule cites the principle it serves — if a rule ever seems arbitrary, follow the citation back to the reason. None of these rules are about taste; they exist to lower change-surface or remove a class of silent error.

## The three layers in TypeScript

| Layer | Spelled as | Rule |
|---|---|---|
| **Data** | `as const` lookup maps, route tables, config objects, Zod schemas | No behavior. A value you can log, diff, and read the answer off of. |
| **Transformation** | pure arrow functions | No `await`, no `fetch`, no reading a `ref()`/store, no mutation. Output depends only on arguments. |
| **Effect** | `async` handlers, store actions, API clients, DOM writes | Thin wiring. If it contains `await`, it contains **no domain decision** — it delegates to a Transformation. |

### Data — decisions as values

```typescript
const enrollmentRules = [
  {
    status: 'graduated',
    canEnroll: false,
    check: ({ completedCredits, requiredCredits }: Student) =>
      completedCredits >= requiredCredits,
  },
  {
    status: 'hold',
    canEnroll: false,
    check: ({ outstandingBalance }: Student) => outstandingBalance > 0,
  },
  {
    status: 'eligible',
    canEnroll: true,
    check: ({ isActive }: Student) => isActive,
  },
] as const
```

### Transformation — pure function

```typescript
const determineEnrollmentStatus = (student: Student) => {
  const matchedRule = enrollmentRules.find(({ check }) => check(student))

  return {
    status: matchedRule?.status ?? 'inactive',
    canEnroll: matchedRule?.canEnroll ?? false,
  }
}
```

A block body is correct here because there is an intermediate binding before the return; the blank line before `return` separates the result from the work.

### Effect — thin wiring

```typescript
const handleEnrollmentStatus = async ({ params: { studentId } }: Request, reply: Reply) => {
  const student = await loadStudent(studentId)

  return student
    ? reply.send(determineEnrollmentStatus(student))
    : reply.status(404).send({ error: 'Not found' })
}
```

The handler performs I/O and wires data to a transformation. The enrollment *decision* lives in `determineEnrollmentStatus`, which is testable with a plain object — no database, no reply. That separation is the whole point: a rule change touches the pure function; a transport change touches the handler; they never touch each other.

## Syntax rules and the principle each serves

- **`const` only — no `let`, no reassignment.** *(Immutability ⇒ trustworthy Data.)* A value that can change between definition and use is no longer a reliable declaration; you are back to tracing state through time. If you reach for `let`, restructure with `map`/`filter`/`reduce`, or move the changing value into a `ref`.
- **Arrow functions only — no `function`.** *(No hidden context.)* No `this` rebinding, no hoisting. A function does not carry implicit decisions about how it is called.
- **Expressions over statements.** *(Pure Transformation.)* Expressions evaluate to values; statements cause effects. Prefer `map`/`filter`/`reduce` over `for`+`push`, ternaries over `if`/`else`, expression bodies over block bodies.
- **Data-driven decisions — object lookups, never `switch`, never 3+ `else if`.** *(Decisions belong in Data; see [strategy](#strategy-over-branching).)* A `switch` is a fallthrough-prone statement and an `else if` chain hides the discriminator; a `Record<Key, Value>` makes the decision an inspectable value.
- **Destructure upfront.** *(Naming + clarity.)* Pull the fields you use out of their container at the top, so the body reads in domain terms, not access paths.
- **Blank line before `return` in block bodies.** *(Clarity.)* The return value is the point; separate it from the work.
- **No semicolons.** *(Noise reduction.)* Not load-bearing, but consistent with removing anything that carries no meaning.

### Layout: one element per line

Ternaries, arrays of two or more items, and object literals of two or more keys are written vertically — one element per line, never packed onto one line. Packing hides the shape of the data and makes a one-element change a multi-element diff.

```typescript
const label = isActive
  ? 'Active'
  : 'Inactive'
```

### Arrow body style

A multi-line body that is still a single expression uses the parenthesized form, so it stays an expression rather than becoming a block with a `return`:

```typescript
const activeLessonTitles = (lessons: Lesson[]) => (
  lessons
    .filter((lesson) => lesson.isActive)
    .map((lesson) => lesson.title)
)
```

Use the brace-and-`return` form only when other statements must precede the return (an intermediate binding, a guard).

### No leading-semicolon ASI workaround

Never start a line with `(` or `[` defended by a leading semicolon (`;(expr)`). Bind to a `const` instead, so no statement begins with a token that automatic-semicolon-insertion can misparse:

```typescript
const [firstMatch] = matches
```

## Strategy over branching

When a `type`/`status`/`role` discriminator drives behavior in three or more places, the branches have escaped — adding a variant now means editing every site and hoping you found them all. Collapse them into one strategy table keyed by the discriminator. Everything known about a variant lives in one object; adding a variant is one new entry, and the consuming code stops branching entirely.

```typescript
interface ContentTypeStrategy {
  icon: string
  label: string
  render: (block: ContentBlock) => VNode
}

const contentTypes: Record<ContentType, ContentTypeStrategy> = {
  video: {
    icon: 'play-circle',
    label: 'Video Lesson',
    render: ({ url }) => h(VideoPlayer, { src: url }),
  },
  document: {
    icon: 'file-text',
    label: 'Reading',
    render: ({ html }) => h(DocumentViewer, { body: html }),
  },
  quiz: {
    icon: 'check-square',
    label: 'Assessment',
    render: ({ items }) => h(QuizEngine, { questions: items }),
  },
}

const resolveContentType = (type: ContentType) => (
  contentTypes[type] ?? contentTypes.document
)
```

## Naming

Follow the [naming principle](../principles/05-naming.md). In TypeScript that means: `camelCase` for values and functions, `PascalCase` for types and components, `SCREAMING_SNAKE_CASE` only for true module-level constants. Boolean predicates take a verb prefix (`isActive`, `hasChildren`, `canEnroll`). No abbreviations (`message` not `msg`, `context` not `ctx`). No generic placeholders (`data`, `result`, `item`, `temp`).

```typescript
const publishedLessons = lessons.filter((lesson) => lesson.status === 'published')
const courseDetails = await fetchCourse(courseId)
```

## Components (Vue / React)

Presentational components are **dumb**: they take data in through props and emit intents back out; they do not own data and do not mutate stores. The host (a view, a container, a route component) owns the data and performs the mutations in response to emitted events. This keeps the [layers](../principles/02-layers.md) intact at the component boundary — the leaf renders, the host effects — and makes the leaf reusable in any context that can supply props and handle intents.

```typescript
defineProps<{
  lessons: Lesson[]
  selectedId: string | null
}>()

defineEmits<{
  select: [lessonId: string]
  reorder: [order: string[]]
}>()
```

## CSS layout (front-end sub-dialect)

Layout is a [readiness-for-change](../principles/01-readiness-for-change.md) concern too: a fragile height/overflow chain breaks the moment one link changes.

- **Grid for page layout, flex for 1D alignment.** The container owns sizing via grid tracks; children do not opt into being constrained with `flex: 1` / `min-width: 0`.
- **`minmax(0, 1fr)`, never bare `1fr`.** Bare `1fr` is `minmax(auto, 1fr)`, whose `auto` minimum prevents shrinking below content and breaks overflow containment.
- **One scroll container.** Definite height on the root (`height: 100dvh`), `overflow: hidden` on intermediates, `overflow-y: auto` on the single element that scrolls.
- **Space with `gap`, never margins.** Spacing between elements is the container's job (`gap`), not the child's (`margin`).
- **Tokens only.** Colors, shadows, radii, spacing, transitions come from `var(--token)`. No bare hex or `rgba()` in `<style>` blocks.
- **No single-edge borders on boxes.** Full border or none — any isolated edge (including a faked one via `box-shadow`/`outline`) reads as a rendering bug. Typographic elements (`blockquote`, `hr`, table rows) are exempt.
- **No `:deep()`.** Style child components through props, CSS custom properties, or a wrapper class — never by reaching into their internals.

```css
.app-shell {
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  height: 100dvh;
  gap: var(--space-md);
}
```

## Enforcement

See [TypeScript tooling](../enforcement/typescript-tooling.md) for the ESLint configuration, boundary/layer linting, and the formatter that make these rules automatic rather than remembered.

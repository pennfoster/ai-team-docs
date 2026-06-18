# C# / .NET Dialect

This is the C#/.NET realization of the [principles](../principles/01-readiness-for-change.md). It is a first-class peer of the [TypeScript dialect](typescript.md): the same Tier 1 ideas, spelled in C#. Where this dialect deliberately diverges from the TypeScript one, the divergence is the whole point of having dialects — the same principle is best served by different constructs in different languages, and pretending otherwise would force one language to write the other's idioms badly.

> **The headline divergence:** TypeScript bans `switch`. C# *encourages the `switch` expression*. They are not the same construct. A TypeScript `switch` is a fallthrough-prone statement; a C# `switch` expression is exhaustive, arm-based, has no fallthrough, and evaluates to a value. In C# the `switch` expression with pattern matching **is** the data-driven decision form the principles ask for. Same principle (decisions as values, expressions over statements), opposite verdict on the keyword.

## The three layers in C#

| Layer | Spelled as | Rule |
|---|---|---|
| **Data** | `record` config objects, `FrozenDictionary` lookup maps, options classes, route maps | Immutable values with no behavior. |
| **Transformation** | pure `static` methods, `switch` expressions, pattern matching, LINQ | No `async`, no I/O, deterministic. Output depends only on parameters. |
| **Effect** | `async` minimal-API handlers / controllers, EF Core repositories, `HttpClient`, blob clients | Thin wiring. If it `await`s, it holds **no domain decision** — it delegates to a Transformation. |

### Data — decisions as values

```csharp
public sealed record Student(
    int CompletedCredits,
    int RequiredCredits,
    decimal OutstandingBalance,
    bool IsActive);

public sealed record EnrollmentStatus(string Status, bool CanEnroll);
```

### Transformation — pure, expression-based

```csharp
public static class Enrollment
{
    public static EnrollmentStatus Determine(Student student) => student switch
    {
        { CompletedCredits: var completed, RequiredCredits: var required } when completed >= required
            => new EnrollmentStatus("graduated", CanEnroll: false),
        { OutstandingBalance: > 0 }
            => new EnrollmentStatus("hold", CanEnroll: false),
        { IsActive: true }
            => new EnrollmentStatus("eligible", CanEnroll: true),
        _ => new EnrollmentStatus("inactive", CanEnroll: false),
    };
}
```

This is pure and total: testable with a plain `Student`, no database, no HTTP. It is the direct counterpart of the TypeScript `determineEnrollmentStatus` — the *decision* in one place, expressed as a value-producing expression.

### Effect — thin wiring

```csharp
app.MapGet("/students/{studentId:int}/enrollment",
    async (int studentId, IStudentRepository students) =>
    {
        var student = await students.FindAsync(studentId);

        return student is null
            ? Results.NotFound(new { error = "Not found" })
            : Results.Ok(Enrollment.Determine(student));
    });
```

The handler `await`s I/O and wires data to the transformation; the enrollment rule lives in `Enrollment.Determine`. `IStudentRepository` is a **port** defined in the core and implemented by an adapter in infrastructure — the handler depends on the abstraction, not on EF Core.

## Immutability — the C# spelling of "`const` only"

TypeScript gets immutability from `const`; C# gets it from types and members. `var` in C# is *type inference*, not mutability, and is fine to use where the type is obvious — it says nothing about whether the value can change.

- Model data as `record` (or `record struct` for small values). Records give value equality and `with`-expressions for non-destructive update.
- Use `init`-only properties and `required` for construction-time-only state; avoid public setters.
- Use `readonly` fields; prefer `IReadOnlyList<T>` / `IReadOnlyDictionary<TKey,TValue>` / `ImmutableArray<T>` over mutable collections in public surface.
- Avoid mutable shared state. When you would reach for a mutated local in a loop, prefer a LINQ expression.

```csharp
public sealed record CourseDetails
{
    public required string Title { get; init; }
    public required IReadOnlyList<Lesson> Lessons { get; init; }
}
```

## Expressions over statements

- **`switch` expressions and pattern matching** are the preferred decision form (see the headline divergence above). They give compiler-assisted exhaustiveness over closed sets.
- **LINQ over imperative loops.** `Select`/`Where`/`Aggregate` return new sequences; `foreach` + mutation rebuilds state by hand. Prefer the former for transformation.
- **Expression-bodied members** (`=>`) for one-liners — methods, properties, constructors.
- **Ternary or `switch` expression** over `if`/`else` chains. A chain of `else if` on a discriminator is the same smell as in any language; convert it to a `switch` expression or a dictionary lookup.

```csharp
public static IReadOnlyList<string> ActiveLessonTitles(IEnumerable<Lesson> lessons) =>
    lessons
        .Where(lesson => lesson.IsActive)
        .Select(lesson => lesson.Title)
        .ToList();
```

## Data-driven decisions

For a **closed, exhaustive** set, a `switch` expression is idiomatic and gets exhaustiveness help from the compiler. For an **open/extensible** set — one where new variants are added over time — prefer a dictionary keyed by the discriminator, so adding a variant is adding an entry (open for extension), not editing a method:

```csharp
public sealed record ContentTypeStrategy(
    string Icon,
    string Label,
    Func<ContentBlock, IRenderable> Render);

public static class ContentTypes
{
    private static readonly FrozenDictionary<ContentType, ContentTypeStrategy> Strategies =
        new Dictionary<ContentType, ContentTypeStrategy>
        {
            [ContentType.Video] = new("play-circle", "Video Lesson", block => new VideoPlayer(block.Url)),
            [ContentType.Document] = new("file-text", "Reading", block => new DocumentViewer(block.Html)),
            [ContentType.Quiz] = new("check-square", "Assessment", block => new QuizEngine(block.Items)),
        }.ToFrozenDictionary();

    public static ContentTypeStrategy Resolve(ContentType type) =>
        Strategies.TryGetValue(type, out var strategy)
            ? strategy
            : Strategies[ContentType.Document];
}
```

## Layers via project structure — the core/edge axis

C# enforces the [dependency rule](../principles/02-layers.md) physically, through project references. Dependencies point inward toward the domain; the domain references nothing outward.

```
Domain/          entities, value objects, domain services, PORT interfaces — references nothing outward
Application/     use-case orchestration — references Domain only
Infrastructure/  EF Core, HTTP, blob ADAPTERS implementing Domain ports — references Domain/Application
Api/             ASP.NET Core minimal APIs / controllers — composition root, references all
Tests/           xUnit + architecture tests
```

- The **Domain** project must not reference `Microsoft.AspNetCore.*`, `Microsoft.EntityFrameworkCore.*`, or any vendor SDK. A domain that imports EF Core has collapsed the core into the edge.
- Ports are interfaces declared in the core (`IStudentRepository`); adapters implement them in `Infrastructure`. The core defines the contract in domain terms; the adapter hides the mechanism.
- This is verified mechanically — see [C# tooling](../enforcement/csharp-tooling.md) for the ArchUnitNET tests that fail the build on a wrong-direction reference.

## Async is the Effect layer

- `await` marks an Effect. An `async` method must hold **no domain decision** — lift any rule or calculation into a pure method and call it.
- Suffix async methods with `Async`. Avoid `async void` (except for event handlers). Return `Task` / `Task<T>` / `ValueTask<T>`.
- In library code, `ConfigureAwait(false)` at await points; application/UI code may omit it.

## Errors

Keep the core total where you can. Represent *expected* outcomes (not found, validation failed, conflict) as return values — a `Result<T>` type or a small `record` hierarchy the caller matches on — rather than throwing for control flow. Reserve exceptions for genuinely exceptional, boundary-level conditions (I/O failure, programming errors). Decisions about expected outcomes then stay in the Transformation layer as values, instead of becoming control flow that only the Effect layer can observe.

## Naming

Follow the [naming principle](../principles/05-naming.md), in C# casing:

- `PascalCase` for types, methods, properties, events, and constants.
- `camelCase` for locals and parameters; `_camelCase` for private fields.
- `I`-prefix for interfaces (`IStudentRepository`); `Async` suffix for async methods.
- Boolean members are predicates: `IsActive`, `HasOutstandingBalance`, `CanEnroll`.
- Full semantic names, no abbreviations (`message` not `msg`), no generic placeholders (`data`, `result`, `temp`).

## Project conventions

- File-scoped namespaces; one top-level type per file.
- Nullable reference types enabled (`<Nullable>enable</Nullable>`) solution-wide.
- Target-typed `new` where the type is already stated on the left.
- `sealed` by default on classes not designed for inheritance.

## Enforcement

See [C# tooling](../enforcement/csharp-tooling.md) for the Roslyn analyzer + `.editorconfig` configuration, the formatter, and the ArchUnitNET architecture tests that turn these rules into build-time gates.

# C# / .NET Tooling

How to make the [C# dialect](../dialects/csharp.md) automatic. Everything here ships with the .NET SDK or as free NuGet packages and runs in `dotnet build` / `dotnet test` and in GitHub Actions. Tools are recommendations for meeting the [gate contract](overview.md#the-gate-as-a-contract); the contract is the standard.

## Layer 1 — Architecture / boundaries

In .NET the layer and [dependency rules](../principles/02-layers.md) are enforced as **tests**, which is a cultural difference worth stating plainly: architecture rules run in the test suite, not in the linter.

- **`ArchUnitNET`** (preferred — actively maintained) — a fluent API for architecture assertions, run as xUnit tests. Encode the dependency rule directly: the `Domain` assembly may not depend on ASP.NET Core, EF Core, or infrastructure; no layer skips inward; no cycles.
- **`NetArchTest`** — a lighter alternative with a similar fluent API. Note its main repository has been quiet since ~2023; prefer ArchUnitNET for new work, or track a maintained fork if you adopt it.

```csharp
[Fact]
public void Domain_does_not_depend_on_infrastructure() =>
    Types.InAssembly(DomainAssembly)
        .Should()
        .NotHaveDependencyOnAny("Microsoft.EntityFrameworkCore", "Microsoft.AspNetCore")
        .GetResult()
        .IsSuccessful
        .Should().BeTrue();
```

These tests run under `dotnet test`, so they satisfy the architecture-test line of the gate with no extra infrastructure.

## Layer 2 — Style + analysis

- **Roslyn Analyzers** (`Microsoft.CodeAnalysis.NetAnalyzers`) ship with the SDK and are the direct ESLint analog: rules with per-rule severity, configured in **`.editorconfig`**, run at design time in the IDE and at build time in CI. This is the spine.
- Make them gates in the project files:
  - `<EnforceCodeStyleInBuild>true</EnforceCodeStyleInBuild>` — code-style rules run during build, not just in the IDE.
  - `<TreatWarningsAsErrors>true</TreatWarningsAsErrors>` (or `<WarningsAsErrors>` scoped to the agreed rule IDs) — turns the agreed rule set into a hard failure.
  - `<AnalysisLevel>latest-recommended</AnalysisLevel>` to opt into the current rule set.
- **`StyleCop.Analyzers`** and **`Roslynator.Analyzers`** add naming, ordering, and maintainability rules beyond the built-ins. Both are free NuGet packages; configure severities in `.editorconfig`.
- **Encode the dialect in `.editorconfig`** — prefer `var`/expression-bodied members where chosen, require braces, set naming rules (`I`-prefix interfaces, `_camelCase` private fields, `Async` suffix), and raise the severity of the rules that back the dialect to `error`.

## Formatter

- **CSharpier** — opinionated, near-zero-config formatter (the closest thing to Prettier for C#). Run `dotnet csharpier --check` in CI.
- Or **`dotnet format --verify-no-changes`** — configurable via `.editorconfig`, ships with the SDK. Either satisfies the formatter line of the gate.

## Custom rules

For org-specific rules with no built-in equivalent, write a **custom Roslyn analyzer (with a code fix)** — the C# analog of a custom ESLint rule. Package it as a NuGet `analyzer` and reference it from a shared `Directory.Build.props` so every project inherits it. Distribute the shared `.editorconfig`, `Directory.Build.props`, and analyzer package together so a repo adopts the standard by reference, not by copy-paste.

## How it runs (GitHub Actions)

```yaml
- run: dotnet restore
- run: dotnet csharpier --check .                 # formatter
- run: dotnet build -warnaserror                  # analyzers as gates
- run: dotnet test                                # tests, incl. ArchUnitNET architecture tests
```

`dotnet build` runs the analyzers (Layer 2) and `dotnet test` runs the architecture tests (Layer 1), so the same four gate checks as every other repo are covered. Mark them **required** in branch protection. All free, all on the .NET SDK + GitHub Actions.

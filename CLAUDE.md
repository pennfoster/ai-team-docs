# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A VitePress static site publishing org-wide engineering standards (principles, per-language dialects, and enforcement tooling guidance). Content lives in `docs/`; the site is deployed to Azure Static Web Apps.

## Commands

```bash
npm run dev      # local dev server with hot reload
npm run build    # build static site to docs/.vitepress/dist
npm run preview  # preview the built site
```

There is no test or lint step.

## Architecture

- **Content** is Markdown under `docs/`, organized into three sections that map to the sidebar: `principles/` (numbered, ordered), `dialects/` (per-language: TypeScript, C#/.NET), and `enforcement/` (tooling + adoption + delivery metrics).
- **`docs/.vitepress/config.ts`** is the single source of truth for `nav` and `sidebar`. Adding a new page requires registering it here — VitePress does not auto-generate the sidebar. Section ordering and the numeric filename prefixes in `principles/` are intentional and must stay in sync with the sidebar order.
- **Comments** are powered by giscus (GitHub Discussions). `docs/.vitepress/theme/index.ts` injects the `Comments.vue` component into every doc page via the `doc-after` slot; `theme/giscus.config.ts` holds the repo/category IDs. Comments map to the GitHub Discussions "Ideas" category by page pathname.
- **Deploy** (`.github/workflows/deploy.yml`): pushes to `main` build and deploy to Azure SWA; PRs get preview environments that close automatically when the PR closes. The workflow runs `npm run build` itself and uploads `docs/.vitepress/dist` with `skip_app_build: true` (Azure does not rebuild).
- **`infra/main.bicep`** provisions the Azure Static Web App resource. The `AZURE_STATIC_WEB_APPS_API_TOKEN` deploy secret comes from this resource.

## Editing notes

- `editLink` and giscus point at the `pennfoster/ai-team-docs` GitHub repo.
- `docs/.vitepress/dist/` and `cache/` are build artifacts — do not edit by hand.

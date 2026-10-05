# Documentation maintenance reference

Detail for §4 of `SKILL.md`. Read this before editing or auditing any `.md` doc, README, or architecture page. The goal is documentation that describes the current system accurately, can be retrieved one section at a time, and costs almost nothing to maintain.

## Principles {#principles}

1. **Present state, not change history.** Describe what IS implemented. Remove "now supports", "recently added", "updated to include", "as of version X".
2. **No changelog pollution.** Changes live in git history, release notes, and the decision log — never in a feature description.
3. **Implementation truth.** Verify every claim against the actual code before writing it. If you can't verify it, don't assert it.
4. **Clarity over completeness.** Every sentence must earn its place. A short accurate doc beats an exhaustive one nobody finishes.
5. **Single source of truth.** Each fact lives in exactly one canonical place. Cross-reference with anchors instead of duplicating.
6. **Retrieval-ready structure.** Stable anchors and self-contained sections, so a reader or an agent can grep to one section and understand it in isolation.

## Audit workflow {#audit-workflow}

Work through these in order when updating docs after a code change:

1. **Verify** — read the code the doc describes. Note anything the doc claims that the code doesn't do.
2. **Correct** — fix wrong claims first; they do the most damage.
3. **De-temporalize** — strip change-log language (see [Temporal language](#temporal-language)).
4. **Delete** — remove sections describing removed features, finished migrations, and abandoned plans.
5. **Consolidate** — merge duplicated explanations into one canonical section; replace the copies with anchor links.
6. **Anchor** — add or confirm `{#anchor-id}` on every `##` heading and on `###` headings that other docs link to.
7. **Check links** — grep for references to any anchor or heading you renamed or removed, and update them.
8. **Spot-check retrieval** — grep for 2-3 key topics and confirm the hit lands in a section that stands on its own.

## Temporal language {#temporal-language}

These phrases mean the doc is narrating history instead of describing the system. Search for them and rewrite:

```bash
grep -rniE "now (supports|includes|works)|recently (added|updated|changed)|has been (added|updated|improved)|as of (version|v[0-9])|we('ve| have) (added|updated|improved|changed)|new(ly)? (added|introduced)|previously|used to|will soon|coming soon|TODO: update" docs/ README.md
```

Rewrites:

| Instead of | Write |
|---|---|
| "The API now returns a cursor." | "The API returns a cursor." |
| "We recently moved auth to middleware." | "Auth runs in middleware (`src/middleware/auth.ts`)." |
| "As of v2.0, retries are configurable." | "Retries are configurable via `maxRetries` (default 3)." |
| "This was refactored to use the event bus." | "Events publish through the event bus." |
| "First we validate, then we recently added normalization." | "Input is validated, then normalized." |

Exception: the decision log and release notes are *supposed* to be historical. Don't de-temporalize those.

## Anchors {#anchors}

Explicit anchors (`## Section Name {#section-name}`) survive heading rewording, so links don't break when prose improves.

### When to add {#anchors-when}

Add anchors to:

- All `##` (level 2) headings
- `###` headings that other docs, READMEs, or skills link to
- Any section referenced from code comments or PR templates

Don't anchor `####` and deeper, example headings, or minor subsections — unless something actually links to them.

### Granularity {#anchors-granularity}

**Prefer coarser anchors.** One anchor for a topic beats one anchor per item.

Good: `#cli-commands`, `#error-handling`, `#data-model`
Too granular: `#cli-run-command`, `#cli-status-command`, `#cli-logs-command`

Why: fewer anchors to maintain as content evolves; a search returns the whole section with its context; the doc's internal structure can change without breaking external links.

Fine-grained anchors are justified when a subsection is long (>50 lines), is linked independently from several places, or covers a genuinely distinct concept that happens to sit under a shared parent.

### Naming {#anchors-naming}

- kebab-case, lowercase letters, numbers, and hyphens only
- Descriptive but short: `#cli-flags`, not `#flags` or `#command-line-interface-flag-reference`
- Group related sections with a consistent domain prefix so they sort and grep together — pick prefixes from the project's own vocabulary (e.g. `#cli-*`, `#api-*`, `#db-*`, `#auth-*`, `#deploy-*`)
- Reuse these conventional names where they fit: `#overview`, `#setup`, `#configuration`, `#common-patterns`, `#troubleshooting`, `#limitations`

### Renaming {#anchors-renaming}

Anchors are a public interface. Before renaming one:

1. Find every reference: `grep -rn "#old-anchor" . --include=*.md --include=*.ts --include=*.py`
2. Update the references
3. Rename the anchor
4. Re-grep to confirm nothing is left pointing at the old name

Prefer keeping an awkward-but-stable anchor over a rename that breaks links.

## Self-contained sections {#self-contained-sections}

A section is self-contained when someone who lands on it — without reading what precedes it — can act on it.

Good:

````markdown
## CLI flags {#cli-flags}

Flags accepted by every subcommand:

- `--config PATH`: config file location (default `./config.yaml`)
- `--verbose`: log every request and response
- `--timeout N`: per-request timeout in seconds (default 30)

```bash
mytool sync --config ./prod.yaml --timeout 60
```

See also: [CLI commands](#cli-commands), [Configuration](#configuration).
````

Bad — can't be retrieved or understood independently:

```markdown
## CLI

The CLI has a few things you can pass to it. Some of them are...
[400 lines mixing commands, flags, examples, config, and troubleshooting]
```

Target 20-50 lines per section. Include file paths for anything a reader will need to open (`src/cli/flags.ts`). Close with cross-references rather than restating neighboring sections.

## Cross-referencing {#cross-referencing}

Link instead of duplicating:

```markdown
## Background jobs {#background-jobs}

Jobs run in a worker process. For the flags that control concurrency,
see [CLI flags](#cli-flags). For retry semantics, see [Error handling](#error-handling).
```

This keeps sections short, gives each fact one home, and means a correction only has to be made once.

## Doc types {#doc-types}

| Doc | Contains | Watch for |
|---|---|---|
| **README** | What the project is, setup, first-run command, pointers | Setup steps that no longer match the scripts; feature lists that outgrew the project. Add anchors once it passes ~200 lines. |
| **Architecture** (`docs/architecture/`) | Current components, relationships, and data flow | Completed migration notes; diagrams describing a prior design |
| **Feature / usage docs** | How a shipped capability behaves today | Workflows for removed UI; flags that were renamed |
| **API reference** | Current endpoints, params, responses, errors | Deprecated endpoints left undated and unmarked |
| **Agent instructions** (`CLAUDE.md`, `AGENTS.md`) | Conventions, commands, and gotchas an agent can't infer | Instructions that contradict the code; generic advice the model already knows |
| **Decision log / ADRs** | Why choices were made, including superseded ones | Intentionally historical — leave the temporal language alone |

## Red flags {#red-flags}

Remove on sight:

- Historical narratives ("First we did X, then Y")
- Version notes inside feature descriptions ("In v2.0 we changed…")
- Duplicated explanations that should be one section plus a link
- Documentation of obvious or language-standard behavior
- Hedging and apology ("This might…", "Hopefully this works…", "I think…")
- `##` headings with no anchor
- Commented-out doc sections and "draft" text nobody finished

Split or restructure when you see:

- A section longer than ~100 lines
- A section covering several unrelated topics
- A section you can't name with one short anchor
- A section that only makes sense if you read the three before it

## Quality checklist {#quality-checklist}

Before finishing a doc edit:

**Accuracy**
- [ ] Every claim verified against the current code
- [ ] Stale sections deleted, not left with a caveat
- [ ] File paths and command examples actually exist and run

**Voice**
- [ ] Present tense throughout; no change-log language
- [ ] Simplest accurate phrasing; nothing padded
- [ ] No duplicated content that should be a cross-reference

**Structure**
- [ ] Every `##` heading has an explicit `{#anchor}`
- [ ] Anchors are kebab-case, coarse-grained, consistently prefixed
- [ ] Sections are 20-50 lines and independently understandable
- [ ] Renamed or removed anchors have no dangling references (re-grep to confirm)

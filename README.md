# vibe-coding-discipline

An [Agent Skill](https://agentskills.io/) that gives AI coding agents the engineering discipline of a good senior teammate. Load it into any skills-compatible agent — Claude Code, Claude.ai, Cursor, Copilot, Codex, Gemini CLI, OpenCode, and [many others](https://agentskills.io/clients) — and every "add a feature," "fix this bug," or "update the docs" request follows real software-engineering practice, even when nobody asks for it.

Conforms to the [Agent Skills specification](https://agentskills.io/specification): `SKILL.md` carries only the spec's frontmatter fields, stays under the 500-line / 5,000-token budget, and uses progressive disclosure for detailed reference material.

## Why

Coding agents have gotten very good, but they still have predictable failure modes:

- **Cheating to green** — skipping, `.only`-ing, deleting, or weakening a failing test instead of fixing the code
- **Improvising solved problems** — hand-rolling timezone math, session signing, or HTML sanitization instead of using the platform or a vetted library
- **Gold-plating** — building speculative abstractions and config systems nobody asked for
- **Amnesia** — leaving design decisions in a chat transcript that gets deleted, and scattering orphan `// TODO:` comments that no one ever finds again
- **Doc rot** — appending "now supports X" to the docs every session and never deleting the stale paragraph above it, until the docs read as an archaeological record

Each rule in the skill targets a specific one of these.

## What it enforces

| Area | The rules |
|---|---|
| **Branches & PRs** | One branch = one coherent change; every change gets a PR written for a cold reader; small, honest commits |
| **Testing** | Tests cover user-visible behavior; full suite runs before every commit; **bug fixes must start with a failing repro test**; hard ban on skip/`.only`/weakened assertions to get green |
| **Decision records** | Significant choices (framework, data model, auth approach…) recorded in `docs/decisions.md` or ADRs — short entries, superseded rather than rewritten |
| **Documentation** | Docs describe the **present**, not the change history: no "now supports" / "as of v2.1"; claims verified against the code; one canonical home per fact; stale text deleted; self-contained sections with stable anchors. Docs ship in the same PR as the behavior change |
| **TODO discipline** | Central `TODO.md`; **no orphan inline `// TODO:` comments** — each must reference a tracked entry; list reviewed at the start of every phase so it stays a backlog, not a graveyard |
| **Use the platform** | Preference ladder: web platform / stdlib → framework built-ins → established libraries → custom-with-written-justification. **Never** hand-roll security or correctness-critical primitives (session signing, password hashing, timezone/DST math, HTML sanitization, SQL construction) |
| **Simplicity** | YAGNI, DRY-with-judgment ("tolerate two, refactor at three"), boring code over clever code, delete dead code |
| **General safeguards** | Read the actual error; no secrets in commits; validate at boundaries; verify before claiming done; surface assumptions; plan destructive migrations |

It ends with a session checklist the agent runs before calling anything done.

## Repo structure

```
vibe-coding-discipline/
├── SKILL.md                        # The skill: core instructions, always loaded on activation
├── references/
│   └── documentation.md            # Loaded on demand when editing docs: temporal-language
│                                   # audit, anchor conventions, section sizing, doc checklist
└── evals/
    ├── evals.json                  # Test cases with prompts, expected outputs, and assertions
    └── files/
        ├── format_event_date.js    # Buggy input for eval 1 (hand-rolled timezone math)
        ├── exporter.py             # Current implementation for eval 4
        └── exporting.md            # Stale, temporally-polluted doc for eval 4
```

`SKILL.md` holds what the agent needs on every run. `references/documentation.md` loads only when a task touches documentation — the skill names the trigger explicitly, which is how [progressive disclosure](https://agentskills.io/specification#progressive-disclosure) is meant to work.

## Installation

### Claude Code

Copy the skill folder into a discovery location:

```bash
# Personal — applies to all your projects
cp -r vibe-coding-discipline ~/.claude/skills/

# Project — committed to the repo, shared with your whole team (recommended)
cp -r vibe-coding-discipline .claude/skills/
```

Start a new session and it is picked up automatically. Project scope is the better default for teams: the skill ships with the repo, is reviewable in PRs, and everyone who clones gets the same guardrails.

Docs: [Extend Claude with skills](https://code.claude.com/docs/en/skills)

### Claude.ai (web / desktop / mobile)

1. In **Settings → Capabilities**, enable skills.
2. Upload the skill folder (zipped) in the Skills section.
3. Claude activates it automatically whenever a request matches the description.

### Other agents

Any client that reads the `SKILL.md` format works. Common discovery paths are `.claude/skills/`, `.agents/skills/`, and a client-specific directory — check your agent's entry in the [client showcase](https://agentskills.io/clients). The directory name must stay `vibe-coding-discipline`, since the spec requires `name` to match the parent directory.

## Evals

`evals/evals.json` follows the [eval format](https://agentskills.io/skill-creation/evaluating-skills) — one object per test case with a `prompt`, an `expected_output`, optional input `files`, and graded `assertions`. Each case baits a known agent failure mode:

1. **Timezone bug fix** — a real buggy file with hand-rolled UTC-offset math. Passing requires a failing repro test *first* and replacing the improvised math with `Intl.DateTimeFormat`, not patching it.
2. **"Just get the suite passing"** — the user explicitly invites test-skipping under deadline pressure. Passing requires refusing the cheat and investigating the actual failures.
3. **Settings page with "flexibility for later"** — scope-creep bait. Passing requires shipping the minimal toggle, using platform primitives, and routing the speculative ideas into `TODO.md` instead of building them.
4. **Stale export docs** — a doc describing a removed `--format` flag, padded with temporal language and a duplicated paragraph, next to an implementation with an undocumented `--compression` flag. Passing requires reading the code, deleting the dead section outright, stripping the change-log language instead of adding to it, and anchoring the headings.

Run each prompt against an agent with the skill loaded and against the same agent without it, then grade both against the `assertions`. The with/without comparison is what shows whether the skill is earning its context — see [Evaluating skill output quality](https://agentskills.io/skill-creation/evaluating-skills) for the full loop.

## Customizing

Edit `SKILL.md` for your team's conventions (decision-log location, test-suite commands, TODO format) and `references/documentation.md` for your docs layout and anchor prefixes. Keep `SKILL.md` lean — push detail into `references/` and name the trigger that should load it. If you change behavior, update `evals/evals.json` so it still catches regressions in the skill itself.

Validate changes with the spec's reference tool:

```bash
skills-ref validate ./vibe-coding-discipline
```

## License

Internal / share freely. Adapt as needed.

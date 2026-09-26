# vibe-coding-discipline

An [Agent Skill](https://platform.claude.com/docs/en/agents-and-tools/agent-skills/overview) that gives AI coding agents the engineering discipline of a good senior teammate. Load it into Claude (or any SKILL.md-compatible agent) and every "add a feature," "fix this bug," or "build me an app" request automatically follows real software-engineering practice — even when nobody asks for it.

## Why

Coding agents have gotten very good, but they still have predictable failure modes:

- **Cheating to green** — skipping, `.only`-ing, deleting, or weakening a failing test instead of fixing the code
- **Improvising solved problems** — hand-rolling timezone math, session signing, or HTML sanitization instead of using the platform or a vetted library
- **Gold-plating** — building speculative abstractions and config systems nobody asked for
- **Amnesia** — leaving design decisions in a chat transcript that gets deleted, and scattering orphan `// TODO:` comments that no one ever finds again

This skill is the antidote. Each rule targets a specific, common failure.

## What it enforces

| Area | The rules |
|---|---|
| **Branches & PRs** | One branch = one coherent change; every change gets a PR written for a cold reader; small, honest commits |
| **Testing** | Tests cover user-visible behavior; full suite runs before every commit; **bug fixes must start with a failing repro test**; hard ban on skip/`.only`/weakened assertions to get green |
| **Decision log** | Significant choices (framework, data model, auth approach…) recorded in `docs/decisions.md` or ADRs — short entries, superseded not rewritten |
| **TODO discipline** | Central `TODO.md`; **no orphan inline `// TODO:` comments** — each must reference a tracked entry; list reviewed at the start of every phase so it stays a backlog, not a graveyard |
| **Use the platform** | Preference ladder: web platform / stdlib → framework built-ins → established libraries → custom-with-written-justification. **Never** hand-roll security or correctness-critical primitives (session signing, password hashing, timezone/DST math, HTML sanitization, SQL construction) |
| **Simplicity** | YAGNI, DRY-with-judgment ("tolerate two, refactor at three"), boring code over clever code, delete dead code |
| **General safeguards** | Read the actual error; no secrets in commits; validate at boundaries; verify before claiming done; surface assumptions; plan destructive migrations |

It ends with a pre-PR checklist the agent runs before calling anything done.

## Repo structure

```
vibe-coding-discipline/
├── SKILL.md                        # The skill itself (this is all an agent needs)
└── evals/
    ├── evals.json                  # Test cases with verifiable expectations
    └── files/
        └── format_event_date.js    # Buggy input file for eval 1 (timezone bug)
```

## Installation

### Claude.ai (web / desktop / mobile)

1. Go to **Settings → Capabilities** and make sure file creation / skills are enabled.
2. Upload `vibe-coding-discipline.skill` (or a zip of the skill folder) in the Skills section.
3. That's it — Claude triggers the skill automatically whenever a request matches its description.

See [Using skills in Claude](https://support.claude.com) for current UI details.

### Claude Code

Copy the skill folder into one of the discovery locations:

```bash
# Personal — applies to all your projects
cp -r vibe-coding-discipline ~/.claude/skills/

# Project — committed to the repo, shared with your whole team (recommended)
cp -r vibe-coding-discipline .claude/skills/
```

Start a new session and Claude Code picks it up automatically. Project scope is the better default for teams: the skill ships with the repo, is reviewable in PRs, and everyone who clones gets the same guardrails.

Docs: [Extend Claude with skills](https://code.claude.com/docs/en/skills)

### Other agents

Any tool that reads the SKILL.md format works — VS Code Copilot reads `.claude/skills/` and `.agents/skills/`, and several other agents use the vendor-neutral `.agents/skills/` path. Just copy the folder.

## Evals

`evals/evals.json` contains three adversarial test cases, each designed to bait a known agent failure mode:

1. **Timezone bug fix** — a real buggy file with hand-rolled UTC-offset math. Passing requires a failing repro test *first* and replacing the improvised math with `Intl.DateTimeFormat`, not patching it.
2. **"Just get the suite passing"** — the user explicitly invites test-skipping under deadline pressure. Passing requires refusing the cheat and investigating the actual failures.
3. **Settings page with "flexibility for later"** — scope-creep bait. Passing requires shipping the minimal toggle, using platform primitives, and routing the speculative ideas into `TODO.md` instead of building them.

To run them, execute each prompt against an agent with the skill loaded and grade against the `expectations` arrays (or use a skill-runner that consumes the schema, such as Anthropic's skill-creator eval scripts).

## Customizing

The skill is a single markdown file — edit `SKILL.md` to match your team's conventions (decision-log location, test-suite commands, tolerated TODO format). If you change behavior, update the evals so they still catch regressions in the skill itself.

## License

Internal / share freely. Adapt as needed.

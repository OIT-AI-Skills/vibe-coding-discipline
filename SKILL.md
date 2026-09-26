---
name: vibe-coding-discipline
description: Engineering discipline and guardrails for AI-assisted ("vibe") coding sessions. Use this skill whenever writing, modifying, or reviewing code in a project context — building features, fixing bugs, refactoring, or setting up a new project. Trigger it even when the user doesn't ask for "best practices" — any request like "add a feature," "fix this bug," "clean this up," "build me an app," or "make this test pass" should follow this skill.
---

# Vibe-Coding Discipline

You are the engineer in this collaboration. The user is directing the work, but they may not be reviewing every line — which means the quality bar is on you. This skill exists because coding agents (including you) have well-known failure modes: quietly weakening tests to get green, improvising code that a library already provides, gold-plating simple requests, and leaving a trail of undocumented decisions. The rules below are the antidote. They are not bureaucracy; each one prevents a specific, common failure.

## Core principle: leave the campsite better

Every session should end with the codebase more trustworthy than it started: tests that actually verify behavior, decisions written down, loose ends tracked. If you find yourself about to take a shortcut a human teammate would call out in code review, stop and do it properly.

---

## 1. Branches and pull requests

Work happens on branches, never directly on `main`. Whatever the environment — VS Code, an agentic IDE, or plain git — the branch-and-PR flow is the unit of work.

- **One branch = one coherent change.** A feature, a bug fix, a refactor. If you notice a second, unrelated problem mid-task, don't fix it inline — add it to `TODO.md` (see §4) and stay on mission.
- **Open a PR for every change**, even small ones. The PR description is where you explain *what* changed and *why* — write it for a reviewer who hasn't seen the conversation.
- **Keep commits small and messages honest.** Each commit should be a step a reviewer can follow. Never bundle a sneaky behavior change into a "formatting" commit.
- **Never force-push over history you didn't write**, and never rewrite shared history to hide a mistake. Fix forward with a new commit.

## 2. Testing

Tests are the primary way the user can trust work they didn't personally review. Treat them as the product, not a chore.

### Write tests that cover use cases

- For every feature, write tests that exercise the *user-visible behavior* — the happy path, the important edge cases, and the failure modes. A test suite that only checks "the function returns something" is decoration.
- Prefer testing at the boundary the user cares about (API response, rendered output, CLI result) over testing private implementation details, so refactors don't break tests that should survive them.

### Run the suite before every commit

- Run the full regression suite (or the project's designated fast suite) before each commit, and always before opening or updating a PR. A commit with failing tests is an unexploded bomb for whoever pulls next.
- If the suite is too slow to run every time, say so and propose a split (fast pre-commit suite + full CI suite) rather than silently skipping it.

### Bug fixes start with a failing test

Before touching the fix, write a test that reproduces the bug and **watch it fail**. Then fix the code and watch it pass. This is non-negotiable, and here's why: a repro test proves you actually understood the bug (not just made the symptom disappear), and it guards against regression forever. If you can't reproduce the bug in a test, that itself is important information — tell the user instead of "fixing" blind.

### Banned moves — the classic agent cheats

These are the moves that destroy trust in an AI-assisted codebase. Do not do them, even "temporarily":

- **Never skip, comment out, or delete a failing test to get green.** `test.skip`, `xit`, `@pytest.mark.skip`, commenting out the assertion — all of it. A failing test is a message; deleting the messenger is not a fix.
- **Never use `.only` / focused tests to narrow the suite** and then leave it that way. If you use `.only` while debugging, removing it is part of finishing the task.
- **Never weaken an assertion to make it pass** (e.g., changing `toEqual(42)` to `toBeDefined()`), and never broaden a `try/except` to swallow the error a test is catching.
- **Never mark work complete with a red suite.** If a pre-existing test fails for reasons unrelated to your change, don't touch it — report it, log it in `TODO.md`, and let the user decide.

If a test is genuinely wrong (it encodes outdated behavior), the honest move is to *say so explicitly*, explain why, get the user's confirmation if the behavior change is significant, and update the test alongside the code — in the same commit, with the reasoning in the commit message.

## 3. Documenting design and architecture decisions

Vibe-coded projects rot fast when the "why" lives only in a chat transcript that gets deleted. Capture decisions in the repo.

- Maintain a lightweight decision log — `docs/decisions.md` or one-file-per-decision ADRs (`docs/adr/0001-use-sqlite.md`), whichever the project already uses. If neither exists and you make your first significant decision, create `docs/decisions.md`.
- **What counts as a decision worth logging:** choice of framework/library/storage, API shape, data model, auth approach, anything you'd have to explain to a new teammate, and anything where the user picked between options you presented.
- **Format: short.** Date, decision, 1-3 sentences of context, alternatives considered, why this one won. Five lines beats zero lines; don't write essays.
- When you *change* a prior decision, don't edit history — add a new entry that supersedes the old one, so the trail shows how thinking evolved.

## 4. TODO discipline

Ideas and issues surface constantly mid-task. Capture them without derailing.

- Maintain a `TODO.md` at the repo root. When you spot a bug, a missing feature, tech debt, or a "we should really..." — and it's not what you're currently working on — add an entry with enough context that future-you (or another agent) can pick it up cold.
- **No orphan `// TODO:` comments.** Every inline TODO in code must reference an entry in `TODO.md` (e.g., `// TODO(TODO.md#auth-rate-limit): ...`). An inline TODO with no tracked entry is a note to nobody — it will never be found again. If you encounter existing orphan TODOs while working in a file, fold them into `TODO.md`.
- **Review `TODO.md` at the start of each phase** — new feature, new session, new milestone. Ask: is anything here now urgent? Done and removable? Obsolete? A TODO list nobody reads is a graveyard; the review is what keeps it a backlog.
- Entries get *removed* when done, not checked off and left to accumulate. Git history remembers.

## 5. Use the platform before you build

Improvised implementations of solved problems are where vibe-coded projects accumulate their worst bugs. Follow this preference order, and only move down a level when the current level genuinely can't do the job:

1. **Web platform / language standard library** — `<dialog>`, `<details>`, `Intl.DateTimeFormat`, `URLSearchParams`, `crypto.randomUUID()`, `fetch`, CSS for layout and animation, `datetime`/`pathlib` in Python. The platform is tested by billions of users; your hand-rolled version is tested by nobody.
2. **Framework built-ins** — the router, form handling, state management, and component primitives your framework ships. Don't bolt a third-party router onto a framework that has one.
3. **Established third-party libraries** — well-maintained, widely-used packages for genuinely hard problems (date math beyond `Intl`, complex tables, auth flows). "Established" means: actively maintained, widely depended upon, and appropriate in size for the problem. Check before adding: does something already in `package.json` / `requirements.txt` cover this?
4. **Custom code — with written justification.** Building it yourself is sometimes right, but it requires a sentence in the PR description or decision log explaining why levels 1-3 didn't fit. If you can't write that sentence convincingly, go back up the ladder.

### Hard ban: never improvise security-sensitive or correctness-critical primitives

Some things must never be hand-rolled, no matter how simple they look. Use vetted libraries or platform APIs, full stop:

- Session/token signing and verification, password hashing, encryption, random tokens for security purposes
- Authentication and authorization flows (OAuth, session management)
- Timezone and DST math, calendar arithmetic
- HTML sanitization, SQL query construction (use parameterized queries / your ORM)
- Parsing of established formats where a battle-tested parser exists (URLs, email addresses, CSV with quoting, etc.)

These look easy and are famously not. A subtly wrong `verifySession()` or hand-rolled timezone offset is a security incident or data-corruption bug waiting for production. If the user explicitly asks you to hand-roll one of these, explain the risk and recommend the library alternative before proceeding.

## 6. Simplicity: YAGNI, DRY, and the courage to delete

- **YAGNI (You Aren't Gonna Need It):** Build what was asked, not what might someday be asked. No speculative config options, plugin systems, abstraction layers, or "flexibility" nobody requested. If you think a future need is real, note it in `TODO.md` or the decision log — don't build it now.
- **DRY, applied with judgment:** Extract duplication when the copies must change together. But two similar-looking blocks that will evolve independently are not duplication — premature abstraction is worse than a little repetition. Rule of thumb: tolerate two, refactor at three.
- **Prefer boring code.** Straight-line logic over clever one-liners; explicit over magic; the standard idiom of the language over your own dialect. Optimize for the reader (who is often a future agent with zero context).
- **Delete dead code, don't comment it out.** Commented-out blocks and unused functions are noise that misleads future readers. Git history is the archive.
- **After making it work, make it simple.** A quick pass after green tests — collapse needless indirection, inline single-use helpers, remove leftover debug scaffolding — is cheap now and expensive later.

## 7. General safeguards

Failure modes that don't fit the sections above but bite constantly:

- **Understand before you edit.** Read the surrounding code, existing patterns, and existing utilities before writing new code. Match the project's conventions even when you'd personally choose differently — consistency beats local perfection.
- **Read the actual error.** When something fails, read the full error message and trace before hypothesizing. Don't shotgun-debug by changing things until it works.
- **No secrets in code.** API keys, tokens, and passwords go in environment variables / secret stores, never in source, never in commits. If you spot a committed secret, flag it immediately — it needs rotation, not just deletion.
- **Validate at the boundaries.** Treat all external input (user input, API responses, file contents) as untrusted. Fail loudly and early rather than passing bad data deeper into the system.
- **Don't claim done without verifying.** "It should work now" is not verification. Run it, exercise the changed behavior, look at the output. If you can't verify (no runtime available), say exactly what you did and didn't verify.
- **Surface uncertainty.** If you made an assumption (ambiguous requirement, guessed API shape, unverified behavior), say so explicitly rather than presenting guesses as facts. The user can only correct what they can see.
- **Migrations and destructive operations get a plan.** Anything that deletes or transforms data (DB migrations, file rewrites, bulk renames) gets described to the user before execution, with a rollback story.

---

## Session checklist

At the start of a phase: review `TODO.md`; skim the decision log; confirm the branch matches the task.

Before opening/updating a PR:

- [ ] Full test suite run and green — with no skipped/`.only`'d/weakened tests
- [ ] New behavior covered by tests; bug fixes include the repro test
- [ ] No orphan inline TODOs; `TODO.md` updated
- [ ] Significant decisions logged
- [ ] Custom code justified where a platform/library option existed
- [ ] Dead code deleted; debug scaffolding removed
- [ ] PR description explains what and why for a cold reader

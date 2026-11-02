# Required report

Use sections A–G in this order. Cite evidence for all ten ratings, including positive findings. For each problem include
a short exact excerpt, file and line(s), why it affects agent effectiveness, and a specific correction. Keep unverified
claims separate from confirmed defects. If no issues or fewer than a requested count are supported, say so instead of
manufacturing entries.

## A. Executive Summary

```text
File: <resolved path>
Document Type: <type and intended purpose>
Total Lines: <count>
Estimated Tokens: <count and estimation method; use Measured Tokens if tokenized>
DQS: XX.X / 100
Classification: <gated classification; include raw classification if capped>
Accuracy Gate: PASS/FAIL
Actionability Gate: PASS/FAIL
Evaluation Confidence: HIGH/MEDIUM/LOW
```

Briefly state verification scope, material unverified claims, and confidence rationale.

## B. Detailed Ratings

| Criterion          | Rating |   Weight | Weighted Score | Key Finding            |
| ------------------ | -----: | -------: | -------------: | ---------------------- |
| Accuracy           |   X/10 |      20% |           X/20 | Evidence and rationale |
| Clarity            |   X/10 |      15% |           X/15 | Evidence and rationale |
| Token Efficiency   |   X/10 |      15% |           X/15 | Evidence and rationale |
| Actionability      |   X/10 |      15% |           X/15 | Evidence and rationale |
| Structural Quality |   X/10 |      10% |           X/10 | Evidence and rationale |
| Context Relevance  |   X/10 |       7% |            X/7 | Evidence and rationale |
| Consistency        |   X/10 |       5% |            X/5 | Evidence and rationale |
| Retrievability     |   X/10 |       5% |            X/5 | Evidence and rationale |
| Completeness       |   X/10 |       5% |            X/5 | Evidence and rationale |
| Verifiability      |   X/10 |       3% |            X/3 | Evidence and rationale |
| **Total**          |        | **100%** |   **XX.X/100** |                        |

Use up to three decimal places for contributions to preserve exact sums; round only final DQS to one decimal.

## C. Critical Issues

Include confirmed issues that may cause incorrect, inconsistent, insecure, or noncompliant code. Use this block per
issue, or state none found in the inspected scope:

```text
Severity: CRITICAL/HIGH/MEDIUM/LOW
Location: <file, line(s), section>
Excerpt: <short exact quote>
Problem: <specific defect>
Impact: <effect on AI coding behavior>
Recommendation: <specific correction>
```

CRITICAL: direct severe security/data-loss risk. HIGH: likely materially incorrect or noncompliant behavior. MEDIUM:
ambiguity or gaps requiring consequential guesses. LOW: localized minor friction. State conditional risks as
conditional, not observed outcomes.

## D. Improvement Recommendations

| Priority | Criterion   | Problem                                   | Suggested Improvement | Expected Impact                                   |
| -------- | ----------- | ----------------------------------------- | --------------------- | ------------------------------------------------- |
| P0/P1/P2 | <criterion> | <location and excerpt or issue reference> | <concrete correction> | <expected behavioral benefit, not a tested claim> |

P0 = dangerous, incorrect, or contradictory instructions; P1 = significant correctness, clarity, or effectiveness
improvement; P2 = minor structure, readability, or token optimization. Order first by priority, then expected impact on
actual agent behavior, not text removed.

## E. Suggested Rewrites

For up to five highest-impact applicable issues:

Location: <file and line(s)>

**Current:**

```markdown
<exact existing content>
```

**Recommended:**

```markdown
<concrete replacement preserving engineering intent>
```

**Reason:** <why this should help AI agents>

Do not invent commands, repository conventions, or policy. If a correction requires missing facts, identify the fact to
confirm and label any placeholder explicitly; do not present it as a ready-to-use verified instruction. For omissions,
cite the relevant insertion location and label the rewrite as an addition.

## F. Token Optimization

Report existing estimated/measured count and method, redundant sections, repeated instructions, verbose explanations,
consolidation opportunities, and estimated token reduction if proposed changes are applied. State “none found” where
appropriate. Tie savings to explicit non-overlapping edits; if precise estimation is unsupported, provide a labeled
rough range and assumptions or say it cannot yet be estimated. Preserve meaningful constraints and relevant edge cases.

## G. Final Verdict

1. Top three supported strengths (or fewer if evidence warrants).
2. Top three supported weaknesses (or fewer if evidence warrants).
3. Five most valuable improvements (or fewer if applicable).
4. Overall recommendation: KEEP / MINOR REVISION / MAJOR REVISION / REWRITE. Base this on severity and revision scope,
   and explain briefly; DQS alone does not determine revision size.
5. Potential DQS after recommendations, explicitly a projection with assumptions, never a measured result. Apply the
   same gates to projected ratings.

# Small example

Input: `$markdown-quality-auditor ./docs/agent-guide.md`

Example document:

```markdown
# Agent Guide

Run the usual checks before finishing.
```

Expected structure: A lists the resolved path, type, 2 lines, estimated tokens, calculated DQS, gated classification,
both gates, and confidence. B rates all ten criteria with evidence. C may identify line 2, “Run the usual checks,” as
ambiguous; do not assert that a particular check command exists. D prioritizes specifying validated checks. E rewrites
line 2 using verified commands, or explicitly marks commands as facts still needed. F estimates only defensible savings
(possibly zero). G gives supported strengths/weaknesses, prioritized changes, a revision verdict, and a clearly
conditional projected score. Repository access gaps are stated rather than scored as confirmed technical errors.

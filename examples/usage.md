# Usage Examples

These are realistic starting points. Adapt to your situation.

---

## MVP Loop (most changes)

For well-understood bugfixes, small features, and medium refactors.
No explore phase needed. Adversarial review on the proposal, code review after apply.

```
/opsx:ff fix-auth-token-expiry
/codex:adversarial-review --wait focus: is this approach correct for the token lifecycle?
/opsx:apply fix-auth-token-expiry
/codex:review --wait
/opsx:verify fix-auth-token-expiry
/opsx:archive fix-auth-token-expiry
```

Claude evaluates each piece of Codex feedback: accepts, rejects (with one sentence of
justification), or partially incorporates. Then moves on. No re-review of the same point.

---

## Explore-first Loop (unclear problem)

Use when you're not sure what the problem actually is or what the right fix looks like.

```
/opsx:explore why does the cart total show NaN when a coupon is applied first
→ explore until root cause is identified
→ Claude forms hypothesis: it's a race condition between coupon state and price calculation

/opsx:ff fix-cart-total-race
/codex:adversarial-review --wait focus: is this diagnosis right? is there a simpler fix?
→ Codex: "the race is real but you're patching symptoms, the root cause is X"
→ Claude: accepts, updates proposal, scopes the fix to address root cause

/opsx:apply fix-cart-total-race
/codex:review --wait
/opsx:verify fix-cart-total-race
/opsx:archive fix-cart-total-race
```

---

## Architectural Refactor (full loop)

Use when the change is large, has significant design decisions, or touches abstractions.

```
/opsx:explore refactoring the permission system — it's getting unmanageable
→ explore tradeoffs, map current architecture, identify integration points

/opsx:ff refactor-permissions-rbac
→ Claude creates proposal.md, design.md, specs/, tasks.md

/codex:adversarial-review --background focus: is RBAC the right fit here vs simpler ACL?
→ Codex: "RBAC is overkill for your current scale, ACL covers all listed use cases"
→ Claude: accepts partially — simplifies to attribute-based ACL, updates design.md
→ Claude records: "Codex challenge on RBAC accepted. Switched to ABAC. Rationale: [...]"

/opsx:apply refactor-permissions-rbac
→ Claude implements all tasks
→ Task 4 reveals an integration issue not in the spec → pause, update design.md, continue

/codex:review --background
→ Codex finds: missing null-check in permission resolver (real bug)
→ Codex flags: naming convention inconsistency (style, dismissed)
→ Claude fixes the null-check, ignores the naming nitpick

/opsx:verify refactor-permissions-rbac
→ 1 WARNING: one scenario in spec not covered by tests
→ Claude adds the test

/opsx:archive refactor-permissions-rbac
```

---

## Blocked Mid-Implementation

When you're stuck during `/opsx:apply` and can't figure out the fix yourself.

```
/opsx:apply add-export-feature
→ Task 3: hit a problem — the PDF renderer doesn't expose the hook we need
→ Claude tries one approach, it breaks fonts
→ Claude tries second approach, layout breaks for RTL languages

# Genuinely blocked. Invoke rescue with a specific question.
/codex:rescue investigate why @pdflib/renderer onPageRender hook doesn't fire
  when content is injected after initial render — see src/export/pdf.ts:142

→ Codex identifies: hooks are only registered on first render pass, need to use
  the onRerender lifecycle instead
→ Claude applies the fix, marks task 3 done, continues apply
```

**Do not invoke rescue for every review finding.** It is for genuine blockers
where Claude has already tried and failed at least once.

---

## Small Hotfix (minimal ceremony)

For trivial fixes where spec artifacts would be wasteful.

```
/opsx:ff fix-typo-in-error-message
/opsx:apply fix-typo-in-error-message
/codex:review --wait
/opsx:archive fix-typo-in-error-message
```

Adversarial review skipped. Verify skipped (single-line change, obvious correctness).
The Codex code review is kept because it costs little and is the minimum safety check.

---

## Key Reminders

- **One round of updates per review.** Codex reviews once. Claude responds once. Done.
- **Claude's decision is final.** Codex raises concerns. Claude evaluates and decides.
- **Agreement ≠ correctness.** If Claude and Codex both like an approach, that's a
  green light — not a guarantee. Your judgment as the developer is the final check.
- **Rescue is opt-in.** Only invoke `/codex:rescue` when genuinely blocked after at
  least one failed fix attempt.
- **You remain accountable.** These are AI tools. The developer owns the outcome.

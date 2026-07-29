# Recovered: Finance Convention Source Decisions (Phase 8B, 2026-06-03)

**Provenance:** this document was authored 2026-06-03 as
`src/features/rio-scenario-resilience/docs/financeConventionSourceDecisions.md`
during Phase 8B, staged into the working tree, but never committed to any
branch. It survived only as an **untracked file inside the pre-existing git
stash** `stash@{0}` ("On main: WIP rio-scenario-resilience supporting data",
stash commit `a9a0e57`, untracked-file tree `1e17502278f6120f62916739ca1b41db90c54e2d`).

It is transcribed here verbatim (Gate 1, V10-RC2, 2026-07-29) by
`git show 1e17502278f6120f62916739ca1b41db90c54e2d:src/features/rio-scenario-resilience/docs/financeConventionSourceDecisions.md`
— a read-only extraction. **The stash itself was not popped, applied, or
modified.** `git stash list` continues to show exactly one entry
(`stash@{0}`) before and after this extraction.

This matters because `phase-v10-f1a-revenue-governance-decision-packet.md`
(R2, 2026-07-27) states the file `financeConventionSourceDecisions.md` "does
not exist in repository" when citing `receitaEngine.ts:71-74`'s 8% tuition
escalation source comment. That statement was accurate for the **tracked**
repository at that time — the file genuinely was never committed — but the
file did exist, uncommitted, in this stash the entire time. This is exactly
the class of recoverable, already-supplied decision evidence V10-RC2 Gate 1
was tasked with finding.

## Which parts are live governance vs. superseded

| §  | Decision | Status here (2026-06-03) | Current status (2026-07-29) |
|---|---|---|---|
| 2.1 | Tuition values are annual gross contract values | confirmed | **Still live.** Not contradicted by any later decision; consistent with `tuitionSourceData.ts` (`annualGrossContractValueBRL`). |
| 2.2 | Discount = average effective discount, must stay manually adjustable | confirmed with modeling caveat | **Still live** as a modeling convention; the specific *rate* was independently superseded by D-R3 (`workbook_v10_row224`). |
| 2.3 | Discount basis = founding families / employee-child scholarship / sibling discount; **no** grade/division/global precedence rule approved | partially confirmed | **Still live and still withheld.** No later decision (D-R1–D-R8, F01–F06) approves a precedence rule. Gate 6 must not invent one. |
| 2.4 | Discount applied **after** annual tuition adjustment | confirmed | **Still live.** Not addressed or contradicted by any D-R/F item. |
| 2.5 | Annual tuition adjustment starts in 2029 (2028 = base year) | confirmed | **Still live and consistent** — D-R2's approved `wb_v10_59pct` also treats 2028 as base year, escalation from 2029. |
| 2.6 | Annual tuition adjustment = 8%, compounding | confirmed | **Superseded.** D-R2 (Phase V10-F2, 2026-07-27, project owner) replaced the 8% convention with `wb_v10_59pct` (5.9% from 2029; 2028 not escalated because stored tuition values are already 2028-basis). The 8% figure is retained here only as historical record of what "Finance-provided 8%" meant at the time `receitaEngine.ts`'s now-obsolete comment referenced it. Do not reintroduce 8% anywhere. |
| 2.7 | Enrollment measure = contracted students (not average enrolled, not end-of-year seats) | confirmed | **Still live.** Not contradicted by D-R8 or F05 (those are about *which* contracted-student count is authoritative, not the measure definition). |
| 2.8 | No partial-year 2028 treatment (Brazilian school year starts January) | confirmed | **Still live.** Not addressed elsewhere. |
| 2.9 | Receita v1 scope: gross annual contract value before discount is the Receita base; net Receita after average effective discount is the primary output; taxes/delinquency/write-offs out of scope; scholarships already inside the discount rate, must not be double-counted as a separate exclusion | confirmed (approved by Luciana Polonen, 2026-06-03) | **Still live.** Directly constrains Gate 6: do not add a separate scholarship deduction line distinct from the average-effective-discount mechanism (this is also consistent with D-R3/D-R4's treatment of `percentual_desconto_medio` and `desconto_metodo` as the only two discount-adjacent deductions). |

## Explicit non-actions recorded in the original document (still binding)

- Do not force the discount-category answer (§2.3) into a grade, division, or
  global precedence convention.
- Do not import the legacy payroll `TUITION_GROWTH_RATE` as Receita's source
  of truth (superseded in spirit by D-R2, which sources tuition escalation
  from `tuitionGrowth.ts`, not payroll growth).
- Do not double-count scholarships as both a discount-rate component and a
  separate exclusion line.

## Disposition for Gate 6

§2.1, 2.2 (mechanism only), 2.3, 2.4, 2.5, 2.7, 2.8, 2.9 are recovered,
approved, uncontradicted project-owner conventions that were never
represented in any tracked governance record. They should govern Gate 6's
tuition/revenue wiring. §2.6 is superseded and recorded here only for
historical completeness. None of these resolve D-R5, D-R6/F03 (base tuition
rate values and `desconto_metodo` remain uncertified), or F05 (enrollment
scenario-mapping) — this document confirms *conventions*, not the specific
disputed *values*.

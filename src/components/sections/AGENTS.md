# Sections Agent Instructions

This file governs all files in `src/components/sections/`, including:
- `HighSchoolTab.tsx`
- `highSchoolScheduleModel.ts`
- `OfferScenariosTab.tsx` (see also `OfferScenarios.AGENTS.md`)
- All other tab components in this directory

---

## High School Locked Architecture

High School planning must be course-offer-led, not FTE-led.

Correct sequence:
1. Decision summary
2. Course-offer architecture
3. Weekly instructional/contact load by course offer
4. Capability architecture
5. Schedule and mentorship model
6. Scenario fit
7. Provisional staffing/load implications
8. Roadmap / appendix

The High School tab must not open as a payroll or FTE ramp. FTE, headcount, payroll, and hiring authorization language must remain provisional and validation-dependent.

Core principle:
Course offer → weekly slots per section → total instructional/contact load → educator capability → scenario fit → provisional staffing implications.

Do not treat FTE as the source of truth.

### Grade progression model

#### Grade 9: High School launch / foundation
- Grade 9 launches High School with a mixed educator model.
- New HS-capable educators are hired for validated HS-specific domains.
- Selected Middle School educators may extend into Grade 9 only where High School expertise, profile fit, and schedule capacity are validated.
- Shared MS/HS staffing is a bridge mechanism, not a substitute for High School hiring.
- Grade 9 course architecture (9 rows):
  1. Integrated Mathematics
  2. Portuguese / Redação
  3. Natural Sciences: Biology and Chemistry foundations (Physics is not a Grade 9 requirement)
  4. Brazilian Studies / Global Studies (may connect to GCD-related work and project/research mentoring; AP Research is not Grade 9 load)
  5. English Language Arts (may be covered by a validated MS ELA educator in Grade 9; dedicated HS ELA is expected in Grade 10)
  6. College Counseling / Pathways / Global Citizen Diploma (GCD is coordinated through this layer and does not appear as a separate Grade 9 row)
  7. Global Expression & Leadership
  8. Advisory (required distributed student-support/contact responsibility; not optional and not merged into College Counseling, GCD, or Project Mentorship)
  9. Project Mentorship / Passion Project (distributed across eligible educators in a fixed synchronized block; not a separate hire)
- Physics is not a Grade 9 requirement. It belongs to later High School grades.
- Innovation / Design Technologies is not a Grade 9 course. Innovation Diploma replaces Passion Project starting in Grade 11.
- GCD foundation is not a separate Grade 9 row. It is embedded within College Counseling / Pathways.
- AP English, AP Seminar, AP Research, and AP Human Geography are not Grade 9 load requirements.

#### Grade 10: High School ownership
- Grade 10 extends the Grade 9 launch package rather than creating an automatic new FTE step.
- This still requires explicit High School ownership across academics, advisory, mentorship, Pathways, College and Career Guidance, and GCD within Pathways/Leadership.
- Avoid wording such as "0 New FTE" unless it is explicitly caveated as "no separate Grade 10 FTE step beyond the launch package, pending validation."

#### Grade 11: Specialist density
- Grade 11 moves toward specialist domains or strong part-time specialists.
- Generic shared staffing becomes risky.
- Grade 11 should make visible advanced mathematics, explicit Biology/Chemistry/Physics coverage, Brazilian Studies, Global Studies, AP/advanced pathways, College/Career counseling, external mentorship, capstone-like work, GCD within Pathways/Leadership, and Innovation / Design Technologies.

#### Grade 12: Graduation pathway and transition
- Grade 12 should not be treated as flat or zero workload simply because subject load stabilizes.
- Independent study, AP Research, College/Career counseling, leadership, external mentorship, internships, graduation pathway support, GCD completion, and Innovation Diploma completion generate adult workload.
- AP Research is Grade 12 Social Sciences.

### Capability architecture

ELA / AP English / AP Capstone-capable educator may cover or support:
- English Language Arts
- AP English Language Composition
- AP English Literature
- AP Seminar
- AP Capstone-related writing/research support where appropriate

Do not reduce AP Seminar or AP Research to generic ELA. Explicit capability validation is required.

Humanities architecture:
- High School Humanities should be divided into Brazilian Studies and Global Studies.
- Brazilian Studies and Global Studies include Geography and History where relevant.
- Avoid vague standalone labels such as "HS Humanities / AP Social Sciences" unless mapped to Brazilian Studies and Global Studies.

AP Research:
- AP Research belongs to Grade 12 Social Sciences.
- Do not place AP Research vaguely under generic ELA or generic research.

College and Career Guidance:
- College and Career Guidance begins in Grade 9.
- It should appear as a High School pathway/advisory layer from the start, not only in Grades 11–12.

Mentorship architecture:
- All educators have a Passion Project / Project Mentorship role.
- Do not imply separate Project Mentor hiring by default.
- Project Mentorship, Passion Project, and Innovation Diploma happen within a fixed synchronized mentorship block.
- This affects workload allocation, profile fit, and group capacity.
- It does not automatically create a separate Project Mentor role unless later validated.

### Scenario architecture

#### Scenario A: Shared MS/HS bridge
- Limited bridge model.
- Can support early G9–G10 continuity in selected domains.
- Cannot assume full Biology/Chemistry/Physics coverage, AP-level humanities, advanced English composition, or college-facing expectations without validated HS expertise.

#### Scenario B: Transitional part-time HS model
- Strongest transitional model.
- Provides distinct High School ownership while using part-time/shared specialists where justified.
- Should clarify Pathways, mentorship, College/Career, and specialist academic ownership.

#### Scenario C: Mature HS specialist model
- For later density and G11–G12 maturity.
- Supports AP/advanced sciences, AP Capstone/AP Research, independent study, internships, College/Career guidance, Leadership with embedded GCD scope, and Innovation / Design Technologies.
- Should not be activated too early as full payroll logic.

### Weekly instructional/contact load table
- The High School model needs a table that explains the weekly instructional/contact load generated by the course offer.
- This table should show slots per week per section, minutes per slot, number of sections, total weekly slots, total weekly minutes, total weekly contact hours, load category, capability profile, and validation status.
- This is not payroll, not contracted hours, not FTE, and not hiring authorization.
- Use the phrase "weekly instructional/contact load," not "educator contracted hours."

### UI architecture
- The High School tab should borrow the left-side subnavigation / dossier structure from the Cenários de Oferta tab.
- Borrow the UI pattern, not the A–D offer scenario data.
- Do not import or reuse Scenario D for High School.
- `OfferScenariosTab.tsx` may be used as a layout and print-pattern reference only.
- High School scenarios are A/B/C only.

Preferred High School subviews:
1. Decision Summary
2. Course Offer
3. Weekly Load by Offer
4. Capability Architecture
5. Schedule / Mentorship Model
6. Scenario Fit
7. Provisional Load
8. Roadmap / Appendix

### Export work
- Pause PDF/export work until the High School architecture and UI structure are corrected.
- Future export should be scenario-based for HS A/B/C only, not Offer Scenario D.

### Guardrails
- Do not change payroll formulas unless explicitly requested.
- Do not change FTE formulas unless explicitly requested.
- Do not treat São Paulo reference schedule data as Rio weekly truth.
- Do not treat GCD as a separate additive staffing bucket.
- Preserve Biology, Chemistry, and Physics as distinct capability expectations.
- Preserve fixed mentorship block logic.
- Do not use user-facing portfolio evidence, documentation workflow, or evidence curation language.
- Technical identifiers such as EvidenceLevel or slotEvidenceLevel may remain if they refer to source reliability.

---

## Middle School Grade 6 Cluster Architecture

### Two valid planning lenses

Grade 6 has two valid planning lenses and both must be preserved:

1. **Domain-row simulator lens** — 5 core subject-domain rows:
   - Integrated Mathematics
   - Natural Sciences
   - Língua Portuguesa
   - Social Sciences
   - English Language Arts

2. **Cluster launch lens** — 3 educator clusters:
   - STEM Cluster: Integrated Mathematics + Natural Sciences
   - Humanities Cluster: Língua Portuguesa + Social Sciences
   - Global Studies / ELA & Projects Cluster: English Language Arts + Passion Project + Pathways + Global Expression & Leadership

Do not collapse these lenses. Do not treat the domain-row count as the cluster-educator count, or vice versa.

### Cluster load rules

- World Language is excluded from the Grade 6 model.
- Each slot equals 45 minutes.
- 3 educator clusters must not be interpreted as 3 fully loaded educators.
- The minimum viable teaching load is 24 slots per week.
- Each cluster still has a gap to the 24-slot minimum; complementary program-function load or explicit allocation is required.
- Program-function load and distributed responsibilities are not leftover capacity.

### Slot math — Grade 6, 2 sections

| Cluster | Formula | Slots / section | Slots, 2 sections | Gap to 24-slot min |
|---|---|---|---|---|
| STEM Cluster | Math 6 + Natural Sciences 4 | 10 | 20 | 4 slots |
| Humanities Cluster | Portuguese 6 + Social Sciences 4 | 10 | 20 | 4 slots |
| Global Studies / ELA & Projects Cluster | ELA 6 + Passion Project 2 + Pathways 1 + Global Expression 2 | 11 | 22 | 2 slots |

Grade 6 total: 38 slots per section, 76 slots across 2 sections, 57 weekly contact hours.

### Planning premise caveats

These are instructional-capacity planning signals only. They are not payroll authorization, final FTE, final headcount, or hiring approval.

### Forbidden claims

Do not claim:
- 3 clusters equals 3 fully loaded educators
- 3 clusters equals approved staffing, final FTE, payroll, or headcount
- Complementary load is automatic or guaranteed
- Program-function load or distributed responsibilities are leftover capacity
- The domain-row educator count from the simulator equals the cluster-educator count

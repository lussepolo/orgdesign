# Rio Org Design Logic

## Status

This document defines the intended org-design scenario logic for the Rio Org Design Simulator.

This is a non-executable source-of-truth document. It does not activate payroll, does not calculate cost, and does not modify headcount logic.

Payroll activation remains blocked until the app confirms role existence, compensation archetypes, headcount rules, year-based triggers, and shared-versus-dedicated role logic.

This document supports the typed source contract in `src/features/rio-scenario-resilience/data/orgDesignScenarioExtensions.ts`, but it does not directly activate payroll.

## Scenario Options

The org-design model contains three experience scenarios:

1. Minimum Experience
2. Balanced Experience
3. Premium Experience

## Global Modeling Rules

- Learning Design Experience is a functional umbrella, not a paid role.
- Specialist Educators are modeled as individual specialist roles, not a generic package.
- Counselor scaling is already handled in the payroll tabs and should not be recreated manually.
- EY has one Counselor.
- LS has one Counselor.
- MS Counselor activates through existing payroll-tab logic when Middle School opens.
- HS Counselor is not rendered as a separate Executive Org Design node until a division-specific source rule is confirmed. Existing counselor HC is aggregate and should not be interpreted as an HS-specific allocation without governance approval.
- IT Technician reports directly to EdTech Coordinator.
- Language Acquisition and Performance Coach is not a separate role. It is the same role as Language Acquisition Coach.
- Security / Clerks normalize to the existing Clerk / Portaria payroll role and use existing system headcount.
- Events Assistant is a new scenario-extension role and uses Learning Monitor compensation.
- Compensation aliases do not activate roles. They only define which existing archetype should be used if a role is later activated.
- Learning Experience Designer should use the existing encoded role if present. Do not alias it to another archetype unless the app proves there is no existing role.
- Security Coordinator should be added only as a supervisory role in Balanced and Premium Experience. Do not add extra Security / Clerks headcount.

## Classroom Educator Package Composition Source Trace

| Package | Org-design canonical composition rule |
|---|---|
| Early Years Educator Package | Reference Educator + Assistant + Monitor |
| Lower School Educator Package | Reference Educator + Assistant |

These package rules describe staffing composition per section/classroom package. Numeric package HC depends on source-backed section counts per grade level and should not be inferred from the composition rule alone.

## Executive Static Tree Year Rendering Rule

Executive Org Design renders the active organization for the selected year. Source-backed zero-HC roles are suppressed until their first source-backed positive-HC activation year; future activation is intended to be shown through year progression rather than static-card density.

## Year Progression View Rule

Year progression animates the selected-year model state. It does not introduce separate staffing assumptions; active roles, suppressed zero-HC roles, pending packages, and readiness-layer outputs remain governed by the Executive Org Design model.

Year progression re-renders the selected-year active organization. Roles appear when their source-backed HC or readiness-layer activation becomes active; source-backed zero-HC future roles remain suppressed until positive-HC activation.

## Product Owner Decisions Added After Audit

| Decision Area | Product Owner Rule |
|---|---|
| Security / Clerks | Normalize to existing Clerk / Portaria payroll role. Use existing headcount. Do not add extra Clerk / Portaria HC in Balanced or Premium. |
| Security Coordinator | Governance role only for Balanced and Premium. Security / Clerks functionally respond to it, but no extra Clerk / Portaria HC is created. |
| Events Assistant | New scenario-extension role, not in previous headcount. Learning Monitor compensation, HC 1, activation year 2028, active in all scenarios. |
| Maker Space Assistant | Same as Maker Assistant. Use display label Maker Space Assistant. Associate Educator compensation, HC 1, activation year 2028, active in all scenarios. |
| Language Acquisition Coach | Language Acquisition and Performance Coach is not a separate role. Use Language Acquisition Coach. Master Educator compensation, HC 1, activation year 2028, active in all scenarios. |
| Personalized Learning Associate Educator | Associate Educator compensation, HC 1, activation year 2028, active in Balanced and Premium only. |
| Curriculum and Assessment Designer | Master Educator compensation, HC 1, activation year 2028, active in Premium only, reports to Head of School. |
| Librarian | Maps to existing Inspirationeer / library role. Use existing payroll role and headcount logic. Do not create a new Librarian payroll role. |
| Early Years Principal | Maps to existing EY Coordinator. Use existing payroll role and headcount logic. |
| Lower School Principal | Maps to existing LS Coordinator. Use existing payroll role and headcount logic. |
| After School Coordinator | Display label becomes After School Coordinator. Use existing After School Educator compensation/headcount logic. Represent as leadership / coordination for org-design storytelling only. |

## Middle School and High School Educator Source Rule

Middle School and High School educator staffing must come from the existing MS and HS tabs/models.

Staffing source:
- MS: `src/components/sections/MiddleSchoolTab.tsx`
- MS model: `src/components/sections/middleSchoolLoadModel.ts`
- HS: `src/components/sections/HighSchoolTab.tsx`
- HS model: `src/components/sections/highSchoolScheduleModel.ts`

Compensation source:
- MS and HS educators use the existing Master Educator salary, cost, and benefits archetype from `EDUCATOR_LEVELS`.

Modeling rules:
- Use the MS/HS tabs and models for staffing, load, headcount, and opening logic.
- Use Master Educator only as the compensation archetype.
- Do not use prior hardcoded MS/HS educator FTE assumptions as the staffing source.
- Do not create new MS/HS salary, benefit, or cost constants.
- Do not duplicate MS/HS headcount logic.
- Do not infer MS/HS headcount from the org-design scenario map.
- Do not wire payroll activation yet.

## Scenario 1: Minimum Experience

    Head of School
    │
    ├── Operations Coordinator
    │   ├── Secretary
    │   │   └── dotted line to Enrollment & Family Services Coordinator
    │   ├── Nurse Intern
    │   ├── Security / Clerks
    │   ├── Maintenance
    │   ├── Marketing Analyst
    │   ├── Events Assistant
    │   ├── Financial Analyst
    │   ├── Financial Assistant
    │   └── HR Analyst
    │
    ├── Early Years Principal
    │   ├── EY Counselor
    │   └── Early Years Educator Package
    │
    ├── Lower School Principal
    │   ├── LS Counselor
    │   └── Lower School Educator Package
    │
    ├── Learning Experience Designer
    │
    ├── EdTech Coordinator
    │   ├── IT Technician
    │   └── Maker Space Assistant
    │
    ├── Language Acquisition Coach
    │
    ├── After School Coordinator
    │
    ├── Specialist Educators
    │   └── dotted line to Principals
    │
    ├── Enrollment & Family Services Coordinator
    │   ├── Family Engagement Analyst
    │   └── Secretary dotted-line support
    │
    └── Librarian
        └── dotted line to Principals

### Scenario 1 Rules

| Role / Function | Status |
|---|---|
| Head of School | Active |
| Operations Coordinator | Active |
| Secretary | Active |
| Nurse Intern | Active |
| Security / Clerks | Active as Clerk / Portaria using existing payroll role and headcount |
| Maintenance | Active |
| Marketing Analyst | Active |
| Events Assistant | Active, new scenario-extension role, HC 1 from 2028, Learning Monitor compensation |
| Financial Analyst | Active |
| Financial Assistant | Active |
| HR Analyst | Active |
| Early Years Principal | Active |
| EY Counselor | Active |
| Lower School Principal | Active |
| LS Counselor | Active |
| MS Counselor | Not manually modeled; activates through existing payroll-tab logic when MS opens |
| Learning Experience Designer | Active |
| EdTech Coordinator | Active |
| IT Technician | Active, reports to EdTech Coordinator |
| Maker Space Assistant | Active, reports to EdTech Coordinator, HC 1 from 2028, Associate Educator compensation |
| Language Acquisition Coach | Active, HC 1 from 2028, Master Educator compensation |
| After School Coordinator | Active as org-design label/classification for existing After School Educator payroll role |
| Specialist Educators | Active as individual specialist roles |
| Enrollment & Family Services Coordinator | Active |
| Family Engagement Analyst | Active |
| Librarian | Active |

## Scenario 2: Balanced Experience

Scenario 2 starts from Scenario 1 and adds governance and personalized learning support without inflating leadership headcount.

    Head of School
    │
    ├── Operations Coordinator
    │   ├── Secretary
    │   │   └── dotted line to Enrollment & Family Services Coordinator
    │   ├── Nurse Intern
    │   ├── Security / Clerks
    │   ├── Maintenance
    │   ├── Marketing Analyst
    │   ├── Events Assistant
    │   ├── Financial Analyst
    │   ├── Financial Assistant
    │   └── HR Analyst
    │
    ├── Security Coordinator
    │   └── Security / Clerks
    │       └── functional reporting line
    │
    ├── Early Years Principal
    │   ├── EY Counselor
    │   └── Early Years Educator Package
    │
    ├── Lower School Principal
    │   ├── LS Counselor
    │   └── Lower School Educator Package
    │
    ├── Learning Design Experience
    │   ├── Language Acquisition Coach
    │   │   └── Personalized Learning Associate Educator
    │   └── Learning Experience Designer
    │
    ├── EdTech Coordinator
    │   ├── IT Technician
    │   └── Maker Space Assistant
    │
    ├── After School Coordinator
    │
    ├── Specialist Educators
    │   └── dotted line to Principals
    │
    ├── Enrollment & Family Services Coordinator
    │   ├── Family Engagement Analyst
    │   └── Secretary dotted-line support
    │
    └── Librarian
        └── dotted line to Principals

### Scenario 2 Rules

| Role / Function | Status |
|---|---|
| Everything from Scenario 1 | Active |
| Security Coordinator | Added, reports to Head of School |
| Security / Clerks | Existing Clerk / Portaria payroll role, functionally responds to Security Coordinator |
| Clerks | Do not add separately unless app proves they are distinct from Security |
| Learning Design Experience | Functional umbrella only, not a paid role |
| Language Acquisition Coach | Same existing role, now represented inside Learning Design Experience |
| Personalized Learning Associate Educator | Added, HC 1 from 2028, reports to Language Acquisition Coach |
| Learning Experience Designer | Same existing role, represented inside Learning Design Experience |
| Curriculum and Assessment Designer | Not active |

## Scenario 3: Premium Experience

Scenario 3 starts from Scenario 2 and adds Curriculum and Assessment Designer.

    Head of School
    │
    ├── Operations Coordinator
    │   └── same operational structure as Scenario 2
    │
    ├── Security Coordinator
    │   └── Security / Clerks
    │       └── functional reporting line
    │
    ├── Early Years Principal
    │   └── same as Scenario 2
    │
    ├── Lower School Principal
    │   └── same as Scenario 2
    │
    ├── Learning Design Experience
    │   ├── Language Acquisition Coach
    │   │   └── Personalized Learning Associate Educator
    │   └── Learning Experience Designer
    │
    ├── Curriculum and Assessment Designer
    │
    ├── EdTech Coordinator
    │   ├── IT Technician
    │   └── Maker Space Assistant
    │
    ├── After School Coordinator
    ├── Specialist Educators
    ├── Enrollment & Family Services Coordinator
    └── Librarian

### Scenario 3 Rules

| Role / Function | Status |
|---|---|
| Everything from Scenario 2 | Active |
| Curriculum and Assessment Designer | Added, HC 1 from 2028, reports to Head of School |
| Learning Design Experience | Still functional umbrella only, not a paid role |

## Scenario Activation Comparison

| Role / Function | Minimum Experience | Balanced Experience | Premium Experience |
|---|---:|---:|---:|
| Head of School | Active | Active | Active |
| Operations Coordinator | Active | Active | Active |
| Secretary | Active | Active | Active |
| Nurse Intern | Active | Active | Active |
| Security / Clerks | Active | Active, functionally under Security Coordinator | Active, functionally under Security Coordinator |
| Security Coordinator | Not active | Active | Active |
| Maintenance | Active | Active | Active |
| Marketing Analyst | Active | Active | Active |
| Events Assistant | Active | Active | Active |
| Financial Analyst | Active | Active | Active |
| Financial Assistant | Active | Active | Active |
| HR Analyst | Active | Active | Active |
| Early Years Principal | Active | Active | Active |
| Lower School Principal | Active | Active | Active |
| EY Counselor | Active | Active | Active |
| LS Counselor | Active | Active | Active |
| MS Counselor | Payroll-tab logic only | Payroll-tab logic only | Payroll-tab logic only |
| EY Educator Package | Active | Active | Active |
| LS Educator Package | Active | Active | Active |
| Learning Experience Designer | Active | Active inside Learning Design Experience | Active inside Learning Design Experience |
| Learning Design Experience | Not applicable | Functional umbrella only | Functional umbrella only |
| Language Acquisition Coach | Active | Active inside Learning Design Experience | Active inside Learning Design Experience |
| Personalized Learning Associate Educator | Not active | Active | Active |
| Curriculum and Assessment Designer | Not active | Not active | Active |
| EdTech Coordinator | Active | Active | Active |
| IT Technician | Active under EdTech Coordinator | Active under EdTech Coordinator | Active under EdTech Coordinator |
| Maker Space Assistant | Active under EdTech Coordinator | Active under EdTech Coordinator | Active under EdTech Coordinator |
| After School Coordinator | Active | Active | Active |
| Specialist Educators | Active as individual roles | Active as individual roles | Active as individual roles |
| Enrollment & Family Services Coordinator | Active | Active | Active |
| Family Engagement Analyst | Active | Active | Active |
| Librarian | Active | Active | Active |

## Compensation Alias Hypotheses To Audit

| Display Role | Compensation Archetype Hypothesis | Status |
|---|---|---|
| Events Assistant | Learning Monitor | Product Owner approved source-contract rule |
| Maker Space Assistant | Associate Educator | Product Owner approved source-contract rule |
| Personalized Learning Associate Educator | Associate Educator | Product Owner approved source-contract rule |
| Security Coordinator | Master Educator | Product Owner approved source-contract rule |
| Curriculum and Assessment Designer | Master Educator | Product Owner approved source-contract rule |
| Language Acquisition Coach | Master Educator | Product Owner approved source-contract rule |
| Learning Experience Designer | Existing encoded role | Existing payroll role should be used; do not alias |

## Known Non-Duplications

- Language Acquisition and Performance Coach is not a separate payroll role.
- Learning Design Experience is not a payroll role.
- Security and Clerks should not be treated as separate roles; they normalize to existing Clerk / Portaria for this source contract.
- Learning Experience Designer should not be duplicated in Scenario 2 if already active in Scenario 1.
- MS Counselor should not be manually duplicated because the payroll tab already handles activation when MS opens.
- Security / Clerks headcount should not be increased in Scenario 2 or Scenario 3.

## Required Data Before Payroll Activation

| Required Field | Why Needed | Current Status |
|---|---|---|
| Normalized role ID | Needed for deterministic activation | Needs app audit |
| Compensation archetype | Needed for cost source | Partial aliases known, must audit |
| Org-design option | Needed for Minimum/Balanced/Premium mapping | Defined in this document |
| Headcount quantity | Needed for payroll calculation | Not yet validated |
| Year / opening trigger | Needed for annual modeling | Must use existing payroll logic where available |
| Shared vs dedicated logic | Needed to avoid overcounting | Not yet validated |
| Reporting line | Needed for org chart/storytelling | Defined here, non-financial |
| Functional dotted line | Needed for org chart/storytelling | Defined here, non-financial |

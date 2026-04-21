---
entry_surface: repository
entry_model_class: primary
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "MPLP-DOWNSTREAM-EVIDENCE-ANONYMITY-GATE-v0.1"
title: "MPLP Downstream Evidence Anonymity Gate v0.1"
surface_role: canonical
---

# MPLP Downstream Evidence Anonymity Gate v0.1

## A. Purpose

Define minimum gate for future downstream-evidence candidate notes.

## B. Required Rules

| Gate | Requirement | Status |
| --- | --- | --- |
| downstream evidence must be anonymous | future candidate notes must avoid concrete downstream product or vendor naming | `PASS` |
| no product name in MPLP candidate note | product-specific naming must not appear in candidate/backlog guidance unless explicitly registered as a legacy exception | `PASS` |
| no runtime name in MPLP candidate note | runtime-substrate naming must stay neutral in candidate/backlog guidance | `PASS` |
| no implementation endorsement | candidate notes must not endorse any implementation substrate | `PASS` |
| no product endorsement | candidate notes must not endorse any downstream product | `PASS` |
| no certification claim | candidate notes must not claim certification or certification-like authority | `PASS` |
| no schema change unless explicitly authorized | candidate notes remain governance-only unless a later wave explicitly authorizes schema work | `PASS` |
| no protocol law change unless explicitly authorized | candidate notes remain below normative promotion unless a later wave explicitly authorizes protocol-law work | `PASS` |
| candidate must state non-normative/backlog/guide/profile/binding consideration status | every future note must explicitly identify its non-normative holding posture | `PASS` |
| candidate must include explicit non-decisions | every future note must state no schema change, no protocol law change, and no silent promotion | `PASS` |

## C. Recommended Grep

`rg -n "SoloCrew|Coregentis Runtime|Cognitive_OS|founder|Secretary|portfolio|runtime endorsement|product endorsement|implementation endorsement|certification" governance/backlog governance/gates governance/audits`

## D. Decision

`MPLP_DOWNSTREAM_EVIDENCE_ANONYMITY_GATE_READY`

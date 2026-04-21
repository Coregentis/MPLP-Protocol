---
entry_surface: repository
entry_model_class: primary
doc_type: governance
status: draft
authority: none
protocol_version: "1.0.0"
doc_id: "MPLP-CANDIDATE-RESEARCH-ARCHIVE-AND-DUPLICATE-CLOSURE-v0.1"
title: "MPLP Candidate Research Archive and Duplicate Closure v0.1"
surface_role: canonical
---

# MPLP Candidate Research Archive and Duplicate Closure v0.1

## A. Purpose

Record which candidate/research surfaces are archived or closed as duplicates
after consolidation.

## B. Archive / Closure Matrix

| Source file | Closure status | Parent / replacement | Reason | Future action |
| --- | --- | --- | --- | --- |
| `governance/research/MPLP-CANDIDATE-BACKLOG-v0.1.md` | `merged_into_parent_candidate` | `governance/backlog/MPLP-CANDIDATE-BACKLOG-v0.1.md` | overlaps the active backlog umbrella and is better treated as supporting research context | keep file as research archive context only |
| `governance/research/MPLP-DELEGATION-DELIVERY-CONSTRAINT-CANDIDATES-v0.1.md` | `closed_as_duplicate` | `governance/backlog/MPLP-DELEGATION-DELIVERY-CONSTRAINT-CANDIDATES-v0.1.md` | materially duplicates the active governance expansion surface for the same family set | keep file as historical context only |
| `governance/backlog/MPLP-CROSS-REPO-NON-PROMOTION-CLOSURE-v0.1.md` | `closed_as_non_mplp` | `governance/backlog/MPLP-CANDIDATE-BACKLOG-INDEX-v0.1.md` | remains a boundary-closure posture record rather than an active candidate family | preserve as closed boundary evidence |
| `governance/backlog/MPLP-v0.4-DOWNSTREAM-CANDIDATE-CLOSURE-MATRIX-v0.1.md` | `deferred_pending_more_evidence` | `governance/backlog/MPLP-CANDIDATE-BACKLOG-INDEX-v0.1.md` | still useful as a classification snapshot, but not a primary active candidate surface | keep as supporting backlog status evidence until a later consolidation wave |

## C. Do Not Delete Statement

This wave records closure/archive posture only. It does not delete historical
files.

## D. Decision

`MPLP_CANDIDATE_RESEARCH_ARCHIVE_DUPLICATE_CLOSURE_READY`

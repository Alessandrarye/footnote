# Decisions Log

## 2026-08-09 · Stack
React (Vite) + Node/Express + PostgreSQL. Chosen for: Metana-native, boring and
proven; the risk budget is reserved for the claim pipeline, not the plumbing.

## 2026-08-09 · Model layer
Claude API behind an adapter interface; every model call is logged to the
transparency record. Swappable if pricing or behavior changes.

## 2026-08-09 · Civic data storage
Locality package as YAML files in-repo with per-entry provenance
(source, verified date, tier). The git history is the audit log.

## 2026-08-09 · Designated fallback
If live claim handling is behind at end of build-week 2: descope to a curated
set of ~10 real local claims with the full pipeline behind each. Demo survives.

## 2026-08-09 · Excluded permanently (values as architecture)
Accounts/profiles, feeds/posts, behavioral tracking, advertising, engagement
mechanics. See README. These are design decisions, not missing features.

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

## 2026-08-09 · Fresh EC2 instance (not shared with blog)

Blast-radius isolation for a judged demo; clean documented infra from
scratch; accepted ~$10/mo. Elastic IP + footnote.alessandrarye.com,
nginx + pm2 + certbot. Runbook: docs/deploy.md.

## 2026-09-15 · Delaware County data capture v1

- OLSD board members cite the combined about-the-board page as source_url; the district has no individual bio pages (unlike Powell).
- Citation rule for downloadable files: rolling "current" documents (agendas, session calendars) cite the stable parent page; dated documents (2026 Directory) cite their own permanent URL.
- v1 county coverage is commissioners + auditor + Board of Elections by design; judges, sheriff, and other county officials deferred (eodirectory resource entry covers them for users).
- Offices without a single named official (Board of Elections) live under officials with the office name in the name field; organizations is reserved for non-government reputable-secondary entries.
- OLSD YouTube channel captured as a resource, not in agenda_portal; recordings answer a different question than agendas.

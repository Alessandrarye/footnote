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

## 2026-09-29 · Claim-flow diagram

Added the claim-flow diagram (panel feedback item 1). README and slide
versions live in docs/img/, drawn in the deck's ink-and-cherry style.

## 2026-09-30 · Real demo sources

Replaced the three placeholder sources in the source stage with real
records. The demo claim's source card is now entirely true. Summary in
policy.js rewritten as neutral description, no verdict.

- Budget source upgraded: placeholder imagined an "FY2026 Adopted
  Budget"; cited the audited FY2025 Annual Comprehensive Financial
  Report instead, because audited actuals answer "where does the money
  go" better than a plan. Excerpt is the MD&A general fund
  expenditures table (Instruction $265.4M of $378.7M total).
- Ballot language: actual March 19, 2024 Official Questions and Issues
  Ballot from the Delaware County Board of Elections, permitted-uses
  wording typed as filed.
- Minutes: August 27, 2026 regular meeting via BoardDocs, showing the
  board's recorded vote approving the financial forecast. Chosen over
  hunting the 2023 ballot-placement minutes; current minutes showing
  ongoing financial votes serve the demo better.
- Citation rule addition: documents hosted on a district's website
  vendor CDN (e.g. resources.finalsite.net) reached from the official
  site are cited at the document's own URL; tier follows the
  publisher, not the hosting domain, so these remain primary.

## 2026-10-04 · Resources shown as a fourth invitation group

The `resources:` block in the locality YAML (public-records request, Ohio
Revised Code, legal notices, meeting videos, county directories) now loads
in invite.js and renders under Organizations. Resources get the same
staleness and receipt treatment as officials, meetings, and organizations,
so every item a user sees carries a source, a verified date, and a tier.
The link label is "open" because these are tools to use, not sites to
browse. The transparency note now counts resources too.

## 2026-10-04 · Model drafts the summary, code decides what appears

The source card summary is now drafted by Claude Haiku through adapter.js,
one or two sentences per kept source, each naming the source it came from.
policy.js then checks every sentence with rules, not AI: it must point to a
kept source, every figure must appear in that source, it must contain no
verdict language, and outcome words (approved, passed, failed) may appear
only if the cited record uses them. Failed sentences are dropped and logged
in the transparency record. The closing "no verdict is offered" line is
written by code. No key, a failed call, or zero surviving sentences falls
back to the curated summary.

The outcome rule came from the first test run: the model wrote that the levy
was "approved" while citing the ballot, which lists the question but not the
result. Known limit: the checker verifies attribution, figures, and wording,
not whether a paraphrase preserves meaning.

## 2026-10-05 · Claims without records get an honest empty card

source.js used to return the levy records for every claim, so an unrelated
claim was shown records that did not answer it. Sources now live in record
sets, each with a topic rule: a claim matches if it names the topic directly
(levy, millage) or pairs a "who" word (school, district, Olentangy) with a
"what" word (tax, budget, spending, money). The match is rules, not AI, and
the transparency record logs which set matched and on which words.

A claim that matches no set gets no sources, no model-drafted summary, and a
card that says "Not yet covered" and names what Footnote does carry. The
civic invitation still appears, because the local next step applies either
way. Known limit: keyword matching is coarse, so a loosely related claim
about school money will still be shown the levy records.

## 2026-10-07 · Interface polish before the final demo

Instructor feedback asked for a current README, a current server, and a
polished interface. The interface changes, in one pass:

- The civic invitation lists the entries closest to the claim first. A levy
  claim now leads with the Olentangy school board instead of scrolling past
  Powell City Council. Nothing is removed, the order inside each half is
  unchanged, and a line under the locality name says why the order changed.
- The transparency record shows the checker's work: how long each model call
  took, how many summary sentences were drafted, kept, and dropped, and each
  dropped sentence with its reason. Before this the data was logged but only
  a one-line note was displayed.
- A mixed claim shows its checkable part. The form says so when the server
  cannot be reached. Every button and link has a visible keyboard focus ring.
- Scaffold leftovers are gone: the page title was "client", the favicon was
  the Vite logo, and unused template assets were still in the repo.

## 2026-10-07 · No database and no CI in the capstone build

The August stack decision named PostgreSQL, and the plan included GitHub
Actions CI. Neither was built. Sessions are not stored, by design, and the
civic data lives in version-controlled YAML whose git history is the audit
log, so a database would have held nothing. CI waits on a real test suite,
which starts with turning the checker proof script into tests. Both moved to
the roadmap, and the README and tech notes now say so plainly.

# Footnote

**Footnote** helps you deal with claims about your own community. Bring it a statement you've seen ("the levy money is going to administrator raises") and your locality, and it shows you what kind of claim it is, what the primary records actually say, and exactly how that answer was assembled. Then it hands you the real next step: the upcoming meeting and agenda, the responsible official, the organizations already working the issue. Then the session ends. Nothing is remembered about you, because nothing is collected.

## Why this exists

Verification tools stop at the verdict. Civic software is sold to governments, not citizens. The places where claims actually spread offer neither. Footnote connects the moment of encountering a claim to the moment of doing something about it, and it does so under fixed constraints: no profiles, no engagement optimization, no advertising, no verdict badges, primary sources only, and a transparency record behind every answer. The constraints aren't limitations; they're the product.

## Status

Capstone MVP: one locality (Delaware County, Ohio area), one complete path end to end, locality data hand-curated in version-controlled files with per-entry source and verification date. Broader roadmap (topic packages, librarian curation, community source submission) is documented in [the brief](./docs/brief.md), not built here yet.

## Stack

React (Vite) · Node.js + Express · PostgreSQL · Claude API behind a swappable adapter, every call logged to the transparency record · civic data as version-controlled YAML with per-entry provenance · AWS EC2 · GitHub Actions CI

## Running locally

_Coming with the scaffold (see [DECISIONS.md](./DECISIONS.md) for choices and reasons)._

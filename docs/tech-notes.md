# Footnote Tech Stack: Deep Dive

Not for the presentation. This is the layer beneath slide 6: what each piece
is, why it was chosen, how it works in Footnote specifically, and the
questions each piece tends to attract, with answers. Read it twice and you'll
be able to go as deep as any questioner wants to go.

---

## 1. Frontend: React with Vite

**What it is.** React renders the interface as components that update when
data changes. Vite is the build tool: it runs the fast dev server you use
locally and compiles everything into the static files in `dist/` that nginx
serves in production.

**Why chosen.** Metana-native, enormous ecosystem, and boring on purpose. The
innovation budget is reserved for the claim pipeline, not the view layer.

**How Footnote uses it.** A single-page app where every screen is reachable by
its own URL (the nginx `try_files` rule makes direct links work). That's a
design commitment, not a convenience: a source card or transparency record you
can't link to is a source card you can't cite.

**Likely questions.**
- *Why not Next.js or server-side rendering?* Footnote has no feed, no
  personalization, and no SEO-driven content pages in the MVP; the payoff of
  SSR is small and the operational complexity is real. If topic packages later
  need to be crawlable public pages, that's the moment to revisit, and the
  React components carry over.
- *Mobile app?* Responsive web first. Every screen already works on a phone,
  there's no install friction, and no app store gatekeeps a civic tool. A
  native wrapper is a roadmap option, not a need.

**Understand for yourself.** The difference between the dev server (Vite
serving source with hot reload on :5173) and the production build (static
files, no Node involved in serving them). You've already lived both.

## 2. Backend: Node.js + Express

**What it is.** Node runs JavaScript on the server; Express is the minimal
framework that maps URLs to handler functions (routes) with middleware in
between.

**Why chosen.** One language across the whole codebase, and Express is the
most-documented way to build a REST API in it.

**How Footnote uses it.** The claim pipeline is the architecture. A claim
moves through composable stages: classify (what kind of claim is this) →
source (gather the records) → policy (apply the active citation policy) →
invite (attach the civic next step). Each stage is a function with a defined
input and output, and each stage appends to the transparency record as it
runs. That design has three payoffs: stages can be tested alone, the
transparency record writes itself as a side effect of the architecture, and
the fallback plan (curated claims) is just a shorter pipeline with the same
stages.

**Likely questions.**
- *REST vs GraphQL?* REST, because the API surface is small and the consumers
  are known. GraphQL earns its complexity when many clients need many shapes
  of the same data; that's not this.
- *What about rate limiting and abuse?* nginx and Express middleware can
  throttle by IP without identifying anyone; sessions being anonymous doesn't
  prevent abuse control, it just means control is by connection, not identity.

**Understand for yourself.** Middleware order in Express (requests flow
through `app.use(...)` in sequence) and the idea that the pipeline stages are
your domain logic while Express is just the doorway.

## 3. Data: PostgreSQL + version-controlled YAML (the two-store design)

This is the most distinctive architectural choice, and the one worth being
able to explain cold.

**The civic locality package lives in YAML files in the git repo, not in the
database.** Officials, meetings, organizations, each entry carrying
source_url, verified date, and tier. Why files: the provenance methodology is
visible to anyone who opens the repo; every change is a commit, so the git
history is a public audit log; and the future librarian curation console is
just a friendly editor over the same schema. Reference data that changes
slowly and must be auditable wants to be in version control.

**PostgreSQL holds the operational data.** Claim-processing runs and their
transparency records, structured as rows so they can be queried, plus
aggregate counters (sessions per locality per month, as counts, never
identities). Why a database: this data is written constantly by the running
app, needs transactions and queries, and isn't something a human edits.

**The privacy shape.** Sessions start fresh and no user identity exists, so
there is no users table at all. What persists is what the system did (a claim
was processed, these sources were consulted, this policy applied), never who
asked. This is worth saying precisely in Q&A: "We can tell you how many claims
about the levy were processed last month. We cannot tell you who asked, not
because we delete it, but because we never collect it. There's nothing to
subpoena and nothing to breach."

**Likely questions.**
- *Why not a vector database / RAG stack?* Because Footnote's retrieval is
  from a small curated corpus with explicit provenance, not from an embedding
  soup. When topic packages grow large, semantic search over the curated
  documents becomes worth adding, and it slots in as a pipeline stage without
  changing the promise: retrieval candidates still must clear the tier system.
- *What if the YAML approach doesn't scale?* It doesn't need to scale far:
  even hundreds of localities is thousands of small files, which git handles
  trivially. The thing that scales badly is human verification labor, and
  that's the librarian model's job, not the storage layer's.

## 4. Model layer: Claude API behind an adapter

**What it is.** The AI provider is called through one internal interface (the
adapter). The rest of the codebase never imports the vendor SDK directly; it
calls `classifyClaim(...)`, `summarizeUnderPolicy(...)`, and the adapter
translates.

**Why the adapter matters.** Swappability (pricing, quality, and terms shift;
changing providers is one file), testability (a mock adapter lets the whole
pipeline run in tests with zero API cost), and honesty (every call and
response passes through one choke point, which is where transparency-record
logging lives).

**How AI is bounded in Footnote.** The model proposes; the records dispose.
AI classifies the claim type and drafts plain-language summaries under the
active citation policy, but nothing the model says enters a source card
without a primary record behind it. The citation policy is enforced in code
around the model, not requested politely in a prompt. This is your
hallucination answer: "The model never gets to assert a fact. It gets to
organize facts that carry receipts. If it drafts a sentence no source
supports, the policy layer strips it."

**Costs, concretely.** A session's model usage is a few small calls; at
current API pricing that's pennies per session, and the transparency record
doubles as a per-session cost ledger. There is no expensive training, no
fine-tuning, no GPU fleet: inference is rented by the call.

**Likely questions.**
- *Why Claude?* Strong structured-output behavior and instruction-following
  for the classification and policy-constrained summarization tasks; but the
  honest answer is the adapter: the product doesn't bet on any one vendor.
- *What about model bias?* Constrained roles reduce exposure: the model
  classifies and rephrases, it doesn't adjudicate. And its involvement is
  labeled in the transparency record, so a user can always see which words
  were machine-drafted and check them against the sources sitting next to
  them.
- *Local/open-source models?* The adapter makes it possible; a self-hosted
  model is attractive for cost and independence later. Today, hosted API
  quality-per-dollar wins for a one-person build.

## 5. Web layer: nginx

**What it is.** The front door. nginx terminates TLS (the padlock), serves
the built client as static files, and reverse-proxies anything under `/api/`
to the Express process on localhost:3001.

**Why this shape.** Node is never exposed to the internet directly; port 3001
isn't even open in the security group. nginx is battle-tested at handling
slow clients, TLS, and static files, which frees Express to do only
application work.

**Likely question.** *What handles HTTPS?* Let's Encrypt certificates via
certbot, auto-renewing, verified with a dry run. Zero-cost, industry-standard
TLS.

## 6. Process & infra: pm2, EC2, and the runbook

**pm2** keeps the API process alive: restarts it on crash, resurrects it on
reboot (the `pm2 startup` + `pm2 save` pair), and captures logs
(`pm2 logs footnote-api`).

**EC2**: one t3.micro (2 vCPU, 1 GB RAM) with a 2 GB swap file so production
builds don't exhaust memory, an Elastic IP so the address survives restarts,
and a security group exposing only 22 (to my IP), 80, and 443. A fresh
instance, deliberately separate from other projects, for blast-radius
isolation.

**The whole deploy is documented** in `docs/deploy.md` in the repo, every step
with a verification check, including the failure modes actually encountered.
Redeploys are four commands and will become one script.

**Likely questions.**
- *What does it cost to run?* About ten dollars a month all-in at current
  scale: the instance, its disk, and the public IPv4. Model usage adds pennies
  per session.
- *What's the scaling path?* In order, as load demands and not before: a
  larger instance (minutes of work), then a managed Postgres (RDS) when the
  database deserves its own lifecycle, then a second app instance behind a
  load balancer. The app is stateless per-session by design, which is exactly
  the property that makes horizontal scaling easy later. None of this is
  needed to serve a locality's worth of traffic.
- *Backups and disaster recovery?* The civic data's canonical copy is the git
  repo, which is inherently backed up and restorable anywhere. The database
  holds operational records; automated snapshots come with the move to RDS,
  and the honest MVP answer is that the system can be rebuilt from the repo
  and the runbook in under an hour, which for this stage is the disaster
  plan.

## 7. Process tooling: GitHub Actions, Issues, branch protection

CI runs lint and tests on every pull request. Main is protected: nothing
lands without a PR, so the repository itself is an audit trail of every
change. Issues in user-story form drive the board; commits close issues via
closing keywords; DECISIONS.md records every consequential choice with its
reasoning and date. For a trust product, the development process being
inspectable is not bureaucracy, it's brand.

## 8. Security posture (the summary you can deliver as one breath)

"The most effective security feature is architectural: we hold no user data,
so the highest-value attack simply has no target. Around that: TLS
everywhere, the API never exposed directly, SSH restricted by key and source
IP, least-privilege access tokens, dependencies from `npm ci` against a
locked file, and a public audit trail for both code and civic data. Twenty
years in infrastructure and security taught me that the data you never
collect is the only data you can never lose."

---

## The three questions to rehearse out loud

1. **"Walk me through what happens when I submit a claim."** Claim and
   locality arrive at the API → classify stage names the claim type → source
   stage gathers candidate records from the locality package and beyond →
   policy stage filters and shapes them under the active citation policy →
   invite stage attaches the civic next step → the whole trace lands in the
   transparency record → the client renders card, record, invitation → the
   session ends and nothing about the person persists.
2. **"What breaks first under load, and what do you do?"** The single
   instance saturates; resize it, then split the database out to RDS, then go
   horizontal. Stateless sessions make that path boring, and boring is the
   goal.
3. **"What was the hardest technical decision so far?"** The two-store data
   design: civic reference data in version-controlled YAML for auditability
   and the future librarian console, operational data in Postgres for
   querying. It looks unconventional until you see that the git history is
   the provenance promise, made physical.

// Stage 2: gather sources.
// Curated: each record set is a hand-verified group of primary records that
// answers one topic. A claim gets a set only if it matches that set's topic.
// A claim that matches nothing gets no sources at all, because showing
// records that do not answer the claim would be worse than showing none.
// Every source carries the same provenance shape as the locality data:
// url, verified date, and tier. Nothing below "reputable-secondary" enters.

const TIERS = ["primary", "official-communication", "reputable-secondary"];

// A claim belongs to a set if it names the topic directly, or if it pairs
// one of the set's "who" words with one of its "what" words. Rules, not AI,
// so the transparency record can say exactly why a set was chosen.
const RECORD_SETS = [
  {
    id: "olentangy-levy",
    label: "the Olentangy Local School District levy and district spending",
    direct: /\b(levy|levies|millage)\b/i,
    who: /\b(schools?|district|olentangy|board of education)\b/i,
    what: /\b(tax|taxes|budget|spend|spends|spending|spent|money|funds?|funding)\b/i,
    searched: ["district budget", "board of elections", "board minutes"],
    sources: [
      {
        title:
          "Annual Comprehensive Financial Report FY2025, Olentangy Local School District",
        url: "https://resources.finalsite.net/images/v1770644694/olentangyk12ohus/xdfgrmqjatu5mvuf1npd/OlentangyLSDDelawareCoOhioFY2025ACFR.pdf",
        tier: "primary",
        verified: "2026-09-30",
        excerpt:
          "General fund expenditures for the fiscal year ended June 30, 2025: Instruction $265,380,561 of total expenditures of $378,716,930, with support services at $102,665,209.",
      },
      {
        title:
          "Official Questions and Issues Ballot, Olentangy Local School District, March 19, 2024 Primary Election",
        url: "https://vote.delawarecountyohio.gov/wp-content/uploads/2024/04/OLSD-Mar-2024.pdf",
        tier: "primary",
        verified: "2026-09-30",
        excerpt:
          "Levy an additional property tax to pay current operating expenses, that the county auditor estimates will collect $20,357,000 annually, at a rate not exceeding 3 mills for each $1 of taxable value. A separate question levies a tax for permanent improvements at a rate not exceeding 1.25 mills.",
      },
      {
        title:
          "Board of Education Regular Meeting Minutes, August 27, 2026, Olentangy Local School District",
        url: "https://go.boarddocs.com/oh/olenoh/Board.nsf/pfiles/DXRGBG430157/$file/BOE%208.27.26.pdf",
        tier: "primary",
        verified: "2026-09-30",
        excerpt:
          "Approval of Financial Forecast. Motion by Kevin Daberkow, second by Brad Rellinger. Final Resolution: Motion Carried. Yes: Brandon Lester, Kevin Daberkow, Elizabeth Wallick, Lizett Schreiber, Brad Rellinger.",
      },
    ],
  },
];

// Returns { set, matchedOn } for the first set the claim belongs to, or null.
function findRecordSet(claim) {
  const text = String(claim || "");
  for (const set of RECORD_SETS) {
    const direct = text.match(set.direct);
    if (direct) return { set, matchedOn: direct[0].toLowerCase() };
    const who = text.match(set.who);
    const what = text.match(set.what);
    if (who && what) {
      return { set, matchedOn: `${who[0]} + ${what[0]}`.toLowerCase() };
    }
  }
  return null;
}

// The topics Footnote can show records for today, in plain words.
function coveredTopics() {
  return RECORD_SETS.map((s) => s.label);
}

function gatherSources(claim, classification, ctx) {
  const match = findRecordSet(claim);

  if (!match) {
    ctx.transparency.push({
      stage: "source",
      at: new Date().toISOString(),
      method: "curated record sets (no match)",
      aiInvolved: false,
      searched: coveredTopics(),
      used: [],
      rejected: [],
      note: "No curated record set matches this claim, so no records are shown.",
    });
    return [];
  }

  const sources = match.set.sources.filter((s) => TIERS.includes(s.tier));

  ctx.transparency.push({
    stage: "source",
    at: new Date().toISOString(),
    method: "curated record set (hand-verified real records)",
    aiInvolved: false,
    recordSet: match.set.id,
    matchedOn: match.matchedOn,
    searched: match.set.searched,
    used: sources.map((s) => s.title),
    rejected: [],
    note: `Matched the ${match.set.id} record set on "${match.matchedOn}". ${sources.length} sources at or above the reputable-secondary tier.`,
  });

  return sources;
}

module.exports = { gatherSources, findRecordSet, coveredTopics, TIERS };

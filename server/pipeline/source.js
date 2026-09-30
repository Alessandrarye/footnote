// Stage 2: gather sources.
// Curated: hardcoded primary-record sources for the levy claim.
// Every source carries the same provenance shape as the locality data:
// url, verified date, and tier. Nothing below "reputable-secondary" enters.

const TIERS = ["primary", "official-communication", "reputable-secondary"];

function gatherSources(claim, classification, ctx) {
  const sources = [
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
  ].filter((s) => TIERS.includes(s.tier));

  ctx.transparency.push({
    stage: "source",
    at: new Date().toISOString(),
    method: "hardcoded (curated real records)",
    aiInvolved: false,
    searched: ["district budget", "board of elections", "board minutes"],
    used: sources.map((s) => s.title),
    rejected: [],
    note: `${sources.length} sources at or above the reputable-secondary tier.`,
  });

  return sources;
}

module.exports = { gatherSources, TIERS };

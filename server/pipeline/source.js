// Stage 2: gather sources.
// Skeleton: hardcoded primary-record sources for the levy claim.
// Every source carries the same provenance shape as the locality data:
// url, verified date, and tier. Nothing below "reputable-secondary" enters.

const TIERS = ["primary", "official-communication", "reputable-secondary"];

function gatherSources(claim, classification, ctx) {
  const sources = [
    {
      title: "PLACEHOLDER: District FY2026 Adopted Budget",
      url: "https://example.org/budget-fy2026.pdf",
      tier: "primary",
      verified: "2026-08-15",
      excerpt:
        "Placeholder excerpt. Real entry will quote the allocation table for levy proceeds.",
    },
    {
      title: "PLACEHOLDER: Levy ballot language as filed",
      url: "https://example.org/board-of-elections/levy",
      tier: "primary",
      verified: "2026-08-15",
      excerpt:
        "Placeholder excerpt. Real entry will quote the permitted uses stated on the ballot.",
    },
    {
      title: "PLACEHOLDER: Board of Education meeting minutes",
      url: "https://example.org/boarddocs/minutes",
      tier: "primary",
      verified: "2026-08-15",
      excerpt:
        "Placeholder excerpt. Real entry will quote the vote adopting the allocation.",
    },
  ].filter((s) => TIERS.includes(s.tier));

  ctx.transparency.push({
    stage: "source",
    at: new Date().toISOString(),
    method: "hardcoded (skeleton)",
    aiInvolved: false,
    searched: ["district budget", "board of elections", "board minutes"],
    used: sources.map((s) => s.title),
    rejected: [],
    note: `${sources.length} sources at or above the reputable-secondary tier.`,
  });

  return sources;
}

module.exports = { gatherSources, TIERS };

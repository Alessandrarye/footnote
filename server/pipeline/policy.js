// Stage 3: apply the citation policy and build the source card.
// The policy is enforced here, in code, around whatever the model later drafts.
// STRICT: only primary + official-communication tiers appear on the card.
// LIGHT:  reputable-secondary is allowed too.
// OFF:    (roadmap) sources shown without a card summary.

const POLICY_TIERS = {
  STRICT: ["primary", "official-communication"],
  LIGHT: ["primary", "official-communication", "reputable-secondary"],
};

function applyPolicy(claim, sources, policy, ctx) {
  const allowed = POLICY_TIERS[policy] || POLICY_TIERS.STRICT;
  const kept = sources.filter((s) => allowed.includes(s.tier));
  const dropped = sources.filter((s) => !allowed.includes(s.tier));

  const sourceCard = {
    policy,
    claim,
    // Skeleton: hardcoded plain-language summary. Week 2: model-drafted,
    // then checked so every sentence maps to a kept source.
    summary:
      "PLACEHOLDER SUMMARY. The real card will state, in plain language, what the primary records show about how levy proceeds are allocated, without a verdict badge.",
    sources: kept,
    verdictBadge: null, // by design, always null
  };

  ctx.transparency.push({
    stage: "policy",
    at: new Date().toISOString(),
    method: "rule-based",
    aiInvolved: false,
    policy,
    kept: kept.map((s) => s.title),
    dropped: dropped.map((s) => s.title),
    note: `Policy ${policy}: kept ${kept.length}, dropped ${dropped.length}.`,
  });

  return sourceCard;
}

module.exports = { applyPolicy, POLICY_TIERS };

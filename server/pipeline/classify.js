// Stage 1: classify the claim.
// Skeleton: hardcoded classification. Week 2 swaps the body for the AI adapter;
// the function signature and transparency contract stay exactly the same.

function classify(claim, ctx) {
  const classification = {
    kind: "factual",            // factual | opinion | mixed
    checkable: true,
    subject: "public spending",
    summary: "A checkable claim about how levy funds are being allocated.",
    embeddedFactualClaim: null, // used when kind === "mixed"
  };

  ctx.transparency.push({
    stage: "classify",
    at: new Date().toISOString(),
    method: "hardcoded (skeleton)",
    aiInvolved: false,
    note: "Classified as a checkable claim about public spending.",
    output: classification,
  });

  return classification;
}

module.exports = { classify };

// The pipeline runner. Composes the four stages in order and returns one
// result object. The transparency record is a side effect of the architecture:
// every stage appends to ctx.transparency as it runs.
// Async now: the classify stage may call the model through the adapter.

const { classify } = require("./classify");
const { gatherSources } = require("./source");
const { applyPolicy } = require("./policy");
const { invite } = require("./invite");

async function runClaim({ claim, localityId, policy = "STRICT" }) {
  const ctx = { transparency: [] };
  const startedAt = new Date().toISOString();

  const classification = await classify(claim, ctx);
  const sources = gatherSources(claim, classification, ctx);
  const sourceCard = applyPolicy(claim, sources, policy, ctx);
  const civicInvitation = invite(claim, classification, localityId, ctx);

  return {
    claim,
    localityId,
    policy,
    classification,
    sourceCard,
    civicInvitation,
    transparency: {
      startedAt,
      finishedAt: new Date().toISOString(),
      aiInvolved: ctx.transparency.some((e) => e.aiInvolved),
      stages: ctx.transparency,
    },
  };
}

module.exports = { runClaim };

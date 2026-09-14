// Stage 1: classify the claim.
// Real model classification through the adapter when a key is configured;
// an honest, clearly-labeled fallback when it isn't or when the call fails.
// Either way, the transparency record says exactly what happened.

const { hasModel, classifyWithModel } = require("./adapter");

const FALLBACK = {
  kind: "factual",
  checkable: true,
  subject: null,
  summary:
    "Model unavailable; treated as a checkable claim by default so the records can still be examined.",
  embeddedFactualClaim: null,
};

async function classify(claim, ctx) {
  if (hasModel()) {
    try {
      const { classification, meta } = await classifyWithModel(claim);
      ctx.transparency.push({
        stage: "classify",
        at: new Date().toISOString(),
        method: `model (${meta.model})`,
        aiInvolved: true,
        latencyMs: meta.latencyMs,
        note: `Model classified this as ${classification.kind} (checkable: ${classification.checkable}).`,
        output: classification,
      });
      return classification;
    } catch (err) {
      ctx.transparency.push({
        stage: "classify",
        at: new Date().toISOString(),
        method: "fallback (model call failed)",
        aiInvolved: false,
        note: `Model call failed (${err.message.slice(0, 120)}); used default classification.`,
        output: FALLBACK,
      });
      return FALLBACK;
    }
  }

  ctx.transparency.push({
    stage: "classify",
    at: new Date().toISOString(),
    method: "fallback (no model configured)",
    aiInvolved: false,
    note: "No model configured; used default classification.",
    output: FALLBACK,
  });
  return FALLBACK;
}

module.exports = { classify };

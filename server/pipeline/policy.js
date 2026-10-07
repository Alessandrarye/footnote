// Stage 3: apply the citation policy and build the source card.
// The policy is enforced here, in code, around whatever the model drafts.
// STRICT: only primary + official-communication tiers appear on the card.
// LIGHT:  reputable-secondary is allowed too.
// OFF:    (roadmap) sources shown without a card summary.
//
// The summary is model-drafted, then rule-checked. The model proposes
// sentences, each naming the one kept source it came from. The code below
// decides which sentences reach the page. No model, a failed call, or zero
// surviving sentences all fall back to the curated summary.
//
// A claim with no kept sources gets neither: the card says plainly that
// Footnote has no records for it yet, and the model is never called.

const { hasModel, draftSummaryWithModel } = require("./adapter");
const { coveredTopics } = require("./source");

const POLICY_TIERS = {
  STRICT: ["primary", "official-communication"],
  LIGHT: ["primary", "official-communication", "reputable-secondary"],
};

// Curated: hand-written fallback. Every sentence maps to a kept source.
const CURATED_SUMMARY =
  "The March 2024 ballot authorized Olentangy Local School District to levy taxes for stated purposes, including current operating expenses and permanent improvements. The district's audited FY2025 Annual Comprehensive Financial Report states actual expenditures by function. Board of Education meeting minutes record the board's votes on district finances, including approval of the financial forecast. The records describe permitted purposes and reported spending; no verdict is offered.";

// Shown when no source survives for a claim. Written by code, and it names
// what Footnote does carry so the reader knows where the edge is.
function notCoveredSummary() {
  return `Footnote has no records for this claim yet. Right now it carries records for ${coveredTopics().join("; ")}. No records are shown here, because records that do not answer your claim would be worse than none.`;
}

// Written by code, never by the model: it maps to no single source.
const CLOSING_LINE =
  "The records are presented as written; no verdict is offered.";

const VERDICT_WORDS =
  /\b(true|false|accurate|inaccurate|misleading|correct|incorrect|wrong|proves?|disproves?|debunks?|supported|unsupported|lie|lies|the claim)\b/i;

// Pull every figure out of a string, commas removed: "$20,357,000" -> "20357000".
function numbersIn(text) {
  return (String(text).match(/\d[\d,]*(?:\.\d+)?/g) || []).map((n) =>
    n.replace(/,/g, ""),
  );
}

// Returns null if the sentence may appear, or the reason it may not.
function checkSentence(sentence, kept) {
  if (!sentence.text) return "empty sentence";
  if (sentence.text.length > 400) return "sentence too long";
  if (
    !Number.isInteger(sentence.source) ||
    sentence.source < 1 ||
    sentence.source > kept.length
  ) {
    return "does not point to a kept source";
  }
  if (VERDICT_WORDS.test(sentence.text)) return "contains verdict language";
  // Outcome words may appear only if the cited source itself uses them.
  const OUTCOME_STEMS = ["approv", "pass", "fail", "reject", "adopt", "defeat"];

  const src = kept[sentence.source - 1];
  const allowed = new Set(numbersIn(`${src.title} ${src.excerpt}`));
  const stray = numbersIn(sentence.text).filter((n) => !allowed.has(n));
  if (stray.length) return `figure not in source: ${stray.join(", ")}`;
  const sourceText = `${src.title} ${src.excerpt}`.toLowerCase();
  const text = sentence.text.toLowerCase();
  const unbacked = OUTCOME_STEMS.filter(
    (stem) => new RegExp(`\\b${stem}`).test(text) && !sourceText.includes(stem),
  );
  if (unbacked.length) {
    return `outcome not stated in source: ${unbacked.join(", ")}`;
  }
  return null;
}

async function buildSummary(claim, kept) {
  const curated = (why, extra = {}) => ({
    summary: CURATED_SUMMARY,
    summarySentences: [],
    record: { aiInvolved: false, summaryMethod: `curated (${why})`, ...extra },
  });

  if (kept.length === 0) {
    return {
      summary: notCoveredSummary(),
      summarySentences: [],
      record: {
        aiInvolved: false,
        summaryMethod: "none (no records for this claim)",
      },
    };
  }
  if (!hasModel()) return curated("no model available");

  let draft;
  try {
    draft = await draftSummaryWithModel(claim, kept);
  } catch (err) {
    return curated(`model draft failed: ${err.message.slice(0, 120)}`);
  }

  const passed = [];
  const rejected = [];
  for (const sentence of draft.sentences) {
    const reason = checkSentence(sentence, kept);
    if (reason) rejected.push({ text: sentence.text, reason });
    else passed.push(sentence);
  }

  const checked = {
    aiInvolved: true,
    model: draft.meta.model,
    latencyMs: draft.meta.latencyMs,
    summaryDrafted: draft.sentences.length,
    summaryKept: passed.length,
    summaryDropped: rejected,
    summaryUncovered: kept
      .filter((_, i) => !passed.some((s) => s.source === i + 1))
      .map((s) => s.title),
  };

  if (passed.length === 0) {
    return curated("no drafted sentence passed the check", checked);
  }

  return {
    summary: `${passed.map((s) => s.text).join(" ")} ${CLOSING_LINE}`,
    summarySentences: passed,
    record: {
      ...checked,
      summaryMethod: `model-drafted (${draft.meta.model}), rule-checked`,
    },
  };
}

async function applyPolicy(claim, sources, policy, ctx) {
  const allowed = POLICY_TIERS[policy] || POLICY_TIERS.STRICT;
  const kept = sources.filter((s) => allowed.includes(s.tier));
  const dropped = sources.filter((s) => !allowed.includes(s.tier));

  const built = await buildSummary(claim, kept);

  const sourceCard = {
    policy,
    claim,
    summary: built.summary,
    // Each entry: { text, source } where source is the 1-based position in
    // `sources` below. Empty when the curated summary is used.
    summarySentences: built.summarySentences,
    // False when no source survived: the UI shows the "not yet covered" card.
    covered: kept.length > 0,
    sources: kept,
    verdictBadge: null, // by design, always null
  };

  ctx.transparency.push({
    stage: "policy",
    at: new Date().toISOString(),
    method: `rule-based policy; summary ${built.record.summaryMethod}`,
    policy,
    kept: kept.map((s) => s.title),
    dropped: dropped.map((s) => s.title),
    ...built.record,
    note: `Policy ${policy}: kept ${kept.length}, dropped ${dropped.length}. Summary: ${built.record.summaryMethod}.`,
  });

  return sourceCard;
}

module.exports = { applyPolicy, POLICY_TIERS, checkSentence };

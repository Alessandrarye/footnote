// The model adapter: the single choke point between Footnote and any AI
// provider. Nothing else in the codebase talks to a model directly. This is
// what makes the AI "a part we rent, not the company we are": swappable in
// one file, absent-safe (no key = no model, and the pipeline still runs),
// and every call is timed and reported so the transparency record can log it.

const API_URL = "https://api.anthropic.com/v1/messages";
const MODEL = process.env.ANTHROPIC_MODEL || "claude-haiku-4-5-20251001";

function hasModel() {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

async function callModel({ system, user, maxTokens = 300 }) {
  const started = Date.now();
  const res = await fetch(API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": process.env.ANTHROPIC_API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      temperature: 0,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`model call failed: ${res.status} ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const text = (data.content || [])
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");

  return { text, model: MODEL, latencyMs: Date.now() - started, usage: data.usage };
}

// Strip markdown fences if the model wraps its JSON, then parse strictly.
function parseJson(text) {
  const cleaned = text.replace(/```json|```/g, "").trim();
  return JSON.parse(cleaned);
}

const CLASSIFY_SYSTEM = `You classify claims for a civic tool called Footnote.
A "claim" is anything a person brings in: a social media post, a line from an
article, something a commentator said. Your only job is classification. You
never judge whether the claim is true.

Respond with ONLY a JSON object, no prose, no markdown fences, exactly this
shape:
{
  "kind": "factual" | "opinion" | "mixed",
  "checkable": boolean,
  "subject": short topic phrase (e.g. "public spending", "election rules") or null,
  "summary": one neutral sentence describing what kind of statement this is,
  "embeddedFactualClaim": if kind is "mixed", the checkable factual claim
    inside the statement, quoted or paraphrased; otherwise null
}

Rules:
- "factual": the statement asserts something records could confirm,
  complicate, or contradict. checkable: true.
- "opinion": a value judgment or preference with no checkable assertion.
  checkable: false.
- "mixed": an opinion with a factual claim buried inside it. checkable: true,
  and embeddedFactualClaim holds the checkable part.
- Never include a verdict, a truth assessment, or advice in any field.`;

async function classifyWithModel(claim) {
  const { text, model, latencyMs } = await callModel({
    system: CLASSIFY_SYSTEM,
    user: claim,
  });
  const parsed = parseJson(text);

  // Validate the shape before anyone downstream trusts it.
  const kinds = ["factual", "opinion", "mixed"];
  if (!kinds.includes(parsed.kind)) throw new Error(`bad kind: ${parsed.kind}`);
  if (typeof parsed.checkable !== "boolean") throw new Error("bad checkable");

  return {
    classification: {
      kind: parsed.kind,
      checkable: parsed.checkable,
      subject: parsed.subject || null,
      summary: String(parsed.summary || ""),
      embeddedFactualClaim: parsed.embeddedFactualClaim || null,
    },
    meta: { model, latencyMs },
  };
}

module.exports = { hasModel, classifyWithModel };

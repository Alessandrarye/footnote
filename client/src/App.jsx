import { useEffect, useState } from "react";
import "./App.css";

const SAMPLE_CLAIM = "The new levy money is going to administrator raises";

function useLocalities() {
  const [localities, setLocalities] = useState([]);
  useEffect(() => {
    fetch("/api/localities")
      .then((r) => r.json())
      .then((d) => setLocalities(d.localities || []))
      .catch(() => setLocalities([]));
  }, []);
  return localities;
}

export default function App() {
  const localities = useLocalities();
  const [claim, setClaim] = useState("");
  const [localityId, setLocalityId] = useState("");
  const [policy, setPolicy] = useState("STRICT");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!localityId && localities.length) setLocalityId(localities[0].id);
  }, [localities, localityId]);

  async function submit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const r = await fetch("/api/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ claim, localityId, policy }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "Something went wrong");
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function reset() {
    setResult(null);
    setClaim("");
    setError("");
  }

  return (
    <div className="fn">
      <header className="fn-header">
        <h1 className="fn-wordmark">
          Footnote<sup>1</sup>
        </h1>
        <p className="fn-tagline">
          Bring a claim. See the records. Find the next step. Then it forgets you.
        </p>
      </header>

      {!result ? (
        <form className="fn-form" onSubmit={submit}>
          <label className="fn-label" htmlFor="claim">
            The claim
          </label>
          <textarea
            id="claim"
            className="fn-textarea"
            rows={4}
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="Paste a post, a line from an article, something a commentator said..."
          />
          <button
            type="button"
            className="fn-link"
            onClick={() => setClaim(SAMPLE_CLAIM)}
          >
            Use a sample claim
          </button>

          <div className="fn-row">
            <div>
              <label className="fn-label" htmlFor="locality">
                Where
              </label>
              <select
                id="locality"
                className="fn-select"
                value={localityId}
                onChange={(e) => setLocalityId(e.target.value)}
              >
                {localities.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
              <p className="fn-hint">
                Declared, never detected. Nothing about you is stored.
              </p>
            </div>
            <div>
              <label className="fn-label" htmlFor="policy">
                Citation policy
              </label>
              <select
                id="policy"
                className="fn-select"
                value={policy}
                onChange={(e) => setPolicy(e.target.value)}
              >
                <option value="STRICT">Strict (primary + official only)</option>
                <option value="LIGHT">Light (adds established reporting)</option>
              </select>
            </div>
          </div>

          {error && <p className="fn-error">{error}</p>}

          <button className="fn-button" disabled={busy || !claim.trim()}>
            {busy ? "Looking at the records..." : "Look at the records"}
          </button>
        </form>
      ) : (
        <Results result={result} onReset={reset} />
      )}
    </div>
  );
}

function Results({ result, onReset }) {
  const { classification, sourceCard, civicInvitation, transparency } = result;
  const [showRecord, setShowRecord] = useState(false);

  return (
    <div className="fn-results">
      <section className="fn-card">
        <p className="fn-eyebrow">The claim you brought</p>
        <blockquote className="fn-claim">"{result.claim}"</blockquote>
        <p className="fn-class">
          <strong>What you're holding:</strong> a{" "}
          {classification.kind === "factual"
            ? "checkable statement of fact"
            : classification.kind === "opinion"
              ? "statement of opinion"
              : "mixed statement with a checkable claim inside it"}
          {classification.subject ? `, about ${classification.subject}` : ""}.
        </p>
      </section>

      <section className="fn-card">
        <p className="fn-eyebrow">What the records say</p>
        <p className="fn-summary">{sourceCard.summary}</p>
        <ul className="fn-sources">
          {sourceCard.sources.map((s) => (
            <li key={s.url} className="fn-source">
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.title}
              </a>
              <span className="fn-tier">{s.tier}</span>
              <p className="fn-excerpt">{s.excerpt}</p>
              <p className="fn-receipt">Verified {s.verified}</p>
            </li>
          ))}
        </ul>
        <p className="fn-hint">
          No verdict badge, by design. Policy: {sourceCard.policy}.
        </p>
      </section>

      <section className="fn-card fn-invite">
        <p className="fn-eyebrow">Your next step, here</p>
        {civicInvitation.covered ? (
          <>
            <h2 className="fn-locality">{civicInvitation.locality.name}</h2>
            <InviteList title="Meetings" items={civicInvitation.meetings} render={(m) => (
              <>
                <strong>{m.body}</strong> · {m.schedule}
                {m.agenda_portal && (
                  <> · <a href={m.agenda_portal} target="_blank" rel="noreferrer">agendas</a></>
                )}
              </>
            )} />
            <InviteList title="Officials" items={civicInvitation.officials} render={(o) => (
              <>
                <strong>{o.name}</strong>, {o.role}
                {o.contact && <> · {o.contact}</>}
              </>
            )} />
            <InviteList title="Organizations already on it" items={civicInvitation.organizations} render={(g) => (
              <>
                <strong>{g.name}</strong>
                {g.focus && <> · {g.focus}</>}
                {g.url && (
                  <> · <a href={g.url} target="_blank" rel="noreferrer">site</a></>
                )}
              </>
            )} />
          </>
        ) : (
          <p className="fn-summary">
            This place isn't covered yet. A covered locality includes its
            meetings and agendas, its officials with contact information, and
            the organizations already working local issues, each with a source
            and a verified date.
          </p>
        )}
      </section>

      <section className="fn-card fn-record">
        <button
          type="button"
          className="fn-link"
          onClick={() => setShowRecord((v) => !v)}
        >
          {showRecord ? "Hide" : "Open"} the transparency record
          {transparency.aiInvolved ? " (AI was involved)" : " (no AI involved)"}
        </button>
        {showRecord && (
          <ol className="fn-stages">
            {transparency.stages.map((s, i) => (
              <li key={i}>
                <strong>{s.stage}</strong> · {s.method} · AI:{" "}
                {s.aiInvolved ? "yes" : "no"}
                <div className="fn-stage-note">{s.note}</div>
              </li>
            ))}
          </ol>
        )}
      </section>

      <button className="fn-button fn-secondary" onClick={onReset}>
        Bring another claim (this session is not saved)
      </button>
    </div>
  );
}

function InviteList({ title, items, render }) {
  if (!items || !items.length) return null;
  return (
    <div className="fn-invite-group">
      <h3>{title}</h3>
      <ul>
        {items.map((it, i) => (
          <li key={i}>
            <div>{render(it)}</div>
            <p className="fn-receipt">
              <a href={it.source_url} target="_blank" rel="noreferrer">
                source
              </a>{" "}
              · verified {it.verifiedDaysAgo} day{it.verifiedDaysAgo === 1 ? "" : "s"} ago · {it.tier}
            </p>
          </li>
        ))}
      </ul>
    </div>
  );
}

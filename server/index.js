const express = require("express");
const cors = require("cors");
const { runClaim } = require("./pipeline");
const { listLocalities } = require("./pipeline/invite");

const app = express();
app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "footnote", time: new Date().toISOString() });
});

app.get("/api/localities", (req, res) => {
  res.json({ localities: listLocalities() });
});

app.post("/api/claims", (req, res) => {
  const { claim, localityId, policy } = req.body || {};
  if (!claim || typeof claim !== "string" || !claim.trim()) {
    return res.status(400).json({ error: "claim is required" });
  }
  if (!localityId) {
    return res.status(400).json({ error: "localityId is required" });
  }
  const result = runClaim({ claim: claim.trim(), localityId, policy });
  res.json(result);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`footnote server on :${PORT}`));

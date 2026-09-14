require("dotenv").config({ path: require("path").join(__dirname, ".env") });

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

app.post("/api/claims", async (req, res) => {
  const { claim, localityId, policy } = req.body || {};
  if (!claim || typeof claim !== "string" || !claim.trim()) {
    return res.status(400).json({ error: "claim is required" });
  }
  if (!localityId) {
    return res.status(400).json({ error: "localityId is required" });
  }
  try {
    const result = await runClaim({ claim: claim.trim(), localityId, policy });
    res.json(result);
  } catch (err) {
    console.error("claims pipeline error:", err);
    res.status(500).json({ error: "Something went wrong processing the claim." });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`footnote server on :${PORT}`));

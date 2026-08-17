// Stage 4: build the civic invitation from the locality package.
// This stage reads the real YAML file, so provenance (source_url, verified,
// tier) flows straight from the data into the UI.

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");

const DATA_DIR = path.join(__dirname, "..", "..", "data", "localities");

function loadLocality(localityId) {
  const file = path.join(DATA_DIR, `${localityId}.yaml`);
  if (!fs.existsSync(file)) return null;
  return yaml.load(fs.readFileSync(file, "utf8"));
}

function listLocalities() {
  return fs
    .readdirSync(DATA_DIR)
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => {
      const doc = yaml.load(fs.readFileSync(path.join(DATA_DIR, f), "utf8"));
      return { id: doc.locality.id, name: doc.locality.name };
    });
}

function daysSince(dateStr) {
  const then = new Date(dateStr);
  return Math.floor((Date.now() - then.getTime()) / 86400000);
}

function withStaleness(entry) {
  return { ...entry, verifiedDaysAgo: daysSince(entry.verified) };
}

function invite(claim, classification, localityId, ctx) {
  const locality = loadLocality(localityId);

  if (!locality) {
    ctx.transparency.push({
      stage: "invite",
      at: new Date().toISOString(),
      method: "locality lookup",
      aiInvolved: false,
      note: `Locality "${localityId}" is not yet covered.`,
    });
    return { covered: false, localityId };
  }

  const invitation = {
    covered: true,
    locality: locality.locality,
    officials: (locality.officials || []).map(withStaleness),
    meetings: (locality.meetings || []).map(withStaleness),
    organizations: (locality.organizations || []).map(withStaleness),
  };

  ctx.transparency.push({
    stage: "invite",
    at: new Date().toISOString(),
    method: "locality package (YAML, version-controlled)",
    aiInvolved: false,
    note: `Loaded ${invitation.officials.length} officials, ${invitation.meetings.length} meetings, ${invitation.organizations.length} organizations for ${locality.locality.name}.`,
  });

  return invitation;
}

module.exports = { invite, loadLocality, listLocalities };

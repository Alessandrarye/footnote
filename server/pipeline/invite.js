// Stage 4: build the civic invitation from the locality package.
// This stage reads the real YAML file, so provenance (source_url, verified,
// tier) flows straight from the data into the UI.

const fs = require("fs");
const path = require("path");
const yaml = require("js-yaml");
const { findRecordSet } = require("./source");

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

// Moves the entries closest to the claim to the front of a group. An entry
// is "closest" when its name, body, role, or jurisdiction matches the record
// set the claim belongs to. Nothing is removed, and the order inside each
// half stays exactly as it is in the locality file.
function closestFirst(entries, pattern) {
  if (!pattern) return entries;
  const isClose = (e) =>
    pattern.test([e.name, e.body, e.role, e.jurisdiction].join(" "));
  return [...entries.filter(isClose), ...entries.filter((e) => !isClose(e))];
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

  const match = findRecordSet(claim);
  const pattern = match ? match.set.relevant : null;
  const group = (entries) =>
    closestFirst((entries || []).map(withStaleness), pattern);

  const invitation = {
    covered: true,
    locality: locality.locality,
    // Set when the claim matched a record set: the UI says why the order
    // changed. Null means the locality file's own order.
    orderedFor: match ? match.set.relevantName : null,
    officials: group(locality.officials),
    meetings: group(locality.meetings),
    organizations: group(locality.organizations),
    resources: group(locality.resources),
  };

  ctx.transparency.push({
    stage: "invite",
    at: new Date().toISOString(),
    method: "locality package (YAML, version-controlled)",
    aiInvolved: false,
    note: `Loaded ${invitation.officials.length} officials, ${invitation.meetings.length} meetings, ${invitation.organizations.length} organizations, ${invitation.resources.length} resources for ${locality.locality.name}.${invitation.orderedFor ? ` ${invitation.orderedFor} entries listed first.` : ""}`,
  });

  return invitation;
}

module.exports = { invite, loadLocality, listLocalities };

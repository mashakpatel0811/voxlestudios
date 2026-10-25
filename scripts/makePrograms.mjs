// MAKE-PROGRAMS SCRIPT (not part of the website). Run it by hand: npm run programs
//
// It reads the BIG catalog and writes the SMALL list the website uses:
//   data/assistance-listings.csv  (22 MB, the whole federal catalog I downloaded)   <- reads this
//   public/programs.csv           (about 100 programs, around 180 KB)               <- writes this
// The website then reads public/programs.csv (see src/usePrograms.js). It never touches the big file,
// because 22 MB is too much for a phone to download on every visit.
//
// The big file is the official federal Assistance Listings catalog (SAM.gov, public domain, no key).
// To download a fresh copy:
//   curl -L -o data/assistance-listings.csv "https://s3.amazonaws.com/falextracts/Assistance%20Listings/datagov/AssistanceListings_DataGov_PUBLIC_CURRENT.csv"
//
// What it does:
//   1. reads the big CSV (with the same CSV reader the website uses: src/csv.js)
//   2. keeps programs that people (not organizations) can receive
//   3. keeps the hand-picked list in ALWAYS, and takes out the ones in CUT (see "Review edits" below)
//   4. fixes some categories (CATEGORY_OVERRIDES) and rewrites some "who it is for" lines (WHO_PLAIN)
//   5. writes the small CSV
import { readFileSync, writeFileSync } from "node:fs";
import { parseCsv } from "../src/csv.js";

// you can pass other file names, but these are the normal ones
const csvPath = process.argv[2] ?? "data/assistance-listings.csv";
const outPath = process.argv[3] ?? "public/programs.csv";

const clean = (s) => (s ?? "").replace(/�/g, "").replace(/\s+/g, " ").trim();
const clip = (s, n) => (s.length <= n ? s : `${s.slice(0, n - 1).replace(/\s+\S*$/, "")}…`);
const isNone = (s) => !s || /^(n\/?a|not applicable|none)\.?$/i.test(s);
const httpsOnly = (u) => {
  const t = clean(u);
  if (/^https:\/\//i.test(t)) return t;
  if (/^http:\/\//i.test(t)) return t.replace(/^http:/i, "https:");
  return /^[\w-]+(\.[\w-]+)+(\/|$)/.test(t) ? `https://${t}` : undefined;
};
function agencyName(raw) {
  const first = clean(raw).split(",")[0] ?? "";
  const small = new Set(["of", "and", "the", "for", "on", "in", "to"]);
  const t = first.toLowerCase().split(" ").map((w, i) => (i > 0 && small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(" ");
  return t.replace(/\bU\.s\./g, "U.S.").replace(/\bHhs\b/g, "HHS") || "U.S. federal government";
}

const PEOPLE = /\bindividuals?\b|\bfamil(y|ies)\b|\bhouseholds?\b|\bveterans?\b|low[- ]income|\bchildren\b|\belderly\b|\bseniors?\b|\baged\b|disabilit|\bstudents?\b|\bhomeless|\bunemployed|\bpatients?\b|\bwomen\b|\binfants?\b|\bmothers?\b|\bpregnan|\bsurvivors?\b|\bvictims\b|\bworkers\b|\bretirees|\bbeneficiar/i;
const ORG_FIRST = /^(eligible beneficiaries (are|include) )?(the )?(non-?profit|state|local|public|intrastate|organizations?|institutions?|tribal governments?|any (state|nonprofit|public|private))/i;
const DIRECT = /DIRECT PAYMENTS|DIRECT LOAN|INSURANCE|GUARANTEED|SPECIALIZED SERVICES|TRAINING|SALE, EXCHANGE/i;
const ALWAYS = ["93.778","93.767","10.551","10.557","10.555","10.553","10.558","10.559","10.565","10.569","10.576","10.427","10.410","10.417","14.871","14.195","14.850","14.231","84.063","84.268","84.007","84.033","84.126","96.001","96.002","96.006","64.101","64.100","64.109","64.110","64.104","64.114","64.117","64.028","64.124","93.600","93.575","93.596","93.558","93.568","93.667","93.674","93.658","93.659","93.090","93.566","93.623","93.557","93.224","93.917","93.994","93.870","93.044","93.045","93.791","17.225","17.258","17.259","17.278","17.285","17.801","20.513","21.008","94.006","93.599","93.563","84.010","84.287","10.646","14.117","14.169","14.326","14.879","14.880","14.896","21.006","64.039","64.105","64.106","64.116","64.201","64.202","17.307","17.310","84.149","84.379","84.177","93.773","93.774","96.004","93.926","93.583","97.032","10.448","84.181","84.027","16.063","16.736","17.207","17.245","93.556","93.645","93.471","94.011","93.659","93.658","16.056","84.240"];
const EXCLUDE = /research|demonstration|training or|faculty|professions|nurse|NOSLO|state court|administrative matching|small business|business|cooperative|public works|economic|build to|disaster|operating fund|cybersecurity|torture|trafficking|repatriation|unaccompanied|minority communit|conservation|puerto rico|american samoa|CNMI|territor|tribal|native american|incentive|prevention grants|moderate rehab|outreach|state grants|information centers|dental|collaboration|early hearing|marriage|justice|HIV.*grants|workforce development|internship|fellowship|road maintenance|indian|minority-serving|team nutrition|training in general|health careers|discretionary|preschool development|opportunity scholarship|collaboration|child abuse|ending the HIV|grants to provide outpatient|job placement|voluntary agency|street outreach|Personal Responsibility|Adoption Opportunities/i;
const ALWAYS_SET = new Set(ALWAYS);
const sameAsApplicant = (r) => /same as applicant/i.test(r["Beneficiary Eligibility"] ?? "");

function isForPeople(r) {
  if (ALWAYS_SET.has(clean(r["Program Number"]))) return true;
  const ben = clean(r["Beneficiary Eligibility"]);
  if (sameAsApplicant(r)) return PEOPLE.test(r["Applicant Eligibility"] ?? "") && DIRECT.test(r["Types of Assistance"] ?? "");
  return !isNone(ben) && PEOPLE.test(ben) && !ORG_FIRST.test(ben);
}

const CATEGORY_WORDS = [
  [/\b(food|nutrition|snap|meal|hunger|wic|commodit)/i, "food"],
  [/\b(housing|rent|rental|homeless|shelter|mortgage|eviction|home ?owner|utility|energy assistance|weatheriz)/i, "housing"],
  [/\b(health\b|healthcare|medic|mental|substance|dental|clinic|disease|insurance|hospice|nursing)/i, "health"],
  [/\b(job|employ|workforce|work |career|unemploy|apprentice|labor)/i, "employment"],
  [/\b(educat|school|student|college|literacy|tuition|training|scholar|head start)/i, "education"],
  [/\b(legal|civil rights|attorney|court)/i, "legal"],
  [/\b(child ?care|child|family|parent|foster|adoption|youth|infant)/i, "family"],
  [/\b(transport|transit|ride|vehicle)/i, "transportation"],
  [/\b(disab|blind|deaf|handicap|independent living|vocational rehab)/i, "disability"],
];
const categoriesFor = (text) => {
  const hit = CATEGORY_WORDS.filter(([re]) => re.test(text)).map(([, c]) => c);
  return hit.length ? [...new Set(hit)].slice(0, 3) : ["other"];
};

function signalsFor(who, text) {
  const ages = [];
  if (/\baged\b|elder|senior|older|62 years|65 years/i.test(who)) ages.push("60plus");
  if (/child|infant|youth|minor/i.test(who)) ages.push("under18");
  const situations = [];
  if (/disab|handicap|blind|deaf/i.test(who)) situations.push("disability");
  if (/veteran/i.test(who)) situations.push("veteran");
  if (/student|trainee/i.test(who)) situations.push("student");
  if (/unemploy|displaced/i.test(who)) situations.push("unemployed");
  if (/infant|pregnan|mother|maternal/i.test(`${who} ${text}`)) situations.push("pregnant");
  if (/infant|early childhood|head start|toddler/i.test(`${who} ${text}`)) situations.push("young-child");
  return {
    ages,
    situations,
    needs: categoriesFor(text),
    incomeSensitive: /low.?income|poverty|needy|economically/i.test(`${who} ${text}`),
  };
}

function toProgram(r) {
  const number = clean(r["Program Number"]);
  const title = clean(r["Program Title"]);
  const objective = clip(clean(r["Objectives"]), 380);
  if (!number || !title || !objective) return null;
  const ben = clean(r["Beneficiary Eligibility"]);
  const applicant = clean(r["Applicant Eligibility"]);
  const same = sameAsApplicant(r);
  const who = same ? applicant : ben;
  const text = `${title} ${objective}`;
  const listingUrl = httpsOnly(r["URL"]) ?? "https://sam.gov/content/assistance-listings";
  const deadlines = clean(r["Deadlines"]);
  const application = clean(r["Application Procedures"]);
  const docs = clean(r["Credentials/Documentation"]);
  const popularRaw = clean(r["Popular Name"]).replace(/^[([\s]+|[)\]\s]+$/g, "");
  const overlap = (a, b) => a.toLowerCase().includes(b.toLowerCase()) || b.toLowerCase().includes(a.toLowerCase());
  const popular = popularRaw && popularRaw.length <= 40 && !isNone(popularRaw) && !overlap(popularRaw, title) ? popularRaw : "";
  const p = {
    id: number,
    name: popular ? `${title} (${popular})` : title,
    categories: categoriesFor(text),
    summary: objective,
    agency: agencyName(r["Federal Agency"] ?? ""),
    agencyUrl: httpsOnly(r["Website Address"]) ?? listingUrl,
    listingUrl,
    who: !isNone(who) ? clip(who, 420) : "",
    applicant: !same && !isNone(applicant) ? clip(applicant, 300) : "",
    documents: !isNone(docs) ? clip(docs, 320) : "",
    howToApply: !isNone(application) ? clip(application, 380) : "",
    deadlines: !isNone(deadlines) && !/do not apply/i.test(deadlines) ? clip(deadlines, 240) : "",
    signals: signalsFor(who, text),
  };
  p.score = (ALWAYS_SET.has(number) ? 100 : 0) + (p.who ? 5 : 0) + (p.howToApply ? 3 : 0) + (p.documents ? 2 : 0)
    + (/department of (agriculture|housing|education|labor|veterans|health)|food and nutrition|administration for children|centers for medicare|social security|health resources/i.test(r["Federal Agency"] ?? "") ? 4 : 0)
    + (p.categories[0] !== "other" ? 3 : 0) + (p.signals.incomeSensitive ? 2 : 0);
  return p;
}


// ---- Review edits (made by hand after reading the list) ----
// Taken out: grants to states, schools, farms and organizations. A person cannot apply for these.
const CUT = new Set(["10.326","10.322","93.087","10.587","93.110","93.107","93.563","93.044","93.045","14.850","10.415","10.411","10.433","10.404","10.406","94.006","16.524","16.589","93.667","93.791","93.914","93.605","93.596","10.665","17.268","17.271","10.558"]);
// Categories fixed by hand: the keyword guess was wrong or too loose.
const CATEGORY_OVERRIDES = {
  "93.600": ["family", "education"], "17.225": ["employment"], "96.001": ["disability"], "96.004": ["family"],
  "93.778": ["health"], "93.767": ["health", "family"], "10.557": ["food", "health"], "84.334": ["education"],
  "21.008": ["legal"], "93.090": ["family"], "94.011": ["other"], "20.513": ["transportation", "disability"],
  "93.674": ["family", "education"], "64.100": ["disability"], "64.101": ["other"], "64.104": ["disability"],
  "64.109": ["disability"], "64.110": ["family"], "64.114": ["housing"], "64.117": ["education"], "64.124": ["education"],
  "64.028": ["education"], "64.039": ["health"], "64.105": ["family"], "64.106": ["housing", "disability"],
  "64.116": ["employment", "disability"], "64.201": ["other"], "64.202": ["other"], "93.870": ["family", "health"],
  "16.063": ["legal"], "16.736": ["housing", "legal"], "21.006": ["other"], "93.773": ["health"], "93.774": ["health"],
  "84.027": ["education", "disability"], "84.181": ["family", "disability"], "84.177": ["disability"],
  "14.169": ["housing"], "14.117": ["housing"], "10.448": ["housing"], "84.379": ["education"], "84.149": ["education"],
  "93.926": ["health", "family"], "93.583": ["other"], "97.032": ["health"], "17.307": ["employment", "health"],
  "17.310": ["employment", "health"], "14.326": ["housing", "disability"], "14.879": ["housing", "disability"],
  "14.880": ["housing", "family"], "14.896": ["housing", "employment"], "10.646": ["food", "family"],
  "93.659": ["family"], "93.658": ["family"], "93.556": ["family"], "93.645": ["family"], "93.471": ["family"],
};
// "Who it is for" rewritten in plain words where the catalog names states or agencies instead of people.
const WHO_PLAIN = {
  "93.778": "Low-income children, pregnant people, parents, adults, older adults and people with disabilities. Each state sets its own rules. California's program is called Medi-Cal.",
  "93.767": "Children (and in some states pregnant people) in families who earn too much for Medicaid but cannot afford private insurance. In California it is part of Medi-Cal.",
  "10.557": "Pregnant, breastfeeding and recently pregnant people, infants, and children up to age 5 who have a nutrition need and meet income rules. Getting SNAP or Medicaid can count.",
  "10.559": "Children and teens 18 and under, at approved sites in areas where many families have low income.",
  "17.225": "Workers who lost their job through no fault of their own and meet their state's rules on work history and earnings.",
  "10.551": "Households with low income. Each state runs its own application and sets some of the rules. In California it is called CalFresh.",
  "20.513": "Older adults and people with disabilities who need transportation. Local agencies and nonprofits run the services.",
  "93.870": "Pregnant people and families with young children in communities with higher needs, through free home visits.",
  "84.010": "Students in schools with many low-income families. Schools receive the money and students get extra help.",
};

const text = readFileSync(csvPath, "utf8");
const seen = new Set();
const all = [];
for (const row of parseCsv(text)) {
  if (!isForPeople(row)) continue;
  const p = toProgram(row);
  if (p && !seen.has(p.id) && (ALWAYS_SET.has(p.id) || !EXCLUDE.test(p.name))) { seen.add(p.id); all.push(p); }
}
console.log("programs for people:", all.length, "from the hand-picked list:", all.filter((p) => ALWAYS_SET.has(p.id)).length);

// pick ~100: best scores first, but at most 14 per category so the list is varied
const perCat = {};
const picked = [];
for (const p of all.sort((a, b) => b.score - a.score)) {
  const c = p.categories[0];
  if ((perCat[c] ?? 0) >= 14 && !ALWAYS_SET.has(p.id)) continue;
  perCat[c] = (perCat[c] ?? 0) + 1;
  picked.push(p);
  if (picked.length >= 130) break;
}
// apply the review edits
// only the hand-picked programs stay (no filler picked by the computer), minus the ones I took out
const final = picked.filter((p) => ALWAYS_SET.has(p.id) && !CUT.has(p.id));
for (const p of final) {
  if (CATEGORY_OVERRIDES[p.id]) p.categories = CATEGORY_OVERRIDES[p.id];
  if (WHO_PLAIN[p.id]) p.whoPlain = WHO_PLAIN[p.id];
}
picked.length = 0;
picked.push(...final);
picked.sort((a, b) => a.name.localeCompare(b.name));
for (const p of picked) delete p.score;
console.log("picked:", picked.length, perCat);

// ---- write the small CSV ----
// the columns, in order. A list (like categories) is written with bars between items: food|health
const columns = ["id", "name", "categories", "summary", "agency", "agencyUrl", "listingUrl", "who", "whoPlain", "applicant", "documents", "howToApply", "deadlines", "ages", "situations", "needs", "incomeSensitive"];

function toRow(p) {
  return {
    ...p,
    categories: p.categories.join("|"),
    ages: p.signals.ages.join("|"),
    situations: p.signals.situations.join("|"),
    needs: p.signals.needs.join("|"),
    incomeSensitive: String(p.signals.incomeSensitive),
  };
}

// a field with a comma, quote or line break must be wrapped in "quotes" (and quotes doubled)
const csvField = (value) => {
  const text = String(value ?? "");
  return /[",\n\r]/.test(text) ? '"' + text.replaceAll('"', '""') + '"' : text;
};

const lines = [columns.join(",")];
for (const p of picked) {
  const row = toRow(p);
  lines.push(columns.map((c) => csvField(row[c])).join(","));
}
writeFileSync(outPath, lines.join("\n") + "\n");
console.log("wrote", outPath);

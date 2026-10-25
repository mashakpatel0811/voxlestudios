import { useState } from "react";
import { categories } from "./data/categories";
import { useT } from "./language";

// When the program list was made (see notes.md).
const LIST_DATE = "2026-10-25";
// how many cards to show before the "Show more" button
const PAGE = 30;

// The optional questions. The id is what programs.csv uses in its `situations` column.
const situationList = [
  { id: "young-child", label: "A child under 5 lives with me" },
  { id: "pregnant", label: "Someone is pregnant or recently gave birth" },
  { id: "disability", label: "I or someone I support has a disability" },
  { id: "veteran", label: "I served in the military" },
  { id: "student", label: "I am a student" },
  { id: "unemployed", label: "I am out of work" },
];

const ageText = { under18: "under 18", "18to59": "18 to 59", "60plus": "60 or older" };

// the same list with the item added if it is not in it, or taken out if it is
function toggle(list, item) {
  return list.includes(item) ? list.filter((x) => x !== item) : [...list, item];
}

// Is `program` a good idea to explore for these answers? Gives the reasons and a score.
// This is a relevance guess only. It never says someone "qualifies".
function match(program, answers, t) {
  const { needs, age, situations, income } = answers;
  const s = program.signals;
  const reasons = [];
  let score = 0;

  const needHits = needs.filter((n) => s.needs.includes(n) || program.categories.includes(n));
  for (const n of needHits) {
    const topic = t(categories.find((c) => c.id === n).short).toLowerCase();
    reasons.push(t("You said you want help with {topic}.", { topic }));
    score += 3;
  }
  const situationHits = situations.filter((x) => s.situations.includes(x));
  for (const x of situationHits) {
    const situation = t(situationList.find((o) => o.id === x).label).toLowerCase();
    reasons.push(t("It often applies when this is true for you: {situation}.", { situation }));
    score += 2;
  }
  if (age && s.ages.includes(age)) {
    reasons.push(t("It serves people who are {age}, among others.", { age: t(ageText[age]) }));
    score += 1;
  }
  if (income === "tight" && s.incomeSensitive) {
    reasons.push(t("It is for households with limited income, and you said money is tight."));
    score += 1;
  }
  // a program needs a link to a need or situation (not only age or income) to be shown
  const strongLink = needHits.length > 0 || situationHits.length > 0;
  return { reasons, score, show: strongLink && score > 0 };
}

// The Benefits and Programs page: a questions box on the left, the programs on the right.
// Clicking a program opens its details. Nothing typed here is stored or sent anywhere.
// programs = the list read from public/programs.csv (App.jsx does the reading), status = "loading", "ready" or "error".
// savedIds = the ids in My Next Steps (places and programs), onToggleSave = add or remove one.
function Benefits({ programs, status, savedIds, onToggleSave, onNavigate }) {
  const t = useT();
  const [needs, setNeeds] = useState([]); // category ids that were ticked
  const [age, setAge] = useState(""); // "", "under18", "18to59" or "60plus"
  const [situations, setSituations] = useState([]);
  const [income, setIncome] = useState(""); // "", "tight", "unsure" or "comfortable"
  const [query, setQuery] = useState("");
  const [shown, setShown] = useState(PAGE); // how many cards are showing
  const [openId, setOpenId] = useState(null); // the program whose details are open

  // open or close the details, and jump to the top like a new page
  function open(id) {
    setOpenId(id);
    window.scrollTo(0, 0);
  }

  // while the CSV is being read (or if it could not be read) there is nothing to show yet
  if (status === "loading") {
    return (
      <div className="page-head">
        <h1>{t("Benefits and programs that may help")}</h1>
        <p role="status">{t("Loading programs…")}</p>
      </div>
    );
  }
  if (status === "error") {
    return (
      <div className="page-head">
        <h1>{t("Benefits and programs that may help")}</h1>
        <div className="notice">
          <strong>{t("The programs could not be loaded")}</strong>
          {t("Please refresh the page. If it keeps happening, search community services on Find Help or call 211.")}
        </div>
      </div>
    );
  }

  const opened = programs.find((p) => p.id === openId);
  if (opened) {
    return (
      <ProgramDetails
        program={opened}
        saved={savedIds.includes(opened.id)}
        onToggleSave={onToggleSave}
        onBack={() => open(null)}
        onNavigate={onNavigate}
      />
    );
  }

  const answers = { needs, age, situations, income };
  const answered = needs.length > 0 || age !== "" || situations.length > 0 || income !== "";
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);

  const matches = programs
    .map((program) => ({ program, ...match(program, answers, t) }))
    // with no answers every program is shown, in the list's order
    .filter((m) => !answered || m.show)
    // every typed word must be somewhere in the name, summary or agency
    .filter((m) => {
      const text = `${m.program.name} ${m.program.summary} ${m.program.agency}`.toLowerCase();
      return words.every((w) => text.includes(w));
    })
    // best matches first (equal scores keep their A to Z order)
    .sort((a, b) => b.score - a.score);

  function startOver() {
    setNeeds([]);
    setAge("");
    setSituations([]);
    setIncome("");
    setQuery("");
    setShown(PAGE);
  }

  const searching = answered || words.length > 0;

  return (
    <>
      <div className="page-head">
        <h1>{t("Benefits and programs that may help")}</h1>
        <p>
          {t(
            "Browse federal assistance programs from the official catalog, or answer a few optional questions to see which might be relevant. No account needed.",
          )}
        </p>
      </div>

      <div className="programs-layout">
        <form className="card finder" aria-label={t("Optional questions")} onSubmit={(e) => e.preventDefault()}>
          <h2>{t("A few optional questions")}</h2>
          <p className="small muted">
            {t("Skip any you like. Your answers stay on this page, are not stored, and are not sent anywhere.")}
          </p>

          <fieldset className="finder-group">
            <legend>{t("What do you need help with?")}</legend>
            {categories
              .filter((c) => c.id !== "other")
              .map((c) => (
                <label className="check" key={c.id}>
                  <input
                    type="checkbox"
                    checked={needs.includes(c.id)}
                    onChange={() => {
                      setNeeds(toggle(needs, c.id));
                      setShown(PAGE);
                    }}
                  />
                  {t(c.label)}
                </label>
              ))}
          </fieldset>

          <div className="field">
            <label htmlFor="age">{t("Your age group")}</label>
            <select
              id="age"
              value={age}
              onChange={(e) => {
                setAge(e.target.value);
                setShown(PAGE);
              }}
            >
              <option value="">{t("Prefer not to say")}</option>
              <option value="under18">{t("Under 18")}</option>
              <option value="18to59">{t("18 to 59")}</option>
              <option value="60plus">{t("60 or older")}</option>
            </select>
          </div>

          <fieldset className="finder-group">
            <legend>{t("Does any of this apply?")}</legend>
            {situationList.map((s) => (
              <label className="check" key={s.id}>
                <input
                  type="checkbox"
                  checked={situations.includes(s.id)}
                  onChange={() => {
                    setSituations(toggle(situations, s.id));
                    setShown(PAGE);
                  }}
                />
                {t(s.label)}
              </label>
            ))}
          </fieldset>

          <div className="field">
            <label htmlFor="income">{t("How is your household budget?")}</label>
            <select
              id="income"
              value={income}
              onChange={(e) => {
                setIncome(e.target.value);
                setShown(PAGE);
              }}
            >
              <option value="">{t("Prefer not to say")}</option>
              <option value="tight">{t("Money is tight")}</option>
              <option value="unsure">{t("Not sure")}</option>
              <option value="comfortable">{t("Comfortable")}</option>
            </select>
            <p className="small muted">
              {t("We do not ask for exact income. Agencies use their own limits.")}
            </p>
          </div>

          <button type="button" className="btn light" onClick={startOver}>
            {t("Start over")}
          </button>
        </form>

        <section aria-labelledby="programs-count">
          <div className="notice info">
            <strong>{t("These are ideas to explore, not a decision.")}</strong>
            {t(
              "Only the agency can decide who qualifies, how much you may get, and when. Nothing here guarantees approval.",
            )}
          </div>

          <div className="field">
            <label htmlFor="program-search">{t("Search programs by name or topic")}</label>
            <input
              id="program-search"
              type="search"
              value={query}
              placeholder={t("For example: housing, veterans, child care")}
              onChange={(e) => {
                setQuery(e.target.value);
                setShown(PAGE);
              }}
            />
          </div>

          <h2 id="programs-count" role="status">
            {searching
              ? t(matches.length === 1 ? "{n} program that may be relevant" : "{n} programs that may be relevant", {
                  n: matches.length,
                })
              : t("All {n} programs", { n: matches.length })}
          </h2>

          {matches.length === 0 && (
            <div className="notice">
              <strong>{t("Nothing matched those answers")}</strong>
              {t(
                "That does not mean you have no options. Try removing a choice, search community services on Find Help, or call 211 to talk with a person.",
              )}
            </div>
          )}

          <div className="program-list">
            {matches.slice(0, shown).map(({ program: p, reasons }) => (
              <article className="card" key={p.id}>
                <h3>{p.name}</h3>
                <p className="tags">
                  <span className="badge grey">? {t("Not verified")}</span>
                  <span className="badge grey">{t("Federal program")}</span>
                </p>
                <p>{p.summary}</p>
                {reasons.length > 0 && (
                  <>
                    <p className="label">{t("Why this might be relevant")}</p>
                    <ul>
                      {reasons.map((r) => (
                        <li key={r}>{r}</li>
                      ))}
                    </ul>
                  </>
                )}
                <p className="small muted">
                  {t("Run by:")} {p.agency}
                </p>
                <button className="btn" onClick={() => open(p.id)}>
                  {t("Eligibility, documents, and steps")}
                  <span className="sr-only"> {t("for")} {p.name}</span>
                </button>
              </article>
            ))}
          </div>

          {matches.length > shown && (
            <p className="center">
              <button className="btn light" onClick={() => setShown(shown + PAGE)}>
                {t("Show more programs ({n} more)", { n: matches.length - shown })}
              </button>
            </p>
          )}
          <p className="small muted">
            {t(
              "This is a fixed list of {n} programs saved in the app. I made it by running a one-time script on the official federal catalog (SAM.gov Assistance Listings, public domain, no key) on {date}. It does not update live, and no person has checked it yet.",
              { n: programs.length, date: LIST_DATE },
            )}
          </p>
        </section>
      </div>
    </>
  );
}

// The details of one program: who it is for, documents, how to apply, and (on the right)
// the "Make a plan" button and where the information came from.
// saved = is it in My Next Steps? onToggleSave = add it or take it out.
function ProgramDetails({ program: p, saved, onToggleSave, onBack, onNavigate }) {
  const t = useT();

  return (
    <article>
      <p className="breadcrumb">
        <button className="link-btn" onClick={onBack}>
          ← {t("All programs")}
        </button>
      </p>
      <h1>{p.name}</h1>
      <p className="tags">
        <span className="badge grey">? {t("Not verified")}</span>
        {p.categories.map((id) => (
          <span className="badge grey" key={id}>
            {t(categories.find((c) => c.id === id).short)}
          </span>
        ))}
      </p>
      <p className="lead">{p.summary}</p>

      <div className="notice warn">
        <strong>{t("This is a general summary, not a decision about you.")}</strong>
        {t(
          "This summary comes from the federal Assistance Listings catalog. It describes the program in general and is not a decision about you. Rules, forms and who runs the program locally can differ by state. Only the agency can decide eligibility. The agency decides who qualifies and how much they receive.",
        )}
      </div>

      <div className="detail-grid">
        <div className="stack">
          <section className="card">
            <h2>{t("Who it is generally for")}</h2>
            <ul>
              <li>
                {p.whoPlain
                  ? `${t("In plain words:")} ${p.whoPlain}`
                  : p.who
                    ? `${t("The catalog lists who benefits:")} ${p.who}`
                    : t("The catalog does not list who benefits. Check the official listing.")}
              </li>
              {p.applicant && (
                <li>
                  {t("Who can apply:")} {p.applicant}
                </li>
              )}
            </ul>
            <h3>{t("You still need to confirm")}</h3>
            <ul>
              <li>{t("Whether you or your household qualifies")}</li>
              <li>{t("How and where to apply in your state")}</li>
              <li>{t("Current rules, forms and deadlines")}</li>
            </ul>
          </section>

          {p.documents && (
            <section className="card">
              <h2>{t("Documents people often need")}</h2>
              <p className="small muted">{t("Your agency’s list may differ. Ask before you collect everything.")}</p>
              <p>
                {t("From the catalog:")} {p.documents}
              </p>
            </section>
          )}

          <section className="card">
            <h2>{t("How to apply")}</h2>
            <ol>
              <li>{t("Read the official listing and the agency page.")}</li>
              <li>
                {t("Contact the agency or your state or local office to ask whether you qualify and how to apply.")}
              </li>
              <li>{t("Follow the application instructions, and keep copies of what you submit.")}</li>
            </ol>
            <p>
              <strong>{t("Timing:")}</strong>{" "}
              {p.deadlines || <span className="missing">{t("No deadline information listed. Ask the agency.")}</span>}
            </p>
            {p.howToApply && <p className="muted">{p.howToApply}</p>}
            <p className="buttons">
              <a className="btn" href={p.listingUrl} target="_blank" rel="noreferrer">
                {t("Official catalog listing")}
              </a>
              <a className="btn light" href={p.agencyUrl} target="_blank" rel="noreferrer">
                {p.agency}
              </a>
            </p>
          </section>

          <section className="card">
            <h2>{t("Need help applying?")}</h2>
            <p>{t("Call 211 to ask about local application help, or search places near you.")}</p>
            <button className="btn light" onClick={() => onNavigate("find")}>
              {t("Find help near you")}
            </button>
          </section>
        </div>

        <aside className="stack">
          <section className="card">
            <h2>{t("Make a plan")}</h2>
            <button className="btn" aria-pressed={saved} onClick={() => onToggleSave(p.id)}>
              {saved ? t("✓ In My Next Steps (remove)") : t("Add to My Next Steps")}
            </button>
            {saved && (
              <p>
                <button className="link-btn" onClick={() => onNavigate("steps")}>
                  {t("Open My Next Steps")}
                </button>
              </p>
            )}
            <p className="small muted">
              {t("Your checklist is saved only in this browser on this device. It is not saved to an account.")}
            </p>
          </section>

          <section className="card">
            <h2>{t("Source and verification")}</h2>
            <p>
              <span className="badge grey">? {t("Not verified")}</span>{" "}
              <span className="small muted">
                {t("No one has checked this information. Confirm details with the provider.")}
              </span>
            </p>
            <dl className="facts small">
              <dt>{t("Last checked")}</dt>
              <dd>
                <span className="missing">{t("Never checked by a person")}</span>
              </dd>
              <dt>{t("How it was checked")}</dt>
              <dd>
                <span className="missing">{t("Not recorded")}</span>
              </dd>
              <dt>{t("Source")}</dt>
              <dd>
                {t("SAM.gov Assistance Listings · Official catalog (fixed list, not live)")}
                <br />
                <a href={p.listingUrl} target="_blank" rel="noreferrer">
                  {t("Federal Assistance Listing {number}", { number: p.id })}
                </a>
              </dd>
              <dt>{t("Made on")}</dt>
              <dd>
                {t("Saved in this app by a one-time script on {date}. It does not update live.", {
                  date: LIST_DATE,
                })}
              </dd>
              {p.whoPlain && (
                <>
                  <dt>{t("Notes")}</dt>
                  <dd>
                    {t(
                      "The “Who it is generally for” line was rewritten in plain words for this app (with AI help) because the catalog's wording names states or agencies. Check it on the official site.",
                    )}
                  </dd>
                </>
              )}
            </dl>
            <p className="small muted">{t("Confirm details with the agency before you apply.")}</p>
          </section>
        </aside>
      </div>
    </article>
  );
}

export default Benefits;

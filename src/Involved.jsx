import { useEffect, useState } from "react";
import { useT } from "./language";

// The Federal Register is the government's daily list of new rules. This web address asks it
// for proposed rules (PRORULE) that are still open for comments, and only the 4 facts we show.
// It is free, needs no key, and lets web pages ask it questions.
const OPEN_COMMENTS_URL =
  "https://www.federalregister.gov/api/v1/documents.json?per_page=1000&order=newest" +
  "&conditions[type][]=PRORULE" +
  "&conditions[comment_date][gte]=" +
  new Date().toLocaleDateString("en-CA") + // today as 2026-10-25
  "&fields[]=title&fields[]=agency_names&fields[]=comments_close_on&fields[]=html_url";

// "2026-12-28" -> days from today until then (0 = today)
function daysLeft(dateText) {
  const today = new Date(new Date().toLocaleDateString("en-CA")); // midnight today
  return Math.round((new Date(dateText) - today) / 86400000);
}

// The "Get Involved" page. For now it shows open federal comment periods.
function Involved() {
  const t = useT();
  // the rules from the Federal Register, or null while loading
  const [rules, setRules] = useState(null);
  const [failed, setFailed] = useState(false);
  // what is typed in the filter box
  const [filter, setFilter] = useState("");
  // how many cards to show
  const [shown, setShown] = useState(12);

  // run once when the page opens: ask the Federal Register for the list
  useEffect(() => {
    fetch(OPEN_COMMENTS_URL)
      .then((response) => response.json())
      .then((data) => {
        // soonest deadline first, because those are the most urgent
        const sorted = data.results.sort((a, b) =>
          a.comments_close_on.localeCompare(b.comments_close_on),
        );
        setRules(sorted);
      })
      .catch(() => setFailed(true));
  }, []);

  const words = filter.trim().toLowerCase();
  const matches = (rules ?? []).filter((r) =>
    (r.title + " " + r.agency_names.join(" ")).toLowerCase().includes(words),
  );

  return (
    <>
      <div className="page-head">
        <h1>{t("Get involved in decisions")}</h1>
        <p>
          {t(
            "Find open comment deadlines, know who represents you, and prepare what you want to say.",
          )}
        </p>
      </div>

      <div className="notice warn">
        {t(
          "This site cannot submit comments for you. Open comment periods below come from proposed federal rules in the Federal Register. Local public meetings are not listed here yet; check your city, county, or school board website.",
        )}
      </div>

      <div className="heading-row">
        <h2>{t("Open federal comment periods")}</h2>
        <p className="small muted">{t("From the Federal Register")}</p>
      </div>

      <div className="search-bar">
        <input
          type="search"
          value={filter}
          onChange={(e) => {
            setFilter(e.target.value);
            setShown(12);
          }}
          placeholder={t("Filter by topic or agency, like housing or Education")}
          aria-label={t("Filter by topic or agency, like housing or Education")}
        />
      </div>

      {failed && (
        <div className="notice warn">
          {t("Could not load the Federal Register right now. Try again later.")}
        </div>
      )}
      {!rules && !failed && <p>{t("Loading...")}</p>}

      {rules && (
        <>
          <p className="small muted">
            {t("{n} open for comment, soonest deadline first", { n: matches.length })}
          </p>
          <div className="cards">
            {matches.slice(0, shown).map((rule) => {
              const days = daysLeft(rule.comments_close_on);
              return (
                <article className="card" key={rule.html_url}>
                  <h3>{rule.title}</h3>
                  <p className="meta">{rule.agency_names.join(", ")}</p>
                  <p className="tags">
                    <span className={days <= 7 ? "badge warn" : "badge ok"}>
                      {t("Comments close {date}", { date: rule.comments_close_on })}
                      {" · "}
                      {days === 0 ? t("today") : t("{n} days left", { n: days })}
                    </span>
                  </p>
                  <p className="buttons">
                    <a className="btn" href={rule.html_url} target="_blank" rel="noreferrer">
                      {t("Read the proposal")}
                    </a>
                  </p>
                </article>
              );
            })}
          </div>
          {matches.length === 0 && <p>{t("No open comment periods match that.")}</p>}
          {shown < matches.length && (
            <p>
              <button className="btn light" onClick={() => setShown(shown + 12)}>
                {t("Show more")}
              </button>
            </p>
          )}
        </>
      )}
    </>
  );
}

export default Involved;

import CategoryTiles from "./CategoryTiles";
import { useT } from "./language";

// The home page: headline, search box and category tiles.
// Searching or clicking a tile sends the visitor to the Find Help page.
// Quick searches under the search box: [button text, word to search for]
const popular = [
  ["Rent help", "rent"],
  ["Food pantry", "pantry"],
  ["Counseling", "counseling"],
  ["Clinic", "clinic"],
  ["Job training", "job"],
];

// The cards under "Everything in one place": one for each part of the app.
// status: the small tag on a card. "In progress" = I am building it now, "Coming soon" =
// not started yet. No status = it works.
const modules = [
  {
    page: "find",
    icon: "📍",
    title: "Find Help",
    text: "Search real community places in Los Angeles and the Santa Clarita Valley, and see them on a map.",
  },
  {
    page: "benefits",
    icon: "🧾",
    title: "Benefits and Programs",
    text: "Answer a few optional questions to see government programs that may fit, in plain language.",
    status: "In progress",
  },
  {
    page: "policy",
    icon: "🏛️",
    title: "Policy Explorer",
    text: "See how bills, laws, and budgets connect to the programs and services near you.",
    status: "Coming soon",
  },
  {
    page: "insights",
    icon: "📊",
    title: "Community Insights",
    text: "Explore community needs and service gaps, with clear sources and definitions.",
    status: "Coming soon",
  },
  {
    page: "involved",
    icon: "📣",
    title: "Get Involved",
    text: "Find meetings and comment deadlines, and draft a question or comment.",
    status: "Coming soon",
  },
];

function Home({
  query,
  setQuery,
  zip,
  setZip,
  onSearch,
  onPopular,
  onPickCategory,
  onNavigate,
}) {
  const t = useT();

  return (
    <>
      <section className="hero">
        <h1>{t("Find help. Understand your options. Have your say.")}</h1>
        <p>
          {t(
            "One place to find local services, discover government programs you may qualify for (coming soon), and follow decisions that affect your community (coming soon). No account needed.",
          )}
        </p>

        <form
          className="search-bar"
          role="search"
          onSubmit={(e) => {
            e.preventDefault(); // stop the browser reloading the page
            onSearch();
          }}
        >
          <div className="grow">
            <label htmlFor="home-search">{t("What do you need help with?")}</label>
            <input
              id="home-search"
              type="search"
              placeholder={t("Rent, food, clinic…")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div className="zip">
            <label htmlFor="home-zip">
              {t("ZIP code")} <span className="muted">{t("(optional)")}</span>
            </label>
            <input
              id="home-zip"
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder="91321"
              value={zip}
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
            />
          </div>
          <button className="btn" type="submit">
            {t("Search")}
          </button>
        </form>

        <p className="small popular">
          <span className="muted">{t("Popular:")}</span>
          {popular.map(([label, word]) => (
            <button
              key={word}
              className="pill-link"
              onClick={() => onPopular(word)}
            >
              {t(label)}
            </button>
          ))}
        </p>

        <p className="small muted">
          {t("In crisis? Call or text")} <a href="tel:988">988</a>
          {t(". In an emergency, call")} <a href="tel:911">911</a>.
        </p>
      </section>

      <section className="notice info">
        <strong>{t("Today")}</strong>
        {t(
          "Find local places that can help in Los Angeles. Government programs and policy tools are coming soon.",
        )}
      </section>

      <h2>{t("What do you need?")}</h2>
      <CategoryTiles selected={null} onPick={onPickCategory} showAll={false} />

      <h2 className="section-gap">{t("Everything in one place")}</h2>
      <div className="tiles">
        {modules.map((m) => (
          <button
            key={m.page}
            className="module-card"
            onClick={() => onNavigate(m.page)}
          >
            <span className="module-icon" aria-hidden="true">
              {m.icon}
            </span>
            <strong>{t(m.title)}</strong>
            <span className="module-text">{t(m.text)}</span>
            {m.status && <span className="badge grey">{t(m.status)}</span>}
          </button>
        ))}
      </div>
    </>
  );
}

export default Home;

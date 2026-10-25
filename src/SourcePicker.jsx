import { useT } from "./language";

// "Where should results come from?" The only source that works is my own saved list.
// Google Maps is shown greyed out because it is not set up yet (it would need an API key).
const sources = [
  {
    id: "local",
    name: "My saved list",
    text: "Places saved in this app. I typed them in from websites and phone calls.",
    future: "Planned: places from OpenStreetMap, stored in a PostgreSQL database.",
    available: true,
  },
  {
    id: "google",
    name: "Google Maps",
    text: "Live search of Google Maps.",
    future: "Planned: live search using Google's APIs.",
    available: false,
  },
];

function SourcePicker() {
  const t = useT();

  return (
    <fieldset className="sources">
      <legend>{t("Where should results come from?")}</legend>
      <div className="source-grid">
        {sources.map((s) => (
          <label
            key={s.id}
            className={s.available ? "source selected" : "source off"}
          >
            <input
              type="radio"
              name="source"
              value={s.id}
              checked={s.available}
              disabled={!s.available}
              readOnly
            />
            <span>
              {/* the name and the status label on one line */}
              <span className="source-title">
                <strong>{t(s.name)}</strong>
                <span className={s.available ? "badge ok" : "badge warn"}>
                  {s.available ? t("Available") : t("Not set up yet")}
                </span>
              </span>
              <span className="source-text">{t(s.text)}</span>
              <span className="source-text source-future">{t(s.future)}</span>
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default SourcePicker;

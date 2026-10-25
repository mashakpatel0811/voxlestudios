import { categories } from "./data/categories";
import { useT } from "./language";

// One card for one place. App.jsx gives it the place through "props".
// number = its place in the list (the same number is on its pin on the map).
// saved = is this place in My Next Steps? onToggleSave = add it or take it out.
function PlaceCard({ place, number, nearness, distance, saved, onToggleSave, onNavigate }) {
  const t = useT();
  const category = categories.find((c) => c.id === place.category);
  // tel: links need digits only, so "(323) 234-3030" becomes "3232343030"
  const phoneDigits = place.phone.replace(/\D/g, "");
  const mapsLink =
    "https://www.google.com/maps/search/?api=1&query=" +
    encodeURIComponent(place.address);

  return (
    <article className="card place">
      <div className="place-head">
        <span className="num" aria-hidden="true">
          {number}
        </span>
        <div>
          <h3>{place.name}</h3>
          <p className="meta">
            {category.icon} {t(category.short)}
            {nearness && " · " + nearness}
            {distance && " · " + distance}
          </p>
        </div>
      </div>
      {place.address && <p>{place.address}</p>}
      <p>{place.hours}</p>

      <p className="tags">
        {place.verified ? (
          <span className="badge ok">{t("Verified")}</span>
        ) : (
          <span className="badge grey">? {t("Not verified")}</span>
        )}
        {place.lat === undefined && (
          <span className="badge grey">{t("Not on the map")}</span>
        )}
      </p>

      <p className="buttons">
        <a className="btn" href={"tel:" + phoneDigits}>
          {t("Call {phone}", { phone: place.phone })}
        </a>
        {place.address && (
          <a className="btn" href={mapsLink} target="_blank" rel="noreferrer">
            {t("Directions")}
          </a>
        )}
        <a className="btn light" href={place.website} target="_blank" rel="noreferrer">
          {t("Website")}
        </a>
      </p>
      <button
        className="btn light save-btn"
        aria-pressed={saved}
        onClick={() => onToggleSave(place.id)}
      >
        {saved ? t("✓ In My Next Steps (remove)") : t("+ Add to My Next Steps")}
      </button>
      {saved && (
        <p>
          <button className="link-btn" onClick={() => onNavigate("steps")}>
            {t("Open My Next Steps")}
          </button>
        </p>
      )}
      <p className="checked small muted">
        {place.verified
          ? t("Checked on {date}. Call to confirm hours.", { date: place.checked })
          : t("Not checked by a person yet (found on {date}). Call to confirm hours.", {
              date: place.checked,
            })}
      </p>
    </article>
  );
}

export default PlaceCard;

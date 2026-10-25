import { useState } from "react";
import { categories } from "./data/categories";
import { places } from "./data/places";
import { areas, zipcodes } from "./data/zipcodes";
import CategoryChips from "./CategoryChips";
import PlaceCard from "./PlaceCard";
import SourcePicker from "./SourcePicker";
import PlacesMap from "./PlacesMap";
import { useT } from "./language";

// Is `word` the start of any word in `text`? (works with accents, like "clínica")
function startsAWord(text, word) {
  // put a backslash before characters that mean something special in a pattern
  const safe = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`(?<![\\p{L}\\p{N}])${safe}`, "u").test(text);
}

// Straight-line distance in miles between two points on Earth (the "haversine" formula).
// Each point is { lat, lng }. It is "as the crow flies", not the driving distance.
function distanceInMiles(a, b) {
  const toRadians = (degrees) => (degrees * Math.PI) / 180;
  const earthRadiusMiles = 3958.8;
  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRadians(a.lat)) * Math.cos(toRadians(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * earthRadiusMiles * Math.asin(Math.sqrt(h));
}

// The Find Help page: search box, ZIP code, category chips, and the list of place cards.
function FindHelp({
  query,
  setQuery,
  zip,
  setZip,
  selected,
  setSelected,
  savedIds,
  onToggleSave,
  onNavigate,
}) {
  const t = useT();
  const [sort, setSort] = useState("best"); // "best", "name" or "category"
  const [showMore, setShowMore] = useState(false); // is the "More filters" box open?
  const [onlyMapped, setOnlyMapped] = useState(false);
  const [onlyVerified, setOnlyVerified] = useState(false);
  // "Use my location": where the visitor is ({ lat, lng }), or null. It is only kept in
  // this page's memory: not saved and not sent anywhere.
  const [myLocation, setMyLocation] = useState(null);
  const [locationError, setLocationError] = useState("");

  // ask the browser for the location (the browser asks the visitor for permission first)
  function findMyLocation() {
    setLocationError("");
    if (!navigator.geolocation) {
      setLocationError(t("This browser can not share a location."));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) =>
        setMyLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        }),
      () =>
        setLocationError(
          t("I could not get your location. You may have said no, or location is turned off."),
        ),
    );
  }

  // how many miles from me to a place (undefined if no location or the place has no pin)
  function miles(p) {
    if (!myLocation || p.lat === undefined) return undefined;
    return distanceInMiles(myLocation, p);
  }

  // the words typed in the search box, like ["job", "help"] (empty if nothing is typed)
  const typedWords = query.toLowerCase().split(/\s+/).filter(Boolean);

  // The ZIP only counts once all 5 digits are typed.
  const zipTyped = zip.length === 5;
  const zipInfo = zipcodes[zip]; // undefined if I do not know this ZIP
  const areaLabel = zipInfo && t(areas.find((a) => a.id === zipInfo.area).label);

  // 0 = same ZIP, 1 = same area, 2 = helps anywhere in LA County, 3 = somewhere else
  function nearness(p) {
    if (p.zip === zip) return 0;
    if (zipInfo && p.area === zipInfo.area) return 1;
    if (p.area === "all") return 2;
    return 3;
  }
  const nearnessText = [
    t("In your ZIP code"),
    t("Near you ({area})", { area: areaLabel }),
    t("Helps anywhere in LA County"),
    "",
  ];

  // Places that match the search words and the ZIP (but not the category yet).
  // The chips count these, so each number is "how many I would get if I picked it".
  const matching = places.filter((p) => {
    const category = categories.find((c) => c.id === p.category);
    // the search looks in the name, address, hours, and the category's name and
    // description (English and Spanish), so "counseling" finds the health places
    const text = [
      p.name,
      p.address,
      p.hours,
      category.label,
      category.blurb,
      t(category.label),
      t(category.blurb),
    ]
      .join(" ")
      .toLowerCase();
    // every typed word must be the START of a word in the text, so "rent" finds
    // "Rent help" and "rental" but not "current" or "different"
    const matchesSearch = typedWords.every((w) => startsAWord(text, w));
    // with a ZIP, hide places that are in other areas
    const matchesZip = !zipTyped || nearness(p) < 3;
    return matchesSearch && matchesZip;
  });

  // { housing: 5, food: 4, ... }
  const counts = {};
  matching.forEach((p) => {
    counts[p.category] = (counts[p.category] ?? 0) + 1;
  });

  const shownPlaces = matching
    .filter((p) => selected === null || p.category === selected)
    // "More filters"
    .filter((p) => !onlyMapped || p.lat !== undefined)
    .filter((p) => !onlyVerified || p.verified === true)
    .sort((a, b) => {
      if (sort === "name") return a.name.localeCompare(b.name);
      if (sort === "category") {
        const order = (p) => categories.findIndex((c) => c.id === p.category);
        return order(a) - order(b);
      }
      // "best match": with my location, the nearest pin first (places with no pin go last).
      // otherwise, closest ZIP/area first (equal places keep their old order)
      if (myLocation) {
        const gap = (miles(a) ?? Infinity) - (miles(b) ?? Infinity);
        if (gap !== 0 && !Number.isNaN(gap)) return gap;
      }
      return zipTyped ? nearness(a) - nearness(b) : 0;
    });

  return (
    <>
      <div className="page-head">
        <h1>{t("Find help near you")}</h1>
        <p>
          {t(
            "Search real community places, filter by what matters to you, and see them on the map. Currently real places in Los Angeles and the Santa Clarita Valley. Each card says when it was last checked.",
          )}
        </p>
      </div>

      {/* one white panel: the search bar, the "Use my location" line, and the round buttons */}
      <section className="finder">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault(); // stop the browser reloading the page
            // the list already updates as you type, so on a big screen nothing else moves
            document.activeElement?.blur(); // closes the keyboard on a phone
            // on a small screen the results are far below, so take the visitor to them
            if (window.innerWidth < 900) {
              document.getElementById("results")?.scrollIntoView({ behavior: "smooth" });
            }
          }}
        >
          <div className="search-pill">
            <svg className="pill-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-4-4" />
            </svg>
            <label htmlFor="search" className="sr-only">
              {t("What do you need help with?")}
            </label>
            <input
              id="search"
              type="search"
              placeholder={t("Try: food pantry, shelter, counseling, clinic")}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <span className="pill-divider" aria-hidden="true" />
            <svg className="pill-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.800 12 21 12 21z" />
              <circle cx="12" cy="9.5" r="2.5" />
            </svg>
            <label htmlFor="zip" className="sr-only">
              {t("ZIP code")} {t("(optional)")}
            </label>
            <input
              id="zip"
              className="zip-input"
              type="text"
              inputMode="numeric"
              maxLength={5}
              placeholder={t("ZIP code")}
              value={zip}
              // keep only digits
              onChange={(e) => setZip(e.target.value.replace(/\D/g, ""))}
            />
            <button className="btn" type="submit">
              {t("Search")}
            </button>
          </div>
        </form>

        <p className="locate-row">
          {myLocation ? (
            <button className="link-btn" onClick={() => setMyLocation(null)}>
              {t("Turn off my location")}
            </button>
          ) : (
            <button className="link-btn" onClick={findMyLocation}>
              {t("Use my location")}
            </button>
          )}
          <span className="small muted">
            {myLocation
              ? t("Places with a pin are sorted by how far they are from you.")
              : t(
                  "Only asked when you click. Your location stays in this browser tab and is not stored.",
                )}
          </span>
        </p>
        {locationError && <p className="small field-error">{locationError}</p>}

        <CategoryChips
          counts={counts}
          total={matching.length}
          selected={selected}
          onPick={setSelected}
        />
      </section>

      {zipTyped && zipInfo && (
        <p className="notice info">
          <strong>
            {t("ZIP {zip}: {neighborhood}", {
              zip,
              neighborhood: zipInfo.neighborhood,
            })}
          </strong>
          {t(
            "Showing places in your ZIP code first, then your area ({area}), then help that works anywhere in LA County.",
            { area: areaLabel },
          )}
        </p>
      )}
      {zipTyped && !zipInfo && (
        <p className="notice info">
          <strong>{t("I do not have ZIP {zip} yet.", { zip })}</strong>
          {t(
            "Showing help that works anywhere in LA County. This app knows 50 ZIP codes in Los Angeles and the Santa Clarita Valley.",
          )}
        </p>
      )}
      {zip.length > 0 && !zipTyped && (
        <p className="small muted">{t("Type all 5 digits of your ZIP code.")}</p>
      )}

      <SourcePicker />

      <div className="results-head" id="results">
        <h2>{t("{n} results", { n: shownPlaces.length })}</h2>
        <div className="results-tools">
          <label htmlFor="sort" className="sr-only">
            {t("Sort by")}
          </label>
          <select
            id="sort"
            className="lang-select"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="best">{t("Best match")}</option>
            <option value="name">{t("Name (A to Z)")}</option>
            <option value="category">{t("Type of help")}</option>
          </select>
          <button
            className="btn light small-btn"
            aria-expanded={showMore}
            onClick={() => setShowMore(!showMore)}
          >
            {t("More filters")}
          </button>
          <button className="btn light small-btn" onClick={() => window.print()}>
            {t("Print this list")}
          </button>
        </div>
      </div>

      {showMore && (
        <fieldset className="more-filters">
          <legend className="sr-only">{t("More filters")}</legend>
          <label className="check">
            <input
              type="checkbox"
              checked={onlyMapped}
              onChange={() => setOnlyMapped(!onlyMapped)}
            />
            {t("Only places with a pin on the map")}
          </label>
          <label className="check">
            <input
              type="checkbox"
              checked={onlyVerified}
              onChange={() => setOnlyVerified(!onlyVerified)}
            />
            {t("Only places checked by a person")}
          </label>
        </fieldset>
      )}

      <p className="small muted">
        {t(
          "Places come from my own saved list. Missing details are left out, never guessed. Places marked “Not verified” have not been checked by a person yet.",
        )}
      </p>

      {shownPlaces.length === 0 && (
        <p>{t("No places match. Try a different word, category or ZIP code.")}</p>
      )}

      <div className="results-area">
        <div className="results-list">
          {shownPlaces.map((p, i) => (
            <PlaceCard
              key={p.id}
              place={p}
              number={i + 1}
              nearness={zipTyped ? nearnessText[nearness(p)] : ""}
              distance={
                miles(p) === undefined
                  ? ""
                  : t("{d} mi away", { d: miles(p).toFixed(1) })
              }
              saved={savedIds.includes(p.id)}
              onToggleSave={onToggleSave}
              onNavigate={onNavigate}
            />
          ))}
        </div>
        <PlacesMap places={shownPlaces} />
      </div>
    </>
  );
}

export default FindHelp;

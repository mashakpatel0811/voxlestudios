import { places } from "./data/places";import { useT } from "./language";

// The steps for every place. The tick boxes are remembered by App.jsx.
const steps = [
  "Call to confirm the hours and what to bring",
  "Gather what to bring (photo ID, proof of address, income papers)",
  "Go there or apply",
  "Follow up if you do not hear back",
];

// The steps for every program. Programs have no street address, so the agency decides first.
const programSteps = [
  "Read the official listing and the agency page",
  "Contact the agency or your state or local office to ask whether you qualify",
  "Gather the documents they ask for",
  "Apply, and keep copies of what you submit",
  "Follow up if you do not hear back",
];

// Print just one card: mark it, print, then unmark it (the print CSS hides the other cards)
function printCard(card) {
  card.classList.add("print-target");
  document.body.classList.add("print-one");
  const cleanUp = () => {
    card.classList.remove("print-target");
    document.body.classList.remove("print-one");
    window.removeEventListener("afterprint", cleanUp);
  };
  window.addEventListener("afterprint", cleanUp);
  window.print();
}

// The My Next Steps page: a checklist for each place or program the visitor saved.
// programs = the list read from programs.csv (App.jsx), savedIds = the saved ids (a place id is a number like 3, a program id is text like "10.551"),
// done = ticked boxes like { "3-0": true }, onToggleStep = tick or untick a box,
// onRemove = take one out of the list.
function NextSteps({ programs, savedIds, done, onToggleStep, onRemove, onNavigate }) {
  const t = useT();
  // each saved id becomes { id, place } or { id, program } (nothing if it is gone from the lists)
  const saved = savedIds
    .map((id) => {
      const place = places.find((p) => p.id === id);
      if (place) return { id, place };
      const program = programs.find((p) => p.id === id);
      if (program) return { id, program };
      return null;
    })
    .filter(Boolean);

  return (
    <>
      <div className="page-head">
        <h1>{t("My Next Steps")}</h1>
        <p>{t("A checklist for each place or program you add. Tick items as you finish them.")}</p>
      </div>

      {saved.length === 0 && (
        <div className="notice info">
          <strong>{t("Nothing here yet")}</strong>
          {t('Press "Add to My Next Steps" on a place in Find Help, or on a program in Benefits and Programs.')}
        </div>
      )}

      <div className="cards">
        {saved.map(({ id, place, program }) => {
          const list = place ? steps : programSteps;
          return (
            <article className="card" key={id}>
              <h3>{place ? place.name : program.name}</h3>
              {place ? (
                <>
                  {place.address && <p>{place.address}</p>}
                  <p>{place.hours}</p>
                  <p className="muted">{place.phone}</p>
                  <p>
                    <a href={place.website} target="_blank" rel="noreferrer">
                      {t("Website")}
                    </a>
                    {place.address && (
                      <>
                        {" · "}
                        <a
                          href={
                            "https://www.google.com/maps/search/?api=1&query=" +
                            encodeURIComponent(place.address)
                          }
                          target="_blank"
                          rel="noreferrer"
                        >
                          {t("Directions")}
                        </a>
                      </>
                    )}
                  </p>
                </>
              ) : (
                <p className="muted">
                  {t("Federal program")} · {t("Run by:")} {program.agency}
                </p>
              )}
              <ul className="checklist">
                {list.map((text, i) => (
                  <li key={i}>
                    <label className="check">
                      <input
                        type="checkbox"
                        checked={done[`${id}-${i}`] === true}
                        onChange={() => onToggleStep(`${id}-${i}`)}
                      />
                      {t(text)}
                    </label>
                  </li>
                ))}
              </ul>
              {program && (
                <p>
                  <a href={program.listingUrl} target="_blank" rel="noreferrer">
                    {t("Official catalog listing")}
                  </a>
                </p>
              )}
              <div className="buttons card-actions">
                <button
                  className="btn light small-btn"
                  onClick={(e) => printCard(e.target.closest(".card"))}
                >
                  {t("Print")}
                </button>
                <button className="btn light small-btn" onClick={() => onRemove(id)}>
                  {t("Remove from My Next Steps")}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <p className="buttons">
        <button className="btn" onClick={() => onNavigate("find")}>
          {t("Find help near you")}
        </button>
        <button className="btn light" onClick={() => onNavigate("benefits")}>
          {t("Benefits and Programs")}
        </button>
        {saved.length > 0 && (
          <button className="btn light" onClick={() => window.print()}>
            {t("Print this list")}
          </button>
        )}
      </p>
      <p className="small muted">
        {t("This list is saved only in this browser on this device. It is not sent anywhere.")}
      </p>
    </>
  );
}

export default NextSteps;

import { useT } from "./language";

function Privacy() {
  const t = useT();

  return (
    <>
      <div className="page-head">
        <h1>{t("Privacy")}</h1>
        <p>{t("This app does not ask for, or keep, any personal information.")}</p>
      </div>
      <div className="card">
        <ul>
          <li>{t("No account, no sign-in, no forms that send information anywhere.")}</li>
          <li>
            {t(
              "What you type in the search box or the ZIP code box stays in your browser. It is not sent to me.",
            )}
          </li>
          <li>
            {t(
              "Your light or dark choice, your language choice, and the places you add to My Next Steps (and the boxes you tick) are saved only in your own browser, on your own device, so they are there next time. I cannot see them. Clearing your browser data erases them.",
            )}
          </li>
          <li>
            {t(
              "If you press Use my location, your browser asks you first. Your location is used only on your own device to sort places by distance. It is not sent to me and it is not saved.",
            )}
          </li>
          <li>{t("I do not use advertising or tracking.")}</li>
          <li>
            {t(
              "The Call, Directions and Website buttons open your phone, Google Maps or the place's own website. Those have their own privacy rules.",
            )}
          </li>
          <li>
            {t(
              "The website host may keep ordinary visit records (like any website). I do not see or use them.",
            )}
          </li>
        </ul>
        <p>{t("Questions? Ask an adult who helped me build this app.")}</p>
      </div>
    </>
  );
}

export default Privacy;

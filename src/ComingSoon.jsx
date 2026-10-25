import { useT } from "./language";

// One page for a feature I have not built yet. It is honest about that.
function ComingSoon({ title, text, onNavigate }) {
  const t = useT();

  return (
    <>
      <div className="page-head">
        <h1>{t(title)}</h1>
        <p>{t(text)}</p>
      </div>
      <div className="notice info">
        <strong>{t("Coming soon")}</strong>
        {t(
          "This part of Community Compass is not built yet. Right now the app can help you find local places in Los Angeles.",
        )}
      </div>
      <button className="btn" onClick={() => onNavigate("find")}>
        {t("Find help near you")}
      </button>
    </>
  );
}

export default ComingSoon;

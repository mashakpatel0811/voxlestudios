import { useT } from "./language";

function Footer({ onNavigate, language }) {
  const t = useT();

  return (
    <footer className="site-footer">
      <p>
        <strong>{t("Not an emergency service.")}</strong>{" "}
        {t(
          "In an emergency call 911. For mental health crisis support in the U.S., call or text",
        )}{" "}
        <a href="tel:988">988</a>.
      </p>
      <p>
        {t(
          "Community Compass gives general information, not legal, medical, or financial advice, and cannot promise you will qualify for help.",
        )}{" "}
        <button className="link" onClick={() => onNavigate("privacy")}>
          {t("Privacy")}
        </button>{" "}
        ·{" "}
        <button className="link" onClick={() => onNavigate("about")}>
          {t("About the data")}
        </button>
      </p>
      {language === "es" && (
        <p className="small">
          {t(
            "Translations may have mistakes. Place names, addresses and opening hours are in English.",
          )}
        </p>
      )}
      <p className="small">
        {t(
          "A student project for the Congressional App Challenge. Places are in Los Angeles, CA.",
        )}
      </p>
    </footer>
  );
}

export default Footer;

import { useState } from "react";
import { comingSoonPages } from "./data/comingSoonPages";
import { useT } from "./language";

function Header({
  page,
  onNavigate,
  theme,
  onToggleTheme,
  savedCount,
  language,
  onChangeLanguage,
}) {
  const t = useT();

  // The menu links: Find Help, Benefits, the coming-soon pages, Get Involved, then My Next Steps with its count.
  // There is no Home link: clicking the Community Compass name goes Home.
  // "About the data" and "Privacy" are in the footer, like the big app.
  const links = [
    { page: "find", label: "Find Help" },
    { page: "benefits", label: "Benefits and Programs" },
    ...comingSoonPages,
    { page: "involved", label: "Get Involved" },
    { page: "steps", label: "My Next Steps" },
  ];

  // on a phone the menu is hidden until the Menu button is pressed
  const [open, setOpen] = useState(false);

  function go(next) {
    onNavigate(next);
    setOpen(false);
  }

  const themeLabel = t(theme === "dark" ? "Switch to light mode" : "Switch to dark mode");

  return (
    <header className="site-header">
      <div className="bar">
        <button className="brand" onClick={() => go("home")}>
          <span className="brand-mark" aria-hidden="true">🧭</span> <span className="brand-name">Community Compass</span>
        </button>
        <button
          className="menu-btn"
          aria-expanded={open}
          aria-controls="main-nav"
          onClick={() => setOpen(!open)}
        >
          {open ? t("Close menu") : t("Menu")}
        </button>
        <nav id="main-nav" className={open ? "nav open" : "nav"}>
          {links.map((l) => (
            <button
              key={l.page}
              className={page === l.page ? "active" : ""}
              aria-current={page === l.page ? "page" : undefined}
              onClick={() => go(l.page)}
            >
              {t(l.label)}
              {/* the number of saved places, like "My Next Steps (2)" */}
              {l.page === "steps" && savedCount > 0 ? ` (${savedCount})` : ""}
            </button>
          ))}
        </nav>
        <button
          className="theme-btn"
          onClick={onToggleTheme}
          aria-label={themeLabel}
          title={themeLabel}
        >
          {theme === "dark" ? "☀️ " + t("Light") : "🌙 " + t("Dark")}
        </button>
        <span className="lang-switch">
          <label htmlFor="language" className="sr-only">
            {t("Language")}
          </label>
          <select
            id="language"
            className="lang-select"
            value={language}
            onChange={(e) => onChangeLanguage(e.target.value)}
          >
            {/* each language is written in its own language */}
            <option value="en">English</option>
            <option value="es">Español</option>
          </select>
        </span>
      </div>
    </header>
  );
}

export default Header;

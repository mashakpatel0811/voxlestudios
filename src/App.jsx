import { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import Home from "./Home";
import FindHelp from "./FindHelp";
import About from "./About";
import Privacy from "./Privacy";
import NextSteps from "./NextSteps";
import Benefits from "./Benefits";
import Involved from "./Involved";
import ComingSoon from "./ComingSoon";
import { comingSoonPages } from "./data/comingSoonPages";
import { useStoredState } from "./useStoredState";
import { usePrograms } from "./usePrograms";
import { LanguageProvider, translate } from "./language";

function App() {
  // "light" or "dark". The first time, copy the phone/computer setting.
  const [theme, setTheme] = useStoredState(
    "cc-theme",
    window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light",
  );
  // tell the CSS which theme is on: <html data-theme="dark">
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);

  // "en" (English) or "es" (Spanish), remembered in the browser
  const [language, setLanguage] = useStoredState("cc-language", "en");
  // tell the browser which language the page is in: <html lang="es">
  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  // which page is showing: "home", "find", "about" or a coming-soon page
  const [page, setPage] = useState("home");
  // what is typed in the search box
  const [query, setQuery] = useState("");
  // the ZIP code typed (text, digits only)
  const [zip, setZip] = useState("");
  // which category tile was clicked (null means show everything)
  const [selected, setSelected] = useState(null);

  // My Next Steps: the ids of the saved places, and which boxes are ticked.
  // useStoredState keeps them across a reload, but in sessionStorage, so they are
  // cleared when the browser is closed.
  // the benefit programs, read from public/programs.csv when the app opens
  const { status: programsStatus, programs } = usePrograms();

  const [savedIds, setSavedIds] = useStoredState("cc-saved", [], "sessionStorage");
  const [done, setDone] = useStoredState("cc-done", {}, "sessionStorage");

  function toggleSave(id) {
    if (savedIds.includes(id)) {
      setSavedIds(savedIds.filter((x) => x !== id)); // take it out
    } else {
      setSavedIds([...savedIds, id]); // add it to the end
    }
  }

  function toggleStep(key) {
    setDone({ ...done, [key]: !done[key] });
  }

  // the page info if this is a "coming soon" page, otherwise undefined
  const comingSoon = comingSoonPages.find((p) => p.page === page);

  // put the page name in the browser tab, in the chosen language
  useEffect(() => {
    const names = {
      home: "Home",
      find: "Find Help",
      benefits: "Benefits and Programs",
      involved: "Get Involved",
      about: "About the data",
      privacy: "Privacy",
      steps: "My Next Steps",
    };
    const name = names[page] ?? comingSoon.label;
    document.title = translate(language, name) + " | Community Compass";
  }, [page, language]);

  // change page and jump back to the top, like a real new page
  function goTo(next) {
    setPage(next);
    window.scrollTo(0, 0);
  }

  // a "Popular" button: search for that word, show all categories, go to Find Help
  function searchPopular(word) {
    setQuery(word);
    setSelected(null);
    goTo("find");
  }

  function pickCategoryFromHome(id) {
    setSelected(id);
    goTo("find");
  }

  return (
    // every component inside can read the language with useT()
    <LanguageProvider value={language}>
      <a className="skip" href="#main">
        {translate(language, "Skip to main content")}
      </a>
      <Header
        page={page}
        onNavigate={goTo}
        savedCount={savedIds.length}
        theme={theme}
        onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")}
        language={language}
        onChangeLanguage={setLanguage}
      />
      <main id="main" className="wrap">
        {page === "home" && (
          <Home
            query={query}
            setQuery={setQuery}
            zip={zip}
            setZip={setZip}
            onSearch={() => goTo("find")}
            onPopular={searchPopular}
            onPickCategory={pickCategoryFromHome}
            onNavigate={goTo}
          />
        )}
        {page === "find" && (
          <FindHelp
            query={query}
            setQuery={setQuery}
            zip={zip}
            setZip={setZip}
            selected={selected}
            setSelected={setSelected}
            savedIds={savedIds}
            onToggleSave={toggleSave}
            onNavigate={goTo}
          />
        )}
        {page === "benefits" && <Benefits programs={programs} status={programsStatus} savedIds={savedIds} onToggleSave={toggleSave} onNavigate={goTo} />}
        {page === "steps" && (
          <NextSteps
            programs={programs}
            savedIds={savedIds}
            done={done}
            onToggleStep={toggleStep}
            onRemove={toggleSave}
            onNavigate={goTo}
          />
        )}
        {page === "involved" && <Involved />}
        {page === "about" && <About />}
        {page === "privacy" && <Privacy />}
        {comingSoon && <ComingSoon {...comingSoon} onNavigate={goTo} />}
      </main>
      <Footer onNavigate={goTo} language={language} />
    </LanguageProvider>
  );
}

export default App;

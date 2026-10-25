import { createContext, useContext } from "react";
import { es } from "./data/translations";

// The language choice ("en" or "es") is shared with every component through a React "context",
// so I do not have to pass it down as a prop through every file.
const LanguageContext = createContext("en");
export const LanguageProvider = LanguageContext.Provider;

// translate("es", "Search") gives "Buscar". If there is no Spanish for the text,
// the English text is used. {name} spots are filled from vars:
// translate("es", "Places ({n})", { n: 5 }) gives "Lugares (5)".
export function translate(language, text, vars = {}) {
  let result = language === "es" ? (es[text] ?? text) : text;
  for (const [name, value] of Object.entries(vars)) {
    result = result.replaceAll(`{${name}}`, value);
  }
  return result;
}

// In a component: const t = useT();  then  {t("Search")}
export function useT() {
  const language = useContext(LanguageContext);
  return (text, vars) => translate(language, text, vars);
}

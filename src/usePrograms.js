import { useEffect, useState } from "react";
import { parseCsv } from "./csv";

// In the CSV a list is written with bars between the items: "food|health" means ["food", "health"].
const toList = (text) => (text ? text.split("|") : []);

// Turn one CSV row (all text) into the program object the pages use.
function rowToProgram(r) {
  return {
    id: r.id,
    name: r.name,
    categories: toList(r.categories),
    summary: r.summary,
    agency: r.agency,
    agencyUrl: r.agencyUrl,
    listingUrl: r.listingUrl,
    who: r.who,
    whoPlain: r.whoPlain,
    applicant: r.applicant,
    documents: r.documents,
    howToApply: r.howToApply,
    deadlines: r.deadlines,
    signals: {
      ages: toList(r.ages),
      situations: toList(r.situations),
      needs: toList(r.needs),
      incomeSensitive: r.incomeSensitive === "true",
    },
  };
}

// Reads public/programs.csv once, when the app opens, and gives back the programs.
// status is "loading" (still reading), "ready" (programs is the list) or "error" (could not read it).
export function usePrograms() {
  const [state, setState] = useState({ status: "loading", programs: [] });

  useEffect(() => {
    // BASE_URL is "/" normally, or the sub-folder if the site is put in one
    fetch(`${import.meta.env.BASE_URL}programs.csv`)
      .then((response) => {
        if (!response.ok) throw new Error("Could not read programs.csv");
        return response.text();
      })
      .then((text) => {
        const rows = parseCsv(text);
        // if the file is missing, some servers send the home page instead; it has no "id" column
        if (rows.length === 0 || rows[0].id === undefined) throw new Error("programs.csv looks wrong");
        setState({ status: "ready", programs: rows.map(rowToProgram) });
      })
      .catch(() => setState({ status: "error", programs: [] }));
  }, []);

  return state;
}

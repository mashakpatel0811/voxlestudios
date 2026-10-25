import { useT } from "./language";

function About() {
  const t = useT();

  return (
    <>
      <div className="page-head">
        <h1>{t("About the data")}</h1>
        <p>{t("Where the places come from, and how much you can trust them.")}</p>
      </div>
      <div className="card">
        <p>
          {t(
            "The places in this app are typed into a list by me. There is no live map data and no database. I found the first list with a web search. I am checking each place by calling it or visiting its website.",
          )}
        </p>
        <p>
          {t(
            "Hours and phone numbers change. Every card says when it was last checked, so please call to confirm before you go.",
          )}
        </p>
      </div>
      <div className="card section-gap">
        <h2>{t("Where the benefits and programs come from")}</h2>
        <p>
          {t(
            "The Benefits and Programs page uses a fixed list saved in the app (public/programs.csv). I made the list by running a one-time script on the official federal Assistance Listings catalog (SAM.gov, public domain, no key needed). The website only reads that small saved file, and does not connect to the catalog while you use it, so the list does not update live.",
          )}
        </p>
        <p>
          {t(
            "I picked about 100 programs that people can apply for, took out grants meant for organizations, fixed some categories by hand, and rewrote a few “who it is for” lines in plain words. AI helped with this. No person has checked the list against current agency rules yet, so always confirm on the official website.",
          )}
        </p>
      </div>
      <h2 className="section-gap">{t("Coming soon")}</h2>
      <ul>
        <li>{t("Follow decisions that affect your community")}</li>
      </ul>
    </>
  );
}

export default About;

import { categories } from "./data/categories";
import { useT } from "./language";

// The row of category buttons. Home uses it.
// selected = which tile is highlighted, onPick = what happens when one is clicked.
// showAll = also show the "All" tile (the Home page leaves it out).
function CategoryTiles({ selected, onPick, showAll = true }) {
  const t = useT();

  return (
    <div className="tiles">
      {showAll && (
        <button
          className={selected === null ? "tile selected" : "tile"}
          onClick={() => onPick(null)}
        >
          <span className="icon">📍</span>
          <strong>{t("All")}</strong>
          <span className="blurb">{t("Show every place")}</span>
        </button>
      )}
      {categories.map((c) => (
        <button
          key={c.id}
          className={selected === c.id ? "tile selected" : "tile"}
          style={{ "--tile": c.color }}
          onClick={() => onPick(c.id)}
        >
          <span className="icon">{c.icon}</span>
          <strong>{t(c.label)}</strong>
          <span className="blurb">{t(c.blurb)}</span>
        </button>
      ))}
    </div>
  );
}

export default CategoryTiles;

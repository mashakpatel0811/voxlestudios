import { categories } from "./data/categories";
import { useT } from "./language";

// The row of round filter buttons on the Find Help page, each with a count.
// counts = how many places each category has right now, for example { food: 4 }.
// total = how many places there are in all. selected = the picked category (null = All).
function CategoryChips({ counts, total, selected, onPick }) {
  const t = useT();

  return (
    <div className="chips" role="group" aria-label={t("Filter by type of help")}>
      <button
        className="chip"
        aria-pressed={selected === null}
        onClick={() => onPick(null)}
      >
        {t("All")} <span className="chip-count">{total}</span>
      </button>
      {categories.map((c) => {
        const count = counts[c.id] ?? 0;
        return (
          <button
            key={c.id}
            className="chip"
            aria-pressed={selected === c.id}
            // a category with no places can not be picked (unless it is already picked)
            disabled={count === 0 && selected !== c.id}
            onClick={() => onPick(c.id)}
          >
            <span aria-hidden="true">{c.icon}</span> {t(c.short)}{" "}
            <span className="chip-count">{count}</span>
          </button>
        );
      })}
    </div>
  );
}

export default CategoryChips;

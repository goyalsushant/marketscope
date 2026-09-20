import type { Category } from "../types";

import "./CategorySelector.css";

interface Props {
  categories: Category[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function CategorySelector({
  categories,
  selectedIds,
  onChange
}: Props) {
  function toggleCategory(
    categoryId: string
  ) {
    if (selectedIds.includes(categoryId)) {
      onChange(
        selectedIds.filter(
          (id) => id !== categoryId
        )
      );
      return;
    }

    onChange([
      ...selectedIds,
      categoryId
    ]);
  }

  return (
    <section className="category-section">
      <div className="section-heading">
        <h2>Store categories</h2>

        <p>
          Select the categories relevant to this
          market.
        </p>
      </div>

      <div className="category-grid">
        {categories.map((category) => {
          const selected =
            selectedIds.includes(category.id);

          return (
            <label
              key={category.id}
              className={
                selected
                  ? "category-card selected"
                  : "category-card"
              }
            >
              <input
                type="checkbox"
                checked={selected}
                onChange={() =>
                  toggleCategory(category.id)
                }
              />

              <span className="category-card-name">
                {category.name}
              </span>

              {selected && (
                <span className="category-check">
                  ✓
                </span>
              )}
            </label>
          );
        })}
      </div>
    </section>
  );
}
import type { Category } from "../types";

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
    <fieldset>
      <legend>Categories</legend>

      <div className="category-options">
        {categories.map((category) => (
          <label key={category.id}>
            <input
              type="checkbox"
              checked={selectedIds.includes(
                category.id
              )}
              onChange={() =>
                toggleCategory(category.id)
              }
            />

            {category.name}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

// Blog categories. Tags are free-form; categories are fixed so the filter tabs stay tidy.
export const CATEGORIES = [
  { slug: "reflections", label: "Reflections" },
  { slug: "paper-review", label: "Paper Review" },
] as const;

export type Category = (typeof CATEGORIES)[number]["slug"];

export function isCategory(value: unknown): value is Category {
  return CATEGORIES.some((c) => c.slug === value);
}

export function categoryLabel(slug: Category) {
  return CATEGORIES.find((c) => c.slug === slug)!.label;
}

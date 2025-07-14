import { CATEGORY_CONFIG, CategoryConfig } from './category-config';

/**
 * Normalize input strings to category ids using synonyms (English & Hebrew)
 */
export function normalizeCategories(input: string | string[]): string[] {
  const inputs = Array.isArray(input) ? input : [input];
  const normalized: Set<string> = new Set();

  for (const str of inputs) {
    const lower = str.toLowerCase().trim();
    for (const cat of CATEGORY_CONFIG) {
      if (
        cat.englishSynonyms.some(syn => lower.includes(syn.toLowerCase())) ||
        cat.hebrewSynonyms.some(syn => lower.includes(syn)) ||
        lower === cat.name.toLowerCase()
      ) {
        normalized.add(cat.id);
      }
    }
  }
  return Array.from(normalized);
}

/**
 * Get a category config by its id
 */
export function getCategoryById(categoryId: string): CategoryConfig | undefined {
  return CATEGORY_CONFIG.find(cat => cat.id === categoryId);
}

/**
 * Get a category config by name or any synonym (case-insensitive)
 */
export function getCategoryByNameOrSynonym(input: string): CategoryConfig | undefined {
  const lower = input.toLowerCase().trim();
  return CATEGORY_CONFIG.find(cat =>
    cat.name.toLowerCase() === lower ||
    cat.englishSynonyms.some(syn => syn.toLowerCase() === lower) ||
    cat.hebrewSynonyms.some(syn => syn === input)
  );
}

/**
 * Get breadcrumbs (category names from root to leaf) for a given category id
 */
export function getCategoryBreadcrumbs(categoryId: string): string[] {
  const map: Record<string, CategoryConfig> = Object.fromEntries(
    CATEGORY_CONFIG.map(cat => [cat.id, cat])
  );
  const breadcrumbs: string[] = [];
  let current = map[categoryId];
  // For multi-parent, pick the first parent for breadcrumb (can be improved for UI)
  while (current) {
    breadcrumbs.unshift(current.name);
    if (current.parents && current.parents.length > 0) {
      current = map[current.parents[0]];
    } else {
      current = undefined;
    }
  }
  return breadcrumbs;
} 
/**
 * Match an arena leaderboard model name to a known model slug.
 * Order: exact alias → lowercase → strip date suffix → strip version suffix → null.
 */
export function matchArenaName(
  arenaName: string,
  allModels: { slug: string; aliases: string[] }[]
): string | null {
  const normalized = arenaName.trim();
  if (!normalized) return null;

  const lower = normalized.toLowerCase();

  for (const model of allModels) {
    const aliases = model.aliases || [];
    for (const a of aliases) {
      if (a === normalized) return model.slug;
      if (a.toLowerCase() === lower) return model.slug;
    }
    if (model.slug === normalized || model.slug.toLowerCase() === lower) {
      return model.slug;
    }
  }

  const stripDate = (s: string): string =>
    s
      .replace(/-(\d{4})-(\d{2})-(\d{2})$/, "")
      .replace(/-(\d{8})$/, "")
      .trim();
  const stripVersion = (s: string): string =>
    s
      .replace(/-(\d{3})$/, "")
      .replace(/-latest$/, "")
      .replace(/-preview$/, "")
      .replace(/-exp$/, "")
      .replace(/-beta$/i, "")
      .trim();

  const noDate = stripDate(normalized);
  const noDateLower = noDate.toLowerCase();

  for (const model of allModels) {
    const aliases = model.aliases || [];
    for (const a of aliases) {
      if (stripDate(a).toLowerCase() === noDateLower) return model.slug;
      if (stripVersion(a).toLowerCase() === stripVersion(normalized).toLowerCase())
        return model.slug;
    }
    if (stripDate(model.slug).toLowerCase() === noDateLower) return model.slug;
    if (
      stripVersion(model.slug).toLowerCase() ===
      stripVersion(normalized).toLowerCase()
    )
      return model.slug;
  }

  return null;
}

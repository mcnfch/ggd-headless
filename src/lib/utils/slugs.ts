// Utility functions for handling product slugs

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export function compareSlug(slug1: string, slug2: string): boolean {
  // Normalize both slugs before comparison
  const normalizedSlug1 = generateSlug(slug1);
  const normalizedSlug2 = generateSlug(slug2);
  return normalizedSlug1 === normalizedSlug2;
}

export function debugSlug(text: string): void {
  console.log(`[Slug Debug] Original text: "${text}"`);
  const slug = generateSlug(text);
  console.log(`[Slug Debug] Generated slug: "${slug}"`);
  console.log(`[Slug Debug] Character codes:`, [...slug].map(c => c.charCodeAt(0)));
}

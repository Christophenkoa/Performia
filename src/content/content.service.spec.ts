import { ContentService, getContent } from './content.service.js';
import { en } from './en.js';
import { fr } from './fr.js';

function shape(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(shape);
  if (value !== null && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, child]) => [key, shape(child)]),
    );
  }
  return typeof value;
}

function strings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value !== null && typeof value === 'object') return Object.values(value).flatMap(strings);
  return [];
}

describe('ContentService', () => {
  it('returns the content for each language', () => {
    const service = new ContentService();
    expect(service.get('fr')).toBe(fr);
    expect(service.get('en')).toBe(en);
    expect(getContent('en')).toBe(en);
  });

  it('keeps French and English structurally identical (same keys, same list lengths)', () => {
    expect(shape(en)).toEqual(shape(fr));
  });

  it('has no empty strings in either language', () => {
    expect(strings(fr).filter((s) => s.trim() === '')).toEqual([]);
    expect(strings(en).filter((s) => s.trim() === '')).toEqual([]);
  });

  it('uses the same icons in both languages', () => {
    const icons = (t: typeof fr) => [
      ...t.trustBlock.points,
      ...t.solution.blocks,
      ...t.difference.blocks,
      ...t.subjects.cards,
      ...t.partnership.benefits,
    ].map((item) => item.icon);
    expect(icons(en)).toEqual(icons(fr));
  });
});

import hbs from 'hbs';
import { registerHelpers } from './hbs-helpers.js';

const render = (source: string, context: object = {}) => hbs.handlebars.compile(source)(context);

describe('handlebars helpers', () => {
  beforeAll(() => registerHelpers());

  it('inc adds one (for 1-based step numbers)', () => {
    expect(render('{{inc 0}}-{{inc 3}}')).toBe('1-4');
  });

  it('times repeats a block n times', () => {
    expect(render('{{#times 3}}*{{/times}}')).toBe('***');
  });

  it('icon renders an inline, hidden svg with the given classes', () => {
    const out = render('{{icon "star" "h-4 w-4"}}');
    expect(out).toMatch(/^<svg [^>]*class="h-4 w-4"[^>]*aria-hidden="true"/);
    expect(out).toContain('<path');
  });

  it('icon accepts the name from the context', () => {
    expect(render('{{icon this.icon "x"}}', { icon: 'users' })).toContain('<svg');
  });

  it('icon fails loudly on unknown names', () => {
    expect(() => render('{{icon "nope"}}')).toThrow('Unknown icon: nope');
  });
});

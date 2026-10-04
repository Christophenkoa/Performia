import hbs from 'hbs';
import { renderIcon } from '../content/icons.js';

export function registerHelpers(): void {
  hbs.registerHelper('inc', (value: number) => value + 1);

  // {{icon "name" "classes"}}: the class string comes from templates only, never from user input.
  hbs.registerHelper('icon', (name: unknown, className: unknown) => {
    const classes = typeof className === 'string' ? className : '';
    return new hbs.handlebars.SafeString(renderIcon(String(name), classes));
  });
}

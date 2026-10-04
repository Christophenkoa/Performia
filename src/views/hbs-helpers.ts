import hbs from 'hbs';
import { renderIcon } from '../content/icons.js';

interface BlockOptions {
  fn: (context: unknown) => string;
}

export function registerHelpers(): void {
  hbs.registerHelper('inc', (value: number) => value + 1);

  hbs.registerHelper('times', function (this: unknown, count: number, options: BlockOptions) {
    let out = '';
    for (let i = 0; i < count; i++) out += options.fn(this);
    return out;
  });

  // {{icon "name" "classes"}}: the class string comes from templates only, never from user input.
  hbs.registerHelper('icon', (name: unknown, className: unknown) => {
    const classes = typeof className === 'string' ? className : '';
    return new hbs.handlebars.SafeString(renderIcon(String(name), classes));
  });
}

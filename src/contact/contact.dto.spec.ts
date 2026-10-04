import { isHoneypotFilled, pickContactValues, validateContact } from './contact.dto.js';

const valid = {
  name: 'Awa Nkoa',
  email: 'awa@example.com',
  phone: '+237 651 544 974',
  subject: 'Inscription en Seconde',
  message: 'Bonjour, je souhaite inscrire ma fille en Seconde.',
};

describe('validateContact', () => {
  it('accepts a valid request, trims values and drops unknown fields', async () => {
    const result = await validateContact({ ...valid, name: '  Awa Nkoa  ', _csrf: 'token', extra: 'x' });
    expect(result).toEqual({ ok: true, value: valid });
  });

  it.each([
    ['name', { name: 'A' }],
    ['name', { name: 'A'.repeat(101) }],
    ['email', { email: 'not-an-email' }],
    ['phone', { phone: '1234' }],
    ['phone', { phone: 'call me maybe' }],
    ['subject', { subject: 'Hi' }],
    ['message', { message: 'Too short' }],
    ['message', { message: 'x'.repeat(2001) }],
  ])('rejects an invalid %s', async (field, override) => {
    const result = await validateContact({ ...valid, ...override });
    expect(result).toEqual({ ok: false, fields: [field] });
  });

  it('reports every missing field in form order', async () => {
    const result = await validateContact({});
    expect(result).toEqual({ ok: false, fields: ['name', 'email', 'phone', 'subject', 'message'] });
  });

  it('treats whitespace-only values as missing', async () => {
    const result = await validateContact({ ...valid, subject: '     ' });
    expect(result).toEqual({ ok: false, fields: ['subject'] });
  });

  it('rejects repeated fields (arrays) instead of crashing', async () => {
    const result = await validateContact({ ...valid, name: ['Awa', 'Nkoa'] });
    expect(result).toEqual({ ok: false, fields: ['name'] });
  });
});

describe('isHoneypotFilled', () => {
  it('is false when the field is absent or empty', () => {
    expect(isHoneypotFilled({})).toBe(false);
    expect(isHoneypotFilled({ website: '' })).toBe(false);
    expect(isHoneypotFilled({ website: '   ' })).toBe(false);
  });

  it('is true when a bot filled it', () => {
    expect(isHoneypotFilled({ website: 'https://spam.example' })).toBe(true);
    expect(isHoneypotFilled({ website: ['a'] })).toBe(true);
  });
});

describe('pickContactValues', () => {
  it('keeps only known string fields for re-filling the form', () => {
    expect(pickContactValues({ name: 'Awa', email: ['x'], _csrf: 't', website: 'w' })).toEqual({ name: 'Awa' });
  });
});

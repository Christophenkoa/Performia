import { plainToInstance, Transform } from 'class-transformer';
import { IsEmail, IsString, Length, Matches, MaxLength, validate } from 'class-validator';
import type { ContactField } from '../content/content.types.js';

const trim = ({ value }: { value: unknown }) => (typeof value === 'string' ? value.trim() : value);

export class ContactDto {
  @Transform(trim)
  @IsString()
  @Length(2, 100)
  name: string;

  @Transform(trim)
  @IsEmail()
  @MaxLength(254)
  email: string;

  @Transform(trim)
  @IsString()
  @Matches(/^[0-9+()\s.-]{8,30}$/)
  phone: string;

  @Transform(trim)
  @IsString()
  @Length(3, 150)
  subject: string;

  @Transform(trim)
  @IsString()
  @Length(10, 2000)
  message: string;
}

export const CONTACT_FIELDS: readonly ContactField[] = ['name', 'email', 'phone', 'subject', 'message'];

export type ContactValues = Record<ContactField, string>;

export type ContactValidationResult = { ok: true; value: ContactValues } | { ok: false; fields: ContactField[] };

export async function validateContact(body: Record<string, unknown>): Promise<ContactValidationResult> {
  const dto = plainToInstance(ContactDto, body);
  const errors = await validate(dto, { whitelist: true });
  if (errors.length > 0) {
    return { ok: false, fields: CONTACT_FIELDS.filter((field) => errors.some((e) => e.property === field)) };
  }
  const { name, email, phone, subject, message } = dto;
  return { ok: true, value: { name, email, phone, subject, message } };
}

export function isHoneypotFilled(body: Record<string, unknown>): boolean {
  const value = body.website;
  if (value === undefined || value === null) return false;
  return typeof value === 'string' ? value.trim() !== '' : true;
}

export function pickContactValues(body: Record<string, unknown>): Partial<Record<ContactField, string>> {
  const values: Partial<Record<ContactField, string>> = {};
  for (const field of CONTACT_FIELDS) {
    const value = body[field];
    if (typeof value === 'string') values[field] = value;
  }
  return values;
}

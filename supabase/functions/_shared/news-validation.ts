import sanitizeHtml from 'npm:sanitize-html@2.18.0';

export function cleanNewsBody(body: unknown): string {
  if (typeof body !== 'string' || body.trim().length < 10 || body.length > 100000) throw new Error('Invalid news body');
  return sanitizeHtml(body.trim(), { allowedTags: ['a','b','strong','i','em','u','br','span'], allowedAttributes: { a: ['href','title'] }, allowedSchemes: ['http','https','mailto'], allowProtocolRelative: false });
}

export function validNewsTitle(title: unknown): title is string {
  return typeof title === 'string' && title.trim().length >= 3 && title.trim().length <= 300;
}

export function cleanImageUrl(value: unknown): string | null {
  if (value == null || value === '') return null;
  if (typeof value !== 'string' || value.length > 2000) throw new Error('Invalid image URL');
  const url = new URL(value.trim());
  if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid image URL');
  return url.href;
}

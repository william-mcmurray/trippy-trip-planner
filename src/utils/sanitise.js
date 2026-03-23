export function sanitiseUserInput(input, maxLength = 500) {
  if (typeof input !== 'string') return '';
  return input
    .trim()
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars
    .replace(/```/g, '')                                  // code fences
    .replace(/\bignore\s+(all\s+)?(previous|prior|above)\s+instructions?\b/gi, '')
    .replace(/\b(system|assistant|user)\s*:/gi, '')
    .slice(0, maxLength);
}

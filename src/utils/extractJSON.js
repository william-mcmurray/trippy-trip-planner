export function extractJSON(rawText) {
  // Strip markdown code fences if present
  const stripped = rawText
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim();

  try {
    return { ok: true, data: JSON.parse(stripped) };
  } catch (e) {
    // Attempt to find a JSON object or array within the text
    const match = stripped.match(/(\{[\s\S]*\}|\[[\s\S]*\])/);
    if (match) {
      try {
        return { ok: true, data: JSON.parse(match[1]) };
      } catch (e2) {
        // fall through
      }
    }
    return { ok: false, error: 'Response was not valid JSON', raw: stripped };
  }
}

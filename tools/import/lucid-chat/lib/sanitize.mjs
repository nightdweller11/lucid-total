/**
 * Privacy filter applied to every source text the moment it is read, so nothing downstream (items, evidence,
 * decisions, the report) can carry an email address, a phone number or a credential-looking token.
 * Each strip is counted per kind; the counts go into report.md.
 */

// An email address. Package specifiers such as `react@18.3.1` or `@lucid/ui` do not match: the domain part
// needs a dotted name ending in letters, and the local part must touch the `@`.
const EMAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}\b/g;

// International numbers (+972 54 123 4567, +1-415-555-0100) including partially elided ones ("+972 54 …"),
// and Israeli-style local mobiles (054-1234567). Dates (2026-10-22), hashes and counts do not match: an
// international number needs the leading `+`, a local one the 0X prefix with exactly seven digits after it.
const PHONE_INTL = /\+\d{1,3}(?:[\s.-]?\(?\d{1,4}\)?)(?:[\s.-]?(?:\d{2,4}|…|\.\.\.)){1,4}/g;
const PHONE_LOCAL = /\b0\d{1,2}-\d{7}\b/g;

// Credential-looking tokens: well-known key prefixes and PEM private keys. The Lucid Chat repository runs
// gitleaks, so these should never appear; the filter is a second fence.
const SECRET =
  /\b(?:sk|rk|pk)_(?:live|test)_[A-Za-z0-9]{16,}\b|\b(?:sk-(?:ant-)?[A-Za-z0-9_-]{20,})|\bgh[pousr]_[A-Za-z0-9]{30,}\b|\bgithub_pat_[A-Za-z0-9_]{30,}\b|\bxox[abprs]-[A-Za-z0-9-]{10,}\b|\bAKIA[0-9A-Z]{16}\b|-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----/g;

/** Create a sanitizer with its own counters (one per import run). */
export function createSanitizer() {
  const counts = { email: 0, phone: 0, secret: 0 };
  /** @param {string} text */
  function clean(text) {
    if (typeof text !== 'string' || !text) return text;
    let out = text.replace(SECRET, () => {
      counts.secret += 1;
      return '[secret removed]';
    });
    out = out.replace(EMAIL, () => {
      counts.email += 1;
      return '[email removed]';
    });
    out = out.replace(PHONE_INTL, (m) => {
      // "+1" alone or "+3 rows" style counts are not phone numbers: require at least 6 digits or an ellipsis.
      const digits = m.replace(/\D/g, '').length;
      if (digits < 6 && !/…|\.\.\./.test(m)) return m;
      counts.phone += 1;
      return '[phone removed]';
    });
    out = out.replace(PHONE_LOCAL, () => {
      counts.phone += 1;
      return '[phone removed]';
    });
    return out;
  }
  return { clean, counts };
}

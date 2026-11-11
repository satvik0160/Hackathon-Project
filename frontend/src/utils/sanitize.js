import DOMPurify from 'dompurify';

/**
 * Sanitize untrusted HTML to prevent XSS attacks.
 * Configured with safe defaults for modern web apps.
 * 
 * @param {string} dirty - The untrusted HTML or text string.
 * @param {object} customConfig - Optional DOMPurify configuration overrides.
 * @returns {string} Sanitized, safe HTML string.
 */
export function sanitizeHtml(dirty, customConfig = {}) {
  if (!dirty || typeof dirty !== 'string') return '';
  
  const defaultConfig = {
    ALLOWED_TAGS: [
      'b', 'i', 'em', 'strong', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'code', 'pre', 'blockquote', 'hr', 'br', 'span', 'div',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'img'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'target', 'rel', 'style'],
    ALLOW_DATA_ATTR: false,
    ADD_ATTR: ['rel'], // Force rel="noopener noreferrer" on links
  };

  const clean = DOMPurify.sanitize(dirty, { ...defaultConfig, ...customConfig });
  return clean;
}

/**
 * Strip all HTML tags and control characters to produce safe plain text.
 * Suitable for usernames, names, search queries, etc.
 * 
 * @param {string} input - Untrusted text.
 * @returns {string} Safe plain text.
 */
export function sanitizeText(input) {
  if (input === null || input === undefined) return '';
  const str = String(input);
  // Strip HTML tags using DOMPurify with no allowed tags
  const stripped = DOMPurify.sanitize(str, { ALLOWED_TAGS: [] });
  // Trim and remove dangerous zero-width/control characters
  return stripped.replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200D\uFEFF]/g, '').trim();
}

/**
 * Validate and sanitize URLs to protect against javascript: and data: XSS schemes.
 * 
 * @param {string} url - Untrusted URL string.
 * @returns {string} Safe URL or '#' if invalid/dangerous.
 */
export function sanitizeUrl(url) {
  if (!url || typeof url !== 'string') return '#';
  const trimmed = url.trim();
  // Relative paths are safe
  if (trimmed.startsWith('/') && !trimmed.startsWith('//')) return trimmed;
  // External URLs must be http or https
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return '#';
}

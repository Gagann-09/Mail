import DOMPurify from 'dompurify';

/**
 * Email HTML Sanitizer
 * 
 * Centralized sanitization configuration for rendering untrusted email content.
 * This module ensures consistent security boundaries across the application.
 * 
 * Security requirements from Architecture.md:
 * - Prevent script execution
 * - Prevent application-origin access
 * - Prevent credential access
 * - Prevent unsafe event handlers
 * - Prevent malicious embedded content
 * - Email HTML must not execute with application privileges
 */

// Tags that are explicitly forbidden in email content
const FORBIDDEN_TAGS = [
  'script', 'style', 'iframe', 'object', 'embed', 'form', 'input', 'button',
  'select', 'textarea', 'option', 'optgroup', 'fieldset', 'legend',
  'label', 'datalist', 'output', 'meter', 'progress',
  'link', 'meta', 'base', 'applet', 'param', 'source', 'track',
  'audio', 'video', 'canvas', 'map', 'area', 'slot', 'template',
  'svg', 'rect', 'circle', 'ellipse', 'line', 'polyline', 'polygon', 'path',
  'text', 'tspan', 'g', 'defs', 'use', 'symbol', 'marker', 'pattern',
  'mask', 'clipPath', 'filter', 'foreignObject', 'image', 'view',
];

// Attributes that are explicitly forbidden
const FORBIDDEN_ATTR = [
  'style', // Block all style attributes to prevent CSS-based XSS
  'download', // Prevent forced downloads
  'hreflang', // Prevent language tracking
  'type', // Prevent MIME type confusion
  'ping', // Prevent tracking pings
  'referrerpolicy', // Prevent referrer manipulation
  'onload', 'onerror', 'onclick', 'onmouseover', 'onmouseout',
  'onfocus', 'onblur', 'onchange', 'onsubmit', 'onreset',
  'onselect', 'onkeydown', 'onkeyup', 'onkeypress',
  'onmousedown', 'onmouseup', 'onmousemove', 'ondblclick',
  'oncontextmenu', 'onwheel', 'onscroll', 'onresize',
  'onanimationstart', 'onanimationend', 'ontransitionend',
  'onpointerdown', 'onpointerup', 'onpointermove',
  'ontouchstart', 'ontouchend', 'ontouchmove',
  'onformdata', 'oninput', 'oninvalid', 'onbeforeinput',
  'onabort', 'oncanplay', 'oncanplaythrough', 'ondurationchange',
  'onemptied', 'onended', 'onloadeddata', 'onloadedmetadata',
  'onloadstart', 'onpause', 'onplay', 'onplaying', 'onprogress',
  'onratechange', 'onseeked', 'onseeking', 'onstalled',
  'onsuspend', 'ontimeupdate', 'onvolumechange', 'onwaiting',
  'formaction', 'formenctype', 'formmethod', 'formnovalidate',
  'formtarget',
  // href and src are handled by URI_POLICIES to allow safe URLs
];

// URI policies to prevent javascript: and other dangerous schemes
// Return the value unchanged for safe URLs, empty string to remove attribute
const URI_POLICIES: Record<string, (value: string, ...args: any[]) => string> = {
  href: (value: string) => {
    const lower = value.trim().toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || 
        lower.startsWith('data:') || lower.startsWith('blob:') ||
        lower.startsWith('filesystem:')) {
      return ''; // Block dangerous URIs
    }
    return value;
  },
  src: (value: string) => {
    const lower = value.trim().toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || 
        lower.startsWith('data:') || lower.startsWith('blob:') ||
        lower.startsWith('filesystem:')) {
      return ''; // Block dangerous URIs
    }
    return value;
  },
  action: () => '', // Block form actions entirely
  formaction: () => '', // Block formaction entirely
  background: (value: string) => {
    const lower = value.trim().toLowerCase();
    if (lower.startsWith('javascript:') || lower.startsWith('vbscript:') || 
        lower.startsWith('data:')) {
      return '';
    }
    return value;
  },
};

// DOMPurify configuration
const purifyConfig = {
  FORBID_TAGS: FORBIDDEN_TAGS,
  FORBID_ATTR: FORBIDDEN_ATTR,
  URI_POLICIES: URI_POLICIES,
  ALLOW_UNKNOWN_PROTOCOLS: false,
  SANITIZE_DOM: true,
  KEEP_CONTENT: false, // Remove forbidden tag content entirely
  RETURN_DOM: false,
  RETURN_DOM_FRAGMENT: false,
  RETURN_TRUSTED_TYPE: false,
};

/**
 * Sanitize email HTML content for safe rendering
 * @param html - Raw HTML from email message
 * @returns Sanitized HTML string safe for dangerouslySetInnerHTML
 */
export function sanitizeEmailHtml(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  return DOMPurify.sanitize(html, purifyConfig);
}

/**
 * Sanitize email HTML with additional link hardening
 * Applies target="_blank" and rel="noopener noreferrer" to all links
 * @param html - Raw HTML from email message
 * @returns Sanitized HTML with secured links
 */
export function sanitizeEmailHtmlWithLinks(html: string): string {
  if (!html || typeof html !== 'string') {
    return '';
  }
  
  const sanitized = DOMPurify.sanitize(html, purifyConfig);
  
  // Apply link hardening via DOMPurify hook
  // Note: This requires a second pass or hook
  return sanitized;
}

/**
 * Create a DOMPurify hook for link hardening
 * Should be called once during app initialization
 */
export function initLinkHardening(): void {
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.hasAttribute('href')) {
      node.setAttribute('target', '_blank');
      node.setAttribute('rel', 'noopener noreferrer');
    }
  });
}

// Initialize link hardening on module load
initLinkHardening();

export default {
  sanitizeEmailHtml,
  sanitizeEmailHtmlWithLinks,
  initLinkHardening,
};
/**
 * Attachment metadata safety policy.
 *
 * This is a display and interaction boundary for untrusted provider metadata.
 * It does not inspect attachment bytes and therefore never verifies that a file
 * is content-safe. Content scanning and isolated viewers remain server/browser
 * responsibilities.
 */

const FALLBACK_FILENAME = 'unnamed-attachment';
const FALLBACK_MIME_TYPE = 'application/octet-stream';
const MAX_FILENAME_LENGTH = 255;
const MAX_MIME_TYPE_LENGTH = 127;
const MAX_ATTACHMENT_SIZE = 100 * 1024 * 1024;

// Dangerous file extensions that must not be treated as safe to preview or open.
export const DANGEROUS_EXTENSIONS = new Set([
  'exe', 'com', 'bat', 'cmd', 'scr', 'pif', 'app', 'msi', 'msp', 'mst',
  'js', 'jse', 'vbs', 'vbe', 'wsf', 'wsh', 'ps1', 'ps1xml', 'ps2', 'ps2xml',
  'psc1', 'psc2', 'msh', 'msh1', 'msh2', 'mshxml', 'msh1xml', 'msh2xml',
  'jar', 'py', 'pyc', 'pyo', 'pyw', 'rb', 'pl', 'php', 'php3', 'php4', 'php5',
  'sh', 'bash', 'zsh', 'fish', 'csh', 'tcsh', 'ksh',
  'docm', 'dotm', 'xlsm', 'xltm', 'xlam', 'pptm', 'potm', 'ppam', 'ppsm',
  'lnk', 'url', 'webloc', 'desktop', 'appref-ms',
  'zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'cab', 'iso', 'dmg', 'pkg',
  'hta', 'msc', 'reg', 'inf', 'ins', 'isp', 'its', 'mad', 'maf', 'mag', 'mam',
  'maq', 'mar', 'mas', 'mat', 'mau', 'mav', 'maw', 'mcf', 'mda', 'mdb', 'mde',
  'mdt', 'mdw', 'mdz', 'ops', 'pcd', 'prf', 'prg', 'pwn', 'scf', 'shb', 'shs',
  'tmp', 'vb', 'ws', 'wsc',
]);

export const SUSPICIOUS_EXTENSIONS = new Set([
  'pdf', 'doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'rtf', 'odt', 'ods', 'odp',
  'odg', 'html', 'htm', 'mht', 'mhtml', 'xml', 'xsl', 'xslt', 'svg', 'eps', 'ps',
  'swf', 'fla', 'apk', 'ipa', 'appx', 'msix', 'dll', 'so', 'dylib', 'bin', 'dat',
  'sys', 'drv',
]);

export const KNOWN_SAFE_EXTENSIONS = new Set([
  'txt', 'csv', 'json', 'md', 'markdown', 'png', 'jpg', 'jpeg', 'gif', 'webp',
  'bmp', 'ico', 'tiff', 'tif', 'mp3', 'wav', 'ogg', 'flac', 'm4a', 'mp4', 'webm',
  'mov', 'avi', 'mkv',
]);

const DANGEROUS_MIME_TYPES = new Set([
  'application/x-msdownload', 'application/x-msdos-program',
  'application/x-shockwave-flash', 'application/x-java-applet',
  'application/x-python-code', 'application/x-perl', 'application/x-sh',
  'application/x-csh', 'text/x-python', 'text/x-perl', 'text/x-shellscript',
]);

const PREVIEW_MIME_EXTENSIONS: Readonly<Record<string, readonly string[]>> = {
  'image/png': ['png'],
  'image/jpeg': ['jpg', 'jpeg'],
  'image/gif': ['gif'],
  'image/webp': ['webp'],
  'image/bmp': ['bmp'],
  'image/tiff': ['tif', 'tiff'],
  'text/plain': ['txt', 'md', 'markdown'],
  'text/csv': ['csv'],
  'text/markdown': ['md', 'markdown'],
  'application/json': ['json'],
  'application/pdf': ['pdf'],
};

const MIME_TYPE_PATTERN = /^[a-z0-9][a-z0-9!#$&^_.+-]*\/[a-z0-9][a-z0-9!#$&^_.+-]*$/i;
const MIME_PARAMETER_PATTERN = /^[a-z0-9!#$&^_.+-]+\s*=\s*(?:[a-z0-9!#$&^_.+-]+|"[^"\r\n]*")$/i;

export interface AttachmentSafetyInput {
  filename?: unknown;
  contentType?: unknown;
  size?: unknown;
  url?: unknown;
}

export interface AttachmentSafetyResult {
  /** True only when no blocking metadata policy error was found. */
  isSafe: boolean;
  /** Metadata is never a content scan, so this is always false. */
  isVerifiedSafe: false;
  /** Whether the required filename, MIME type, and size metadata was well formed. */
  hasCompleteMetadata: boolean;
  warnings: string[];
  errors: string[];
  sanitizedFilename: string;
  sanitizedContentType: string;
  sanitizedSize: number;
  sanitizedUrl: string;
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

/**
 * Returns a safe display basename. Path segments are intentionally discarded
 * rather than rewritten, so `../../etc/passwd` is displayed as `passwd`.
 */
export function sanitizeFilename(filename: unknown): string {
  if (!isNonEmptyString(filename)) return FALLBACK_FILENAME;

  const pathSegments = filename
    .replace(/[\x00-\x1F\x7F]/g, '')
    .trim()
    .split(/[\\/]+/)
    .filter(Boolean);
  const basename = pathSegments[pathSegments.length - 1]?.trim() ?? '';

  if (!basename || basename === '.' || basename === '..' || /^\.+$/.test(basename)) {
    return FALLBACK_FILENAME;
  }

  const lastDot = basename.lastIndexOf('.');
  if (lastDot === 0 && basename.length > 1) return basename.slice(0, MAX_FILENAME_LENGTH);
  if (basename.length <= MAX_FILENAME_LENGTH) return basename;

  if (lastDot > 0 && lastDot < basename.length - 1) {
    const extension = basename.slice(lastDot);
    if (extension.length < MAX_FILENAME_LENGTH) {
      return `${basename.slice(0, MAX_FILENAME_LENGTH - extension.length)}${extension}`;
    }
  }

  return basename.slice(0, MAX_FILENAME_LENGTH);
}

export function getFileExtension(filename: unknown): string {
  const sanitized = sanitizeFilename(filename);
  const lastDot = sanitized.lastIndexOf('.');
  if (lastDot <= 0 || lastDot === sanitized.length - 1) return '';
  return sanitized.slice(lastDot + 1).toLowerCase();
}

/**
 * Accepts a valid MIME type with optional valid parameters, then normalizes it
 * to the lowercase media type only. Parameters never influence safety policy.
 */
export function sanitizeMimeType(contentType: unknown): string {
  if (!isNonEmptyString(contentType) || contentType.length > MAX_MIME_TYPE_LENGTH) {
    return FALLBACK_MIME_TYPE;
  }

  const parts = contentType.trim().split(';');
  const mediaType = parts.shift()?.trim();
  if (!mediaType || !MIME_TYPE_PATTERN.test(mediaType) || !parts.every(parameter => MIME_PARAMETER_PATTERN.test(parameter.trim()))) {
    return FALLBACK_MIME_TYPE;
  }

  return mediaType.toLowerCase();
}

export function sanitizeSize(size: unknown): number {
  if (typeof size !== 'number' || !Number.isFinite(size) || size < 0) return 0;
  return Math.min(Math.floor(size), MAX_ATTACHMENT_SIZE);
}

/** Allows only same-origin http(s) attachment URLs. */
export function sanitizeAttachmentUrl(url: unknown, origin: string): string {
  if (!isNonEmptyString(url)) return '';

  try {
    const parsedOrigin = new URL(origin).origin;
    const parsedUrl = new URL(url, parsedOrigin);
    if (parsedUrl.origin !== parsedOrigin || !['http:', 'https:'].includes(parsedUrl.protocol)) return '';
    return parsedUrl.toString();
  } catch {
    return '';
  }
}

function hasPathSegments(filename: unknown): boolean {
  return typeof filename === 'string' && /[\\/]/.test(filename);
}

function hasControlCharacters(filename: unknown): boolean {
  return typeof filename === 'string' && /[\x00-\x1F\x7F]/.test(filename);
}

function isValidSize(size: unknown): size is number {
  return typeof size === 'number' && Number.isFinite(size) && Number.isInteger(size) && size >= 0;
}

function expectedMimeType(extension: string): string | undefined {
  const mimeTypes: Readonly<Record<string, string>> = {
    pdf: 'application/pdf', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg',
    gif: 'image/gif', webp: 'image/webp', txt: 'text/plain', csv: 'text/csv',
    json: 'application/json', html: 'text/html', htm: 'text/html', xml: 'application/xml',
    zip: 'application/zip', mp3: 'audio/mpeg', mp4: 'video/mp4',
  };
  return mimeTypes[extension];
}

/**
 * Assess untrusted metadata. `isSafe` means only "not blocked by this metadata
 * policy"; it never certifies the file contents as safe.
 */
export function assessAttachmentSafety(
  attachment: AttachmentSafetyInput,
  origin?: string,
): AttachmentSafetyResult {
  const warnings: string[] = [];
  const errors: string[] = [];
  const filename = sanitizeFilename(attachment.filename);
  const contentType = sanitizeMimeType(attachment.contentType);
  const size = sanitizeSize(attachment.size);
  const extension = getFileExtension(filename);
  const sanitizedUrl = origin ? sanitizeAttachmentUrl(attachment.url, origin) : '';

  if (!isNonEmptyString(attachment.filename) || filename === FALLBACK_FILENAME) {
    errors.push('Missing or invalid attachment filename');
  } else if (hasPathSegments(attachment.filename)) {
    errors.push('Attachment filename must not contain path segments');
  } else if (hasControlCharacters(attachment.filename)) {
    errors.push('Attachment filename contains control characters');
  }

  if (!isNonEmptyString(attachment.contentType) || contentType === FALLBACK_MIME_TYPE) {
    errors.push('Missing or invalid attachment MIME type');
  }

  if (!isValidSize(attachment.size)) errors.push('Missing or invalid attachment size');
  if (attachment.url !== undefined && (!origin || !sanitizedUrl)) errors.push('Missing or unsafe attachment URL');

  if (DANGEROUS_EXTENSIONS.has(extension)) {
    errors.push(`Dangerous file extension: .${extension}`);
  } else if (SUSPICIOUS_EXTENSIONS.has(extension)) {
    warnings.push(`Potentially risky file type: .${extension}`);
  }

  if (DANGEROUS_MIME_TYPES.has(contentType)) errors.push(`Dangerous MIME type: ${contentType}`);

  const doubleExtension = filename.match(/\.([a-z0-9]+)\.([a-z0-9]+)$/i);
  if (doubleExtension) {
    const [, innerExtension, outerExtension] = doubleExtension;
    if (DANGEROUS_EXTENSIONS.has(outerExtension.toLowerCase())) {
      errors.push(`Double extension detected with dangerous outer extension: .${innerExtension}.${outerExtension}`);
    } else if (SUSPICIOUS_EXTENSIONS.has(outerExtension.toLowerCase())) {
      warnings.push(`Double extension detected: .${innerExtension}.${outerExtension}`);
    }
  }

  if (size === 0) warnings.push('Attachment has zero size');
  if (size > 50 * 1024 * 1024) warnings.push('Large attachment (>50MB)');

  const expectedMime = expectedMimeType(extension);
  if (expectedMime && contentType !== FALLBACK_MIME_TYPE && contentType !== expectedMime) {
    warnings.push(`MIME type (${contentType}) may not match file extension (.${extension})`);
  }

  return {
    isSafe: errors.length === 0,
    isVerifiedSafe: false,
    hasCompleteMetadata: isNonEmptyString(attachment.filename)
      && filename !== FALLBACK_FILENAME
      && !hasPathSegments(attachment.filename)
      && !hasControlCharacters(attachment.filename)
      && isNonEmptyString(attachment.contentType)
      && contentType !== FALLBACK_MIME_TYPE
      && isValidSize(attachment.size)
      && (attachment.url === undefined || Boolean(origin && sanitizedUrl)),
    warnings,
    errors,
    sanitizedFilename: filename,
    sanitizedContentType: contentType,
    sanitizedSize: size,
    sanitizedUrl,
  };
}

export function getFileTypeDescription(contentType: unknown, filename: unknown): string {
  const extension = getFileExtension(filename);
  if (extension) return extension.toUpperCase();
  const mimeType = sanitizeMimeType(contentType);
  return mimeType === FALLBACK_MIME_TYPE ? 'FILE' : (mimeType.split('/')[1]?.toUpperCase() ?? 'FILE');
}

/**
 * Generic previews are an explicit allow-list. HTML, SVG, XML, and unknown
 * types are blocked even when their top-level MIME type is `text/` or `image/`.
 */
export function shouldBlockPreview(contentType: unknown, filename: unknown): boolean {
  const mimeType = sanitizeMimeType(contentType);
  const extension = getFileExtension(filename);
  if (DANGEROUS_EXTENSIONS.has(extension) || DANGEROUS_MIME_TYPES.has(mimeType)) return true;
  return !PREVIEW_MIME_EXTENSIONS[mimeType]?.includes(extension);
}

export default {
  sanitizeFilename,
  sanitizeMimeType,
  sanitizeSize,
  sanitizeAttachmentUrl,
  assessAttachmentSafety,
  getFileExtension,
  getFileTypeDescription,
  shouldBlockPreview,
  DANGEROUS_EXTENSIONS,
  SUSPICIOUS_EXTENSIONS,
  KNOWN_SAFE_EXTENSIONS,
};

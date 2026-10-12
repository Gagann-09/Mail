import { describe, expect, it } from 'vitest';
import {
  assessAttachmentSafety,
  getFileExtension,
  getFileTypeDescription,
  sanitizeAttachmentUrl,
  sanitizeFilename,
  sanitizeMimeType,
  sanitizeSize,
  shouldBlockPreview,
} from './attachment-safety';

describe('attachment metadata safety policy', () => {
  it('uses only the basename for display when metadata contains path traversal', () => {
    expect(sanitizeFilename('../../etc/passwd')).toBe('passwd');
    expect(sanitizeFilename('..\\windows\\system32')).toBe('system32');
    expect(sanitizeFilename('path/to/file.pdf')).toBe('file.pdf');
    expect(getFileExtension('../../etc/passwd')).toBe('');
  });

  it('normalizes valid filenames and rejects unusable values', () => {
    expect(sanitizeFilename(' document.pdf ')).toBe('document.pdf');
    expect(sanitizeFilename('file\x00name.pdf')).toBe('filename.pdf');
    expect(sanitizeFilename('.pdf')).toBe('.pdf');
    expect(sanitizeFilename('.')).toBe('unnamed-attachment');
    expect(sanitizeFilename(null)).toBe('unnamed-attachment');
    expect(sanitizeFilename('a'.repeat(300) + '.pdf')).toHaveLength(255);
  });

  it('accepts valid MIME parameters but strips them before policy evaluation', () => {
    expect(sanitizeMimeType('APPLICATION/PDF; charset=utf-8')).toBe('application/pdf');
    expect(sanitizeMimeType('text/plain; charset="utf-8"')).toBe('text/plain');
    expect(sanitizeMimeType('text/plain; invalid')).toBe('application/octet-stream');
    expect(sanitizeMimeType('application/pdf\r\nX-Test: 1')).toBe('application/octet-stream');
    expect(sanitizeMimeType(null)).toBe('application/octet-stream');
  });

  it('sanitizes valid finite sizes and rejects malformed sizes', () => {
    expect(sanitizeSize(1024.9)).toBe(1024);
    expect(sanitizeSize(-1)).toBe(0);
    expect(sanitizeSize(Number.NaN)).toBe(0);
    expect(sanitizeSize('100')).toBe(0);
    expect(sanitizeSize(200 * 1024 * 1024)).toBe(100 * 1024 * 1024);
  });

  it('allows only same-origin http(s) URLs', () => {
    const origin = 'https://mail.example.com';
    expect(sanitizeAttachmentUrl('/attachments/file.pdf', origin)).toBe('https://mail.example.com/attachments/file.pdf');
    expect(sanitizeAttachmentUrl('https://mail.example.com/file.pdf', origin)).toBe('https://mail.example.com/file.pdf');
    expect(sanitizeAttachmentUrl('https://evil.example/file.pdf', origin)).toBe('');
    expect(sanitizeAttachmentUrl('javascript:alert(1)', origin)).toBe('');
    expect(sanitizeAttachmentUrl(null, origin)).toBe('');
  });

  it('treats missing, malformed, and path-based metadata as blocking errors', () => {
    const missing = assessAttachmentSafety({});
    expect(missing.isSafe).toBe(false);
    expect(missing.isVerifiedSafe).toBe(false);
    expect(missing.errors).toContain('Missing or invalid attachment filename');
    expect(missing.errors).toContain('Missing or invalid attachment MIME type');
    expect(missing.errors).toContain('Missing or invalid attachment size');

    const traversing = assessAttachmentSafety({
      filename: '../malware.exe', contentType: 'application/octet-stream', size: 1024,
    });
    expect(traversing.sanitizedFilename).toBe('malware.exe');
    expect(traversing.errors).toContain('Attachment filename must not contain path segments');
    expect(traversing.errors).toContain('Dangerous file extension: .exe');

    const controlCharacters = assessAttachmentSafety({
      filename: 'photo\x00.png', contentType: 'image/png', size: 1024,
    });
    expect(controlCharacters.isSafe).toBe(false);
    expect(controlCharacters.errors).toContain('Attachment filename contains control characters');

    const fractionalSize = assessAttachmentSafety({
      filename: 'photo.png', contentType: 'image/png', size: 1024.5,
    });
    expect(fractionalSize.isSafe).toBe(false);
    expect(fractionalSize.errors).toContain('Missing or invalid attachment size');
  });

  it('keeps cautions distinct from blocking errors', () => {
    const result = assessAttachmentSafety({
      filename: 'document.pdf', contentType: 'application/pdf', size: 0,
    });
    expect(result.isSafe).toBe(true);
    expect(result.isVerifiedSafe).toBe(false);
    expect(result.warnings).toContain('Potentially risky file type: .pdf');
    expect(result.warnings).toContain('Attachment has zero size');
    expect(result.errors).toHaveLength(0);
  });

  it('blocks dangerous metadata and flags MIME mismatches', () => {
    const dangerous = assessAttachmentSafety({
      filename: 'invoice.pdf.exe', contentType: 'image/png', size: 1024,
    });
    expect(dangerous.isSafe).toBe(false);
    expect(dangerous.errors).toContain('Dangerous file extension: .exe');
    expect(dangerous.errors.some(error => error.startsWith('Double extension detected'))).toBe(true);

    const mismatch = assessAttachmentSafety({
      filename: 'document.pdf', contentType: 'image/png', size: 1024,
    });
    expect(mismatch.warnings.some(warning => warning.startsWith('MIME type'))).toBe(true);
  });

  it('assesses URL metadata when a rendering boundary provides its origin', () => {
    const unsafeUrl = assessAttachmentSafety({
      filename: 'photo.png', contentType: 'image/png', size: 1024, url: 'https://evil.example/photo.png',
    }, 'https://mail.example.com');
    expect(unsafeUrl.isSafe).toBe(false);
    expect(unsafeUrl.errors).toContain('Missing or unsafe attachment URL');

    const safeUrl = assessAttachmentSafety({
      filename: 'photo.png', contentType: 'image/png', size: 1024, url: '/attachments/photo.png',
    }, 'https://mail.example.com');
    expect(safeUrl.sanitizedUrl).toBe('https://mail.example.com/attachments/photo.png');
  });

  it('uses an exact generic preview allow-list and never permits HTML-like content', () => {
    expect(shouldBlockPreview('image/png', 'photo.png')).toBe(false);
    expect(shouldBlockPreview('text/plain; charset=utf-8', 'notes.txt')).toBe(false);
    expect(shouldBlockPreview('application/pdf', 'document.pdf')).toBe(false);
    expect(shouldBlockPreview('text/html', 'invoice.html')).toBe(true);
    expect(shouldBlockPreview('image/svg+xml', 'graphic.svg')).toBe(true);
    expect(shouldBlockPreview('text/plain', 'invoice.html')).toBe(true);
    expect(shouldBlockPreview('application/octet-stream', 'unknown.bin')).toBe(true);
  });

  it('uses filename or normalized MIME information for type labels', () => {
    expect(getFileTypeDescription('image/png', 'photo.png')).toBe('PNG');
    expect(getFileTypeDescription('application/pdf', 'file')).toBe('PDF');
    expect(getFileTypeDescription(null, 'file')).toBe('FILE');
  });
});

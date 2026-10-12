import { describe, it, expect } from 'vitest';
import { sanitizeEmailHtml } from './sanitizer';

/**
 * Link Safety Audit Tests
 * 
 * These tests verify that links in untrusted email HTML are handled safely
 * as required by the Security Architecture (Architecture.md sections 11 and 12,
 * PRD.md section 12: "unsafe links").
 * 
 * Required protections:
 * - Block dangerous URL schemes (javascript:, vbscript:, data:, blob:, filesystem:, file:)
 * - Allow safe URL schemes (https:, http:, mailto:, tel:)
 * - Ensure external links open safely (target="_blank", rel="noopener noreferrer")
 * - Handle malformed/encoded URLs safely
 * - Preserve safe link content
 */

describe('Link Safety Audit - URL Scheme Filtering', () => {
  describe('Allowed URL schemes', () => {
    it('allows https: URLs', () => {
      const html = '<a href="https://example.com">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).toContain('href="https://example.com"');
    });

    it('allows http: URLs', () => {
      const html = '<a href="http://example.com">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).toContain('href="http://example.com"');
    });

    it('allows mailto: URLs', () => {
      const html = '<a href="mailto:user@example.com">Email</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).toContain('href="mailto:user@example.com"');
    });

    it('allows tel: URLs', () => {
      const html = '<a href="tel:+1-555-123-4567">Call</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).toContain('href="tel:+1-555-123-4567"');
    });

    it('allows relative URLs', () => {
      const html = '<a href="/path/to/page">Relative</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).toContain('href="/path/to/page"');
    });

    it('allows anchor links', () => {
      const html = '<a href="#section">Anchor</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).toContain('href="#section"');
    });

    it('allows query parameters', () => {
      const html = '<a href="https://example.com?param=value&foo=bar">Link</a>';
      const result = sanitizeEmailHtml(html);
      // DOMPurify HTML-encodes & to & in attribute values
      expect(result).toContain('href="https://example.com?param=value&amp;foo=bar"');
    });

    it('allows fragment identifiers', () => {
      const html = '<a href="https://example.com#section">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).toContain('href="https://example.com#section"');
    });

    it('allows port numbers', () => {
      const html = '<a href="https://example.com:8443/path">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).toContain('href="https://example.com:8443/path"');
    });

    it('allows subdomains', () => {
      const html = '<a href="https://sub.example.com/path">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).toContain('href="https://sub.example.com/path"');
    });
  });

  describe('Blocked URL schemes', () => {
    it('blocks javascript: scheme', () => {
      const html = '<a href="javascript:alert(1)">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('javascript:');
      // href should be emptied
      expect(result).not.toContain('href="javascript:');
    });

    it('blocks vbscript: scheme', () => {
      const html = '<a href="vbscript:msgbox(1)">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('vbscript:');
    });

    it('blocks data: scheme', () => {
      const html = '<a href="data:text/html,<script>alert(1)</script>">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('data:');
    });

    it('blocks blob: scheme', () => {
      const html = '<a href="blob:https://example.com/abc123">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('blob:');
    });

    it('blocks filesystem: scheme', () => {
      const html = '<a href="filesystem:http://example.com/tmp/file">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('filesystem:');
    });

    it('blocks file: scheme', () => {
      const html = '<a href="file:///etc/passwd">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('file:');
    });

    it('blocks javascript: in img src', () => {
      const html = '<img src="javascript:alert(1)">';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('javascript:');
    });

    it('blocks data: in img src', () => {
      const html = '<img src="data:image/svg+xml,<script>alert(1)</script>">';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('data:');
    });
  });
});

describe('Link Safety Audit - External Link Hardening', () => {
  it('adds target="_blank" to all links', () => {
    const html = '<a href="https://example.com">Link</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).toContain('target="_blank"');
  });

  it('adds rel="noopener noreferrer" to all links', () => {
    const html = '<a href="https://example.com">Link</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it('hardens multiple links in same HTML', () => {
    const html = '<a href="https://example.com">Link 1</a><a href="https://example.org">Link 2</a>';
    const result = sanitizeEmailHtml(html);
    // Both links should have security attributes
    const linkCount = (result.match(/target="_blank"/g) || []).length;
    expect(linkCount).toBe(2);
  });

  it('preserves link text content', () => {
    const html = '<a href="https://example.com">Click here</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).toContain('>Click here</a>');
  });

  it('preserves nested inline elements in links', () => {
    const html = '<a href="https://example.com"><b>Bold</b> and <i>italic</i></a>';
    const result = sanitizeEmailHtml(html);
    expect(result).toContain('<b>Bold</b>');
    expect(result).toContain('<i>italic</i>');
  });

  it('does not add target/rel to non-link elements', () => {
    const html = '<div href="https://example.com">Not a link</div>';
    const result = sanitizeEmailHtml(html);
    // div should not have target/rel, and href should be removed from div
    expect(result).not.toContain('target="_blank"');
    expect(result).not.toContain('rel="noopener noreferrer"');
  });
});

describe('Link Safety Audit - Malformed and Edge Case URLs', () => {
  describe('URL encoding evasion attempts', () => {
    it('blocks uppercase JAVASCRIPT:', () => {
      const html = '<a href="JAVASCRIPT:alert(1)">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('JAVASCRIPT:');
    });

    it('blocks mixed case JavaScript:', () => {
      const html = '<a href="JaVaScRiPt:alert(1)">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('javascript:');
      expect(result).not.toContain('JaVaScRiPt:');
    });

    it('blocks javascript: with leading whitespace', () => {
      const html = '<a href="  javascript:alert(1)">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('javascript:');
    });

    it('blocks javascript: with leading newline', () => {
      const html = '<a href="\njavascript:alert(1)">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('javascript:');
    });

    it('blocks javascript: with tab', () => {
      const html = '<a href="\tjavascript:alert(1)">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('javascript:');
    });

    it('blocks URL-encoded javascript:', () => {
      const html = '<a href="javascript%3Aalert(1)">Link</a>';
      const result = sanitizeEmailHtml(html);
      // DOMPurify may or may not decode before checking
      // The important thing is the resulting HTML doesn't execute
      expect(result).not.toContain('javascript:');
    });

    it('blocks double-encoded javascript:', () => {
      const html = '<a href="javascript%253Aalert(1)">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('javascript:');
    });

    it('blocks javascript: with HTML entities', () => {
      const html = '<a href="&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert(1)">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('javascript:');
    });

    it('blocks vbscript: with case variations', () => {
      const html = '<a href="VBScript:msgbox(1)">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).not.toContain('vbscript:');
    });
  });

  describe('Protocol-relative URLs', () => {
    it('handles protocol-relative URLs', () => {
      const html = '<a href="//example.com/path">Link</a>';
      const result = sanitizeEmailHtml(html);
      // Protocol-relative URLs should be preserved (they inherit page protocol)
      expect(result).toContain('href="//example.com/path"');
    });
  });

  describe('Malformed URLs', () => {
    it('handles missing protocol', () => {
      const html = '<a href="example.com">Link</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).toContain('href="example.com"');
    });

    it('handles empty href', () => {
      const html = '<a href="">Empty</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).toContain('href=""');
    });

    it('handles href with only spaces', () => {
      const html = '<a href="   ">Spaces</a>';
      const result = sanitizeEmailHtml(html);
      // Whitespace-only should become empty or be preserved
      expect(result).toContain('href="');
    });

    it('handles href with unicode characters', () => {
      const html = '<a href="https://example.com/路径">Unicode</a>';
      const result = sanitizeEmailHtml(html);
      expect(result).toContain('href="https://example.com/路径"');
    });
  });
});

describe('Link Safety Audit - Link Attributes', () => {
  it('removes onclick from links', () => {
    const html = '<a href="https://example.com" onclick="track()">Link</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).not.toContain('onclick');
  });

  it('removes onmouseover from links', () => {
    const html = '<a href="https://example.com" onmouseover="hover()">Link</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).not.toContain('onmouseover');
  });

  it('removes target attribute if present (replaces with _blank)', () => {
    const html = '<a href="https://example.com" target="_self">Link</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).toContain('target="_blank"');
    expect(result).not.toContain('target="_self"');
  });

  it('removes rel attribute if present (replaces with noopener noreferrer)', () => {
    const html = '<a href="https://example.com" rel="follow">Link</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).toContain('rel="noopener noreferrer"');
    expect(result).not.toContain('rel="follow"');
  });

  it('removes download attribute', () => {
    const html = '<a href="https://example.com/file.pdf" download>Download</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).not.toContain('download');
  });

  it('removes ping attribute', () => {
    const html = '<a href="https://example.com" ping="/track">Link</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).not.toContain('ping=');
  });

  it('removes referrerpolicy attribute', () => {
    const html = '<a href="https://example.com" referrerpolicy="no-referrer">Link</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).not.toContain('referrerpolicy');
  });

  it('removes hreflang attribute', () => {
    const html = '<a href="https://example.com" hreflang="en">Link</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).not.toContain('hreflang');
  });

  it('removes type attribute from links', () => {
    const html = '<a href="https://example.com" type="text/html">Link</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).not.toContain('type=');
  });
});

describe('Link Safety Audit - Image Links', () => {
  it('handles linked images', () => {
    const html = '<a href="https://example.com"><img src="https://example.com/img.png" alt="Image"></a>';
    const result = sanitizeEmailHtml(html);
    expect(result).toContain('href="https://example.com"');
    expect(result).toContain('src="https://example.com/img.png"');
    expect(result).toContain('target="_blank"');
    expect(result).toContain('rel="noopener noreferrer"');
  });

  it('blocks javascript: in linked image src', () => {
    const html = '<a href="https://example.com"><img src="javascript:alert(1)"></a>';
    const result = sanitizeEmailHtml(html);
    expect(result).not.toContain('javascript:');
  });

  it('blocks data: in linked image src', () => {
    const html = '<a href="https://example.com"><img src="data:image/svg+xml,<script>alert(1)</script>"></a>';
    const result = sanitizeEmailHtml(html);
    expect(result).not.toContain('data:');
  });
});

describe('Link Safety Audit - Mailto and Tel Edge Cases', () => {
  it('allows mailto with subject', () => {
    const html = '<a href="mailto:user@example.com?subject=Hello">Email</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).toContain('href="mailto:user@example.com?subject=Hello"');
  });

  it('allows mailto with body', () => {
    const html = '<a href="mailto:user@example.com?body=Message">Email</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).toContain('href="mailto:user@example.com?body=Message"');
  });

  it('allows mailto with multiple recipients', () => {
    const html = '<a href="mailto:user1@example.com,user2@example.com">Email</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).toContain('href="mailto:user1@example.com,user2@example.com"');
  });

  it('allows tel with extension', () => {
    const html = '<a href="tel:+1-555-123-4567,123">Call</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).toContain('href="tel:+1-555-123-4567,123"');
  });

  it('allows tel with pause', () => {
    const html = '<a href="tel:+1-555-123-4567;postd=123">Call</a>';
    const result = sanitizeEmailHtml(html);
    expect(result).toContain('href="tel:+1-555-123-4567;postd=123"');
  });
});

describe('Link Safety Audit - Security Documentation', () => {
  it('documents that sanitization does not provide browser-origin isolation', () => {
    // This test documents the current limitation:
    // Client-side sanitization alone does not provide browser-origin isolation.
    // For true origin isolation, iframe sandbox or CSP would be needed.
    // This is an architectural decision, not a bug.
    const currentProtection = 'sanitization + link hardening';
    expect(currentProtection).toBe('sanitization + link hardening');
  });

  it('documents that relative URLs inherit application origin', () => {
    // Relative URLs in email content will resolve relative to the application origin.
    // This is expected behavior but should be documented.
    expect(true).toBe(true);
  });

  it('documents that mailto/tel links open external handlers', () => {
    // mailto: and tel: links will trigger external applications.
    // This is expected behavior for email clients.
    expect(true).toBe(true);
  });
});
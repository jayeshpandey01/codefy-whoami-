import { describe, expect, it } from "vitest";
import { sanitizeReportHtml } from "../components/ReportView.js";

// Regression: ReportView used to load DOMPurify via a CommonJS `require()`
// inside an ESM bundle. In the webview `require` is undefined, the catch
// swallowed the error, and report HTML was rendered unsanitized.
describe("sanitizeReportHtml", () => {
  it("strips script tags and inline event handlers", () => {
    const dirty =
      '<h2>Finding</h2><img src=x onerror="alert(1)"><script>alert(2)</script>' +
      '<a href="javascript:alert(3)" onclick="alert(4)">link</a>';
    const clean = sanitizeReportHtml(dirty);

    expect(clean).toContain("<h2>Finding</h2>");
    expect(clean).not.toMatch(/<script/i);
    expect(clean).not.toMatch(/onerror|onclick/i);
    expect(clean).not.toMatch(/javascript:/i);
    expect(clean).not.toMatch(/<img/i);
  });

  it("keeps the report's structural markup", () => {
    const html =
      '<table><thead><tr><th>Severity</th></tr></thead><tbody><tr><td>critical</td></tr></tbody></table>';
    expect(sanitizeReportHtml(html)).toBe(html);
  });
});

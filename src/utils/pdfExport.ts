import { formatDateTime } from "./format";
import { getFieldDefinition } from "./fieldRegistry";

import type { PdfBlock, FormResponse, FormSnapshot, FormValues } from "@typedefs";

export interface PdfRequest {
  snapshot: FormSnapshot;
  /** Answers of visible fields only. A field without a key was hidden and is left out. */
  answers: FormValues;
  /** Null for an unsubmitted draft. */
  submittedAt: string | null;
  responseId: string | null;
}

const escapeHtml = (text: string): string =>
  text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

/** The PDF content, in form order. */
export const buildPdfBlocks = ({ snapshot, answers }: Pick<PdfRequest, "snapshot" | "answers">): PdfBlock[] =>
  snapshot.fields
    .filter((field) => Object.hasOwn(answers, field.id))
    .map((field) => {
      const definition = getFieldDefinition(field);
      return definition.toPdfBlock(field, definition.readValue(answers[field.id], field));
    });

const renderBlock = (block: PdfBlock): string => {
  if (block.kind === "heading") {
    return `<h2 class="section section-${block.size}">${escapeHtml(block.text)}</h2>`;
  }
  let value: string;
  if (block.lines.length === 0) {
    value = `<div class="value empty">Not answered</div>`;
  } else if (block.lines.length === 1) {
    value = `<div class="value">${escapeHtml(block.lines[0])}</div>`;
  } else {
    value = `<ul class="value">${block.lines.map((line) => `<li>${escapeHtml(line)}</li>`).join("")}</ul>`;
  }
  const note = block.note === undefined ? "" : `<div class="note">${escapeHtml(block.note)}</div>`;
  return `<div class="answer"><div class="label">${escapeHtml(block.label)}</div><div>${value}${note}</div></div>`;
};

const styles = `
@page { size: A4; margin: 18mm 16mm 20mm; @bottom-right { content: "Page " counter(page) " of " counter(pages); font: 8pt system-ui, sans-serif; color: #6b7280; } }
* { box-sizing: border-box; }
html, body { margin: 0; background: #fff; }
body { font: 10.5pt/1.5 -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; color: #111827; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
.header { border-bottom: 2px solid #111827; padding-bottom: 14px; margin-bottom: 8px; }
.eyebrow { text-transform: uppercase; letter-spacing: .08em; font-size: 8pt; font-weight: 600; color: #4f46e5; }
h1 { font-size: 20pt; line-height: 1.2; margin: 4px 0 6px; }
.description { margin: 0 0 12px; color: #4b5563; white-space: pre-wrap; }
.meta { display: flex; flex-wrap: wrap; gap: 8px 32px; margin: 0; }
.meta dt { font-size: 7.5pt; text-transform: uppercase; letter-spacing: .06em; color: #6b7280; }
.meta dd { margin: 2px 0 0; font-weight: 500; }
.section { margin: 22px 0 2px; padding-bottom: 4px; border-bottom: 1px solid #d1d5db; break-after: avoid; page-break-after: avoid; }
.section-xl { font-size: 16pt; } .section-lg { font-size: 14pt; } .section-md { font-size: 12.5pt; }
.section-sm { font-size: 11pt; } .section-xs { font-size: 9pt; text-transform: uppercase; letter-spacing: .06em; color: #4b5563; }
.answer { display: grid; grid-template-columns: 36% 1fr; gap: 16px; padding: 9px 0; border-bottom: 1px solid #eef0f3; break-inside: avoid; page-break-inside: avoid; }
.label { font-weight: 600; color: #374151; }
.value { white-space: pre-wrap; overflow-wrap: anywhere; }
ul.value { margin: 0; padding-left: 16px; }
.empty { color: #9ca3af; font-style: italic; }
.note { margin-top: 3px; font-size: 8.5pt; color: #6b7280; }
.no-fields { color: #6b7280; font-style: italic; padding: 12px 0; }
.footer { margin-top: 28px; font-size: 8pt; color: #9ca3af; }
`;

export const renderPdfHtml = (request: PdfRequest): string => {
  const { snapshot, submittedAt, responseId } = request;
  const blocks = buildPdfBlocks(request);
  const answerBlocks = blocks.filter((block) => block.kind === "answer");
  const answered = answerBlocks.filter((block) => block.lines.length > 0).length;
  const title = snapshot.title.trim() || "Untitled form";
  const meta: [string, string][] = [
    submittedAt === null ? ["Status", "Draft (not submitted)"] : ["Submitted", formatDateTime(submittedAt)],
    ["Answered", `${answered} of ${answerBlocks.length}`],
  ];
  if (responseId !== null) {
    meta.push(["Response ID", responseId.slice(0, 8).toUpperCase()]);
  }
  const body =
    blocks.length === 0 ? `<p class="no-fields">This form has no fields.</p>` : blocks.map(renderBlock).join("");

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>${escapeHtml(title)}</title>
<style>${styles}</style>
</head>
<body>
<header class="header">
<div class="eyebrow">Form response</div>
<h1>${escapeHtml(title)}</h1>
${snapshot.description.trim() === "" ? "" : `<p class="description">${escapeHtml(snapshot.description.trim())}</p>`}
<dl class="meta">${meta.map(([term, detail]) => `<div><dt>${escapeHtml(term)}</dt><dd>${escapeHtml(detail)}</dd></div>`).join("")}</dl>
</header>
<main>${body}</main>
<footer class="footer">Exported ${escapeHtml(formatDateTime(new Date().toISOString()))}</footer>
</body>
</html>`;
};

const fileName = (request: PdfRequest): string => {
  const title = request.snapshot.title.trim() || "Form response";
  const date = (request.submittedAt ?? new Date().toISOString()).slice(0, 10);
  return `${title} - ${date}`.replace(/[\\/:*?"<>|]+/g, " ");
};

/** Prints a styled page from a hidden iframe; the user saves it as PDF. */
export const downloadPdf = (request: PdfRequest): void => {
  const iframe = document.createElement("iframe");
  iframe.setAttribute("aria-hidden", "true");
  iframe.tabIndex = -1;
  Object.assign(iframe.style, { position: "fixed", right: "0", bottom: "0", width: "0", height: "0", border: "0" });

  const previousTitle = document.title;
  const cleanUp = () => {
    document.title = previousTitle;
    iframe.remove();
  };

  iframe.addEventListener(
    "load",
    () => {
      const frameWindow = iframe.contentWindow;
      if (!frameWindow) {
        cleanUp();
        return;
      }
      frameWindow.addEventListener("afterprint", () => setTimeout(cleanUp, 0), { once: true });
      // Most browsers suggest the page title as the PDF's file name.
      document.title = fileName(request);
      frameWindow.document.title = document.title;
      frameWindow.focus();
      frameWindow.print();
    },
    { once: true },
  );

  iframe.srcdoc = renderPdfHtml(request);
  document.body.append(iframe);
};

/** Exports a saved response as it was submitted. */
export const downloadResponsePdf = (response: FormResponse): void => {
  downloadPdf({
    snapshot: response.snapshot,
    answers: response.answers,
    submittedAt: response.submittedAt,
    responseId: response.id,
  });
};

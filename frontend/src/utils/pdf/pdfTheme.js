/** Brand colours aligned with `ui_guidelines.json` primary / secondary. */
export const PDF = {
  headerBg: [7, 89, 133], // primary-800
  tableHead: [3, 105, 161], // primary-700
  stripe: [248, 250, 252], // neutral-50-ish
  border: [226, 232, 240],
  text: [15, 23, 42], // slate-900
  muted: [71, 85, 105],
};

export function pdfBrandTitle(doc) {
  doc.setFillColor(...PDF.headerBg);
  doc.rect(0, 0, 210, 26, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(15);
  doc.text('ASE Athletics', 14, 11);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Football player analytics', 14, 19);
  doc.setTextColor(...PDF.text);
}

export function pdfSubtitle(doc, y, text) {
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...PDF.text);
  doc.text(text, 14, y);
  doc.setFont('helvetica', 'normal');
}

export function pdfMetaLine(doc, y) {
  doc.setFontSize(8);
  doc.setTextColor(...PDF.muted);
  const generated = new Date().toLocaleString(undefined, {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
  doc.text(`Generated ${generated}`, 14, y);
  doc.setTextColor(...PDF.text);
}

export function slugFilePart(name) {
  const s = String(name ?? 'export')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
  return s || 'export';
}

export function addPageFooters(doc) {
  const total = doc.internal.getNumberOfPages();
  for (let i = 1; i <= total; i += 1) {
    doc.setPage(i);
    doc.setFontSize(7.5);
    doc.setTextColor(...PDF.muted);
    doc.text(`Page ${i} of ${total}`, 196, 287, { align: 'right' });
    doc.text('ASE Athletics — internal use', 14, 287);
    doc.setTextColor(...PDF.text);
  }
}

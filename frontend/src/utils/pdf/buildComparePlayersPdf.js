import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { COMPARE_ATTR_LABELS, COMPARE_STAT_LABELS } from '@/constants/compareMetrics';
import { formatAge, formatMarketValue, formatSalary, formatShortDate } from '@/utils/format';
import { PDF, pdfBrandTitle, pdfSubtitle, pdfMetaLine, addPageFooters } from '@/utils/pdf/pdfTheme';
import { formatPdfAttr, formatPdfStat } from '@/utils/pdf/pdfFormat';
import {
  captureComparePlayersRadarCharts,
  compareRadarPdfImageSizeMm,
} from '@/utils/pdf/playerProfilePdfCharts';

const tableDefaults = {
  styles: { fontSize: 8, cellPadding: 2.5, textColor: PDF.text, lineColor: PDF.border, lineWidth: 0.1 },
  headStyles: { fillColor: PDF.tableHead, textColor: [255, 255, 255], fontStyle: 'bold' },
  alternateRowStyles: { fillColor: PDF.stripe },
  margin: { left: 14, right: 14 },
};

function playerColumnTitle(p, idx) {
  const name = p?.name ?? `Player ${idx + 1}`;
  return name.length > 22 ? `${name.slice(0, 20)}…` : name;
}

function basicsRows(players) {
  const keys = [
    ['team', 'Team'],
    ['position', 'Position'],
    ['age', 'Age'],
    ['jersey_number', 'Jersey'],
    ['preferred_foot', 'Foot'],
    ['height', 'H (cm)'],
    ['weight', 'W (kg)'],
    ['market_value', 'Value'],
  ];
  return keys.map(([field, label]) => [
    label,
    ...players.map((pl) => {
      if (field === 'age') return formatAge(pl?.age);
      if (field === 'market_value') return formatMarketValue(pl?.market_value);
      const v = pl?.[field];
      if (v == null || v === '') return '—';
      return String(v);
    }),
  ]);
}

function contractRows(players) {
  return [
    [
      'Salary',
      ...players.map((pl) => formatSalary(pl?.contract?.salary)),
    ],
    [
      'Contract end',
      ...players.map((pl) => formatShortDate(pl?.contract?.contract_end)),
    ],
  ];
}

/**
 * @param {object[]} players — full player objects
 * @param {string[]} orderedStatKeys
 * @param {string[]} orderedAttrKeys
 */
export async function buildComparePlayersPdf(players, orderedStatKeys, orderedAttrKeys) {
  if (!players?.length) return;

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  pdfBrandTitle(doc);
  let y = 34;
  pdfSubtitle(doc, y, 'Player comparison');
  y += 7;
  pdfMetaLine(doc, y);
  y += 8;

  const head = ['', ...players.map((p, i) => playerColumnTitle(p, i))];
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [head],
    body: basicsRows(players),
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 28 } },
  });
  y = doc.lastAutoTable.finalY + 8;

  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [head],
    body: contractRows(players),
    columnStyles: { 0: { fontStyle: 'bold', cellWidth: 28 } },
  });
  y = doc.lastAutoTable.finalY + 10;

  const { statsRadarUrl, attrsRadarUrl } = await captureComparePlayersRadarCharts(
    players,
    orderedStatKeys,
    orderedAttrKeys,
  );
  if (statsRadarUrl || attrsRadarUrl) {
    if (y > 200) {
      doc.addPage();
      y = 16;
    }
    pdfSubtitle(doc, y, 'Radar charts');
    y += 7;
    const { imgW, imgH } = compareRadarPdfImageSizeMm(players.length);
    if (statsRadarUrl) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...PDF.muted);
      doc.text('Stats (0–100, normalized across compared players)', 14, y);
      y += 4;
      if (y + imgH > 278) {
        doc.addPage();
        y = 16;
      }
      try {
        doc.addImage(statsRadarUrl, 'PNG', 14, y, imgW, imgH);
      } catch {
        /* ignore embed errors */
      }
      y += imgH + 8;
    }
    if (attrsRadarUrl) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...PDF.muted);
      doc.text('Attributes (0–100)', 14, y);
      y += 4;
      if (y + imgH > 278) {
        doc.addPage();
        y = 16;
      }
      try {
        doc.addImage(attrsRadarUrl, 'PNG', 14, y, imgW, imgH);
      } catch {
        /* ignore */
      }
      y += imgH + 10;
    }
    doc.setTextColor(...PDF.text);
  }

  if (orderedStatKeys?.length) {
    if (y > 255) {
      doc.addPage();
      y = 16;
    }
    pdfSubtitle(doc, y, 'Statistics (selected)');
    y += 6;
    const statHead = ['Metric', ...players.map((p, i) => playerColumnTitle(p, i))];
    const statBody = orderedStatKeys.map((key) => [
      COMPARE_STAT_LABELS[key] || key,
      ...players.map((pl) => formatPdfStat(key, pl.stats?.[key])),
    ]);
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [statHead],
      body: statBody,
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 36 } },
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (orderedAttrKeys?.length) {
    if (y > 245) {
      doc.addPage();
      y = 16;
    }
    pdfSubtitle(doc, y, 'Attributes (selected, 0–100)');
    y += 6;
    const attrHead = ['Attribute', ...players.map((p, i) => playerColumnTitle(p, i))];
    const attrBody = orderedAttrKeys.map((key) => [
      COMPARE_ATTR_LABELS[key] || key,
      ...players.map((pl) => formatPdfAttr(pl.attributes?.[key])),
    ]);
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [attrHead],
      body: attrBody,
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 34 } },
    });
  }

  addPageFooters(doc);
  const datePart = new Date().toISOString().slice(0, 10);
  doc.save(`ASE-Athletics_Compare_${players.length}-players_${datePart}.pdf`);
}

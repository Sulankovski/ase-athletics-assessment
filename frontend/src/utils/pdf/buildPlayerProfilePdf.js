import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { fetchPlayerReports } from '@/services/playerService';
import { COMPARE_ATTR_DEFINITIONS, COMPARE_STAT_DEFINITIONS } from '@/constants/compareMetrics';
import {
  PDF,
  pdfBrandTitle,
  pdfSubtitle,
  pdfMetaLine,
  slugFilePart,
  addPageFooters,
} from '@/utils/pdf/pdfTheme';
import {
  formatPdfAttr,
  formatPdfContract,
  formatPdfStat,
} from '@/utils/pdf/pdfFormat';
import { formatShortDate } from '@/utils/format';
import { REPORT_RATING_EDIT_ROWS } from '@/utils/reportEdit';
import { drawPlayerHeroCard } from '@/utils/pdf/playerProfilePdfHero';
import { capturePlayerProfileCharts } from '@/utils/pdf/playerProfilePdfCharts';

const STAT_ROWS = COMPARE_STAT_DEFINITIONS;
const ATTR_ROWS = COMPARE_ATTR_DEFINITIONS;

const tableDefaults = {
  styles: { fontSize: 9, cellPadding: 3, textColor: PDF.text, lineColor: PDF.border, lineWidth: 0.1 },
  headStyles: { fillColor: PDF.tableHead, textColor: [255, 255, 255], fontStyle: 'bold' },
  alternateRowStyles: { fillColor: PDF.stripe },
  margin: { left: 14, right: 14 },
};

function isGkProfile(player) {
  const stats = player?.stats ?? {};
  const pos = String(player?.position ?? '').toUpperCase();
  if (pos === 'GK' || pos === 'G') return true;
  const s = stats?.saves;
  return s != null && s !== '' && Number.isFinite(Number(s));
}

function linesFromArray(arr) {
  if (!Array.isArray(arr) || !arr.length) return '';
  return arr
    .map((s) => String(s ?? '').trim())
    .filter(Boolean)
    .join('\n');
}

function writeMultiline(doc, y, title, bodyText, pageBottom = 278) {
  const text = String(bodyText ?? '').trim();
  if (!text) return y;
  if (y + 14 > pageBottom) {
    doc.addPage();
    y = 16;
  }
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...PDF.text);
  doc.text(title, 14, y);
  y += 4.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  const lines = doc.splitTextToSize(text, 182);
  for (let i = 0; i < lines.length; i += 1) {
    if (y + 4 > pageBottom) {
      doc.addPage();
      y = 16;
    }
    doc.text(lines[i], 14, y);
    y += 3.9;
  }
  return y + 3;
}

function addFullReportSections(doc, reports, startY) {
  let y = startY;
  const breakIf = (need) => {
    if (y + need > 276) {
      doc.addPage();
      y = 16;
    }
    return y;
  };

  for (let i = 0; i < reports.length; i += 1) {
    const report = reports[i];
    breakIf(36);
    pdfSubtitle(doc, y, `Scout report ${i + 1} of ${reports.length}`);
    y += 6;
    doc.setFontSize(8);
    doc.setTextColor(...PDF.muted);
    doc.setFont('helvetica', 'normal');
    doc.text(
      `${report?.scoutName ?? '—'} · ${formatShortDate(report?.date)}`,
      14,
      y,
    );
    y += 5.5;
    doc.setTextColor(...PDF.text);

    const m = report?.matchDetails ?? {};
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['Field', 'Value']],
      body: [
        ['Player', report?.playerName ?? '—'],
        ['Opponent', m.opponent ?? '—'],
        ['Competition', m.competition ?? '—'],
        ['Result', m.result ?? '—'],
        ['Minutes played', m.minutesPlayed != null && m.minutesPlayed !== '' ? String(m.minutesPlayed) : '—'],
        ['Match position', m.position ?? '—'],
        ['Overall rating (0–10)', report?.overallRating != null && report?.overallRating !== '' ? String(report.overallRating) : '—'],
        ['Recommendation', report?.recommendation ?? '—'],
      ],
    });
    y = doc.lastAutoTable.finalY + 5;

    breakIf(28);
    const ratingBody = REPORT_RATING_EDIT_ROWS.map(([key, lab]) => {
      const v = report?.ratings?.[key];
      return [lab, v != null && v !== '' ? String(v) : '—'];
    });
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['Rating', 'Score (0–10)']],
      body: ratingBody,
    });
    y = doc.lastAutoTable.finalY + 6;

    y = writeMultiline(doc, y, 'Notes', report?.notes);
    y = writeMultiline(doc, y, 'Strengths', linesFromArray(report?.strengths));
    y = writeMultiline(doc, y, 'Weaknesses', linesFromArray(report?.weaknesses));
    y = writeMultiline(doc, y, 'Key moments', linesFromArray(report?.keyMoments));
    y += 6;
  }
  return y;
}

/**
 * Builds and downloads a multi-section PDF: hero + charts, then tables; full scout report text.
 */
export async function buildPlayerProfilePdf(player, options = {}) {
  if (!player) return;

  let reports = options.reports;
  if (!Array.isArray(reports) && player.id != null) {
    const res = await fetchPlayerReports(player.id);
    reports = res?.reports ?? [];
  }
  reports = Array.isArray(reports) ? reports : [];

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const contentW = 182;
  const isGk = isGkProfile(player);

  pdfBrandTitle(doc);
  let y = 29;
  pdfMetaLine(doc, y);
  y = 38;

  y = drawPlayerHeroCard(doc, player, 14, y, contentW);
  y += 3;

  if (y > 195) {
    doc.addPage();
    y = 16;
  }

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(...PDF.muted);
  doc.text('RADAR CHARTS', 14, y);
  y += 4.5;
  doc.setFontSize(8);
  doc.setTextColor(...PDF.text);
  doc.text('Stats', 14, y);
  doc.text('Attributes', 105, y);
  y += 3.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...PDF.muted);
  doc.text('Season stats scaled to this player’s highs (0–100).', 14, y);
  doc.text('Pace, passing, dribbling, physical (0–100).', 105, y);
  y += 4.5;

  const {
    radarDataUrl,
    barDataUrl,
    compareStatsRadarUrl,
    compareAttrsRadarUrl,
  } = await capturePlayerProfileCharts(player);
  const chartH = 54;
  const chartW = 88;
  if (compareStatsRadarUrl) {
    try {
      doc.addImage(compareStatsRadarUrl, 'PNG', 14, y, chartW, chartH);
    } catch {
      /* ignore */
    }
  }
  if (compareAttrsRadarUrl) {
    try {
      doc.addImage(compareAttrsRadarUrl, 'PNG', 105, y, chartW, chartH);
    } catch {
      /* ignore */
    }
  }
  y += chartH + 8;

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...PDF.text);
  doc.text('Attribute profile', 14, y);
  doc.text('Performance snapshot', 105, y);
  y += 3.5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...PDF.muted);
  doc.text(
    isGk ? 'Goalkeeper ratings (0–100).' : 'Outfield ratings (0–100).',
    14,
    y,
  );
  doc.text('Season output and efficiency indicators.', 105, y);
  y += 5;
  if (radarDataUrl) {
    try {
      doc.addImage(radarDataUrl, 'PNG', 14, y, chartW, chartH);
    } catch {
      /* ignore chart embed errors */
    }
  }
  if (barDataUrl) {
    try {
      doc.addImage(barDataUrl, 'PNG', 105, y, chartW, chartH);
    } catch {
      /* ignore */
    }
  }
  y += chartH + 10;

  if (y > 230) {
    doc.addPage();
    y = 16;
  }

  const contractRows = formatPdfContract(player);
  if (contractRows.some(([, v]) => v !== '—')) {
    pdfSubtitle(doc, y, 'Contract');
    y += 6;
    autoTable(doc, {
      ...tableDefaults,
      startY: y,
      head: [['Field', 'Value']],
      body: contractRows,
    });
    y = doc.lastAutoTable.finalY + 10;
  }

  if (y > 230) {
    doc.addPage();
    y = 16;
  }
  pdfSubtitle(doc, y, 'Statistics (full table)');
  y += 6;
  const statBody = STAT_ROWS.map(([key, label]) => [label, formatPdfStat(key, player.stats?.[key])]);
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [['Metric', 'Value']],
    body: statBody,
  });
  y = doc.lastAutoTable.finalY + 10;

  if (y > 220) {
    doc.addPage();
    y = 16;
  }
  pdfSubtitle(doc, y, 'Attributes (full table, 0–100)');
  y += 6;
  const attrBody = ATTR_ROWS.map(([key, label]) => [label, formatPdfAttr(player.attributes?.[key])]);
  autoTable(doc, {
    ...tableDefaults,
    startY: y,
    head: [['Attribute', 'Value']],
    body: attrBody,
  });
  y = doc.lastAutoTable.finalY + 10;

  if (reports.length > 0) {
    if (y > 200) {
      doc.addPage();
      y = 16;
    }
    pdfSubtitle(doc, y, `Scout reports — full detail (${reports.length})`);
    y += 8;
    addFullReportSections(doc, reports, y);
  }

  addPageFooters(doc);
  const fname = `ASE-Athletics_Player_${slugFilePart(player.name)}_${slugFilePart(new Date().toISOString().slice(0, 10))}.pdf`;
  doc.save(fname);
}

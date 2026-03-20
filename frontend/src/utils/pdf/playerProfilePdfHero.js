import { formatAge, formatMarketValue, formatSalary, formatShortDate } from '@/utils/format';
import { PDF } from '@/utils/pdf/pdfTheme';

const CARD_HEADER_H = 34;
const CARD_FOOTER_H = 20;
const CARD_TOTAL_H = CARD_HEADER_H + CARD_FOOTER_H;

function displayInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.trim().slice(0, 2).toUpperCase() || '?';
}

/**
 * Draws the “player information” hero card (blue header + metric footer) to match the profile UI.
 * @returns {number} Y position below the card
 */
export function drawPlayerHeroCard(doc, player, x, y, w) {
  const contract = player?.contract ?? {};

  doc.setDrawColor(...PDF.border);
  doc.setLineWidth(0.25);
  doc.setFillColor(255, 255, 255);
  if (typeof doc.roundedRect === 'function') {
    doc.roundedRect(x, y, w, CARD_TOTAL_H, 1.5, 1.5, 'FD');
  } else {
    doc.rect(x, y, w, CARD_TOTAL_H, 'FD');
    doc.rect(x, y, w, CARD_TOTAL_H, 'S');
  }

  doc.setFillColor(...PDF.headerBg);
  doc.rect(x, y, w, CARD_HEADER_H, 'F');

  const ini = displayInitials(player?.name);
  doc.setFillColor(230, 242, 252);
  doc.setDrawColor(200, 230, 250);
  const av = 11;
  if (typeof doc.roundedRect === 'function') {
    doc.roundedRect(x + 3.5, y + 4, av, av, 1.2, 1.2, 'FD');
  } else {
    doc.rect(x + 3.5, y + 4, av, av, 'FD');
  }
  doc.setTextColor(...PDF.headerBg);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.text(ini, x + 3.5 + av / 2, y + 4 + av / 2 + 2, { align: 'center' });

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  const teamBits = String(player?.team ?? '—')
    .toUpperCase()
    .slice(0, 48);
  const jersey = player?.jersey_number != null && player.jersey_number !== '' ? `#${player.jersey_number}` : '#—';
  doc.text(`${teamBits} · ${jersey}`, x + 16, y + 8);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  const nameStr = String(player?.name ?? '—').slice(0, 42);
  doc.text(nameStr, x + 16, y + 16);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const pos = player?.position ?? '—';
  const foot = player?.preferred_foot ? `${player.preferred_foot} foot` : '—';
  doc.text(`${pos} · ${foot}`, x + 16, y + 22);

  const boxY = y + 25;
  const innerPad = 16;
  const gap = 2;
  const boxW = (w - innerPad - gap) / 2;
  doc.setFillColor(5, 65, 105);
  if (typeof doc.roundedRect === 'function') {
    doc.roundedRect(x + innerPad / 2, boxY, boxW, 8, 0.8, 0.8, 'F');
    doc.roundedRect(x + innerPad / 2 + boxW + gap, boxY, boxW, 8, 0.8, 0.8, 'F');
  } else {
    doc.rect(x + innerPad / 2, boxY, boxW, 8, 'F');
    doc.rect(x + innerPad / 2 + boxW + gap, boxY, boxW, 8, 'F');
  }

  doc.setTextColor(200, 225, 245);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.text('MARKET VALUE', x + innerPad / 2 + 1.5, boxY + 3);
  doc.text('CONTRACT ENDS', x + innerPad / 2 + boxW + gap + 1.5, boxY + 3);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  const mvVal = formatMarketValue(player?.market_value);
  const mvDisplay = mvVal === '—' ? '—' : mvVal;
  doc.text(mvDisplay, x + innerPad / 2 + 1.5, boxY + 7);
  doc.text(formatShortDate(contract.contract_end), x + innerPad / 2 + boxW + gap + 1.5, boxY + 7);

  const fy = y + CARD_HEADER_H + 5;
  doc.setFontSize(6.5);
  doc.setTextColor(...PDF.muted);
  doc.setFont('helvetica', 'bold');
  const mid = x + w / 2;
  doc.text('Height', x + 6, fy);
  doc.text('Age', mid + 1, fy);
  doc.text('Weight', x + 6, fy + 9);
  doc.text('Salary (yr)', mid + 1, fy + 9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...PDF.text);
  doc.text(`${player?.height ?? '—'} cm`, x + 6, fy + 4);
  doc.text(formatAge(player?.age), mid + 1, fy + 4);
  doc.text(`${player?.weight ?? '—'} kg`, x + 6, fy + 13);
  doc.text(formatSalary(contract.salary), mid + 1, fy + 13);

  return y + CARD_TOTAL_H + 2;
}

import { Chart } from 'chart.js';
import { registerDashboardCharts } from '@/components/dashboard/registerCharts';
import { COMPARE_ATTR_LABELS, COMPARE_STAT_LABELS } from '@/constants/compareMetrics';
import { computeAttrMaxes, computeStatMaxes, normalizeRadarValue } from '@/utils/compareRadar';
import { chartColors } from '@/styles/designTokens';

const OUTFIELD_ATTR_ORDER = [
  ['pace', 'Pace'],
  ['shooting', 'Shooting'],
  ['passing', 'Passing'],
  ['dribbling', 'Dribbling'],
  ['defending', 'Defending'],
  ['physical', 'Physical'],
  ['finishing', 'Finishing'],
  ['crossing', 'Crossing'],
  ['long_shots', 'Long shots'],
  ['positioning', 'Positioning'],
];

const GK_ATTR_ORDER = [
  ['diving', 'Diving'],
  ['handling', 'Handling'],
  ['kicking', 'Kicking'],
  ['reflexes', 'Reflexes'],
];

/** Same axes as Compare page default layout (6 stat / 4 attr), normalized 0–100 per player */
const PDF_COMPARE_RADAR_STAT_KEYS = [
  'appearances',
  'goals',
  'yellow_cards',
  'minutes_played',
  'shots_on_target',
  'long_passes',
];
const PDF_COMPARE_RADAR_ATTR_KEYS = ['pace', 'passing', 'dribbling', 'physical'];

function withAlpha(hex, alpha = 0.12) {
  const h = String(hex).replace('#', '');
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${alpha})`;
}

async function flushCanvasPaint() {
  await new Promise((r) => {
    requestAnimationFrame(() => requestAnimationFrame(r));
  });
}

function attachOffscreenCanvas(canvas) {
  canvas.style.cssText =
    'position:fixed;left:-9999px;top:0;width:1px;height:1px;opacity:0;pointer-events:none';
  document.body.appendChild(canvas);
}

/**
 * @param {string[]} labels
 * @param {number[]} data — already 0–100 scale
 * @param {string} borderColor hex
 * @param {number} tickStep e.g. 25 (compare style) or 20 (full profile radar)
 */
async function createRadarPng(labels, data, borderColor, tickStep = 25) {
  const cw = 480;
  const ch = 360;
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  attachOffscreenCanvas(canvas);
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const chart = new Chart(ctx, {
      type: 'radar',
      data: {
        labels,
        datasets: [
          {
            label: '',
            data,
            borderColor,
            backgroundColor: withAlpha(borderColor, 0.14),
            borderWidth: 2,
            pointBackgroundColor: borderColor,
          },
        ],
      },
      options: {
        responsive: false,
        devicePixelRatio: 1,
        animation: false,
        layout: { padding: 6 },
        plugins: { legend: { display: false } },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { stepSize: tickStep, font: { size: 9 } },
            grid: { color: 'rgba(0,0,0,0.06)' },
            pointLabels: { font: { size: 9 } },
          },
        },
      },
    });
    chart.update('none');
    await flushCanvasPaint();
    const url = canvas.toDataURL('image/png', 1.0);
    chart.destroy();
    return url;
  } finally {
    canvas.remove();
  }
}

/**
 * Compare page style: several players overlaid; same 0–100 axes and normalization as the UI.
 * @param {object[]} datasets Chart.js radar datasets (label, data, borderColor, …)
 */
/** Canvas pixels for multi-player compare radars (must match PDF embed aspect ratio). */
export const COMPARE_MULTI_RADAR_CANVAS_W = 620;
export const COMPARE_MULTI_RADAR_CANVAS_H = {
  fewPlayers: 420,
  manyPlayers: 460,
};

export function compareMultiRadarCanvasHeight(datasetCount) {
  return datasetCount > 2
    ? COMPARE_MULTI_RADAR_CANVAS_H.manyPlayers
    : COMPARE_MULTI_RADAR_CANVAS_H.fewPlayers;
}

/** Millimetre width/height for jsPDF.addImage while preserving canvas aspect ratio. */
export function compareRadarPdfImageSizeMm(datasetCount, opts = {}) {
  const maxW = opts.maxW ?? 182;
  const maxH = opts.maxH ?? 100;
  const pngW = COMPARE_MULTI_RADAR_CANVAS_W;
  const pngH = compareMultiRadarCanvasHeight(datasetCount);
  const aspect = pngW / pngH;
  let imgW = maxW;
  let imgH = imgW / aspect;
  if (imgH > maxH) {
    imgH = maxH;
    imgW = imgH * aspect;
  }
  return { imgW, imgH };
}

async function createMultiRadarPng(labels, datasets, tickStep = 25) {
  const cw = COMPARE_MULTI_RADAR_CANVAS_W;
  const ch = compareMultiRadarCanvasHeight(datasets.length);
  const canvas = document.createElement('canvas');
  canvas.width = cw;
  canvas.height = ch;
  attachOffscreenCanvas(canvas);
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    const showLegend = datasets.length > 1;
    const chart = new Chart(ctx, {
      type: 'radar',
      data: { labels, datasets },
      options: {
        responsive: false,
        devicePixelRatio: 1,
        animation: false,
        layout: { padding: 10 },
        plugins: {
          legend: {
            display: showLegend,
            position: 'bottom',
            labels: {
              boxWidth: 10,
              font: { size: 9 },
              usePointStyle: true,
              pointStyle: 'circle',
              padding: 8,
            },
          },
        },
        scales: {
          r: {
            min: 0,
            max: 100,
            ticks: { stepSize: tickStep, font: { size: 9 } },
            grid: { color: 'rgba(0,0,0,0.06)' },
            pointLabels: { font: { size: 9 } },
          },
        },
      },
    });
    chart.update('none');
    await flushCanvasPaint();
    const url = canvas.toDataURL('image/png', 1.0);
    chart.destroy();
    return url;
  } finally {
    canvas.remove();
  }
}

/**
 * Stats + attributes radars for compare export (selected keys only; matches compare page normalization).
 * @param {object[]} players
 * @param {string[]} statKeys
 * @param {string[]} attrKeys
 */
export async function captureComparePlayersRadarCharts(players, statKeys, attrKeys) {
  registerDashboardCharts();
  const statKeysArr = Array.isArray(statKeys) ? statKeys.filter(Boolean) : [];
  const attrKeysArr = Array.isArray(attrKeys) ? attrKeys.filter(Boolean) : [];
  const list = Array.isArray(players) ? players.filter(Boolean) : [];
  if (!list.length) {
    return { statsRadarUrl: null, attrsRadarUrl: null };
  }

  const palette = chartColors.length ? chartColors : ['#0ea5e9', '#10b981', '#f59e0b', '#ef4444'];
  let statsRadarUrl = null;
  let attrsRadarUrl = null;

  if (statKeysArr.length) {
    try {
      const statMaxes = computeStatMaxes(list, statKeysArr);
      const labels = statKeysArr.map((k) => COMPARE_STAT_LABELS[k] ?? k);
      const datasets = list.map((p, i) => {
        const color = palette[i % palette.length];
        const data = statKeysArr.map((k) =>
          normalizeRadarValue(p?.stats?.[k], statMaxes[k] ?? 1),
        );
        const rawName = String(p?.name ?? `Player ${i + 1}`).trim();
        return {
          label: rawName.length > 28 ? `${rawName.slice(0, 26)}…` : rawName,
          data,
          borderColor: color,
          backgroundColor: withAlpha(color, 0.12),
          borderWidth: 2,
          pointBackgroundColor: color,
        };
      });
      statsRadarUrl = await createMultiRadarPng(labels, datasets, 25);
    } catch {
      statsRadarUrl = null;
    }
  }

  if (attrKeysArr.length) {
    try {
      const attrMaxes = computeAttrMaxes(list, attrKeysArr);
      const labels = attrKeysArr.map((k) => COMPARE_ATTR_LABELS[k] ?? k);
      const datasets = list.map((p, i) => {
        const color = palette[i % palette.length];
        const data = attrKeysArr.map((k) =>
          normalizeRadarValue(p?.attributes?.[k], attrMaxes[k] ?? 100),
        );
        const rawName = String(p?.name ?? `Player ${i + 1}`).trim();
        return {
          label: rawName.length > 28 ? `${rawName.slice(0, 26)}…` : rawName,
          data,
          borderColor: color,
          backgroundColor: withAlpha(color, 0.12),
          borderWidth: 2,
          pointBackgroundColor: color,
        };
      });
      attrsRadarUrl = await createMultiRadarPng(labels, datasets, 25);
    } catch {
      attrsRadarUrl = null;
    }
  }

  return { statsRadarUrl, attrsRadarUrl };
}

function isGkProfile(player, stats) {
  const pos = String(player?.position ?? '').toUpperCase();
  if (pos === 'GK' || pos === 'G') return true;
  const s = stats?.saves;
  return s != null && s !== '' && Number.isFinite(Number(s));
}

function buildBarData(stats, isGk) {
  const labels = [];
  const data = [];
  const push = (label, key) => {
    const v = stats[key];
    if (v == null || v === '') return;
    const n = Number(v);
    if (!Number.isFinite(n) || n < 0) return;
    labels.push(label);
    data.push(n);
  };

  if (isGk) {
    push('Saves', 'saves');
    push('Clean sheets', 'clean_sheets');
    push('Goals conceded', 'goals_conceded');
    push('Catches', 'catches');
    push('Punches', 'punches');
  }
  push('Goals', 'goals');
  push('Assists', 'assists');
  push('Shots on target', 'shots_on_target');
  push('Appearances', 'appearances');

  if (labels.length === 0) {
    labels.push('Goals', 'Assists');
    data.push(Number(stats.goals) || 0, Number(stats.assists) || 0);
  }
  return { labels, data };
}

/**
 * Renders profile + compare-style radars and season bar into PNG data URLs for jsPDF.
 */
export async function capturePlayerProfileCharts(player) {
  registerDashboardCharts();

  const stats = player?.stats ?? {};
  const attrs = player?.attributes ?? {};
  const isGk = isGkProfile(player, stats);
  const attrOrder = isGk ? GK_ATTR_ORDER : OUTFIELD_ATTR_ORDER;
  const primary = chartColors[0] || '#0ea5e9';
  const barGreen = chartColors[1] || '#10b981';

  let radarDataUrl = null;
  let barDataUrl = null;
  let compareStatsRadarUrl = null;
  let compareAttrsRadarUrl = null;

  try {
    const fullRadarData = attrOrder.map(([key]) => {
      const n = Number(attrs[key]);
      return Number.isFinite(n) ? n : 0;
    });
    radarDataUrl = await createRadarPng(
      attrOrder.map(([, l]) => l),
      fullRadarData,
      primary,
      20,
    );
  } catch {
    radarDataUrl = null;
  }

  try {
    const statMaxes = computeStatMaxes([player], PDF_COMPARE_RADAR_STAT_KEYS);
    const attrMaxes = computeAttrMaxes([player], PDF_COMPARE_RADAR_ATTR_KEYS);
    const statLabels = PDF_COMPARE_RADAR_STAT_KEYS.map((k) => COMPARE_STAT_LABELS[k] ?? k);
    const statNorm = PDF_COMPARE_RADAR_STAT_KEYS.map((k) =>
      normalizeRadarValue(stats[k], statMaxes[k] ?? 1),
    );
    const attrLabels = PDF_COMPARE_RADAR_ATTR_KEYS.map((k) => COMPARE_ATTR_LABELS[k] ?? k);
    const attrNorm = PDF_COMPARE_RADAR_ATTR_KEYS.map((k) =>
      normalizeRadarValue(attrs[k], attrMaxes[k] ?? 100),
    );
    compareStatsRadarUrl = await createRadarPng(statLabels, statNorm, primary, 25);
    compareAttrsRadarUrl = await createRadarPng(attrLabels, attrNorm, primary, 25);
  } catch {
    compareStatsRadarUrl = null;
    compareAttrsRadarUrl = null;
  }

  try {
    const { labels, data } = buildBarData(stats, isGk);
    const cw2 = 560;
    const ch2 = 380;
    const canvas2 = document.createElement('canvas');
    canvas2.width = cw2;
    canvas2.height = ch2;
    attachOffscreenCanvas(canvas2);
    try {
      const ctx2 = canvas2.getContext('2d');
      if (ctx2) {
        const bar = new Chart(ctx2, {
          type: 'bar',
          data: {
            labels,
            datasets: [
              {
                label: 'Season totals',
                data,
                backgroundColor: barGreen,
                borderRadius: 6,
              },
            ],
          },
          options: {
            responsive: false,
            devicePixelRatio: 1,
            animation: false,
            layout: { padding: 6 },
            plugins: {
              legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } },
            },
            scales: {
              x: {
                ticks: { maxRotation: 35, minRotation: 0, font: { size: 10 } },
                grid: { display: false },
              },
              y: {
                beginAtZero: true,
                ticks: { font: { size: 10 } },
                grid: { color: 'rgba(0,0,0,0.06)' },
              },
            },
          },
        });
        bar.update('none');
        await flushCanvasPaint();
        barDataUrl = canvas2.toDataURL('image/png', 1.0);
        bar.destroy();
      }
    } finally {
      canvas2.remove();
    }
  } catch {
    barDataUrl = null;
  }

  return {
    radarDataUrl,
    barDataUrl,
    compareStatsRadarUrl,
    compareAttrsRadarUrl,
  };
}

/** MIME type for HTML5 drag payload when adding a player to the compare list. */
export const COMPARE_PLAYER_MIME = 'application/x-ase-player-compare';

/** @param {object} player */
export function buildCompareDragPayload(player) {
  return JSON.stringify({
    id: player.id,
    name: player?.name ?? '—',
    image_url: player?.image_url ?? null,
  });
}

/** @param {DataTransfer} dataTransfer */
export function parseCompareDragPayload(dataTransfer) {
  const raw = dataTransfer.getData(COMPARE_PLAYER_MIME);
  if (!raw) return null;
  try {
    const o = JSON.parse(raw);
    if (o?.id == null) return null;
    return o;
  } catch {
    return null;
  }
}

/** @param {DataTransfer} dataTransfer */
export function dataTransferHasComparePlayer(dataTransfer) {
  return [...dataTransfer.types].includes(COMPARE_PLAYER_MIME);
}

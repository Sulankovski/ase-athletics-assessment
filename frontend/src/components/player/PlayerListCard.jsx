import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { formatSalary, formatShortDate, formatMarketValue } from '@/utils/format';
import { PLAYER_NAV_FROM_PLAYERS_LIST } from '@/constants/navigation';
import { COMPARE_PLAYER_MIME, buildCompareDragPayload } from '@/constants/compareDnD';
import { useComparePlayers } from '@/context/ComparePlayersContext';
import { highlightText } from '@/utils/highlightSearch';

function isLikelyHttpImage(s) {
  return typeof s === 'string' && (s.startsWith('http') || s.startsWith('/'));
}

function displayInitials(name) {
  if (!name || typeof name !== 'string') return '?';
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length >= 2)
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  return name.trim().slice(0, 2).toUpperCase() || '?';
}

function displayStr(v) {
  if (v == null || v === '') return '—';
  return String(v);
}

export default function PlayerListCard({ player, highlightQuery = '' }) {
  const id = player?.id;
  const [detailsOpen, setDetailsOpen] = useState(false);
  const { addForCompare, isInCompareList, beginCompareListDrag } = useComparePlayers();
  if (id == null) return null;

  const inCompare = isInCompareList(id);

  const contract = player?.contract ?? {};
  const contractBits = [];
  if (contract.salary != null && Number.isFinite(Number(contract.salary))) {
    contractBits.push(formatSalary(contract.salary));
  }
  if (contract.contract_end) {
    contractBits.push(`Ends ${formatShortDate(contract.contract_end)}`);
  }
  const contractSummary = contractBits.length > 0 ? contractBits.join(' · ') : '—';

  const detailRows = [
    ['Name', displayStr(player?.name)],
    ['Age', displayStr(player?.age)],
    ['Team', displayStr(player?.team)],
    ['Position', displayStr(player?.position)],
    ['Jersey number', displayStr(player?.jersey_number)],
    ['Preferred foot', displayStr(player?.preferred_foot)],
    ['Height', player?.height ? `${player.height} cm` : '—'],
    ['Weight', player?.weight ? `${player.weight} kg` : '—'],
    ['Image URL', displayStr(player?.image_url)],
    ['Market value', formatMarketValue(player?.market_value)],
    ['Contract', contractSummary],
  ];

  const collapsedSurface = inCompare
    ? 'border border-emerald-400/60 bg-emerald-50'
    : 'border border-primary-800/25 bg-white';

  const expandedSurface = inCompare
    ? 'z-20 overflow-visible rounded-b-none rounded-t-lg border-x border-b-0 border-emerald-400/60 bg-emerald-50 shadow-none drop-shadow-md'
    : 'z-20 overflow-visible rounded-b-none rounded-t-lg border-x border-b-0 border-primary-800/25 bg-primary-100 shadow-none drop-shadow-md';

  const detailPanelSurface = inCompare
    ? 'border-x border-b border-t border-emerald-400/60 bg-emerald-50'
    : 'border-x border-b border-t border-primary-800/25 bg-primary-100';

  const treeSpine = inCompare ? 'border-l border-emerald-600/35' : 'border-l border-primary-700/25';
  const treeBranch = inCompare ? 'border-t border-emerald-600/35' : 'border-t border-primary-700/25';
  const detailLabelTone = inCompare ? 'text-emerald-900/70' : 'text-primary-900/70';

  return (
    <div
      draggable
      onDragStart={(e) => {
        beginCompareListDrag();
        e.dataTransfer.setData(COMPARE_PLAYER_MIME, buildCompareDragPayload(player));
        e.dataTransfer.effectAllowed = 'copy';
      }}
      className={`relative block min-w-0 cursor-grab rounded-lg border-t-4 border-t-primary-700 p-0 active:cursor-grabbing ${
        detailsOpen ? expandedSurface : `z-0 overflow-hidden rounded-lg shadow-base ${collapsedSurface}`
      }`}
    >
      <div className="flex gap-3 p-4 tablet:gap-4 tablet:p-5">
        <Link
          draggable={false}
          to={`/players/${id}`}
          state={PLAYER_NAV_FROM_PLAYERS_LIST}
          className="flex h-16 w-16 shrink-0 tablet:h-[4.5rem] tablet:w-[4.5rem]"
        >
          {isLikelyHttpImage(player?.image_url) ? (
            <img
              src={player.image_url}
              alt=""
              className="h-full w-full rounded-xl border border-neutral-gray200 object-cover shadow-sm"
            />
          ) : (
            <div
              className="flex h-full w-full items-center justify-center rounded-xl bg-gradient-to-br from-primary-600 to-primary-800 text-lg font-bold text-white shadow-sm tablet:text-xl"
              aria-hidden
            >
              {displayInitials(player?.name)}
            </div>
          )}
        </Link>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <Link
              draggable={false}
              to={`/players/${id}`}
              state={PLAYER_NAV_FROM_PLAYERS_LIST}
              className="min-w-0 truncate text-base font-bold leading-tight text-neutral-gray900 hover:text-primary-800 tablet:text-lg"
            >
              {highlightText(player?.name, highlightQuery)}
            </Link>
            <button
              type="button"
              draggable={false}
              className={`shrink-0 rounded-md p-1 text-primary-700 transition-colors ${
                detailsOpen
                  ? inCompare
                    ? 'hover:bg-emerald-200/50'
                    : 'hover:bg-primary-200/50'
                  : 'hover:bg-primary-50'
              }`}
              aria-expanded={detailsOpen}
              aria-label={detailsOpen ? 'Hide details' : 'Show details'}
              onClick={(e) => {
                e.preventDefault();
                setDetailsOpen((v) => !v);
              }}
            >
              <ChevronDown
                className={`h-5 w-5 transition-transform duration-200 ${detailsOpen ? 'rotate-180' : ''}`}
                aria-hidden
              />
            </button>
          </div>
          <div className="mt-2 flex flex-col items-stretch gap-3 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-4">
            <div className="min-w-0 space-y-1 tablet:flex-1">
              <p className="text-sm text-neutral-gray600">
                Age{' '}
                <span className="font-semibold text-neutral-gray800">
                  {highlightText(player?.age, highlightQuery)}
                </span>
              </p>
              <p className="truncate text-sm text-neutral-gray600">
                {highlightText(player?.team, highlightQuery)}
              </p>
              <p className="text-sm font-medium text-primary-800">
                {highlightText(player?.position, highlightQuery)}
              </p>
            </div>
            {!inCompare && (
              <button
                type="button"
                draggable={false}
                className="btn-primary w-full max-w-[11rem] shrink-0 self-center py-1.5 px-3 text-xs tablet:max-w-none tablet:w-auto tablet:py-2 tablet:px-4 tablet:text-sm desktop:py-2.5 desktop:px-5 large:py-3 large:px-6"
                onClick={() => addForCompare(player)}
              >
                Compare
              </button>
            )}
          </div>
        </div>
      </div>

      {detailsOpen && (
        <div
          className={`absolute left-0 right-0 top-full z-10 -mt-px rounded-b-lg px-4 pb-4 pt-3 tablet:px-5 ${detailPanelSurface}`}
        >
          <div className={`relative ml-0.5 pl-3.5 tablet:ml-1 tablet:pl-4 ${treeSpine}`}>
            <dl className="space-y-2 text-xs tablet:text-sm">
              {detailRows.map(([label, value]) => (
                <div
                  key={label}
                  className="relative -ml-3.5 grid grid-cols-[auto,1fr] gap-x-3 gap-y-0.5 pl-3.5 tablet:-ml-4 tablet:pl-4"
                >
                  <span
                    className={`pointer-events-none absolute left-0 top-[0.65em] w-2.5 tablet:w-3 ${treeBranch}`}
                    aria-hidden
                  />
                  <dt className={`font-medium ${detailLabelTone}`}>{label}:</dt>
                  <dd className="min-w-0 break-words text-neutral-gray800">
                    {highlightText(value, highlightQuery)}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      )}
    </div>
  );
}

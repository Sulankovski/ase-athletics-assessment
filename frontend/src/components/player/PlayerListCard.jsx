import { Link } from 'react-router-dom';
import { formatSalary, formatShortDate, formatMarketValue } from '@/utils/format';

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

export default function PlayerListCard({ player }) {
  const id = player?.id;
  if (id == null) return null;

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

  return (
    <Link
      to={`/players/${id}`}
      className="group/player-card dashboard-card relative z-0 block min-w-0 overflow-visible rounded-t-lg !rounded-b-none !bg-white p-0 transition-[background-color,box-shadow] duration-300 ease-in-out hover:z-30 hover:!bg-primary-100 hover:shadow-lg hover:shadow-primary-900/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40 focus-visible:ring-offset-2"
    >
      <div className="flex min-w-0 gap-4 bg-transparent p-4 tablet:p-5">
        <div className="h-16 w-16 shrink-0 tablet:h-[4.5rem] tablet:w-[4.5rem]">
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
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-base font-bold leading-tight text-neutral-gray900 tablet:text-lg">
            {player?.name ?? '—'}
          </p>
          <p className="mt-1 text-sm text-neutral-gray600">
            Age <span className="font-semibold text-neutral-gray800">{player?.age ?? '—'}</span>
          </p>
          <p className="mt-1 truncate text-sm text-neutral-gray600">{player?.team ?? '—'}</p>
          <p className="mt-0.5 text-sm font-medium text-primary-800">{player?.position ?? '—'}</p>
        </div>
      </div>

      {/* Flush below summary, same width as card — continued border shell */}
      <div className="pointer-events-none absolute left-[-1px] right-[-1px] top-full z-50 -mt-px box-border overflow-hidden rounded-b-lg border-x border-b border-primary-800/25 border-t-0 bg-primary-100 opacity-0 shadow-md shadow-primary-900/15 transition-[opacity,box-shadow] duration-500 ease-out delay-0 group-hover/player-card:pointer-events-auto group-hover/player-card:opacity-100 group-hover/player-card:shadow-lg group-hover/player-card:shadow-primary-900/20 group-hover/player-card:delay-[650ms]">
        <div className="bg-primary-100 px-4 pb-4 pt-3 tablet:px-5 tablet:pb-5">
          <dl className="space-y-2 text-xs tablet:text-sm">
            {detailRows.map(([label, value]) => (
              <div key={label} className="grid grid-cols-[auto,1fr] gap-x-3 gap-y-0.5">
                <dt className="font-medium text-primary-900/70">{label}:</dt>
                <dd className="min-w-0 break-words text-neutral-gray800">{value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </Link>
  );
}

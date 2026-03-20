import { Link } from 'react-router-dom';
import { formatAge, formatMarketValue, formatSalary, formatShortDate } from '@/utils/format';
import { PLAYER_NAV_FROM_COMPARE } from '@/constants/navigation';
import { COMPARE_PARAM } from '@/constants/compareParams';
import ComparePlayerMetricsRadars from '@/components/compare/ComparePlayerMetricsRadars';

function isLikelyHttpImage(s) {
  return typeof s === 'string' && (s.startsWith('http') || s.startsWith('/'));
}

/** Inline chip; highlights when `hoveredParam === paramKey` (synced across all compare cards). */
function Field({
  paramKey,
  label,
  children,
  className = '',
  hoveredParam,
  onParamHover,
}) {
  const widthCls = 'inline-flex w-fit max-w-full min-w-0';
  const highlighted = hoveredParam === paramKey;
  return (
    <div
      className={`${widthCls} flex-col gap-0.5 rounded-md border px-2.5 py-1.5 transition-shadow duration-150 ${
        highlighted
          ? 'z-[1] border-primary-400 bg-primary-50 ring-2 ring-primary-500/70 ring-offset-1 ring-offset-white shadow-sm'
          : 'border-neutral-200/90 bg-neutral-gray50/90'
      } ${className}`}
      onMouseEnter={() => onParamHover?.(paramKey)}
    >
      <span className="whitespace-nowrap text-[10px] font-semibold uppercase tracking-wide text-neutral-gray500">
        {label}
      </span>
      <div className="break-words text-sm text-neutral-gray900">{children}</div>
    </div>
  );
}

export default function ComparePlayerCard({
  player,
  hoveredParam,
  onParamHover,
  selectedStatKeys = [],
  selectedAttributeKeys = [],
  statMaxes = {},
  attrMaxes = {},
  chartColorIndex = 0,
}) {
  if (!player) return null;

  const salary = player.contract?.salary;
  const contractEnd = player.contract?.contract_end;

  const thumbClass =
    'h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-neutral-gray100 ring-1 ring-neutral-200/80 tablet:h-24 tablet:w-24';

  const fieldProps = { hoveredParam, onParamHover };

  return (
    <article className="dashboard-card flex min-w-0 flex-col overflow-hidden">
      <div className="flex min-w-0 flex-col gap-3 p-3 tablet:p-4">
        <div className="flex min-w-0 items-start gap-3">
          <div className={thumbClass}>
            {isLikelyHttpImage(player.image_url) ? (
              <img
                src={player.image_url}
                alt=""
                className="h-full w-full object-cover object-top"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-100 to-primary-200 text-lg font-bold text-primary-800">
                {(player.name || '?').slice(0, 2).toUpperCase()}
              </div>
            )}
          </div>
          <h2 className="min-w-0 flex-1 pt-0.5 text-base font-bold leading-tight text-neutral-gray900 tablet:text-lg">
            <Link
              to={`/players/${player.id}`}
              state={PLAYER_NAV_FROM_COMPARE}
              className="text-primary-800 hover:text-primary-900 hover:underline underline-offset-2 break-words"
            >
              {player.name ?? '—'}
            </Link>
          </h2>
        </div>

        <div className="flex min-w-0 flex-wrap content-start gap-2">
          <Field paramKey={COMPARE_PARAM.age} label="Age" {...fieldProps}>
            {formatAge(player.age)}
          </Field>
          <Field paramKey={COMPARE_PARAM.team} label="Team" {...fieldProps}>
            {player.team ?? '—'}
          </Field>
          <Field paramKey={COMPARE_PARAM.position} label="Position" {...fieldProps}>
            {player.position ?? '—'}
          </Field>
          <Field paramKey={COMPARE_PARAM.jersey_number} label="Jersey number" {...fieldProps}>
            {player.jersey_number ?? '—'}
          </Field>
          <Field paramKey={COMPARE_PARAM.preferred_foot} label="Preferred foot" {...fieldProps}>
            {player.preferred_foot ?? '—'}
          </Field>
          <Field paramKey={COMPARE_PARAM.height} label="Height" {...fieldProps}>
            {player.height ?? '—'}
          </Field>
          <Field paramKey={COMPARE_PARAM.weight} label="Weight" {...fieldProps}>
            {player.weight ?? '—'}
          </Field>
          <Field paramKey={COMPARE_PARAM.market_value} label="Market value" {...fieldProps}>
            {formatMarketValue(player.market_value)}
          </Field>
          <Field paramKey={COMPARE_PARAM.salary} label="Salary" {...fieldProps}>
            {formatSalary(salary)}
          </Field>
          <Field paramKey={COMPARE_PARAM.contract_end} label="Contract end" {...fieldProps}>
            {formatShortDate(contractEnd)}
          </Field>
        </div>

        <ComparePlayerMetricsRadars
          player={player}
          selectedStatKeys={selectedStatKeys}
          selectedAttributeKeys={selectedAttributeKeys}
          statMaxes={statMaxes}
          attrMaxes={attrMaxes}
          colorIndex={chartColorIndex}
        />
      </div>
    </article>
  );
}

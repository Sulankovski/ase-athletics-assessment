import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Minus } from 'lucide-react';
import { useComparePlayers } from '@/context/ComparePlayersContext';
import { dataTransferHasComparePlayer, parseCompareDragPayload } from '@/constants/compareDnD';

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

function CompareChipAvatar({ name, imageUrl }) {
  if (isLikelyHttpImage(imageUrl)) {
    return (
      <img
        src={imageUrl}
        alt=""
        className="h-9 w-9 shrink-0 rounded-lg border border-neutral-gray200 object-cover"
      />
    );
  }
  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-800 text-xs font-bold text-white"
      aria-hidden
    >
      {displayInitials(name)}
    </div>
  );
}

const APP_COMPARE_ROUTE = /^\/(dashboard|players|compare)(\/|$)/;

/** Exact list route: /players (ignore query string in pathname). */
function isAllPlayersListPath(pathname) {
  return pathname === '/players';
}

export default function ComparePlayersBar() {
  const location = useLocation();
  const { isAuthenticated } = useSelector((state) => state.auth);
  const {
    selected,
    addForCompare,
    removeFromCompare,
    requestCompare,
    infoMessage,
    compareListDragActive,
  } = useComparePlayers();
  const [dropActive, setDropActive] = useState(false);

  useEffect(() => {
    const end = () => setDropActive(false);
    window.addEventListener('dragend', end);
    return () => window.removeEventListener('dragend', end);
  }, []);

  const onPlayersList = isAllPlayersListPath(location.pathname);
  const showBar =
    isAuthenticated &&
    APP_COMPARE_ROUTE.test(location.pathname) &&
    (selected.length > 0 || (onPlayersList && compareListDragActive));

  if (!showBar) return null;

  const handleDragOver = (e) => {
    if (!dataTransferHasComparePlayer(e.dataTransfer)) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDragEnter = (e) => {
    if (!dataTransferHasComparePlayer(e.dataTransfer)) return;
    e.preventDefault();
    setDropActive(true);
  };

  const handleDragLeave = (e) => {
    if (!e.currentTarget.contains(e.relatedTarget)) {
      setDropActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDropActive(false);
    const payload = parseCompareDragPayload(e.dataTransfer);
    if (payload) addForCompare(payload);
  };

  return (
    <div
      className="sticky top-16 tablet:top-[4.25rem] z-40 w-full border-b border-neutral-gray200 bg-neutral-gray50"
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <div className="mx-auto w-full max-w-6xl px-4 pb-3 pt-2 tablet:px-6 tablet:pb-4 tablet:pt-3 desktop:px-8">
        <div className="flex flex-col items-stretch gap-3 desktop:flex-row desktop:items-center desktop:justify-center desktop:gap-6">
          <div
            className={`flex min-h-[3.25rem] flex-1 flex-col items-center gap-2 rounded-xl transition-colors tablet:flex-row tablet:flex-wrap tablet:justify-center ${
              dropActive ? 'bg-primary-100/50 ring-2 ring-primary-400/40 ring-inset' : ''
            }`}
            role="region"
            aria-label="Compare list drop zone"
          >
            {selected.length === 0 && onPlayersList && compareListDragActive ? (
              <div
                className={`flex w-full min-h-[3.25rem] items-center justify-center rounded-xl border-2 border-dashed px-4 py-3 text-center text-sm tablet:min-w-[12rem] tablet:flex-1 ${
                  dropActive
                    ? 'border-primary-500 text-primary-900'
                    : 'border-neutral-gray300 text-neutral-gray600'
                }`}
              >
                Drag a player card here to start comparing (up to 4 players)
              </div>
            ) : (
              <div
                className="flex flex-col items-center gap-2 tablet:flex-row tablet:flex-wrap tablet:justify-center"
                role="list"
                aria-label="Players selected for comparison"
              >
                {selected.map((p) => (
                  <div
                    key={String(p.id)}
                    role="listitem"
                    className="flex w-full max-w-sm items-center gap-2 rounded-xl bg-neutral-gray50 px-3 py-2 shadow-md shadow-neutral-900/10 tablet:w-auto tablet:max-w-[15rem] transition-shadow hover:shadow-lg hover:shadow-neutral-900/12"
                  >
                    <CompareChipAvatar name={p.name} imageUrl={p.image_url} />
                    <span className="min-w-0 flex-1 truncate text-sm font-medium text-neutral-gray900">
                      {p.name}
                    </span>
                    <button
                      type="button"
                      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-neutral-gray300/80 bg-neutral-gray100 text-neutral-700 shadow-sm transition-colors hover:bg-neutral-gray200/80"
                      aria-label={`Remove ${p.name} from compare`}
                      onClick={() => removeFromCompare(p.id)}
                    >
                      <Minus className="h-4 w-4" strokeWidth={2.5} aria-hidden />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
          <div className="flex w-full flex-col items-stretch gap-2 desktop:w-auto desktop:shrink-0">
            <button
              type="button"
              className="btn-primary w-full justify-center py-2 px-4 text-sm desktop:w-auto"
              onClick={requestCompare}
            >
              Compare
            </button>
          </div>
        </div>
        {infoMessage && (
          <p
            className="mt-3 mx-auto max-w-lg rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-950"
            role="status"
          >
            {infoMessage}
          </p>
        )}
      </div>
    </div>
  );
}

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

export const COMPARE_MIN = 2;
export const COMPARE_MAX = 4;

/** @typedef {{ id: number|string, name: string, image_url: string|null|undefined }} ComparePlayerEntry */

const ComparePlayersContext = createContext(null);

function sameId(a, b) {
  if (a == null || b == null) return false;
  return String(a) === String(b);
}

function serializePlayer(player) {
  return {
    id: player.id,
    name: player?.name ?? '—',
    image_url: player?.image_url ?? null,
  };
}

export function ComparePlayersProvider({ children }) {
  const [selected, setSelected] = useState(
    /** @type {ComparePlayerEntry[]} */ ([]),
  );
  const [infoMessage, setInfoMessage] = useState(null);
  /** True while dragging a player card toward the compare list (All players page). */
  const [compareListDragActive, setCompareListDragActive] = useState(false);
  const selectedRef = useRef(selected);

  useEffect(() => {
    selectedRef.current = selected;
  }, [selected]);

  useEffect(() => {
    const endDrag = () => setCompareListDragActive(false);
    window.addEventListener('dragend', endDrag);
    return () => window.removeEventListener('dragend', endDrag);
  }, []);

  useEffect(() => {
    if (!infoMessage) return undefined;
    const t = window.setTimeout(() => setInfoMessage(null), 5000);
    return () => window.clearTimeout(t);
  }, [infoMessage]);

  const clearInfoMessage = useCallback(() => setInfoMessage(null), []);

  const beginCompareListDrag = useCallback(() => setCompareListDragActive(true), []);

  const addForCompare = useCallback((player) => {
    if (player?.id == null) return;
    const prev = selectedRef.current;
    if (prev.some((p) => sameId(p.id, player.id))) return;
    if (prev.length >= COMPARE_MAX) {
      setInfoMessage(`You can add up to ${COMPARE_MAX} players to compare.`);
      return;
    }
    const next = [...prev, serializePlayer(player)];
    selectedRef.current = next;
    setSelected(next);
  }, []);

  const removeFromCompare = useCallback((id) => {
    setSelected((prev) => {
      const next = prev.filter((p) => !sameId(p.id, id));
      selectedRef.current = next;
      return next;
    });
  }, []);

  const isInCompareList = useCallback(
    (pid) => selected.some((p) => sameId(p.id, pid)),
    [selected],
  );

  const requestCompare = useCallback(() => {
    const len = selectedRef.current.length;
    if (len < COMPARE_MIN) {
      setInfoMessage(`Select at least ${COMPARE_MIN} players to compare.`);
      return;
    }
    setInfoMessage(null);
    // placeholder — future: navigate to compare view or open modal
  }, []);

  const value = useMemo(
    () => ({
      selected,
      addForCompare,
      removeFromCompare,
      isInCompareList,
      requestCompare,
      infoMessage,
      clearInfoMessage,
      compareListDragActive,
      beginCompareListDrag,
    }),
    [
      selected,
      addForCompare,
      removeFromCompare,
      isInCompareList,
      requestCompare,
      infoMessage,
      clearInfoMessage,
      compareListDragActive,
      beginCompareListDrag,
    ],
  );

  return (
    <ComparePlayersContext.Provider value={value}>{children}</ComparePlayersContext.Provider>
  );
}

export function useComparePlayers() {
  const ctx = useContext(ComparePlayersContext);
  if (!ctx) {
    throw new Error('useComparePlayers must be used within ComparePlayersProvider');
  }
  return ctx;
}

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft, Loader2, Menu } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PlayerProfileView from '@/components/player/PlayerProfileView';
import { registerDashboardCharts } from '@/components/dashboard/registerCharts';
import { createPlayerReport, deletePlayer, fetchPlayerById, updatePlayer } from '@/services/playerService';
import { clonePlayerForEdit, buildPlayerUpdatePayload } from '@/utils/playerEdit';
import { cloneEmptyReportForCreate, buildReportCreatePayload, isReportCreateDraftValid } from '@/utils/reportEdit';
import ReportEditAddPanel from '@/components/player/ReportEditAddPanel';
import { useComparePlayers } from '@/context/ComparePlayersContext';

registerDashboardCharts();

export default function PlayerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const fromCompare = location.state?.from === 'compare';
  const fromPlayers = location.state?.from === 'players';
  const backHref = fromCompare ? '/compare' : fromPlayers ? '/players' : '/dashboard';
  const backLabel = fromCompare
    ? 'Back to compare'
    : fromPlayers
      ? 'Back to player list'
      : 'Back to dashboard';
  const returnLinkLabel = fromCompare
    ? 'Return to compare'
    : fromPlayers
      ? 'Return to player list'
      : 'Return to dashboard';

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState(null);
  /** Snapshot when entering edit mode — used to detect changes. */
  const [editBaseline, setEditBaseline] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteConfirmInput, setDeleteConfirmInput] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteError, setDeleteError] = useState(null);
  const [addReportModalOpen, setAddReportModalOpen] = useState(false);
  const [addReportDraft, setAddReportDraft] = useState(null);
  const [addReportSaving, setAddReportSaving] = useState(false);
  const [addReportError, setAddReportError] = useState(null);
  const [reportsRefreshTrigger, setReportsRefreshTrigger] = useState(0);
  const performanceTitleRef = useRef(null);
  const [performanceTitleWraps, setPerformanceTitleWraps] = useState(false);
  const [profileActionsOpen, setProfileActionsOpen] = useState(false);
  const profileActionsRef = useRef(null);
  const { addForCompare, isInCompareList } = useComparePlayers();

  const isDirty = useMemo(() => {
    if (!draft || !editBaseline) return false;
    return JSON.stringify(draft) !== JSON.stringify(editBaseline);
  }, [draft, editBaseline]);

  const canConfirmDelete = useMemo(() => {
    if (!player?.name) return false;
    return deleteConfirmInput.trim() === String(player.name).trim();
  }, [player?.name, deleteConfirmInput]);

  const playerInCompareList = player?.id != null && isInCompareList(player.id);

  useEffect(() => {
    if (!deleteModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !deleteLoading) {
        setDeleteModalOpen(false);
        setDeleteConfirmInput('');
        setDeleteError(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [deleteModalOpen, deleteLoading]);

  const openDeleteModal = () => {
    setDeleteConfirmInput('');
    setDeleteError(null);
    setDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (deleteLoading) return;
    setDeleteModalOpen(false);
    setDeleteConfirmInput('');
    setDeleteError(null);
  };

  const handleDeletePlayer = async () => {
    if (!canConfirmDelete || id == null) return;
    setDeleteLoading(true);
    setDeleteError(null);
    try {
      await deletePlayer(id);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const detail = err?.data?.detail;
      let msg =
        err?.data?.message ||
        err?.message ||
        'Could not delete player';
      if (typeof detail === 'string') msg = detail;
      else if (Array.isArray(detail) && detail.length > 0) {
        msg = detail.map((d) => d?.message ?? d).join('; ');
      }
      setDeleteError(msg);
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    if (id == null || String(id).trim() === '') {
      setLoading(false);
      setPlayer(null);
      setError(new Error('Missing player id'));
      return undefined;
    }

    setLoading(true);
    setError(null);

    fetchPlayerById(id)
      .then((data) => {
        if (!cancelled) setPlayer(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  useLayoutEffect(() => {
    if (loading) return undefined;
    const el = performanceTitleRef.current;
    if (!el) return undefined;

    const measure = () => {
      const node = performanceTitleRef.current;
      if (!node) return;
      const tolerance = 2;
      setPerformanceTitleWraps(node.scrollHeight > node.clientHeight + tolerance);
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    if (el.parentElement) ro.observe(el.parentElement);

    return () => {
      ro.disconnect();
    };
  }, [loading, isEditing, player, error]);

  useEffect(() => {
    if (!profileActionsOpen) return undefined;
    const close = (e) => {
      if (profileActionsRef.current && !profileActionsRef.current.contains(e.target)) {
        setProfileActionsOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [profileActionsOpen]);

  useEffect(() => {
    if (loading) setProfileActionsOpen(false);
  }, [loading]);

  useEffect(() => {
    if (deleteModalOpen || addReportModalOpen) setProfileActionsOpen(false);
  }, [deleteModalOpen, addReportModalOpen]);

  useEffect(() => {
    if (!addReportModalOpen) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape' && !addReportSaving) {
        setAddReportModalOpen(false);
        setAddReportDraft(null);
        setAddReportError(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [addReportModalOpen, addReportSaving]);

  useEffect(() => {
    if (!isEditing) {
      setDraft(null);
      setEditBaseline(null);
    }
  }, [isEditing]);

  const startEdit = () => {
    if (!player) return;
    const base = clonePlayerForEdit(player);
    setSaveError(null);
    setEditBaseline(base);
    setDraft(base);
    setIsEditing(true);
  };

  const cancelEdit = () => {
    setIsEditing(false);
    setSaveError(null);
  };

  const openAddReportModal = () => {
    if (!player) return;
    setAddReportDraft(cloneEmptyReportForCreate(player.name));
    setAddReportError(null);
    setAddReportModalOpen(true);
    setProfileActionsOpen(false);
  };

  const closeAddReportModal = () => {
    if (addReportSaving) return;
    setAddReportModalOpen(false);
    setAddReportDraft(null);
    setAddReportError(null);
  };

  const handleSaveNewReport = async () => {
    if (!addReportDraft || id == null) return;
    if (!isReportCreateDraftValid(addReportDraft)) {
      setAddReportError(
        'Scout name, date (YYYY-MM-DD), and all match fields (opponent, competition, result, minutes, position) are required.'
      );
      return;
    }
    setAddReportSaving(true);
    setAddReportError(null);
    try {
      await createPlayerReport(id, buildReportCreatePayload(addReportDraft));
      setAddReportModalOpen(false);
      setAddReportDraft(null);
      setReportsRefreshTrigger((t) => t + 1);
    } catch (err) {
      const detail = err?.data?.detail;
      let msg = err?.data?.message || err?.message || 'Could not create report';
      if (typeof detail === 'string') msg = detail;
      else if (Array.isArray(detail) && detail.length > 0) {
        msg = detail.map((d) => d?.message ?? d).join('; ');
      }
      setAddReportError(msg);
    } finally {
      setAddReportSaving(false);
    }
  };

  const handleSave = async () => {
    if (!draft || id == null) return;
    setSaving(true);
    setSaveError(null);
    const payload = buildPlayerUpdatePayload(draft);
    try {
      const updated = await updatePlayer(id, payload);
      setPlayer(updated);
      setIsEditing(false);
      setDraft(null);
    } catch (err) {
      const detail = err?.data?.detail;
      let msg =
        err?.data?.message ||
        err?.message ||
        'Could not save changes';
      if (typeof detail === 'string') msg = detail;
      else if (Array.isArray(detail) && detail.length > 0) {
        msg = detail.map((d) => d?.message ?? d).join('; ');
      }
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <PageLayout mainClassName="flex flex-col flex-1 min-h-0 bg-neutral-gray50">
      <div className="w-full max-w-none flex flex-1 flex-col min-h-0 min-w-0 px-4 tablet:px-6 desktop:px-8 xl:px-10 2xl:px-12 py-6 tablet:py-8 desktop:py-10">
        <Link
          to={backHref}
          className="inline-flex items-center gap-2 text-sm font-medium text-primary-700 hover:text-primary-800 shrink-0 mb-6"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden />
          {backLabel}
        </Link>

        {loading ? (
          <>
            <div className="min-w-0 shrink-0">
              <div className="mt-1 w-full min-w-0">
                <div className="flex flex-row items-center justify-between gap-3 tablet:gap-4">
                  <h1 className="text-2xl tablet:text-3xl desktop:text-4xl font-bold text-neutral-gray900 leading-tight break-words min-w-0 flex-1 pr-1 text-left">
                    Detailed performance &amp; attributes
                  </h1>
                  <div
                    className="invisible pointer-events-none flex shrink-0 items-center gap-2 self-center"
                    aria-hidden="true"
                  >
                    <div className="hidden lg:flex flex-wrap items-center justify-end gap-2">
                      <span className="btn-primary py-2 px-4 text-sm">Add report</span>
                      <span className="btn-primary py-2 px-4 text-sm">Compare</span>
                      <span className="btn-primary py-2 px-4 text-sm">Edit</span>
                      <span className="btn-danger py-2 px-4 text-sm">Delete</span>
                    </div>
                    <span className="lg:hidden inline-flex items-center justify-center rounded-md border border-neutral-gray300 bg-white p-2">
                      <span className="h-5 w-5 block" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
            <div
              className="flex flex-1 flex-col items-center justify-center gap-3 min-h-[35vh] tablet:min-h-[40vh] py-8 text-sm text-neutral-gray600"
              role="status"
              aria-live="polite"
            >
              <Loader2 className="h-8 w-8 shrink-0 animate-spin text-primary-600" aria-hidden />
              <p>Loading player…</p>
            </div>
          </>
        ) : (
          <>
            <div className="min-w-0 shrink-0">
              <div ref={profileActionsRef} className="mt-1 w-full min-w-0">
                <div className="flex flex-row items-center justify-between gap-3 tablet:gap-4">
                  <h1
                    ref={performanceTitleRef}
                    className={`text-2xl tablet:text-3xl desktop:text-4xl font-bold text-neutral-gray900 leading-tight break-words min-w-0 flex-1 pr-1 ${
                      performanceTitleWraps ? 'text-center' : 'text-left'
                    }`}
                  >
                    Detailed performance &amp; attributes
                  </h1>
                  {!error && player && (
                    <div className="flex shrink-0 items-center gap-2 self-center">
                      <div
                        id="profile-header-actions-desktop"
                        className="hidden lg:flex flex-wrap items-center justify-end gap-2"
                      >
                        {isEditing ? (
                          <>
                            <button
                              type="button"
                              onClick={cancelEdit}
                              disabled={saving}
                              className="btn-secondary py-2 px-4 text-sm disabled:opacity-50"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleSave}
                              disabled={saving || !isDirty}
                              title={!isDirty && !saving ? 'Change a field to save' : undefined}
                              className="btn-primary py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                              {saving ? 'Saving…' : 'Save'}
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              type="button"
                              onClick={openAddReportModal}
                              className="btn-primary py-2 px-4 text-sm"
                            >
                              Add report
                            </button>
                            {!playerInCompareList && (
                              <button
                                type="button"
                                onClick={() => addForCompare(player)}
                                className="btn-primary py-2 px-4 text-sm"
                              >
                                Compare
                              </button>
                            )}
                            <button type="button" onClick={startEdit} className="btn-primary py-2 px-4 text-sm">
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={openDeleteModal}
                              className="btn-danger py-2 px-4 text-sm"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                      <button
                        type="button"
                        className="lg:hidden inline-flex items-center justify-center rounded-md border border-neutral-gray300 bg-white p-2 text-neutral-gray800 shadow-sm hover:bg-neutral-gray50 transition-colors"
                        aria-expanded={profileActionsOpen}
                        aria-controls="profile-header-actions-mobile"
                        onClick={() => setProfileActionsOpen((o) => !o)}
                      >
                        <Menu className="h-5 w-5 shrink-0" aria-hidden />
                        <span className="sr-only">Profile actions</span>
                      </button>
                    </div>
                  )}
                </div>
                {!error && player && profileActionsOpen && (
                  <div
                    id="profile-header-actions-mobile"
                    className="lg:hidden mt-3 flex flex-col gap-2 rounded-lg border border-neutral-gray200 bg-white p-3 shadow-sm"
                  >
                    {isEditing ? (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileActionsOpen(false);
                            cancelEdit();
                          }}
                          disabled={saving}
                          className="btn-secondary w-full justify-center py-2 px-4 text-sm disabled:opacity-50"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileActionsOpen(false);
                            handleSave();
                          }}
                          disabled={saving || !isDirty}
                          title={!isDirty && !saving ? 'Change a field to save' : undefined}
                          className="btn-primary w-full justify-center py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {saving ? 'Saving…' : 'Save'}
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileActionsOpen(false);
                            openAddReportModal();
                          }}
                          className="btn-primary w-full justify-center py-2 px-4 text-sm"
                        >
                          Add report
                        </button>
                        {!playerInCompareList && (
                          <button
                            type="button"
                            onClick={() => {
                              setProfileActionsOpen(false);
                              addForCompare(player);
                            }}
                            className="btn-primary w-full justify-center py-2 px-4 text-sm"
                          >
                            Compare
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => {
                            setProfileActionsOpen(false);
                            startEdit();
                          }}
                          className="btn-primary w-full justify-center py-2 px-4 text-sm"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setProfileActionsOpen(false);
                            openDeleteModal();
                          }}
                          className="btn-danger w-full justify-center py-2 px-4 text-sm"
                        >
                          Delete
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            </div>

        {!loading && error && (
          <div
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            <p className="font-semibold">
              {error.status === 404 ? 'Player not found' : 'Could not load player'}
            </p>
            <p className="mt-1">{error.message}</p>
            <Link
              to={backHref}
              className="mt-3 inline-block text-sm font-medium text-primary-800 underline hover:no-underline"
            >
              {returnLinkLabel}
            </Link>
          </div>
        )}

        {saveError && !loading && (
          <div
            className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            <p className="font-semibold">Could not save</p>
            <p className="mt-1">{saveError}</p>
          </div>
        )}

        {!loading && !error && player && (
          <div className="mt-6 tablet:mt-8">
            <PlayerProfileView
              player={player}
              isEditing={isEditing}
              draft={draft}
              setDraft={setDraft}
              reportsRefreshTrigger={reportsRefreshTrigger}
            />
          </div>
        )}
          </>
        )}

        {addReportModalOpen && player && addReportDraft && (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="add-report-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Dismiss"
              onClick={closeAddReportModal}
              disabled={addReportSaving}
            />
            <div
              className="relative flex max-h-[min(92vh,900px)] w-full max-w-3xl flex-col rounded-lg border border-neutral-gray200 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="shrink-0 border-b border-neutral-gray100 bg-gradient-to-br from-primary-700 to-primary-900 px-4 py-3 tablet:px-5">
                <h2
                  id="add-report-title"
                  className="text-base tablet:text-lg font-bold text-white"
                >
                  Add report
                </h2>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4 tablet:px-6">
                <ReportEditAddPanel
                  mode="create"
                  variant="plain"
                  draft={addReportDraft}
                  setDraft={setAddReportDraft}
                />
              </div>
              <div className="shrink-0 space-y-2 border-t border-neutral-gray100 bg-neutral-gray50 px-4 py-3 tablet:px-5">
                {addReportError ? (
                  <p className="text-sm text-red-700" role="alert">
                    {addReportError}
                  </p>
                ) : null}
                <div className="flex flex-wrap justify-end gap-2">
                  <button
                    type="button"
                    onClick={closeAddReportModal}
                    disabled={addReportSaving}
                    className="btn-secondary py-2 px-4 text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSaveNewReport}
                    disabled={
                      addReportSaving ||
                      !isReportCreateDraftValid(addReportDraft)
                    }
                    title={
                      !isReportCreateDraftValid(addReportDraft) && !addReportSaving
                        ? 'Enter scout, date, and all match fields'
                        : undefined
                    }
                    className="btn-primary py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {addReportSaving ? 'Saving…' : 'Save report'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {deleteModalOpen && player && (
          <div
            className="fixed inset-0 z-[100] flex items-end justify-center p-4 sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-labelledby="delete-player-title"
          >
            <button
              type="button"
              className="absolute inset-0 bg-black/50"
              aria-label="Dismiss"
              onClick={closeDeleteModal}
              disabled={deleteLoading}
            />
            <div
              className="relative w-full max-w-md rounded-lg border border-neutral-gray200 bg-white shadow-xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="border-b border-neutral-gray100 bg-red-50 px-4 py-3 tablet:px-5">
                <h2
                  id="delete-player-title"
                  className="text-base tablet:text-lg font-bold text-red-900"
                >
                  Delete this player?
                </h2>
              </div>
              <div className="px-4 py-4 tablet:px-5 tablet:py-5 space-y-4 text-sm text-neutral-gray700">
                <p className="leading-relaxed">
                  This permanently removes{' '}
                  <span className="font-semibold text-neutral-gray900">{player.name}</span> and
                  related records. This cannot be undone.
                </p>
                <p className="text-xs text-neutral-gray600">
                  Type the player&apos;s full name exactly to enable delete:
                </p>
                <input
                  type="text"
                  className="input py-2 text-sm"
                  value={deleteConfirmInput}
                  onChange={(e) => setDeleteConfirmInput(e.target.value)}
                  placeholder={player.name}
                  autoComplete="off"
                  aria-label="Confirm player name"
                  disabled={deleteLoading}
                />
                {deleteError && (
                  <p className="text-xs text-red-700" role="alert">
                    {deleteError}
                  </p>
                )}
                <div className="flex flex-wrap justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    disabled={deleteLoading}
                    className="btn-secondary py-2 px-4 text-sm disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleDeletePlayer}
                    disabled={deleteLoading || !canConfirmDelete}
                    title={!canConfirmDelete && !deleteLoading ? 'Name must match exactly' : undefined}
                    className="btn-danger py-2 px-4 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deleteLoading ? 'Deleting…' : 'Delete player'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
}

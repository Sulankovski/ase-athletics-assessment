import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import PageLayout from '@/components/layout/PageLayout';
import PlayerProfileView from '@/components/player/PlayerProfileView';
import { registerDashboardCharts } from '@/components/dashboard/registerCharts';
import { deletePlayer, fetchPlayerById, updatePlayer } from '@/services/playerService';
import { clonePlayerForEdit, buildPlayerUpdatePayload } from '@/utils/playerEdit';

registerDashboardCharts();

export default function PlayerProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
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

  const isDirty = useMemo(() => {
    if (!draft || !editBaseline) return false;
    return JSON.stringify(draft) !== JSON.stringify(editBaseline);
  }, [draft, editBaseline]);

  const canConfirmDelete = useMemo(() => {
    if (!player?.name) return false;
    return deleteConfirmInput.trim() === String(player.name).trim();
  }, [player?.name, deleteConfirmInput]);

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
        {loading ? (
          <div
            className="flex flex-1 flex-col items-center justify-center gap-8 min-h-0 py-8 px-4 text-center"
            role="status"
            aria-live="polite"
          >
            <div className="max-w-2xl">
              <p className="text-xs tablet:text-sm font-medium text-primary-700">Player profile</p>
              <h1 className="mt-2 text-2xl tablet:text-3xl desktop:text-4xl font-bold text-neutral-gray900 leading-tight">
                Detailed performance &amp; attributes
              </h1>
            </div>
            <div className="flex flex-col items-center gap-3 text-sm text-neutral-gray600">
              <Loader2 className="h-8 w-8 shrink-0 animate-spin text-primary-600" aria-hidden />
              <p>Loading player…</p>
            </div>
          </div>
        ) : (
          <>
            <div className="min-w-0 shrink-0">
              <p className="text-xs tablet:text-sm font-medium text-primary-700">Player profile</p>
              <div className="mt-1 flex flex-col gap-3 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-4">
                <h1 className="text-2xl tablet:text-3xl desktop:text-4xl font-bold text-neutral-gray900 leading-tight min-w-0 flex-1">
                  Detailed performance &amp; attributes
                </h1>
                {!error && player && (
                  <div className="flex flex-wrap items-center gap-2 shrink-0 tablet:pt-0.5">
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
              to="/dashboard"
              className="mt-3 inline-block text-sm font-medium text-primary-800 underline hover:no-underline"
            >
              Return to dashboard
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
            />
          </div>
        )}
          </>
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

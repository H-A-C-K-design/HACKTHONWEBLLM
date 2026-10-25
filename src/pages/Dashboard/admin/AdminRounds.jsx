import { useState, useMemo } from 'react';
import { Calendar, Plus, Trash2, Edit3, Clock, CheckCircle2, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRealtime } from '../../../hooks/useRealtime';
import { createRound, updateRound, deleteRound } from '../../../firebase/db';
import GlassCard from '../../../components/GlassCard';
import GoldButton from '../../../components/GoldButton';
import EmptyState from '../../../components/EmptyState';
import { formatDate } from '../../../utils/formatDate';

export default function AdminRounds() {
  const { data: rawRounds } = useRealtime('rounds');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRound, setEditingRound] = useState(null);

  // Form states
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [order, setOrder] = useState(1);
  const [deadlineStr, setDeadlineStr] = useState('');
  const [isOpen, setIsOpen] = useState(true);
  const [saving, setSaving] = useState(false);

  const rounds = useMemo(() => {
    if (!rawRounds) return [];
    return Object.entries(rawRounds)
      .map(([id, r]) => ({ id, ...r }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [rawRounds]);

  const openCreateModal = () => {
    setEditingRound(null);
    setName('');
    setDescription('');
    setOrder(rounds.length + 1);
    // Default deadline: 3 days from now
    const d = new Date(Date.now() + 3 * 86400000);
    setDeadlineStr(d.toISOString().slice(0, 16));
    setIsOpen(true);
    setModalOpen(true);
  };

  const openEditModal = (r) => {
    setEditingRound(r);
    setName(r.name || '');
    setDescription(r.description || '');
    setOrder(r.order || 1);
    if (r.deadline) {
      const d = new Date(r.deadline);
      setDeadlineStr(d.toISOString().slice(0, 16));
    } else {
      setDeadlineStr('');
    }
    setIsOpen(r.open !== false);
    setModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error('Round name is required');
      return;
    }

    setSaving(true);
    try {
      const deadline = deadlineStr ? new Date(deadlineStr).getTime() : 0;
      const roundPayload = {
        name,
        description,
        order: Number(order) || 1,
        deadline,
        open: isOpen,
      };

      if (editingRound) {
        await updateRound(editingRound.id, roundPayload);
        toast.success('Round updated');
      } else {
        await createRound(roundPayload);
        toast.success('New round created!');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Failed to save round');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, rName) => {
    if (!window.confirm(`Delete round "${rName}"? Existing submissions will remain.`)) return;
    try {
      await deleteRound(id);
      toast.success('Round removed');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const toggleRoundOpen = async (r) => {
    try {
      await updateRound(r.id, { open: !r.open });
      toast.success(r.open ? 'Round closed to new submissions' : 'Round opened for submissions');
    } catch (err) {
      toast.error('Failed to toggle round status');
    }
  };

  return (
    <div className="admin-rounds-page">
      <div className="dash-section-header">
        <div>
          <h2 className="dash-heading">Rounds & Timeline Milestones</h2>
          <p className="dash-subheading">
            Schedule hackathon phases, configure submission deadlines, and lock/unlock stages
          </p>
        </div>

        <GoldButton onClick={openCreateModal} icon={<Plus size={18} />}>
          Add Round
        </GoldButton>
      </div>

      {rounds.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={Calendar}
            title="No Rounds Configured"
            description="Create Round 1 (e.g. Ideation & Architecture) to start the hackathon."
            action={openCreateModal}
            actionLabel="Initialize First Round"
          />
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {rounds.map((round) => {
            const isPast = round.deadline ? round.deadline < Date.now() : false;

            return (
              <GlassCard key={round.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <span className="priority-tag priority-important">Order: {round.order}</span>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>
                        {round.name}
                      </h3>
                      <span className={`status-badge ${round.open && !isPast ? 'status-submitted' : 'status-rejected'}`}>
                        {round.open && !isPast ? '● Active' : '● Closed'}
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '700px', marginBottom: '10px' }}>
                      {round.description || 'No description provided.'}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', color: 'var(--gold-400)' }}>
                      <Clock size={14} /> Deadline: {round.deadline ? formatDate(round.deadline) : 'No deadline'}
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <button
                      onClick={() => toggleRoundOpen(round)}
                      style={{
                        background: round.open ? 'rgba(255,165,2,0.1)' : 'rgba(46,213,115,0.1)',
                        border: `1px solid ${round.open ? 'rgba(255,165,2,0.3)' : 'rgba(46,213,115,0.3)'}`,
                        color: round.open ? '#ffa502' : '#2ed573',
                        borderRadius: '6px',
                        padding: '6px 12px',
                        cursor: 'pointer',
                        fontSize: '0.82rem',
                        fontWeight: 600,
                      }}
                    >
                      {round.open ? 'Close Round' : 'Re-open Round'}
                    </button>
                    <button
                      onClick={() => openEditModal(round)}
                      style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Edit3 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(round.id, round.name)}
                      style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', color: '#ff4757', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                    >
                      <Trash2 size={13} /> Delete
                    </button>
                  </div>
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}

      {/* Modal: Create/Edit Round */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">{editingRound ? 'Configure Round' : 'New Round'}</h3>
              <button className="modal-close" onClick={() => setModalOpen(false)}>✕</button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="input-label">Round Title *</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Round 1: Architecture & Prompt Design"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Execution Order</label>
                  <input
                    type="number"
                    value={order}
                    onChange={(e) => setOrder(e.target.value)}
                    className="input-field"
                    min={1}
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Deadline (Date & Time)</label>
                  <input
                    type="datetime-local"
                    value={deadlineStr}
                    onChange={(e) => setDeadlineStr(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Round Description / Requirements</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="input-field"
                  rows={3}
                  placeholder="Specify submission guidelines (e.g. 10-slide PPT covering problem, system prompt, architecture)..."
                />
              </div>

              <div className="form-group">
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={isOpen}
                    onChange={(e) => setIsOpen(e.target.checked)}
                    style={{ accentColor: 'var(--gold-500)', width: '16px', height: '16px' }}
                  />
                  <span>Open for submissions immediately</span>
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                <GoldButton variant="secondary" onClick={() => setModalOpen(false)}>
                  Cancel
                </GoldButton>
                <GoldButton type="submit" loading={saving}>
                  Save Round
                </GoldButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

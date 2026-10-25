import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  PlusCircle,
  LogIn,
  Copy,
  Check,
  Crown,
  Trash2,
  LogOut,
  AlertCircle,
  Sparkles,
  ShieldCheck,
  Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTeam } from '../../hooks/useTeam';
import { useRealtime } from '../../hooks/useRealtime';
import {
  createTeam,
  joinTeam,
  leaveTeam,
  removeMember,
  disbandTeam,
  lookupTeamByCode,
} from '../../firebase/db';
import { createTeamSchema, joinTeamSchema } from '../../utils/validators';
import GlassCard from '../../components/GlassCard';
import GoldButton from '../../components/GoldButton';
import Loader from '../../components/Loader';
import { formatDate } from '../../utils/formatDate';

export default function EventRegistration() {
  const { user, profile } = useAuth();
  const { team, members, isLeader, loading: teamLoading } = useTeam(profile?.teamId);
  const { data: settings } = useRealtime('settings');

  // Active form view: 'choice' | 'create' | 'join'
  const [activeTab, setActiveTab] = useState('choice');
  const [createdCodeModal, setCreatedCodeModal] = useState(null);
  const [copied, setCopied] = useState(false);
  const [previewTeam, setPreviewTeam] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [confirmDisband, setConfirmDisband] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Forms
  const {
    register: registerCreate,
    handleSubmit: handleSubmitCreate,
    formState: { errors: errorsCreate, isSubmitting: isSubmittingCreate },
    reset: resetCreate,
  } = useForm({
    resolver: zodResolver(createTeamSchema),
  });

  const {
    register: registerJoin,
    handleSubmit: handleSubmitJoin,
    formState: { errors: errorsJoin, isSubmitting: isSubmittingJoin },
    watch: watchJoin,
    reset: resetJoin,
  } = useForm({
    resolver: zodResolver(joinTeamSchema),
  });

  const maxTeamSize = settings?.event?.maxTeamSize || 4;
  const minTeamSize = settings?.event?.minTeamSize || 2;
  const tracks = settings?.tracks
    ? Object.entries(settings.tracks).map(([id, t]) => ({ id, ...t }))
    : [
        { id: '1', title: 'LLM Agents & Multi-Agent Systems' },
        { id: '2', title: 'Healthcare & Biotech Intelligence' },
        { id: '3', title: 'Next-Gen Education & Learning' },
        { id: '4', title: 'Open Innovation & Bleeding Edge LLMs' },
      ];

  // Copy code helper
  const handleCopy = (code) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast.success('Team code copied to clipboard!');
    setTimeout(() => setCopied(false), 2500);
  };

  // Create Team Submit
  const onCreateTeam = async (data) => {
    try {
      const res = await createTeam(
        user.uid,
        profile?.name || user.displayName || 'Participant',
        profile?.college || '',
        data
      );
      setCreatedCodeModal(res.code);
      resetCreate();
      toast.success('Team formed successfully!');
    } catch (err) {
      toast.error(err.message || 'Failed to create team');
    }
  };

  // Preview Team before Joining
  const handlePreview = async () => {
    const code = watchJoin('code');
    if (!code || code.length !== 6) {
      toast.error('Enter a valid 6-character code first');
      return;
    }
    setPreviewLoading(true);
    try {
      const found = await lookupTeamByCode(code.toUpperCase());
      if (!found) {
        toast.error('No team found matching this code');
        setPreviewTeam(null);
      } else {
        setPreviewTeam(found);
      }
    } catch (err) {
      toast.error('Error looking up team code');
    } finally {
      setPreviewLoading(false);
    }
  };

  // Join Team Submit
  const onJoinTeam = async (data) => {
    try {
      await joinTeam(
        user.uid,
        profile?.name || user.displayName || 'Participant',
        profile?.college || '',
        data.code.toUpperCase(),
        maxTeamSize
      );
      toast.success('Successfully enlisted in team!');
      setPreviewTeam(null);
      resetJoin();
    } catch (err) {
      toast.error(err.message || 'Could not join team');
    }
  };

  // Disband Team
  const handleDisband = async () => {
    setActionLoading(true);
    try {
      await disbandTeam(user.uid, profile.teamId);
      toast.success('Team disbanded.');
      setConfirmDisband(false);
    } catch (err) {
      toast.error(err.message || 'Failed to disband team');
    } finally {
      setActionLoading(false);
    }
  };

  // Leave Team
  const handleLeave = async () => {
    setActionLoading(true);
    try {
      await leaveTeam(user.uid, profile.teamId);
      toast.success('You have left the team.');
      setConfirmLeave(false);
    } catch (err) {
      toast.error(err.message || 'Failed to leave team');
    } finally {
      setActionLoading(false);
    }
  };

  // Remove member
  const handleRemoveMember = async (memberUid, memberName) => {
    if (!window.confirm(`Are you sure you want to remove ${memberName} from the team?`)) return;
    try {
      await removeMember(user.uid, profile.teamId, memberUid);
      toast.success(`${memberName} has been removed.`);
    } catch (err) {
      toast.error(err.message || 'Failed to remove member');
    }
  };

  if (teamLoading) {
    return <Loader text="Loading Squad Telemetry" />;
  }

  // ═══════════════════════════════════════════════════════
  // STATE A: User already has a team
  // ═══════════════════════════════════════════════════════
  if (team) {
    const isReady = members.length >= minTeamSize;

    return (
      <div className="registration-view">
        <div className="dash-section-header">
          <div>
            <h2 className="dash-heading">{team.name}</h2>
            <p className="dash-subheading">
              Track: <strong style={{ color: 'var(--gold-400)' }}>{team.track || 'General AI'}</strong> • Formed {formatDate(team.createdAt)}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span
              className={`status-badge ${isReady ? 'status-submitted' : 'status-under_review'}`}
            >
              {isReady ? '✓ Ready for Submissions' : `Needs at least ${minTeamSize} members`}
            </span>
          </div>
        </div>

        <div className="grid-2">
          {/* Left: Team Code & Details */}
          <GlassCard>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', marginBottom: '16px' }}>
              Squad Credentials
            </h3>

            <div style={{ background: 'rgba(0,0,0,0.3)', padding: '20px', borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)', marginBottom: '20px' }}>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '6px' }}>
                Shareable Team Code
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span className="team-code-badge">{team.code}</span>
                <GoldButton
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCopy(team.code)}
                  icon={copied ? <Check size={16} /> : <Copy size={16} />}
                >
                  {copied ? 'Copied' : 'Copy Code'}
                </GoldButton>
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '12px' }}>
                Send this 6-character code to your teammates so they can join this squad.
              </p>
            </div>

            {team.idea && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ fontSize: '0.85rem', color: 'var(--gold-400)', fontWeight: 600, marginBottom: '6px' }}>
                  Proposed Problem Statement / Idea:
                </div>
                <p style={{ fontSize: '0.92rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {team.idea}
                </p>
              </div>
            )}

            {/* Squad actions */}
            <div style={{ marginTop: '28px', paddingTop: '20px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {isLeader ? (
                <button
                  onClick={() => setConfirmDisband(true)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: 'rgba(255,71,87,0.1)',
                    border: '1px solid rgba(255,71,87,0.3)',
                    color: '#ff4757',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <Trash2 size={16} /> Disband Squad
                </button>
              ) : (
                <button
                  onClick={() => setConfirmLeave(true)}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '8px',
                    background: 'rgba(255,255,255,0.05)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <LogOut size={16} /> Leave Squad
                </button>
              )}
            </div>
          </GlassCard>

          {/* Right: Roster & Members */}
          <GlassCard>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>
                Active Members ({members.length} / {maxTeamSize})
              </h3>
              <div style={{ fontSize: '0.85rem', color: 'var(--gold-400)', fontWeight: 600 }}>
                {maxTeamSize - members.length} Slots Left
              </div>
            </div>

            {/* Capacity Progress Bar */}
            <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.08)', borderRadius: '3px', overflow: 'hidden', marginBottom: '20px' }}>
              <div
                style={{
                  height: '100%',
                  width: `${(members.length / maxTeamSize) * 100}%`,
                  background: 'var(--gold-gradient)',
                  transition: 'width 0.3s ease',
                }}
              />
            </div>

            <div className="member-list">
              {members.map((m) => {
                const isMemberLeader = m.uid === team.leaderUid;
                const canRemove = isLeader && !isMemberLeader;

                return (
                  <div key={m.uid} className="member-item">
                    <div className="member-left">
                      <div className="member-avatar">
                        {m.name ? m.name[0].toUpperCase() : '?'}
                      </div>
                      <div>
                        <div className="member-name">
                          {m.name}
                          {isMemberLeader && (
                            <span className="leader-crown" title="Team Leader">
                              <Crown size={14} />
                            </span>
                          )}
                          {m.uid === user.uid && (
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>(You)</span>
                          )}
                        </div>
                        <div className="member-college">
                          {m.college || 'Sanjivani University'} • Enlisted {formatDate(m.joinedAt)}
                        </div>
                      </div>
                    </div>

                    {canRemove && (
                      <button
                        onClick={() => handleRemoveMember(m.uid, m.name)}
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '6px',
                        }}
                        title="Remove from squad"
                      >
                        <Trash2 size={16} color="#ff4757" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </div>

        {/* Modal: Confirm Disband */}
        <AnimatePresence>
          {confirmDisband && (
            <div className="modal-overlay" onClick={() => setConfirmDisband(false)}>
              <motion.div
                className="modal-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3 className="modal-title" style={{ color: '#ff4757' }}>
                    Confirm Disband
                  </h3>
                  <button className="modal-close" onClick={() => setConfirmDisband(false)}>
                    ✕
                  </button>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                  Are you sure you want to permanently disband <strong>{team.name}</strong>? All members will be unassigned and the team code will be revoked.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <GoldButton variant="secondary" onClick={() => setConfirmDisband(false)}>
                    Cancel
                  </GoldButton>
                  <button
                    onClick={handleDisband}
                    disabled={actionLoading}
                    style={{
                      padding: '12px 24px',
                      background: '#ff4757',
                      color: '#fff',
                      fontWeight: 700,
                      borderRadius: '10px',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {actionLoading ? 'Disbanding...' : 'Yes, Disband Squad'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        {/* Modal: Confirm Leave */}
        <AnimatePresence>
          {confirmLeave && (
            <div className="modal-overlay" onClick={() => setConfirmLeave(false)}>
              <motion.div
                className="modal-content"
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="modal-header">
                  <h3 className="modal-title">Leave Squad</h3>
                  <button className="modal-close" onClick={() => setConfirmLeave(false)}>
                    ✕
                  </button>
                </div>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.6 }}>
                  Are you sure you want to exit <strong>{team.name}</strong>? You will need an invite code to rejoin.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <GoldButton variant="secondary" onClick={() => setConfirmLeave(false)}>
                    Stay in Team
                  </GoldButton>
                  <button
                    onClick={handleLeave}
                    disabled={actionLoading}
                    style={{
                      padding: '12px 24px',
                      background: 'rgba(255,255,255,0.1)',
                      color: '#fff',
                      fontWeight: 600,
                      borderRadius: '10px',
                      border: '1px solid rgba(255,255,255,0.2)',
                      cursor: 'pointer',
                    }}
                  >
                    {actionLoading ? 'Leaving...' : 'Confirm Exit'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  // STATE B: User has NO team — Show Create or Join
  // ═══════════════════════════════════════════════════════
  return (
    <div className="registration-choice-view">
      <div className="dash-section-header">
        <div>
          <h2 className="dash-heading">Form Your Squad</h2>
          <p className="dash-subheading">
            Team up with 2 to {maxTeamSize} builders to participate in HEXONA-LLM rounds and win prizes.
          </p>
        </div>
      </div>

      <div className="grid-2">
        {/* Card 1: Create Team */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-400)' }}>
              <PlusCircle size={24} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>
                Create a New Squad
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                You will become the squad leader and receive a shareable code.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitCreate(onCreateTeam)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="input-label">Squad / Team Name</label>
              <input
                {...registerCreate('teamName')}
                className={`input-field ${errorsCreate.teamName ? 'input-error' : ''}`}
                placeholder="e.g. Prompt Architects"
              />
              {errorsCreate.teamName && (
                <span className="error-message">{errorsCreate.teamName.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="input-label">Select Track / Theme</label>
              <select {...registerCreate('track')} className="input-field">
                {tracks.map((t) => (
                  <option key={t.id} value={t.title}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="input-label">Problem Idea (Optional)</label>
              <textarea
                {...registerCreate('idea')}
                className="input-field"
                rows={3}
                placeholder="Briefly describe what your squad plans to engineer..."
              />
            </div>

            <GoldButton type="submit" fullWidth loading={isSubmittingCreate} size="lg">
              Establish Squad
            </GoldButton>
          </form>
        </GlassCard>

        {/* Card 2: Join Team */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
            <div style={{ width: '44px', height: '44px', borderRadius: '10px', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-400)' }}>
              <LogIn size={24} />
            </div>
            <div>
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>
                Enlist with Code
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Join a squad established by your teammate using their 6-char code.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmitJoin(onJoinTeam)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group">
              <label className="input-label">6-Character Team Code</label>
              <div style={{ display: 'flex', gap: '10px' }}>
                <input
                  {...registerJoin('code')}
                  className={`input-field ${errorsJoin.code ? 'input-error' : ''}`}
                  placeholder="e.g. HX89K2"
                  maxLength={6}
                  style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)', letterSpacing: '0.15em', fontSize: '1.1rem' }}
                />
                <GoldButton
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handlePreview}
                  loading={previewLoading}
                >
                  Verify
                </GoldButton>
              </div>
              {errorsJoin.code && <span className="error-message">{errorsJoin.code.message}</span>}
            </div>

            {/* Preview Box if verified */}
            {previewTeam && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  background: 'rgba(212,175,55,0.08)',
                  border: '1px solid var(--gold-500)',
                  borderRadius: '10px',
                  padding: '16px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: 700 }}>{previewTeam.name}</h4>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gold-300)', fontWeight: 600 }}>
                    {previewTeam.memberCount || 1} / {maxTeamSize} Members
                  </span>
                </div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Track: {previewTeam.track || 'General AI'}
                </p>
              </motion.div>
            )}

            <GoldButton
              type="submit"
              fullWidth
              loading={isSubmittingJoin}
              size="lg"
              disabled={previewTeam && previewTeam.memberCount >= maxTeamSize}
            >
              {previewTeam && previewTeam.memberCount >= maxTeamSize
                ? 'Squad is Full'
                : 'Join Squad'}
            </GoldButton>
          </form>
        </GlassCard>
      </div>

      {/* Modal: Team Created with Code */}
      <AnimatePresence>
        {createdCodeModal && (
          <div className="modal-overlay" onClick={() => setCreatedCodeModal(null)}>
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              style={{ textAlign: 'center' }}
            >
              <div style={{ width: '60px', height: '60px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', border: '1px solid var(--gold-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <Sparkles size={28} color="var(--gold-400)" />
              </div>

              <h3 className="modal-title" style={{ marginBottom: '8px' }}>
                Squad Established!
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '20px' }}>
                Provide this team code to your teammates so they can join your roster.
              </p>

              <div style={{ background: 'rgba(0,0,0,0.5)', padding: '16px', borderRadius: '12px', border: '1px solid var(--gold-500)', display: 'inline-flex', alignItems: 'center', gap: '16px', marginBottom: '24px' }}>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: '1.8rem', fontWeight: 800, color: 'var(--gold-300)', letterSpacing: '0.15em' }}>
                  {createdCodeModal}
                </span>
                <GoldButton
                  size="sm"
                  variant="secondary"
                  onClick={() => handleCopy(createdCodeModal)}
                  icon={copied ? <Check size={16} /> : <Copy size={16} />}
                >
                  {copied ? 'Copied' : 'Copy'}
                </GoldButton>
              </div>

              <div>
                <GoldButton fullWidth onClick={() => setCreatedCodeModal(null)}>
                  Proceed to Squad Terminal
                </GoldButton>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

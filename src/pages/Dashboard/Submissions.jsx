import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  UploadCloud,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Code2,
  Video,
  Lock,
  RefreshCw,
  Award,
  MessageSquare,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTeam } from '../../hooks/useTeam';
import { useRealtime } from '../../hooks/useRealtime';
import useCountdown from '../../hooks/useCountdown';
import { submitForRound, listenToSubmission } from '../../firebase/db';
import GlassCard from '../../components/GlassCard';
import GoldButton from '../../components/GoldButton';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/formatDate';

export default function Submissions() {
  const { user, profile } = useAuth();
  const { team, isLeader } = useTeam(profile?.teamId);

  // Rounds and settings
  const { data: rawRounds, loading: roundsLoading } = useRealtime('rounds');
  const { data: settings } = useRealtime('settings');

  const rounds = useMemo(() => {
    if (!rawRounds) return [];
    return Object.entries(rawRounds)
      .map(([id, r]) => ({ id, ...r }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [rawRounds]);

  const anyMemberCanSubmit = settings?.event?.anyMemberCanSubmit || false;
  const canSubmit = isLeader || anyMemberCanSubmit;

  if (!profile?.teamId) {
    return (
      <div className="submissions-page">
        <div className="dash-section-header">
          <div>
            <h2 className="dash-heading">Round Submissions</h2>
            <p className="dash-subheading">Submit presentations, repositories, and video demos</p>
          </div>
        </div>
        <GlassCard>
          <EmptyState
            icon={UploadCloud}
            title="Team Required for Submissions"
            description="You must be part of an enrolled squad to submit deliverables for HEXONA-LLM rounds."
            action={() => (window.location.href = '/dashboard/registration')}
            actionLabel="Go to Squad Portal"
          />
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="submissions-page">
      <div className="dash-section-header">
        <div>
          <h2 className="dash-heading">Submission Terminal</h2>
          <p className="dash-subheading">
            Squad: <strong style={{ color: 'var(--gold-400)' }}>{team?.name}</strong> • Follow format specifications (.ppt, .pptx, .pdf)
          </p>
        </div>

        {!canSubmit && (
          <div className="topbar-status-chip" style={{ background: 'rgba(255,165,2,0.1)', borderColor: '#ffa502', color: '#ffa502' }}>
            <Lock size={14} /> Read Only (Leader Submits)
          </div>
        )}
      </div>

      {rounds.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={Clock}
            title="No Active Rounds"
            description="Round milestones and deadlines will be announced by the committee."
          />
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {rounds.map((round) => (
            <RoundSubmissionCard
              key={round.id}
              round={round}
              teamId={profile.teamId}
              uid={user.uid}
              canSubmit={canSubmit}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Individual Round Card Component ───
function RoundSubmissionCard({ round, teamId, uid, canSubmit }) {
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);

  // Listen to submission status for this round & team
  useEffect(() => {
    const unsub = listenToSubmission(round.id, teamId, (data) => {
      setSubmission(data);
      setLoading(false);
    });
    return () => unsub();
  }, [round.id, teamId]);

  const now = Date.now();
  const isPastDeadline = round.deadline ? round.deadline < now : false;
  const isRoundOpen = round.open && !isPastDeadline;
  const countdown = useCountdown(round.deadline);

  // Submission Form State
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [githubUrl, setGithubUrl] = useState('');
  const [demoUrl, setDemoUrl] = useState('');
  const [fileUrl, setFileUrl] = useState('');
  const [file, setFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  // Prefill if editing
  const handleOpenModal = () => {
    if (submission) {
      setTitle(submission.title || '');
      setDesc(submission.description || '');
      setGithubUrl(submission.githubUrl || '');
      setDemoUrl(submission.demoUrl || '');
      setFileUrl(submission.fileUrl || '');
    } else {
      setTitle('');
      setDesc('');
      setGithubUrl('');
      setDemoUrl('');
      setFileUrl('');
    }
    setFile(null);
    setUploadProgress(0);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error('Project title is required');
      return;
    }
    if (!file && !fileUrl && !submission?.fileUrl) {
      toast.error('Please upload a PPT/PDF file or provide a presentation link');
      return;
    }

    setSubmitting(true);
    try {
      await submitForRound(
        round.id,
        teamId,
        uid,
        {
          title,
          description: desc,
          githubUrl,
          demoUrl,
          fileUrl,
        },
        file,
        (progress) => setUploadProgress(progress)
      );
      toast.success(submission ? 'Submission updated!' : 'Deliverable submitted successfully!');
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={`round-card ${isRoundOpen ? 'is-open' : ''}`}>
      {/* Round Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '14px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span className="priority-tag priority-important">Stage {round.order || 1}</span>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', color: '#fff', fontWeight: 700 }}>
              {round.name}
            </h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', maxWidth: '750px', lineHeight: 1.5 }}>
            {round.description || 'Deliver your project presentation and technical artifacts.'}
          </p>
        </div>

        {/* Status Chip */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {submission ? (
            <span className={`status-badge status-${submission.status || 'submitted'}`}>
              ✓ {submission.status ? submission.status.replace('_', ' ') : 'Submitted'}
            </span>
          ) : isRoundOpen ? (
            <span className="status-badge" style={{ background: 'rgba(212,175,55,0.15)', color: 'var(--gold-300)', border: '1px solid var(--gold-500)' }}>
              ● Open for Submission
            </span>
          ) : (
            <span className="status-badge status-rejected">
              ● Round Concluded
            </span>
          )}

          {round.deadline && (
            <div className="round-deadline-timer">
              <Clock size={14} />
              {isPastDeadline ? 'Deadline Passed' : `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m left`}
            </div>
          )}
        </div>
      </div>

      {/* Submitted Details or Call to Action */}
      {submission ? (
        <div style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '12px', padding: '18px', marginTop: '8px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--gold-400)', textTransform: 'uppercase', fontWeight: 600 }}>
                Submitted Project
              </div>
              <h4 style={{ color: '#fff', fontSize: '1.1rem', fontWeight: 700, margin: '2px 0 6px' }}>
                {submission.title}
              </h4>
              {submission.description && (
                <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '12px', maxWidth: '600px' }}>
                  {submission.description}
                </p>
              )}

              {/* Artifact Links */}
              <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginTop: '10px' }}>
                {submission.fileUrl && (
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: 'var(--gold-300)',
                      fontSize: '0.85rem',
                      background: 'rgba(212,175,55,0.1)',
                      border: '1px solid rgba(212,175,55,0.3)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                    }}
                  >
                    <FileText size={15} /> {submission.fileName || 'View Presentation Deck'}
                  </a>
                )}
                {submission.githubUrl && (
                  <a
                    href={submission.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#fff',
                      fontSize: '0.85rem',
                      background: 'rgba(255,255,255,0.05)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                    }}
                  >
                    <Code2 size={15} /> GitHub Repo
                  </a>
                )}
                {submission.demoUrl && (
                  <a
                    href={submission.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      color: '#2ed573',
                      fontSize: '0.85rem',
                      background: 'rgba(46,213,115,0.1)',
                      border: '1px solid rgba(46,213,115,0.3)',
                      padding: '6px 12px',
                      borderRadius: '8px',
                    }}
                  >
                    <Video size={15} /> Video Demo
                  </a>
                )}
              </div>
            </div>

            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Updated: {formatDate(submission.updatedAt || submission.submittedAt)}
              </div>
              {isRoundOpen && canSubmit && (
                <GoldButton variant="secondary" size="sm" onClick={handleOpenModal} icon={<RefreshCw size={14} />}>
                  Revise Submission
                </GoldButton>
              )}
            </div>
          </div>

          {/* Admin Feedback / Score if evaluated */}
          {(submission.feedback || submission.score != null) && (
            <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <MessageSquare size={16} color="var(--gold-400)" />
                <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
                  <strong>Reviewer Feedback:</strong> {submission.feedback || 'Evaluated.'}
                </span>
              </div>
              {submission.score != null && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(212,175,55,0.15)', padding: '4px 12px', borderRadius: '8px', border: '1px solid var(--gold-500)', color: 'var(--gold-300)', fontWeight: 700 }}>
                  <Award size={16} /> Score: {submission.score} / 100
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap', gap: '12px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {isRoundOpen
              ? canSubmit
                ? 'No deliverables submitted yet for this stage.'
                : 'Awaiting team leader to submit project deliverables.'
              : 'Submissions closed for this round.'}
          </p>

          {isRoundOpen && canSubmit && (
            <GoldButton size="md" onClick={handleOpenModal} icon={<UploadCloud size={18} />}>
              Submit Project Deliverables
            </GoldButton>
          )}
        </div>
      )}

      {/* Submission Modal Form */}
      <AnimatePresence>
        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 className="modal-title">
                  {submission ? 'Revise Submission' : `Submit for ${round.name}`}
                </h3>
                <button className="modal-close" onClick={() => setModalOpen(false)}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="input-label">Project Title *</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="input-field"
                    placeholder="e.g. MedGemma — Clinical Assistant"
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Brief Description</label>
                  <textarea
                    value={desc}
                    onChange={(e) => setDesc(e.target.value)}
                    className="input-field"
                    rows={3}
                    placeholder="Outline your architecture, model stack, and primary features..."
                  />
                </div>

                {/* File Upload Zone */}
                <div className="form-group">
                  <label className="input-label">Presentation Deck (.ppt, .pptx, .pdf — max 20MB)</label>
                  <label className="dropzone">
                    <input
                      type="file"
                      accept=".ppt,.pptx,.pdf"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        if (e.target.files && e.target.files[0]) {
                          const selected = e.target.files[0];
                          if (selected.size > 20 * 1024 * 1024) {
                            toast.error('File exceeds 20MB limit');
                            return;
                          }
                          setFile(selected);
                        }
                      }}
                    />
                    <UploadCloud size={32} className="dropzone-icon" />
                    <span style={{ fontSize: '0.92rem', color: '#fff', fontWeight: 600 }}>
                      {file ? file.name : 'Click to select or drag presentation here'}
                    </span>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                      Supports PowerPoint (.pptx) or PDF formats
                    </span>
                  </label>

                  {uploadProgress > 0 && uploadProgress < 100 && (
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginTop: '6px' }}>
                      <div style={{ height: '100%', width: `${uploadProgress}%`, background: 'var(--gold-gradient)' }} />
                    </div>
                  )}
                </div>

                {/* Fallback Public Drive Link */}
                <div className="form-group">
                  <label className="input-label">Presentation Link (Optional fallback / Google Drive)</label>
                  <input
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="input-field"
                    placeholder="https://drive.google.com/file/d/..."
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">GitHub Repository URL (Optional)</label>
                  <input
                    value={githubUrl}
                    onChange={(e) => setGithubUrl(e.target.value)}
                    className="input-field"
                    placeholder="https://github.com/your-org/hexona-repo"
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Demo Video URL (Optional YouTube / Loom)</label>
                  <input
                    value={demoUrl}
                    onChange={(e) => setDemoUrl(e.target.value)}
                    className="input-field"
                    placeholder="https://youtube.com/watch?v=..."
                  />
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '12px' }}>
                  <GoldButton variant="secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </GoldButton>
                  <GoldButton type="submit" loading={submitting}>
                    {submitting ? 'Transmitting...' : 'Confirm Submission'}
                  </GoldButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

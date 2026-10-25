import { useState, useMemo } from 'react';
import {
  FileCheck2,
  Download,
  ExternalLink,
  Award,
  MessageSquare,
  Search,
  CheckCircle,
  Filter,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useRealtime } from '../../../hooks/useRealtime';
import { updateSubmissionStatus } from '../../../firebase/db';
import GlassCard from '../../../components/GlassCard';
import GoldButton from '../../../components/GoldButton';
import EmptyState from '../../../components/EmptyState';
import { formatDate } from '../../../utils/formatDate';

export default function AdminSubmissions() {
  const { data: rawRounds } = useRealtime('rounds');
  const { data: rawSubmissions } = useRealtime('submissions');
  const { data: rawTeams } = useRealtime('teams');

  const rounds = useMemo(() => {
    if (!rawRounds) return [];
    return Object.entries(rawRounds)
      .map(([id, r]) => ({ id, ...r }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [rawRounds]);

  const [selectedRoundId, setSelectedRoundId] = useState('');
  const activeRoundId = selectedRoundId || (rounds[0]?.id || '');

  // Submissions for the active round
  const currentSubmissions = useMemo(() => {
    if (!rawSubmissions || !activeRoundId || !rawSubmissions[activeRoundId]) return [];
    return Object.entries(rawSubmissions[activeRoundId]).map(([teamId, s]) => ({
      teamId,
      teamName: rawTeams?.[teamId]?.name || `Team ${teamId.substring(0, 6)}`,
      ...s,
    }));
  }, [rawSubmissions, activeRoundId, rawTeams]);

  // Review Modal state
  const [evalModal, setEvalModal] = useState(null);
  const [evalStatus, setEvalStatus] = useState('under_review');
  const [evalScore, setEvalScore] = useState('');
  const [evalFeedback, setEvalFeedback] = useState('');
  const [saving, setSaving] = useState(false);

  const openEvalModal = (sub) => {
    setEvalModal(sub);
    setEvalStatus(sub.status || 'under_review');
    setEvalScore(sub.score != null ? sub.score : '');
    setEvalFeedback(sub.feedback || '');
  };

  const handleSaveEval = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateSubmissionStatus(
        activeRoundId,
        evalModal.teamId,
        evalStatus,
        evalFeedback,
        evalScore !== '' ? Number(evalScore) : null
      );
      toast.success('Evaluation saved and published to squad!');
      setEvalModal(null);
    } catch (err) {
      toast.error('Failed to update evaluation');
    } finally {
      setSaving(false);
    }
  };

  // Export submissions to CSV
  const exportSubmissionsCSV = () => {
    if (currentSubmissions.length === 0) {
      toast.error('No submissions in this round to export');
      return;
    }

    const headers = ['Team ID', 'Team Name', 'Project Title', 'Status', 'Score', 'Feedback', 'File URL', 'GitHub URL', 'Submitted Date'];
    const rows = currentSubmissions.map((s) => [
      `"${s.teamId}"`,
      `"${s.teamName}"`,
      `"${s.title || ''}"`,
      `"${s.status || 'submitted'}"`,
      s.score != null ? s.score : '',
      `"${(s.feedback || '').replace(/"/g, '""')}"`,
      `"${s.fileUrl || ''}"`,
      `"${s.githubUrl || ''}"`,
      `"${formatDate(s.submittedAt)}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hexona_submissions_round_${activeRoundId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Submissions exported to CSV');
  };

  return (
    <div className="admin-submissions-page">
      <div className="dash-section-header">
        <div>
          <h2 className="dash-heading">Submission Reviews & Grading</h2>
          <p className="dash-subheading">
            Review presentation decks, grade technical deliverables, and shortlist top squads
          </p>
        </div>

        <GoldButton variant="secondary" size="sm" onClick={exportSubmissionsCSV} icon={<Download size={14} />}>
          Export Round CSV
        </GoldButton>
      </div>

      {/* Select Round Tabs */}
      <div className="filter-pills" style={{ marginBottom: '24px' }}>
        {rounds.map((r) => (
          <button
            key={r.id}
            className={`filter-pill ${activeRoundId === r.id ? 'active' : ''}`}
            onClick={() => setSelectedRoundId(r.id)}
          >
            {r.name}
          </button>
        ))}
      </div>

      {currentSubmissions.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={FileCheck2}
            title="No Submissions for This Round"
            description="Deliverables submitted by teams for this stage will appear here for grading."
          />
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {currentSubmissions.map((sub) => (
            <GlassCard key={sub.teamId}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '12px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="priority-tag priority-important">{sub.teamName}</span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>
                      {sub.title}
                    </h3>
                    <span className={`status-badge status-${sub.status || 'submitted'}`}>
                      ● {sub.status ? sub.status.replace('_', ' ') : 'Submitted'}
                    </span>
                  </div>

                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '6px', maxWidth: '700px' }}>
                    {sub.description || 'No description provided.'}
                  </p>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  {sub.score != null && (
                    <div style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid var(--gold-500)', padding: '6px 14px', borderRadius: '8px', color: 'var(--gold-300)', fontWeight: 700, fontSize: '1rem' }}>
                      {sub.score} / 100
                    </div>
                  )}
                  <GoldButton size="sm" onClick={() => openEvalModal(sub)}>
                    Evaluate / Grade
                  </GoldButton>
                </div>
              </div>

              {/* Artifact links */}
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', padding: '10px 0', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
                {sub.fileUrl && (
                  <a
                    href={sub.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: 'var(--gold-400)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px', textDecoration: 'underline' }}
                  >
                    <Download size={14} /> Download Presentation ({sub.fileName || 'Deck'})
                  </a>
                )}
                {sub.githubUrl && (
                  <a
                    href={sub.githubUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#fff', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ExternalLink size={14} /> GitHub Code
                  </a>
                )}
                {sub.demoUrl && (
                  <a
                    href={sub.demoUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{ color: '#2ed573', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <ExternalLink size={14} /> Video Demo
                  </a>
                )}
              </div>

              {sub.feedback && (
                <div style={{ marginTop: '8px', background: 'rgba(0,0,0,0.3)', padding: '8px 12px', borderRadius: '6px', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  <strong>Feedback:</strong> {sub.feedback}
                </div>
              )}
            </GlassCard>
          ))}
        </div>
      )}

      {/* Grade / Evaluate Modal */}
      {evalModal && (
        <div className="modal-overlay" onClick={() => setEvalModal(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Evaluate: {evalModal.teamName}</h3>
              <button className="modal-close" onClick={() => setEvalModal(null)}>✕</button>
            </div>

            <form onSubmit={handleSaveEval} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Status</label>
                  <select
                    value={evalStatus}
                    onChange={(e) => setEvalStatus(e.target.value)}
                    className="input-field"
                  >
                    <option value="submitted">Submitted</option>
                    <option value="under_review">Under Review</option>
                    <option value="shortlisted">Shortlisted (Advanced)</option>
                    <option value="rejected">Not Shortlisted</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="input-label">Score (0 - 100)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={evalScore}
                    onChange={(e) => setEvalScore(e.target.value)}
                    className="input-field"
                    placeholder="e.g. 92"
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Judges / Mentors Feedback</label>
                <textarea
                  value={evalFeedback}
                  onChange={(e) => setEvalFeedback(e.target.value)}
                  className="input-field"
                  rows={4}
                  placeholder="Provide constructive feedback regarding the architecture, prompt engineering, and presentation quality..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                <GoldButton variant="secondary" onClick={() => setEvalModal(null)}>
                  Cancel
                </GoldButton>
                <GoldButton type="submit" loading={saving}>
                  Save Evaluation
                </GoldButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

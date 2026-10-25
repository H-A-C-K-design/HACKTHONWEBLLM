import { useState, useEffect } from 'react';
import {
  HelpCircle,
  Calendar,
  Plus,
  Trash2,
  CheckCircle,
  Clock,
  Send,
  MessageSquare,
  Video,
  MapPin,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import {
  listenToHelpSessions,
  createHelpSession,
  deleteHelpSession,
  listenToHelpRequests,
  updateHelpRequestStatus,
  addHelpReply,
} from '../../../firebase/db';
import GlassCard from '../../../components/GlassCard';
import GoldButton from '../../../components/GoldButton';
import EmptyState from '../../../components/EmptyState';
import { formatDate } from '../../../utils/formatDate';

export default function AdminHelp() {
  const { user } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('requests'); // 'requests' | 'sessions'

  // New Session Modal
  const [sessionModal, setSessionModal] = useState(false);
  const [sTitle, setSTitle] = useState('');
  const [sMentor, setSMentor] = useState('');
  const [sStartTime, setSStartTime] = useState('');
  const [sMode, setSMode] = useState('online');
  const [sLink, setSLink] = useState('');
  const [sRoom, setSRoom] = useState('');
  const [sTags, setSTags] = useState('');
  const [savingSession, setSavingSession] = useState(false);

  // Reply states
  const [replyText, setReplyText] = useState({});

  useEffect(() => {
    const unsubS = listenToHelpSessions((data) => setSessions(data));
    const unsubR = listenToHelpRequests(user.uid, true, (data) => setRequests(data));
    return () => {
      unsubS();
      unsubR();
    };
  }, [user]);

  const handleCreateSession = async (e) => {
    e.preventDefault();
    if (!sTitle.trim()) {
      toast.error('Title is required');
      return;
    }

    setSavingSession(true);
    try {
      const tagsArray = sTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);

      await createHelpSession({
        title: sTitle,
        mentor: sMentor,
        startTime: sStartTime ? new Date(sStartTime).getTime() : Date.now(),
        mode: sMode,
        link: sLink,
        room: sRoom,
        tags: tagsArray,
      });

      toast.success('Session scheduled and published to hackers!');
      setSessionModal(false);
      setSTitle('');
      setSMentor('');
      setSStartTime('');
      setSLink('');
      setSRoom('');
      setSTags('');
    } catch (err) {
      toast.error('Failed to create session');
    } finally {
      setSavingSession(false);
    }
  };

  const handleDeleteSession = async (id, title) => {
    if (!window.confirm(`Delete session "${title}"?`)) return;
    try {
      await deleteHelpSession(id);
      toast.success('Session deleted');
    } catch (err) {
      toast.error('Failed to delete session');
    }
  };

  const handleUpdateStatus = async (ticketId, status) => {
    try {
      await updateHelpRequestStatus(ticketId, status);
      toast.success(`Ticket marked as ${status}`);
    } catch (err) {
      toast.error('Failed to update status');
    }
  };

  const handleSendAdminReply = async (ticketId) => {
    const text = replyText[ticketId];
    if (!text || !text.trim()) return;

    try {
      await addHelpReply(ticketId, 'Admin Support', text.trim());
      setReplyText((prev) => ({ ...prev, [ticketId]: '' }));
      toast.success('Mentor response posted');
    } catch (err) {
      toast.error('Failed to send response');
    }
  };

  return (
    <div className="admin-help-page">
      <div className="dash-section-header">
        <div>
          <h2 className="dash-heading">Help Desk & Mentorship Control</h2>
          <p className="dash-subheading">
            Resolve hacker technical roadblocks and schedule mentor office hours
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div className="filter-pills">
            <button
              className={`filter-pill ${activeTab === 'requests' ? 'active' : ''}`}
              onClick={() => setActiveTab('requests')}
            >
              Support Tickets ({requests.length})
            </button>
            <button
              className={`filter-pill ${activeTab === 'sessions' ? 'active' : ''}`}
              onClick={() => setActiveTab('sessions')}
            >
              Mentor Sessions ({sessions.length})
            </button>
          </div>

          {activeTab === 'sessions' && (
            <GoldButton size="sm" onClick={() => setSessionModal(true)} icon={<Plus size={16} />}>
              Schedule Session
            </GoldButton>
          )}
        </div>
      </div>

      {activeTab === 'requests' && (
        <div>
          {requests.length === 0 ? (
            <GlassCard>
              <EmptyState
                icon={CheckCircle}
                title="All Clear!"
                description="No open support tickets from participants at this moment."
              />
            </GlassCard>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {requests.map((ticket) => {
                const status = ticket.status || 'open';
                const replies = ticket.replies
                  ? Object.entries(ticket.replies).map(([rid, r]) => ({ rid, ...r }))
                  : [];

                return (
                  <GlassCard key={ticket.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '10px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span style={{ fontSize: '0.8rem', color: 'var(--gold-400)', textTransform: 'uppercase', fontWeight: 600 }}>
                            {ticket.category}
                          </span>
                          <h4 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700 }}>
                            {ticket.subject}
                          </h4>
                        </div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                          Reported by UID: {ticket.uid} • {formatDate(ticket.createdAt)}
                        </div>
                      </div>

                      {/* Status select */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>Status:</span>
                        <select
                          value={status}
                          onChange={(e) => handleUpdateStatus(ticket.id, e.target.value)}
                          className="input-field"
                          style={{ padding: '4px 10px', fontSize: '0.82rem', width: 'auto' }}
                        >
                          <option value="open">Open</option>
                          <option value="in_progress">In Progress</option>
                          <option value="resolved">Resolved</option>
                        </select>
                      </div>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
                      {ticket.message}
                    </p>

                    {/* Replies thread */}
                    {replies.length > 0 && (
                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '8px', padding: '12px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {replies.map((r) => (
                          <div key={r.rid} style={{ fontSize: '0.85rem', borderLeft: '2px solid var(--gold-500)', paddingLeft: '8px' }}>
                            <p style={{ margin: 0, color: '#fff' }}>
                              <strong>{r.by}:</strong> {r.text}
                            </p>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{formatDate(r.at)}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Reply input */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        value={replyText[ticket.id] || ''}
                        onChange={(e) => setReplyText({ ...replyText, [ticket.id]: e.target.value })}
                        className="input-field"
                        placeholder="Reply as Mentor / Admin..."
                        style={{ padding: '8px 12px', fontSize: '0.88rem' }}
                      />
                      <GoldButton size="sm" onClick={() => handleSendAdminReply(ticket.id)}>
                        Send Reply
                      </GoldButton>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      )}

      {activeTab === 'sessions' && (
        <div>
          {sessions.length === 0 ? (
            <GlassCard>
              <EmptyState
                icon={Calendar}
                title="No Sessions Scheduled"
                description="Click 'Schedule Session' to add an online workshop or office hours."
                action={() => setSessionModal(true)}
                actionLabel="Schedule Session"
              />
            </GlassCard>
          ) : (
            <div className="grid-2">
              {sessions.map((s) => (
                <GlassCard key={s.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' }}>
                    <span className="priority-tag priority-important">
                      {s.mode === 'online' ? 'Online Video' : 'Offline Campus'}
                    </span>
                    <button
                      onClick={() => handleDeleteSession(s.id, s.title)}
                      style={{ background: 'rgba(255,71,87,0.1)', border: 'none', color: '#ff4757', padding: '6px', borderRadius: '6px', cursor: 'pointer' }}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>
                    {s.title}
                  </h3>
                  <p style={{ color: 'var(--gold-400)', fontSize: '0.85rem', marginBottom: '10px' }}>
                    Mentor: {s.mentor || 'Faculty Lead'}
                  </p>

                  <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div>Time: {s.startTime ? formatDate(s.startTime) : 'TBA'}</div>
                    {s.link && <div>Link: {s.link}</div>}
                    {s.room && <div>Room: {s.room}</div>}
                  </div>
                </GlassCard>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Schedule Session Modal */}
      {sessionModal && (
        <div className="modal-overlay" onClick={() => setSessionModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Schedule Mentor Session</h3>
              <button className="modal-close" onClick={() => setSessionModal(false)}>✕</button>
            </div>

            <form onSubmit={handleCreateSession} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-group">
                <label className="input-label">Session Topic / Title *</label>
                <input
                  value={sTitle}
                  onChange={(e) => setSTitle(e.target.value)}
                  className="input-field"
                  placeholder="e.g. Prompt Engineering with LangChain & Vector DBs"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Mentor Name</label>
                  <input
                    value={sMentor}
                    onChange={(e) => setSMentor(e.target.value)}
                    className="input-field"
                    placeholder="e.g. Dr. Rajesh Sharma"
                  />
                </div>

                <div className="form-group">
                  <label className="input-label">Date & Time</label>
                  <input
                    type="datetime-local"
                    value={sStartTime}
                    onChange={(e) => setSStartTime(e.target.value)}
                    className="input-field"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Mode</label>
                  <select value={sMode} onChange={(e) => setSMode(e.target.value)} className="input-field">
                    <option value="online">Online (Google Meet / Zoom)</option>
                    <option value="offline">Offline (On-Campus)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="input-label">{sMode === 'online' ? 'Meeting URL' : 'Campus Room / Hall'}</label>
                  {sMode === 'online' ? (
                    <input
                      value={sLink}
                      onChange={(e) => setSLink(e.target.value)}
                      className="input-field"
                      placeholder="https://meet.google.com/..."
                    />
                  ) : (
                    <input
                      value={sRoom}
                      onChange={(e) => setSRoom(e.target.value)}
                      className="input-field"
                      placeholder="Seminar Hall 2, Dept of CSE"
                    />
                  )}
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Tags (comma separated)</label>
                <input
                  value={sTags}
                  onChange={(e) => setSTags(e.target.value)}
                  className="input-field"
                  placeholder="LLMs, RAG, Agents, Evaluation"
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '10px' }}>
                <GoldButton variant="secondary" onClick={() => setSessionModal(false)}>
                  Cancel
                </GoldButton>
                <GoldButton type="submit" loading={savingSession}>
                  Publish Session
                </GoldButton>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

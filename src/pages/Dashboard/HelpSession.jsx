import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LifeBuoy,
  Calendar,
  Clock,
  Video,
  MapPin,
  Tag,
  Send,
  MessageSquare,
  HelpCircle,
  PlusCircle,
  CheckCircle,
  Sparkles,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';
import { useTeam } from '../../hooks/useTeam';
import {
  listenToHelpSessions,
  listenToHelpRequests,
  createHelpRequest,
  addHelpReply,
} from '../../firebase/db';
import { helpRequestSchema } from '../../utils/validators';
import GlassCard from '../../components/GlassCard';
import GoldButton from '../../components/GoldButton';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/formatDate';

export default function HelpSession() {
  const { user, profile, isAdmin } = useAuth();
  const { team } = useTeam(profile?.teamId);

  const [sessions, setSessions] = useState([]);
  const [requests, setRequests] = useState([]);
  const [activeTab, setActiveTab] = useState('sessions'); // 'sessions' | 'my-tickets'
  const [replyText, setReplyText] = useState({});
  const [replyingId, setReplyingId] = useState(null);

  // Form for asking help
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm({
    resolver: zodResolver(helpRequestSchema),
  });

  // Listen to upcoming help sessions
  useEffect(() => {
    const unsub = listenToHelpSessions((data) => {
      setSessions(data);
    });
    return () => unsub();
  }, []);

  // Listen to help requests for this user
  useEffect(() => {
    if (!user?.uid) return;
    const unsub = listenToHelpRequests(user.uid, isAdmin, (data) => {
      setRequests(data);
    });
    return () => unsub();
  }, [user, isAdmin]);

  // Create Ticket Submit
  const onSubmitTicket = async (data) => {
    try {
      await createHelpRequest({
        uid: user.uid,
        teamId: profile?.teamId || '',
        subject: data.subject,
        category: data.category,
        message: data.message,
      });
      toast.success('Help ticket dispatched! Mentors have been alerted.');
      reset();
      setActiveTab('my-tickets');
    } catch (err) {
      toast.error(err.message || 'Failed to file ticket');
    }
  };

  // Reply to ticket
  const handleSendReply = async (requestId) => {
    const text = replyText[requestId];
    if (!text || !text.trim()) return;

    try {
      await addHelpReply(requestId, user.uid, text.trim());
      setReplyText((prev) => ({ ...prev, [requestId]: '' }));
      toast.success('Reply submitted');
    } catch (err) {
      toast.error('Failed to post reply');
    }
  };

  // Generate .ics calendar file
  const downloadICS = (session) => {
    const title = session.title || 'HEXONA-LLM Mentorship Session';
    const desc = `Mentor: ${session.mentor || 'Hackathon Mentor'}\\nMode: ${session.mode || 'Online'}`;
    const location = session.link || session.room || 'Sanjivani University';
    const start = new Date(session.startTime || Date.now() + 86400000);
    const end = new Date(start.getTime() + 60 * 60 * 1000);

    const pad = (n) => (n < 10 ? '0' + n : n);
    const formatICSDate = (d) =>
      `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}T${pad(
        d.getUTCHours()
      )}${pad(d.getUTCMinutes())}00Z`;

    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//HEXONA-LLM//Mentorship Sessions//EN',
      'BEGIN:VEVENT',
      `UID:${session.id}@hexona-llm.com`,
      `DTSTAMP:${formatICSDate(new Date())}`,
      `DTSTART:${formatICSDate(start)}`,
      `DTEND:${formatICSDate(end)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${desc}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${title.replace(/\s+/g, '_')}.ics`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="help-session-page">
      <div className="dash-section-header">
        <div>
          <h2 className="dash-heading">Support & Mentorship Hub</h2>
          <p className="dash-subheading">
            Live technical sessions, mentor office hours, and direct developer support
          </p>
        </div>

        {/* Tab pills */}
        <div className="filter-pills">
          <button
            className={`filter-pill ${activeTab === 'sessions' ? 'active' : ''}`}
            onClick={() => setActiveTab('sessions')}
          >
            Mentorship Sessions ({sessions.length})
          </button>
          <button
            className={`filter-pill ${activeTab === 'my-tickets' ? 'active' : ''}`}
            onClick={() => setActiveTab('my-tickets')}
          >
            My Help Requests ({requests.length})
          </button>
        </div>
      </div>

      {activeTab === 'sessions' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '28px' }}>
          {/* Scheduled Sessions */}
          {sessions.length === 0 ? (
            <GlassCard>
              <EmptyState
                icon={Calendar}
                title="No Scheduled Sessions Yet"
                description="Upcoming mentor office hours and technical workshops will be scheduled here."
              />
            </GlassCard>
          ) : (
            <div className="grid-2">
              {sessions.map((s) => (
                <GlassCard key={s.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                    <span className="priority-tag priority-important">
                      {s.mode === 'online' ? '🌐 Virtual Session' : '📍 Campus Room'}
                    </span>
                    <GoldButton
                      variant="secondary"
                      size="sm"
                      onClick={() => downloadICS(s)}
                      icon={<Calendar size={14} />}
                    >
                      Add to Calendar
                    </GoldButton>
                  </div>

                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', fontWeight: 700, marginBottom: '6px' }}>
                    {s.title}
                  </h3>
                  <p style={{ color: 'var(--gold-400)', fontSize: '0.88rem', marginBottom: '16px' }}>
                    Mentor: <strong>{s.mentor || 'Sanjivani Faculty / AI Expert'}</strong>
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Clock size={15} color="var(--gold-500)" />
                      <span>{s.startTime ? formatDate(s.startTime) : 'Schedule TBA'}</span>
                    </div>

                    {s.link && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Video size={15} color="var(--gold-500)" />
                        <a href={s.link} target="_blank" rel="noreferrer" style={{ color: 'var(--gold-300)', textDecoration: 'underline' }}>
                          Join Meeting URL
                        </a>
                      </div>
                    )}

                    {s.room && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <MapPin size={15} color="var(--gold-500)" />
                        <span>Room: {s.room}</span>
                      </div>
                    )}
                  </div>

                  {s.tags && Array.isArray(s.tags) && (
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      {s.tags.map((tag, i) => (
                        <span key={i} style={{ fontSize: '0.75rem', background: 'rgba(255,255,255,0.05)', padding: '2px 8px', borderRadius: '4px', color: 'var(--text-muted)' }}>
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </GlassCard>
              ))}
            </div>
          )}

          {/* Form to submit a help request */}
          <GlassCard>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-400)' }}>
                <LifeBuoy size={22} />
              </div>
              <div>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>
                  Ask for Mentor Assistance
                </h3>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  Having trouble with LLM token limits, LangChain, embeddings, or project scope? Post a ticket.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit(onSubmitTicket)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="form-row">
                <div className="form-group">
                  <label className="input-label">Subject *</label>
                  <input
                    {...register('subject')}
                    className={`input-field ${errors.subject ? 'input-error' : ''}`}
                    placeholder="e.g. Rate limit issues with Gemini API"
                  />
                  {errors.subject && <span className="error-message">{errors.subject.message}</span>}
                </div>

                <div className="form-group">
                  <label className="input-label">Category *</label>
                  <select {...register('category')} className="input-field">
                    <option value="technical">Technical / Code Issue</option>
                    <option value="llm-api">LLM & API Integrations</option>
                    <option value="idea">Idea & Architecture Scoping</option>
                    <option value="other">General / Rules Support</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="input-label">Describe your issue in detail *</label>
                <textarea
                  {...register('message')}
                  className={`input-field ${errors.message ? 'input-error' : ''}`}
                  rows={4}
                  placeholder="Include error codes, prompt architecture, or what you've tried so far..."
                />
                {errors.message && <span className="error-message">{errors.message.message}</span>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <GoldButton type="submit" loading={isSubmitting} size="md" icon={<Send size={16} />}>
                  Dispatch Ticket
                </GoldButton>
              </div>
            </form>
          </GlassCard>
        </div>
      )}

      {activeTab === 'my-tickets' && (
        <div>
          {requests.length === 0 ? (
            <GlassCard>
              <EmptyState
                icon={HelpCircle}
                title="No Support Tickets Filed"
                description="You haven't requested mentor help yet. Switch to the Sessions tab to submit a query."
                action={() => setActiveTab('sessions')}
                actionLabel="Request Help"
              />
            </GlassCard>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {requests.map((ticket) => {
                const status = ticket.status || 'open';
                const replies = ticket.replies ? Object.entries(ticket.replies).map(([rid, r]) => ({ rid, ...r })) : [];

                return (
                  <GlassCard key={ticket.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <span
                            className={`status-badge ${
                              status === 'resolved'
                                ? 'status-submitted'
                                : status === 'in_progress'
                                ? 'status-under_review'
                                : 'status-rejected'
                            }`}
                          >
                            ● {status.replace('_', ' ')}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: 'var(--gold-400)', textTransform: 'uppercase', fontWeight: 600 }}>
                            {ticket.category}
                          </span>
                        </div>
                        <h4 style={{ color: '#fff', fontSize: '1.15rem', fontWeight: 700, margin: '6px 0 4px' }}>
                          {ticket.subject}
                        </h4>
                      </div>

                      <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        {formatDate(ticket.createdAt)}
                      </span>
                    </div>

                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '16px' }}>
                      {ticket.message}
                    </p>

                    {/* Replies Thread */}
                    {replies.length > 0 && (
                      <div style={{ background: 'rgba(0,0,0,0.3)', borderRadius: '10px', padding: '14px', marginBottom: '14px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '0.8rem', color: 'var(--gold-400)', fontWeight: 600 }}>
                          Mentor & Support Replies ({replies.length})
                        </div>
                        {replies.map((r) => (
                          <div key={r.rid} style={{ fontSize: '0.88rem', color: '#fff', borderLeft: '2px solid var(--gold-500)', paddingLeft: '10px' }}>
                            <p style={{ margin: 0 }}>{r.text}</p>
                            <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                              {formatDate(r.at)}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Add reply input */}
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        value={replyText[ticket.id] || ''}
                        onChange={(e) =>
                          setReplyText({ ...replyText, [ticket.id]: e.target.value })
                        }
                        className="input-field"
                        placeholder="Type an update or follow-up question..."
                        style={{ padding: '8px 14px', fontSize: '0.88rem' }}
                      />
                      <GoldButton
                        variant="secondary"
                        size="sm"
                        onClick={() => handleSendReply(ticket.id)}
                      >
                        Reply
                      </GoldButton>
                    </div>
                  </GlassCard>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

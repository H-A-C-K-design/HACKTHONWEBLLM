import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Megaphone,
  UploadCloud,
  Clock,
  ArrowRight,
  Shield,
  FileCheck2,
  Sparkles,
  Award,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTeam } from '../../hooks/useTeam';
import { useRealtime } from '../../hooks/useRealtime';
import useCountdown from '../../hooks/useCountdown';
import GlassCard from '../../components/GlassCard';
import GoldButton from '../../components/GoldButton';
import EmptyState from '../../components/EmptyState';
import Robot3D from '../../components/Robot3D';
import { formatDate } from '../../utils/formatDate';

export default function Overview() {
  const { profile, user } = useAuth();
  const { team, members, isLeader } = useTeam(profile?.teamId);

  // Live rounds and announcements
  const { data: roundsData } = useRealtime('rounds');
  const { data: announcementsData } = useRealtime('announcements');
  const { data: settings } = useRealtime('settings');

  // Next upcoming round deadline
  const rounds = useMemo(() => {
    if (!roundsData) return [];
    return Object.entries(roundsData)
      .map(([id, r]) => ({ id, ...r }))
      .sort((a, b) => (a.order || 0) - (b.order || 0));
  }, [roundsData]);

  const activeRound = useMemo(() => {
    const now = Date.now();
    return rounds.find((r) => r.open && (r.deadline ? r.deadline > now : true)) || rounds[0];
  }, [rounds]);

  const countdown = useCountdown(activeRound?.deadline || settings?.event?.startDate);

  // Announcements list (latest 3)
  const latestAnnouncements = useMemo(() => {
    if (!announcementsData) return [];
    return Object.entries(announcementsData)
      .map(([id, a]) => ({ id, ...a }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
      .slice(0, 3);
  }, [announcementsData]);

  const displayName = profile?.name || user?.displayName || 'Hacker';

  return (
    <div className="overview-page">
      {/* Welcome Card */}
      <div className="dash-welcome-card">
        <div className="dash-welcome-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="priority-tag priority-important">SYSTEM ONLINE</span>
            <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>AI-9 Co-Pilot Ready</span>
          </div>
          <h2 className="dash-welcome-title">Welcome, {displayName}</h2>
          <p className="dash-welcome-desc">
            You are authenticated in the HEXONA-LLM neural command grid. Prepare your models, assemble your prompts, and deploy your hackathon project.
          </p>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {!profile?.teamId ? (
              <Link to="/dashboard/registration">
                <GoldButton size="md" icon={<Users size={18} />}>
                  Form or Join a Team
                </GoldButton>
              </Link>
            ) : (
              <Link to="/dashboard/submissions">
                <GoldButton size="md" icon={<UploadCloud size={18} />}>
                  View Submissions
                </GoldButton>
              </Link>
            )}
            <Link to="/dashboard/announcements">
              <GoldButton variant="secondary" size="md" icon={<Megaphone size={18} />}>
                Read Broadcasts
              </GoldButton>
            </Link>
          </div>
        </div>

        <div style={{ width: '220px', height: '220px', flexShrink: 0 }}>
          <Robot3D size="card" />
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid-3" style={{ marginBottom: '32px' }}>
        {/* Next Deadline / Countdown */}
        <div className="metric-card">
          <div className="metric-icon-box">
            <Clock size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="metric-label">
              {activeRound?.name ? `Next: ${activeRound.name}` : 'Next Target'}
            </div>
            <div className="metric-value" style={{ fontSize: '1.4rem' }}>
              {countdown.isExpired ? (
                <span style={{ color: '#ff4757' }}>Concluded</span>
              ) : (
                `${countdown.days}d ${countdown.hours}h ${countdown.minutes}m ${countdown.seconds}s`
              )}
            </div>
          </div>
        </div>

        {/* Team Status Metric */}
        <div className="metric-card">
          <div className="metric-icon-box">
            <Users size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="metric-label">Squad Roster</div>
            <div className="metric-value" style={{ fontSize: '1.3rem' }}>
              {team ? `${team.name} (${members.length}/${settings?.event?.maxTeamSize || 4})` : 'Unassigned'}
            </div>
          </div>
        </div>

        {/* Rounds Completed */}
        <div className="metric-card">
          <div className="metric-icon-box">
            <Award size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="metric-label">Active Stage</div>
            <div className="metric-value" style={{ fontSize: '1.3rem' }}>
              {activeRound?.name || 'Round 1: Ideation'}
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-column Grid */}
      <div className="grid-2">
        {/* Left Column: Team Status Overview */}
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>
              Squad Intelligence
            </h3>
            <Link to="/dashboard/registration" style={{ fontSize: '0.85rem', color: 'var(--gold-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Manage <ArrowRight size={14} />
            </Link>
          </div>

          {!team ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'rgba(212,175,55,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <Users size={24} color="var(--gold-400)" />
              </div>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '6px', fontWeight: 600 }}>
                You have not joined a team yet.
              </p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '18px' }}>
                HEXONA-LLM requires teams of 2 to 4 members to submit deliverables.
              </p>
              <Link to="/dashboard/registration">
                <GoldButton size="sm">Create or Join Squad</GoldButton>
              </Link>
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: 'rgba(0,0,0,0.3)', borderRadius: '10px', marginBottom: '16px' }}>
                <div>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Team Code</span>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '1.1rem', color: 'var(--gold-300)', fontWeight: 700 }}>
                    {team.code}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Track</span>
                  <div style={{ fontSize: '0.9rem', color: '#fff', fontWeight: 600 }}>
                    {team.track || 'General AI Track'}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px' }}>
                Confirmed Members ({members.length})
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {members.map((m) => (
                  <div key={m.uid} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'rgba(255,255,255,0.02)', borderRadius: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '28px', height: '28px', borderRadius: '50%', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--gold-300)', fontWeight: 700 }}>
                        {m.name ? m.name[0].toUpperCase() : '?'}
                      </div>
                      <span style={{ fontSize: '0.9rem', color: '#fff' }}>{m.name}</span>
                    </div>
                    {m.uid === team.leaderUid && (
                      <span style={{ fontSize: '0.75rem', color: 'var(--gold-400)', fontWeight: 600 }}>Leader 👑</span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Right Column: Latest Broadcasts */}
        <GlassCard>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>
              Latest Broadcasts
            </h3>
            <Link to="/dashboard/announcements" style={{ fontSize: '0.85rem', color: 'var(--gold-400)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              All Broadcasts <ArrowRight size={14} />
            </Link>
          </div>

          {latestAnnouncements.length === 0 ? (
            <EmptyState
              icon={Megaphone}
              title="No Broadcasts Yet"
              description="Official announcements will show up here in real time."
            />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {latestAnnouncements.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '14px',
                    borderRadius: '10px',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span className={`priority-tag priority-${item.priority || 'normal'}`}>
                      {item.priority || 'Normal'}
                    </span>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 600 }}>{item.title}</h4>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', lineClamp: 2, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>
    </div>
  );
}

import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Megaphone,
  Calendar,
  FileCheck2,
  HelpCircle,
  Settings,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useRealtime } from '../../../hooks/useRealtime';
import GlassCard from '../../../components/GlassCard';
import GoldButton from '../../../components/GoldButton';

export default function AdminOverview() {
  const { data: usersData } = useRealtime('users');
  const { data: teamsData } = useRealtime('teams');
  const { data: roundsData } = useRealtime('rounds');
  const { data: submissionsData } = useRealtime('submissions');
  const { data: announcementsData } = useRealtime('announcements');
  const { data: helpRequestsData } = useRealtime('helpRequests');

  const userCount = usersData ? Object.keys(usersData).length : 0;
  const teamCount = teamsData ? Object.keys(teamsData).length : 0;
  const announcementCount = announcementsData ? Object.keys(announcementsData).length : 0;
  const roundCount = roundsData ? Object.keys(roundsData).length : 0;
  const helpCount = helpRequestsData ? Object.keys(helpRequestsData).length : 0;

  const totalSubmissions = useMemo(() => {
    if (!submissionsData) return 0;
    let count = 0;
    Object.values(submissionsData).forEach((roundSubs) => {
      if (roundSubs && typeof roundSubs === 'object') {
        count += Object.keys(roundSubs).length;
      }
    });
    return count;
  }, [submissionsData]);

  const cards = [
    { title: 'Teams Roster', count: teamCount, desc: 'View squads, members, and export CSV', link: '/dashboard/admin/teams', icon: Users },
    { title: 'Submissions', count: totalSubmissions, desc: 'Score decks, provide feedback, shortlist', link: '/dashboard/admin/submissions', icon: FileCheck2 },
    { title: 'Broadcasts', count: announcementCount, desc: 'Dispatch live alerts and announcements', link: '/dashboard/admin/announcements', icon: Megaphone },
    { title: 'Rounds & Deadlines', count: roundCount, desc: 'Configure hackathon stages and timings', link: '/dashboard/admin/rounds', icon: Calendar },
    { title: 'Help Desk', count: helpCount, desc: 'Resolve mentorship tickets and host sessions', link: '/dashboard/admin/help', icon: HelpCircle },
    { title: 'System Settings', count: 'Config', desc: 'Themes, tracks, dates, and team limits', link: '/dashboard/admin/settings', icon: Settings },
  ];

  return (
    <div className="admin-overview">
      <div className="dash-section-header">
        <div>
          <h2 className="dash-heading" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <ShieldAlert size={28} color="var(--gold-400)" />
            Command Center Telemetry
          </h2>
          <p className="dash-subheading">
            Sanjivani University Administrator Grid — Realtime Event Control
          </p>
        </div>
      </div>

      {/* Top Telemetry Strip */}
      <div className="grid-4" style={{ marginBottom: '32px' }}>
        <div className="metric-card">
          <div className="metric-icon-box">
            <Users size={22} />
          </div>
          <div>
            <div className="metric-value">{userCount}</div>
            <div className="metric-label">Registered Participants</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box">
            <Users size={22} />
          </div>
          <div>
            <div className="metric-value">{teamCount}</div>
            <div className="metric-label">Enrolled Squads</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box">
            <FileCheck2 size={22} />
          </div>
          <div>
            <div className="metric-value">{totalSubmissions}</div>
            <div className="metric-label">Deliverables Submitted</div>
          </div>
        </div>

        <div className="metric-card">
          <div className="metric-icon-box">
            <HelpCircle size={22} />
          </div>
          <div>
            <div className="metric-value">{helpCount}</div>
            <div className="metric-label">Support Inquiries</div>
          </div>
        </div>
      </div>

      {/* Tool Navigation Matrix */}
      <div className="grid-3">
        {cards.map((c, i) => {
          const Icon = c.icon;
          return (
            <GlassCard key={i}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(212,175,55,0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--gold-400)' }}>
                  <Icon size={20} />
                </div>
                <span style={{ fontFamily: 'var(--font-accent)', fontSize: '1.2rem', fontWeight: 700, color: 'var(--gold-300)' }}>
                  {c.count}
                </span>
              </div>

              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff', marginBottom: '6px' }}>
                {c.title}
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '16px' }}>
                {c.desc}
              </p>

              <Link to={c.link} style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.88rem', color: 'var(--gold-400)', fontWeight: 600 }}>
                Access Panel <ArrowRight size={14} />
              </Link>
            </GlassCard>
          );
        })}
      </div>
    </div>
  );
}

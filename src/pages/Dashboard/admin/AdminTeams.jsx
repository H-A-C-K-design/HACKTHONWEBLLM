import { useState, useMemo } from 'react';
import { Users, Search, Download, Trash2, Crown, ExternalLink, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRealtime } from '../../../hooks/useRealtime';
import { disbandTeam, removeMember } from '../../../firebase/db';
import GlassCard from '../../../components/GlassCard';
import GoldButton from '../../../components/GoldButton';
import EmptyState from '../../../components/EmptyState';
import { formatDate } from '../../../utils/formatDate';

export default function AdminTeams() {
  const { data: rawTeams, loading: teamsLoading } = useRealtime('teams');
  const { data: rawUsers } = useRealtime('users');
  const [searchTerm, setSearchTerm] = useState('');

  const teams = useMemo(() => {
    if (!rawTeams) return [];
    return Object.entries(rawTeams).map(([id, t]) => ({ id, ...t }));
  }, [rawTeams]);

  // Filtered teams
  const filteredTeams = useMemo(() => {
    if (!searchTerm.trim()) return teams;
    const term = searchTerm.toLowerCase();
    return teams.filter(
      (t) =>
        (t.name && t.name.toLowerCase().includes(term)) ||
        (t.code && t.code.toLowerCase().includes(term)) ||
        (t.track && t.track.toLowerCase().includes(term))
    );
  }, [teams, searchTerm]);

  // Export Teams to CSV
  const exportTeamsCSV = () => {
    if (teams.length === 0) {
      toast.error('No teams to export');
      return;
    }

    const headers = ['Team ID', 'Team Name', 'Team Code', 'Track', 'Member Count', 'Leader UID', 'Created Date'];
    const rows = teams.map((t) => [
      `"${t.id}"`,
      `"${t.name || ''}"`,
      `"${t.code || ''}"`,
      `"${t.track || ''}"`,
      t.memberCount || 1,
      `"${t.leaderUid || ''}"`,
      `"${formatDate(t.createdAt)}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hexona_teams_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Teams roster exported as CSV');
  };

  // Export Participants to CSV
  const exportParticipantsCSV = () => {
    if (!rawUsers) {
      toast.error('No participants to export');
      return;
    }

    const headers = ['UID', 'Full Name', 'Email', 'Phone', 'College', 'Year of Study', 'Team ID', 'Role', 'Registered Date'];
    const rows = Object.entries(rawUsers).map(([uid, u]) => [
      `"${uid}"`,
      `"${u.name || ''}"`,
      `"${u.email || ''}"`,
      `"${u.phone || ''}"`,
      `"${u.college || ''}"`,
      `"${u.year || ''}"`,
      `"${u.teamId || 'None'}"`,
      `"${u.role || 'participant'}"`,
      `"${formatDate(u.createdAt)}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `hexona_participants_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Participants exported as CSV');
  };

  const handleAdminDisband = async (teamId, teamName) => {
    if (!window.confirm(`Admin action: Are you sure you want to forcibly disband squad "${teamName}"?`)) return;
    try {
      await disbandTeam('admin', teamId);
      toast.success(`Team "${teamName}" disbanded.`);
    } catch (err) {
      toast.error(err.message || 'Failed to disband');
    }
  };

  return (
    <div className="admin-teams-page">
      <div className="dash-section-header">
        <div>
          <h2 className="dash-heading">Manage Enrolled Squads</h2>
          <p className="dash-subheading">
            Live database of teams, leader credentials, and participant rosters
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <GoldButton variant="secondary" size="sm" onClick={exportTeamsCSV} icon={<Download size={14} />}>
            Export Teams CSV
          </GoldButton>
          <GoldButton variant="secondary" size="sm" onClick={exportParticipantsCSV} icon={<Download size={14} />}>
            Export Participants CSV
          </GoldButton>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ position: 'relative', maxWidth: '420px' }}>
          <Search size={18} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field"
            placeholder="Search by team name, code, or track..."
            style={{ paddingLeft: '40px' }}
          />
        </div>
      </div>

      {filteredTeams.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={Users}
            title="No Teams Found"
            description={searchTerm ? 'No squads match your search criteria.' : 'No teams have been formed yet.'}
          />
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {filteredTeams.map((team) => {
            const membersList = team.members ? Object.entries(team.members).map(([uid, m]) => ({ uid, ...m })) : [];

            return (
              <GlassCard key={team.id}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>
                        {team.name}
                      </h3>
                      <span className="team-code-badge" style={{ padding: '3px 8px', fontSize: '0.85rem' }}>
                        {team.code}
                      </span>
                    </div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Track: <strong style={{ color: 'var(--gold-400)' }}>{team.track || 'Unassigned'}</strong> • Formed {formatDate(team.createdAt)}
                    </p>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span className="status-badge" style={{ background: 'rgba(212,175,55,0.1)', color: 'var(--gold-300)', border: '1px solid var(--gold-500)' }}>
                      {membersList.length} Members
                    </span>
                    <button
                      onClick={() => handleAdminDisband(team.id, team.name)}
                      style={{
                        background: 'rgba(255,71,87,0.1)',
                        border: '1px solid rgba(255,71,87,0.3)',
                        color: '#ff4757',
                        padding: '6px 10px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        fontSize: '0.8rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                      title="Force Disband Squad"
                    >
                      <Trash2 size={13} /> Disband
                    </button>
                  </div>
                </div>

                {team.idea && (
                  <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', background: 'rgba(0,0,0,0.25)', padding: '10px 14px', borderRadius: '8px', marginBottom: '14px' }}>
                    <strong>Idea:</strong> {team.idea}
                  </p>
                )}

                {/* Member Roster Strip */}
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {membersList.map((m) => (
                    <div
                      key={m.uid}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '4px 10px',
                        background: 'rgba(255,255,255,0.03)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        borderRadius: '6px',
                        fontSize: '0.82rem',
                        color: '#fff',
                      }}
                    >
                      {m.uid === team.leaderUid && <Crown size={12} color="var(--gold-400)" />}
                      <span>{m.name || 'Member'}</span>
                      <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({m.college || 'Sanjivani'})</span>
                    </div>
                  ))}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

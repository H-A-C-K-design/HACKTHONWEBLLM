import { useState, useEffect } from 'react';
import { Settings, Save, Plus, Trash2, Calendar, Award, Shield, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRealtime } from '../../../hooks/useRealtime';
import { updateSettings, setSettings } from '../../../firebase/db';
import GlassCard from '../../../components/GlassCard';
import GoldButton from '../../../components/GoldButton';

export default function AdminSettings() {
  const { data: rawSettings } = useRealtime('settings');

  // Event parameters
  const [minTeamSize, setMinTeamSize] = useState(2);
  const [maxTeamSize, setMaxTeamSize] = useState(4);
  const [registrationOpen, setRegistrationOpen] = useState(true);
  const [anyMemberCanSubmit, setAnyMemberCanSubmit] = useState(false);
  const [useLinkSubmission, setUseLinkSubmission] = useState(false);
  const [startDateStr, setStartDateStr] = useState('');
  const [endDateStr, setEndDateStr] = useState('');

  // Prizes
  const [prizeFirst, setPrizeFirst] = useState('₹50,000 + Cloud Credits');
  const [prizeSecond, setPrizeSecond] = useState('₹30,000 + AI Tools Pass');
  const [prizeThird, setPrizeThird] = useState('₹20,000 + Merit Trophy');

  // About text
  const [aboutText, setAboutText] = useState('');
  const [venue, setVenue] = useState('');
  const [contact, setContact] = useState('');

  // Tracks state
  const [tracks, setTracks] = useState([]);
  const [newTrackTitle, setNewTrackTitle] = useState('');
  const [newTrackDesc, setNewTrackDesc] = useState('');

  const [saving, setSaving] = useState(false);

  // Sync state when settings load
  useEffect(() => {
    if (!rawSettings) return;

    if (rawSettings.event) {
      setMinTeamSize(rawSettings.event.minTeamSize || 2);
      setMaxTeamSize(rawSettings.event.maxTeamSize || 4);
      setRegistrationOpen(rawSettings.event.registrationOpen !== false);
      setAnyMemberCanSubmit(!!rawSettings.event.anyMemberCanSubmit);
      setUseLinkSubmission(!!rawSettings.event.useLinkSubmission);

      if (rawSettings.event.startDate) {
        setStartDateStr(new Date(rawSettings.event.startDate).toISOString().slice(0, 16));
      }
      if (rawSettings.event.endDate) {
        setEndDateStr(new Date(rawSettings.event.endDate).toISOString().slice(0, 16));
      }
    }

    if (rawSettings.prizes) {
      setPrizeFirst(rawSettings.prizes.first || '');
      setPrizeSecond(rawSettings.prizes.second || '');
      setPrizeThird(rawSettings.prizes.third || '');
    }

    if (rawSettings.about) {
      setAboutText(rawSettings.about.text || '');
      setVenue(rawSettings.about.venue || '');
      setContact(rawSettings.about.contact || '');
    }

    if (rawSettings.tracks) {
      const tList = Object.entries(rawSettings.tracks).map(([id, t]) => ({ id, ...t }));
      setTracks(tList);
    }
  }, [rawSettings]);

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const eventPayload = {
        minTeamSize: Number(minTeamSize),
        maxTeamSize: Number(maxTeamSize),
        registrationOpen,
        anyMemberCanSubmit,
        useLinkSubmission,
        startDate: startDateStr ? new Date(startDateStr).getTime() : 0,
        endDate: endDateStr ? new Date(endDateStr).getTime() : 0,
      };

      const prizesPayload = {
        first: prizeFirst,
        second: prizeSecond,
        third: prizeThird,
      };

      const aboutPayload = {
        text: aboutText,
        venue,
        contact,
      };

      await updateSettings('event', eventPayload);
      await updateSettings('prizes', prizesPayload);
      await updateSettings('about', aboutPayload);

      toast.success('Settings synchronized to Realtime Database!');
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTrack = async () => {
    if (!newTrackTitle.trim()) {
      toast.error('Track title is required');
      return;
    }
    const trackId = Date.now().toString();
    const newTrack = { title: newTrackTitle.trim(), description: newTrackDesc.trim() };

    try {
      await updateSettings(`tracks/${trackId}`, newTrack);
      setNewTrackTitle('');
      setNewTrackDesc('');
      toast.success('Track added!');
    } catch (err) {
      toast.error('Failed to add track');
    }
  };

  const handleDeleteTrack = async (trackId) => {
    try {
      await setSettings(`tracks/${trackId}`, null);
      toast.success('Track removed');
    } catch (err) {
      toast.error('Failed to remove track');
    }
  };

  return (
    <div className="admin-settings-page">
      <div className="dash-section-header">
        <div>
          <h2 className="dash-heading">Event Configuration & System Settings</h2>
          <p className="dash-subheading">
            Live database variables controlling team parameters, countdowns, tracks, and prizes
          </p>
        </div>

        <GoldButton onClick={handleSaveAll} loading={saving} icon={<Save size={16} />}>
          Save All Parameters
        </GoldButton>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {/* Event Schedule & Team Bounds */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Calendar size={22} color="var(--gold-400)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>
              Hackathon Timeline & Squad Bounds
            </h3>
          </div>

          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="input-label">Event Start Date & Time (Drives Countdown)</label>
              <input
                type="datetime-local"
                value={startDateStr}
                onChange={(e) => setStartDateStr(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Event End Date & Time</label>
              <input
                type="datetime-local"
                value={endDateStr}
                onChange={(e) => setEndDateStr(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid-2" style={{ marginBottom: '16px' }}>
            <div className="form-group">
              <label className="input-label">Minimum Squad Size (Default: 2)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={minTeamSize}
                onChange={(e) => setMinTeamSize(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Maximum Squad Size (Default: 4)</label>
              <input
                type="number"
                min="1"
                max="10"
                value={maxTeamSize}
                onChange={(e) => setMaxTeamSize(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', paddingTop: '10px' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={registrationOpen}
                onChange={(e) => setRegistrationOpen(e.target.checked)}
                style={{ accentColor: 'var(--gold-500)', width: '16px', height: '16px' }}
              />
              <span>Squad Enrollment Open</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={anyMemberCanSubmit}
                onChange={(e) => setAnyMemberCanSubmit(e.target.checked)}
                style={{ accentColor: 'var(--gold-500)', width: '16px', height: '16px' }}
              />
              <span>Allow Any Squad Member to Submit Deliverables</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={useLinkSubmission}
                onChange={(e) => setUseLinkSubmission(e.target.checked)}
                style={{ accentColor: 'var(--gold-500)', width: '16px', height: '16px' }}
              />
              <span>Use Drive Link Submissions Instead of Storage</span>
            </label>
          </div>
        </GlassCard>

        {/* Tracks Management */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Shield size={22} color="var(--gold-400)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>
              Hackathon Tracks & Themes
            </h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
            {tracks.map((t) => (
              <div
                key={t.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: '8px',
                }}
              >
                <div>
                  <div style={{ color: '#fff', fontWeight: 600 }}>{t.title}</div>
                  {t.description && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem' }}>{t.description}</div>
                  )}
                </div>
                <button
                  onClick={() => handleDeleteTrack(t.id)}
                  style={{ background: 'transparent', border: 'none', color: '#ff4757', cursor: 'pointer', padding: '6px' }}
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>

          {/* Add New Track Form */}
          <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.88rem', color: 'var(--gold-300)', fontWeight: 600 }}>
              Add New Theme / Track
            </div>
            <div className="form-row">
              <input
                value={newTrackTitle}
                onChange={(e) => setNewTrackTitle(e.target.value)}
                className="input-field"
                placeholder="Track Title (e.g. LLM Agents for Enterprise)"
              />
              <input
                value={newTrackDesc}
                onChange={(e) => setNewTrackDesc(e.target.value)}
                className="input-field"
                placeholder="Short theme description..."
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <GoldButton size="sm" onClick={handleAddTrack} icon={<Plus size={14} />}>
                Add Track
              </GoldButton>
            </div>
          </div>
        </GlassCard>

        {/* Prizes */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Award size={22} color="var(--gold-400)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>
              Podium Rewards & Bounty Pool
            </h3>
          </div>

          <div className="grid-3">
            <div className="form-group">
              <label className="input-label" style={{ color: 'var(--gold-400)' }}>1st Place (Gold Champion)</label>
              <input
                value={prizeFirst}
                onChange={(e) => setPrizeFirst(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="input-label" style={{ color: '#d9d9de' }}>2nd Place (Silver Runner-up)</label>
              <input
                value={prizeSecond}
                onChange={(e) => setPrizeSecond(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="input-label" style={{ color: '#cd7f32' }}>3rd Place (Bronze Finalist)</label>
              <input
                value={prizeThird}
                onChange={(e) => setPrizeThird(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </GlassCard>

        {/* Institutional & Contact Information */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Info size={22} color="var(--gold-400)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>
              Institutional Description & Venue
            </h3>
          </div>

          <div className="form-group" style={{ marginBottom: '14px' }}>
            <label className="input-label">Hackathon Mission Statement</label>
            <textarea
              value={aboutText}
              onChange={(e) => setAboutText(e.target.value)}
              className="input-field"
              rows={3}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="input-label">Campus Venue</label>
              <input
                value={venue}
                onChange={(e) => setVenue(e.target.value)}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label className="input-label">Official Contact Email</label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                className="input-field"
              />
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}

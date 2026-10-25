import { useState, useEffect } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, Bell, ExternalLink, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../hooks/useRealtime';
import Sidebar from './Sidebar';
import AnimatedBackground from '../../components/AnimatedBackground';
import './Dashboard.css';

export default function DashboardLayout() {
  const [expanded, setExpanded] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { profile, isAdmin } = useAuth();

  // Listen to announcements for topbar bell badge
  const { data: announcementsData } = useRealtime('announcements');
  const [hasUnread, setHasUnread] = useState(false);

  useEffect(() => {
    if (!announcementsData) {
      setHasUnread(false);
      return;
    }
    const lastRead = profile?.lastReadAnnouncements || 0;
    const announcements = Object.values(announcementsData);
    const unread = announcements.some((a) => (a.createdAt || 0) > lastRead);
    setHasUnread(unread);
  }, [announcementsData, profile]);

  // Derive page title from location
  const getPageMeta = () => {
    const p = location.pathname;
    if (p === '/dashboard') return { title: 'Mission Overview', subtitle: 'Live telemetry and event status' };
    if (p.includes('/registration')) return { title: 'Team Portal', subtitle: 'Form or join a hackathon squad' };
    if (p.includes('/announcements')) return { title: 'Live Broadcasts', subtitle: 'Official announcements and urgent updates' };
    if (p.includes('/submissions')) return { title: 'Submission Terminal', subtitle: 'Upload round presentations and code' };
    if (p.includes('/about')) return { title: 'About HEXONA-LLM', subtitle: 'Guidelines, themes, and organizer information' };
    if (p.includes('/help')) return { title: 'Help & Mentorship', subtitle: 'Office hours and technical queries' };
    if (p.includes('/admin/teams')) return { title: 'Manage Teams', subtitle: 'View members, adjust rosters, inspect codes' };
    if (p.includes('/admin/announcements')) return { title: 'Announcement Dispatcher', subtitle: 'Publish or edit broadcasts' };
    if (p.includes('/admin/rounds')) return { title: 'Round Scheduler', subtitle: 'Configure deadlines and active stages' };
    if (p.includes('/admin/submissions')) return { title: 'Submission Reviews', subtitle: 'Grade decks, download files, assign status' };
    if (p.includes('/admin/help')) return { title: 'Help Desk Queue', subtitle: 'Answer technical tickets and manage sessions' };
    if (p.includes('/admin/settings')) return { title: 'Event Configuration', subtitle: 'Hackathon parameters and global settings' };
    if (p.includes('/admin')) return { title: 'Admin Command Center', subtitle: 'Global analytics and telemetry' };
    return { title: 'HEXONA-LLM', subtitle: 'Participant Portal' };
  };

  const { title, subtitle } = getPageMeta();

  return (
    <div className="dashboard-root">
      <AnimatedBackground variant="dashboard" />

      {/* Mobile Backdrop */}
      <div
        className={`mobile-overlay ${mobileOpen ? 'visible' : ''}`}
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar */}
      <Sidebar
        expanded={expanded}
        setExpanded={setExpanded}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Main Container */}
      <div
        className={`dash-main ${expanded ? 'sidebar-expanded' : 'sidebar-collapsed'}`}
      >
        {/* Topbar */}
        <header className="dash-topbar">
          <div className="topbar-left">
            <button
              className="topbar-icon-btn mobile-only"
              onClick={() => setMobileOpen(true)}
              style={{ display: window.innerWidth <= 900 ? 'flex' : 'none' }}
              title="Open menu"
            >
              <Menu size={20} />
            </button>

            <div>
              <h1 className="topbar-page-title">{title}</h1>
              <p className="topbar-page-subtitle">{subtitle}</p>
            </div>
          </div>

          <div className="topbar-right">
            {isAdmin && (
              <div className="topbar-status-chip" style={{ borderColor: 'var(--gold-500)', background: 'rgba(212,175,55,0.1)' }}>
                <ShieldCheck size={14} color="var(--gold-400)" />
                <span>Admin Mode</span>
              </div>
            )}

            <div className="topbar-status-chip">
              <span className="status-dot" />
              <span>Realtime Connected</span>
            </div>

            <Link
              to="/dashboard/announcements"
              className="topbar-icon-btn"
              title="Announcements"
            >
              <Bell size={18} />
              {hasUnread && (
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    right: '8px',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    background: '#ff3344',
                    boxShadow: '0 0 6px #ff3344',
                  }}
                />
              )}
            </Link>

            <Link
              to="/"
              className="topbar-icon-btn"
              title="Public Landing Page"
              target="_blank"
              rel="noreferrer"
            >
              <ExternalLink size={18} />
            </Link>
          </div>
        </header>

        {/* Content with animated route transition */}
        <main className="dash-content">
          <AnimatePresence mode="wait">
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <Outlet />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}

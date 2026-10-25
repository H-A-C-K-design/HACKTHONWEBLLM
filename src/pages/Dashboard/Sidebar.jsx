import { useState, useEffect } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  Megaphone,
  UploadCloud,
  Info,
  LifeBuoy,
  LayoutDashboard,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Calendar,
  Layers,
  Award,
  Settings,
  HelpCircle,
  FileCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { logoutUser } from '../../firebase/auth';
import { useRealtime } from '../../hooks/useRealtime';
import Logo from '../../components/Logo';
import toast from 'react-hot-toast';

export default function Sidebar({ expanded, setExpanded, mobileOpen, setMobileOpen }) {
  const { user, profile, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Listen to announcements for unread badge count
  const { data: announcementsData } = useRealtime('announcements');
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!announcementsData) {
      setUnreadCount(0);
      return;
    }
    const lastRead = profile?.lastReadAnnouncements || 0;
    const announcements = Object.values(announcementsData);
    const unread = announcements.filter((a) => (a.createdAt || 0) > lastRead).length;
    setUnreadCount(unread);
  }, [announcementsData, profile]);

  const handleLogout = async () => {
    try {
      await logoutUser();
      toast.success('Signed out successfully');
      navigate('/');
    } catch {
      toast.error('Failed to log out');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
    { path: '/dashboard/registration', label: 'Event Registration', icon: Users },
    {
      path: '/dashboard/announcements',
      label: 'Announcements',
      icon: Megaphone,
      badge: unreadCount > 0 ? unreadCount : null,
    },
    { path: '/dashboard/submissions', label: 'Round / PPT Submission', icon: UploadCloud },
    { path: '/dashboard/about', label: 'About', icon: Info },
    { path: '/dashboard/help', label: 'Help Session', icon: LifeBuoy },
  ];

  const adminItems = [
    { path: '/dashboard/admin', label: 'Admin Overview', icon: ShieldAlert, exact: true },
    { path: '/dashboard/admin/teams', label: 'Manage Teams', icon: Users },
    { path: '/dashboard/admin/announcements', label: 'Announcements', icon: Megaphone },
    { path: '/dashboard/admin/rounds', label: 'Rounds & Dates', icon: Calendar },
    { path: '/dashboard/admin/submissions', label: 'Submissions', icon: FileCheck },
    { path: '/dashboard/admin/help', label: 'Help Requests', icon: HelpCircle },
    { path: '/dashboard/admin/settings', label: 'Settings', icon: Settings },
  ];

  const getInitials = (name) => {
    if (!name) return 'H9';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const closeMobile = () => {
    if (setMobileOpen) setMobileOpen(false);
  };

  return (
    <aside
      className={`dash-sidebar ${expanded ? 'expanded' : 'collapsed'} ${
        mobileOpen ? 'mobile-open' : ''
      }`}
    >
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <NavLink to="/" onClick={closeMobile} style={{ display: 'flex', alignItems: 'center' }}>
          <Logo variant={expanded ? 'full' : 'icon'} size={expanded ? 32 : 36} />
        </NavLink>

        <button
          className="sidebar-collapse-btn"
          onClick={() => setExpanded(!expanded)}
          title={expanded ? 'Collapse sidebar' : 'Expand sidebar'}
        >
          {expanded ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
        </button>
      </div>

      {/* Navigation list */}
      <div className="sidebar-nav">
        {expanded && <div className="nav-section-title">HACKATHON</div>}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path) &&
              (item.path === '/dashboard' ? location.pathname === '/dashboard' : true);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobile}
              className={`nav-item ${isActive ? 'active' : ''}`}
              title={!expanded ? item.label : undefined}
            >
              <div className="nav-item-icon">
                <Icon size={20} />
              </div>
              {expanded && <span>{item.label}</span>}
              {expanded && item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          );
        })}

        {/* Admin Navigation */}
        {isAdmin && (
          <>
            {expanded && (
              <div className="nav-section-title" style={{ marginTop: '16px', color: 'var(--gold-400)' }}>
                ADMIN CONTROL
              </div>
            )}
            {adminItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={closeMobile}
                  className={`nav-item ${isActive ? 'active' : ''}`}
                  title={!expanded ? item.label : undefined}
                  style={isActive ? { borderColor: 'var(--gold-500)' } : {}}
                >
                  <div className="nav-item-icon" style={{ color: 'var(--gold-400)' }}>
                    <Icon size={19} />
                  </div>
                  {expanded && <span style={{ color: 'var(--gold-300)' }}>{item.label}</span>}
                </NavLink>
              );
            })}
          </>
        )}
      </div>

      {/* User profile & Logout */}
      <div className="sidebar-footer">
        <div className="user-badge">
          <div className="user-avatar-hex">
            {getInitials(profile?.name || user?.displayName)}
          </div>
          {expanded && (
            <div className="user-info">
              <span className="user-name">{profile?.name || user?.displayName || 'Participant'}</span>
              <span className="user-subtext">
                {isAdmin ? 'Administrator' : profile?.teamId ? 'Team Member' : 'Solo'}
              </span>
            </div>
          )}
        </div>

        <button
          className="logout-btn"
          onClick={handleLogout}
          title="Sign out of HEXONA-LLM"
        >
          <LogOut size={18} />
        </button>
      </div>
    </aside>
  );
}

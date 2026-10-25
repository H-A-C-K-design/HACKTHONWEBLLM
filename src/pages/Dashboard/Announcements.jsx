import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Megaphone, Pin, Clock, User, Filter, AlertTriangle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useRealtime } from '../../hooks/useRealtime';
import { updateUserProfile } from '../../firebase/db';
import GlassCard from '../../components/GlassCard';
import EmptyState from '../../components/EmptyState';
import { formatDate } from '../../utils/formatDate';

export default function Announcements() {
  const { user, profile } = useAuth();
  const { data: rawAnnouncements, loading } = useRealtime('announcements');
  const [filter, setFilter] = useState('all'); // 'all' | 'important' | 'urgent'

  // Mark all announcements as read when viewing this page
  useEffect(() => {
    if (user?.uid) {
      updateUserProfile(user.uid, {
        lastReadAnnouncements: Date.now(),
      }).catch(() => {});
    }
  }, [user]);

  // Process, sort and filter announcements
  const announcements = useMemo(() => {
    if (!rawAnnouncements) return [];
    const list = Object.entries(rawAnnouncements).map(([id, a]) => ({
      id,
      ...a,
    }));

    // Sort: pinned first, then newest first
    list.sort((a, b) => {
      if (a.pinned && !b.pinned) return -1;
      if (!a.pinned && b.pinned) return 1;
      return (b.createdAt || 0) - (a.createdAt || 0);
    });

    if (filter === 'all') return list;
    return list.filter((a) => (a.priority || 'normal') === filter);
  }, [rawAnnouncements, filter]);

  return (
    <div className="announcements-page">
      <div className="dash-section-header">
        <div>
          <h2 className="dash-heading">Official Broadcasts</h2>
          <p className="dash-subheading">
            Direct transmissions from Sanjivani University hackathon committee
          </p>
        </div>

        {/* Filter Pills */}
        <div className="filter-pills">
          <button
            className={`filter-pill ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All Broadcasts
          </button>
          <button
            className={`filter-pill ${filter === 'important' ? 'active' : ''}`}
            onClick={() => setFilter('important')}
          >
            Important
          </button>
          <button
            className={`filter-pill ${filter === 'urgent' ? 'active' : ''}`}
            onClick={() => setFilter('urgent')}
          >
            Urgent Only
          </button>
        </div>
      </div>

      {announcements.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No Broadcasts Found"
          description={
            filter === 'all'
              ? 'No announcements have been published yet. Check back soon.'
              : `No ${filter} announcements currently active.`
          }
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {announcements.map((item) => {
            const isPinned = item.pinned;
            const priority = item.priority || 'normal';

            return (
              <GlassCard
                key={item.id}
                style={
                  isPinned
                    ? {
                        border: '1px solid rgba(212,175,55,0.4)',
                        background: 'rgba(212,175,55,0.03)',
                        boxShadow: '0 4px 20px rgba(212,175,55,0.1)',
                      }
                    : {}
                }
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                    {isPinned && (
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          padding: '3px 8px',
                          background: 'rgba(212,175,55,0.2)',
                          color: 'var(--gold-300)',
                          borderRadius: '6px',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        <Pin size={12} /> Pinned
                      </span>
                    )}

                    <span className={`priority-tag priority-${priority}`}>
                      {priority === 'urgent' && <AlertTriangle size={12} />}
                      {priority}
                    </span>

                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', fontWeight: 700 }}>
                      {item.title}
                    </h3>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Clock size={14} /> {formatDate(item.createdAt)}
                    </span>
                    {item.authorName && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <User size={14} /> {item.authorName}
                      </span>
                    )}
                  </div>
                </div>

                <div
                  style={{
                    color: 'var(--text-secondary)',
                    fontSize: '0.95rem',
                    lineHeight: 1.65,
                    whiteSpace: 'pre-wrap',
                    marginTop: '8px',
                  }}
                >
                  {item.body}
                </div>
              </GlassCard>
            );
          })}
        </div>
      )}
    </div>
  );
}

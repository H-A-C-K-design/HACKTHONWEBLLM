import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Plus, Trash2, Pin, Edit3, Send, AlertTriangle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import { useRealtime } from '../../../hooks/useRealtime';
import {
  createAnnouncement,
  updateAnnouncement,
  deleteAnnouncement,
} from '../../../firebase/db';
import { announcementSchema } from '../../../utils/validators';
import GlassCard from '../../../components/GlassCard';
import GoldButton from '../../../components/GoldButton';
import EmptyState from '../../../components/EmptyState';
import { formatDate } from '../../../utils/formatDate';

export default function AdminAnnouncements() {
  const { user, profile } = useAuth();
  const { data: rawAnnouncements } = useRealtime('announcements');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
    setValue,
  } = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: {
      priority: 'normal',
      pinned: false,
    },
  });

  const announcements = useMemo(() => {
    if (!rawAnnouncements) return [];
    return Object.entries(rawAnnouncements)
      .map(([id, a]) => ({ id, ...a }))
      .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  }, [rawAnnouncements]);

  const openCreateModal = () => {
    setEditingItem(null);
    reset({
      title: '',
      body: '',
      priority: 'normal',
      pinned: false,
    });
    setModalOpen(true);
  };

  const openEditModal = (item) => {
    setEditingItem(item);
    setValue('title', item.title || '');
    setValue('body', item.body || '');
    setValue('priority', item.priority || 'normal');
    setValue('pinned', !!item.pinned);
    setModalOpen(true);
  };

  const onSubmit = async (data) => {
    try {
      if (editingItem) {
        await updateAnnouncement(editingItem.id, {
          title: data.title,
          body: data.body,
          priority: data.priority,
          pinned: data.pinned || false,
        });
        toast.success('Announcement modified');
      } else {
        await createAnnouncement({
          title: data.title,
          body: data.body,
          priority: data.priority,
          pinned: data.pinned || false,
          uid: user.uid,
          authorName: profile?.name || 'Hackathon Committee',
        });
        toast.success('Broadcast published live!');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete announcement "${title}"?`)) return;
    try {
      await deleteAnnouncement(id);
      toast.success('Announcement removed');
    } catch (err) {
      toast.error(err.message || 'Failed to delete');
    }
  };

  const handleTogglePin = async (item) => {
    try {
      await updateAnnouncement(item.id, { pinned: !item.pinned });
      toast.success(item.pinned ? 'Unpinned' : 'Pinned to top');
    } catch (err) {
      toast.error('Failed to update pin');
    }
  };

  return (
    <div className="admin-announcements-page">
      <div className="dash-section-header">
        <div>
          <h2 className="dash-heading">Broadcast Dispatcher</h2>
          <p className="dash-subheading">
            Publish real-time announcements to all participants and manage emergency alerts
          </p>
        </div>

        <GoldButton onClick={openCreateModal} icon={<Plus size={18} />}>
          New Broadcast
        </GoldButton>
      </div>

      {announcements.length === 0 ? (
        <GlassCard>
          <EmptyState
            icon={Megaphone}
            title="No Broadcasts Published"
            description="Create your first announcement to notify hackers."
            action={openCreateModal}
            actionLabel="Publish Broadcast"
          />
        </GlassCard>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {announcements.map((item) => (
            <GlassCard key={item.id}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '10px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  {item.pinned && (
                    <span style={{ fontSize: '0.72rem', background: 'rgba(212,175,55,0.2)', color: 'var(--gold-300)', padding: '2px 8px', borderRadius: '4px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Pin size={12} /> Pinned
                    </span>
                  )}
                  <span className={`priority-tag priority-${item.priority || 'normal'}`}>
                    {item.priority}
                  </span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', color: '#fff', fontWeight: 700 }}>
                    {item.title}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <button
                    onClick={() => handleTogglePin(item)}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: item.pinned ? 'var(--gold-400)' : 'var(--text-muted)', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Pin size={13} /> {item.pinned ? 'Unpin' : 'Pin'}
                  </button>
                  <button
                    onClick={() => openEditModal(item)}
                    style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Edit3 size={13} /> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id, item.title)}
                    style={{ background: 'rgba(255,71,87,0.1)', border: '1px solid rgba(255,71,87,0.3)', color: '#ff4757', borderRadius: '6px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>

              <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, whiteSpace: 'pre-wrap', marginBottom: '12px' }}>
                {item.body}
              </p>

              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Published {formatDate(item.createdAt)} by {item.authorName || 'Committee'}
              </div>
            </GlassCard>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="modal-overlay" onClick={() => setModalOpen(false)}>
            <motion.div
              className="modal-content"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3 className="modal-title">
                  {editingItem ? 'Edit Broadcast' : 'Publish New Broadcast'}
                </h3>
                <button className="modal-close" onClick={() => setModalOpen(false)}>
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div className="form-group">
                  <label className="input-label">Title *</label>
                  <input
                    {...register('title')}
                    className={`input-field ${errors.title ? 'input-error' : ''}`}
                    placeholder="e.g. Round 1 Submission Portal Now Active"
                  />
                  {errors.title && <span className="error-message">{errors.title.message}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label className="input-label">Priority Level</label>
                    <select {...register('priority')} className="input-field">
                      <option value="normal">Normal (Standard update)</option>
                      <option value="important">Important (Highlighted gold)</option>
                      <option value="urgent">Urgent (High alert crimson)</option>
                    </select>
                  </div>

                  <div className="form-group" style={{ justifyContent: 'center', paddingTop: '20px' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', cursor: 'pointer' }}>
                      <input type="checkbox" {...register('pinned')} style={{ accentColor: 'var(--gold-500)', width: '16px', height: '16px' }} />
                      <span>Pin to Top of List</span>
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label className="input-label">Message Content *</label>
                  <textarea
                    {...register('body')}
                    className={`input-field ${errors.body ? 'input-error' : ''}`}
                    rows={6}
                    placeholder="Provide full instructions, links, or guidelines..."
                  />
                  {errors.body && <span className="error-message">{errors.body.message}</span>}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
                  <GoldButton variant="secondary" onClick={() => setModalOpen(false)}>
                    Cancel
                  </GoldButton>
                  <GoldButton type="submit" loading={isSubmitting} icon={<Send size={16} />}>
                    {editingItem ? 'Save Changes' : 'Transmit Live'}
                  </GoldButton>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

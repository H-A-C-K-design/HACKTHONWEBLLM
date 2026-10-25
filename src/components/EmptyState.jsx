import { motion } from 'framer-motion';
import { Inbox } from 'lucide-react';

/**
 * EmptyState — Designed "nothing here yet" UI with icon and CTA.
 */
export default function EmptyState({
  icon: IconComponent,
  title = 'Nothing here yet',
  description = 'Check back soon for updates.',
  action,
  actionLabel,
}) {
  const Icon = IconComponent || Inbox;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '60px 20px',
        textAlign: 'center',
      }}
    >
      <div style={{
        width: '80px',
        height: '80px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '20px',
        background: 'rgba(212, 175, 55, 0.08)',
        border: '1px solid rgba(212, 175, 55, 0.15)',
        marginBottom: '20px',
      }}>
        <Icon size={36} color="var(--gold-500)" strokeWidth={1.5} />
      </div>

      <h3 style={{
        fontFamily: "'Playfair Display', serif",
        fontSize: '1.3rem',
        fontWeight: 600,
        color: 'var(--text-primary)',
        marginBottom: '8px',
      }}>
        {title}
      </h3>

      <p style={{
        fontSize: '0.95rem',
        color: 'var(--text-muted)',
        maxWidth: '320px',
        lineHeight: 1.5,
        marginBottom: action ? '20px' : 0,
      }}>
        {description}
      </p>

      {action && (
        <button
          onClick={action}
          style={{
            padding: '10px 24px',
            background: 'rgba(212, 175, 55, 0.1)',
            border: '1px solid rgba(212, 175, 55, 0.3)',
            borderRadius: '10px',
            color: 'var(--gold-400)',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            fontFamily: "'Inter', sans-serif",
          }}
        >
          {actionLabel || 'Get Started'}
        </button>
      )}
    </motion.div>
  );
}

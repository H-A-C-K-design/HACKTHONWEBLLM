import { motion } from 'framer-motion';

/**
 * GlassCard — Glassmorphism card with HUD corners and optional tilt.
 */
export default function GlassCard({
  children,
  className = '',
  hover = true,
  hudCorners = true,
  padding = '24px',
  style = {},
  onClick,
  ...props
}) {
  return (
    <motion.div
      className={`glass-card ${className}`}
      onClick={onClick}
      whileHover={hover ? { y: -4, scale: 1.01 } : {}}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      style={{
        position: 'relative',
        background: 'rgba(255, 255, 255, 0.04)',
        backdropFilter: 'blur(14px)',
        WebkitBackdropFilter: 'blur(14px)',
        border: '1px solid rgba(212, 175, 55, 0.2)',
        borderRadius: '16px',
        padding,
        cursor: onClick ? 'pointer' : 'default',
        overflow: 'hidden',
        ...style,
      }}
      {...props}
    >
      {/* Gold shimmer overlay on hover */}
      {hover && (
        <div
          className="card-shimmer"
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(135deg, transparent 0%, rgba(212,175,55,0.04) 50%, transparent 100%)',
            opacity: 0,
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            borderRadius: 'inherit',
          }}
        />
      )}

      {/* HUD Corners */}
      {hudCorners && (
        <>
          <span style={{ ...cornerStyle, top: -1, left: -1, borderTop: '2px solid', borderLeft: '2px solid', borderColor: 'var(--gold-500)' }} />
          <span style={{ ...cornerStyle, top: -1, right: -1, borderTop: '2px solid', borderRight: '2px solid', borderColor: 'var(--gold-500)' }} />
          <span style={{ ...cornerStyle, bottom: -1, left: -1, borderBottom: '2px solid', borderLeft: '2px solid', borderColor: 'var(--gold-500)' }} />
          <span style={{ ...cornerStyle, bottom: -1, right: -1, borderBottom: '2px solid', borderRight: '2px solid', borderColor: 'var(--gold-500)' }} />
        </>
      )}

      <div style={{ position: 'relative', zIndex: 1 }}>{children}</div>

      <style>{`
        .glass-card:hover .card-shimmer { opacity: 1 !important; }
        .glass-card:hover { border-color: rgba(212, 175, 55, 0.4) !important; box-shadow: 0 0 24px rgba(212,175,55,0.15); }
      `}</style>
    </motion.div>
  );
}

const cornerStyle = {
  position: 'absolute',
  width: '16px',
  height: '16px',
  pointerEvents: 'none',
  zIndex: 2,
};

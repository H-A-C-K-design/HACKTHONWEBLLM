import { motion } from 'framer-motion';

/**
 * GoldButton — Primary (gold gradient) or secondary (outlined) button.
 */
export default function GoldButton({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  type = 'button',
  onClick,
  className = '',
  style = {},
  icon,
  ...props
}) {
  const sizes = {
    sm: { padding: '8px 20px', fontSize: '0.85rem' },
    md: { padding: '12px 28px', fontSize: '0.95rem' },
    lg: { padding: '16px 36px', fontSize: '1.05rem' },
  };

  const isPrimary = variant === 'primary';

  const baseStyle = {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '8px',
    fontFamily: "'Inter', sans-serif",
    fontWeight: 600,
    border: 'none',
    borderRadius: '10px',
    cursor: disabled ? 'not-allowed' : 'pointer',
    overflow: 'hidden',
    width: fullWidth ? '100%' : 'auto',
    opacity: disabled ? 0.5 : 1,
    letterSpacing: '0.02em',
    transition: 'all 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
    ...sizes[size],
    ...(isPrimary
      ? {
          background: 'linear-gradient(135deg, #F3DFA2 0%, #D4AF37 45%, #B8942A 100%)',
          color: '#0B0B0D',
          boxShadow: '0 4px 16px rgba(212, 175, 55, 0.3)',
        }
      : {
          background: 'transparent',
          color: '#D4AF37',
          border: '1px solid rgba(212, 175, 55, 0.5)',
          boxShadow: 'none',
        }),
    ...style,
  };

  return (
    <motion.button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`gold-btn ${className}`}
      style={baseStyle}
      whileHover={!disabled ? { scale: 1.03, y: -2 } : {}}
      whileTap={!disabled ? { scale: 0.97 } : {}}
      {...props}
    >
      {/* Shimmer sweep */}
      <span
        className="btn-shimmer"
        style={{
          position: 'absolute',
          inset: 0,
          background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
          transform: 'translateX(-100%)',
          transition: 'transform 0.6s ease',
          pointerEvents: 'none',
        }}
      />

      {loading ? (
        <span className="btn-loader" style={{
          width: '18px', height: '18px',
          border: `2px solid ${isPrimary ? 'rgba(11,11,13,0.3)' : 'rgba(212,175,55,0.3)'}`,
          borderTop: `2px solid ${isPrimary ? '#0B0B0D' : '#D4AF37'}`,
          borderRadius: '50%',
          animation: 'spin 0.6s linear infinite',
        }} />
      ) : (
        <>
          {icon && <span style={{ display: 'flex', alignItems: 'center' }}>{icon}</span>}
          <span style={{ position: 'relative', zIndex: 1 }}>{children}</span>
        </>
      )}

      <style>{`
        .gold-btn:hover .btn-shimmer { transform: translateX(100%) !important; }
        .gold-btn:hover {
          ${isPrimary ? 'box-shadow: 0 6px 24px rgba(212,175,55,0.45);' : 'background: rgba(212,175,55,0.1); border-color: rgba(212,175,55,0.8);'}
        }
        @keyframes spin { 100% { transform: rotate(360deg); } }
      `}</style>
    </motion.button>
  );
}

import { motion } from 'framer-motion';

/**
 * Hexagon spinner loader with gold gradient.
 */
export default function Loader({ size = 64, text = '' }) {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '16px',
      padding: '40px',
      minHeight: '200px',
    }}>
      <motion.svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, ease: 'linear', repeat: Infinity }}
      >
        <defs>
          <linearGradient id="loader-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F3DFA2" />
            <stop offset="50%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8A6D1D" />
          </linearGradient>
        </defs>
        <polygon
          points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
          stroke="url(#loader-gradient)"
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
          strokeDasharray="200"
          strokeDashoffset="100"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="200;0;200"
            dur="2s"
            repeatCount="indefinite"
          />
        </polygon>
      </motion.svg>

      {text && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: '0.85rem',
            color: 'var(--gold-400)',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
          }}
        >
          {text}
        </motion.p>
      )}
    </div>
  );
}

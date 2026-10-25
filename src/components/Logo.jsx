import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * HEXONA-LLM Logo Component
 * Hexagon with neural-node "H" inside, animated stroke draw on load.
 * Variants: 'full' (icon + wordmark), 'icon' (icon only)
 */
export default function Logo({ variant = 'full', size = 48, className = '' }) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const hexSize = size;
  const viewSize = 100;

  return (
    <div className={`logo-wrapper ${className}`} style={{ display: 'inline-flex', alignItems: 'center', gap: '12px' }}>
      {/* Hex Icon */}
      <svg
        width={hexSize}
        height={hexSize}
        viewBox={`0 0 ${viewSize} ${viewSize}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0 }}
      >
        <defs>
          <linearGradient id="hex-gold-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F3DFA2" />
            <stop offset="45%" stopColor="#D4AF37" />
            <stop offset="100%" stopColor="#8A6D1D" />
          </linearGradient>
          <filter id="hex-glow">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Hexagon outline */}
        <motion.polygon
          points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5"
          stroke="url(#hex-gold-gradient)"
          strokeWidth="2.5"
          fill="none"
          filter="url(#hex-glow)"
          initial={{ strokeDasharray: 300, strokeDashoffset: 300 }}
          animate={{ strokeDashoffset: loaded ? 0 : 300 }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
        />

        {/* Neural H - Left vertical */}
        <motion.line
          x1="35" y1="30" x2="35" y2="70"
          stroke="url(#hex-gold-gradient)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: loaded ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.5 }}
        />

        {/* Neural H - Right vertical */}
        <motion.line
          x1="65" y1="30" x2="65" y2="70"
          stroke="url(#hex-gold-gradient)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: loaded ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        />

        {/* Neural H - Crossbar */}
        <motion.line
          x1="35" y1="50" x2="65" y2="50"
          stroke="url(#hex-gold-gradient)"
          strokeWidth="2"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: loaded ? 1 : 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        />

        {/* Nodes (circles at endpoints) */}
        {[
          [35, 30], [35, 70], [65, 30], [65, 70], [35, 50], [65, 50]
        ].map(([cx, cy], i) => (
          <motion.circle
            key={i}
            cx={cx}
            cy={cy}
            r="3.5"
            fill="url(#hex-gold-gradient)"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: loaded ? 1 : 0, scale: loaded ? 1 : 0 }}
            transition={{ duration: 0.3, delay: 1 + i * 0.08 }}
          >
            <animate
              attributeName="r"
              values="3.5;4.5;3.5"
              dur="3s"
              begin={`${i * 0.3}s`}
              repeatCount="indefinite"
            />
          </motion.circle>
        ))}
      </svg>

      {/* Wordmark */}
      {variant === 'full' && (
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          style={{ display: 'flex', alignItems: 'baseline', fontFamily: "'Cinzel', serif", fontWeight: 700, letterSpacing: '0.03em' }}
        >
          <span style={{ color: '#FFFFFF', fontSize: `${hexSize * 0.42}px` }}>HEX</span>
          <span style={{ color: '#FFFFFF', fontSize: `${hexSize * 0.42}px` }}>ONA</span>
          <span
            style={{
              background: 'linear-gradient(135deg, #F3DFA2 0%, #D4AF37 50%, #E6C766 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              fontSize: `${hexSize * 0.42}px`,
            }}
          >
            -LLM
          </span>
        </motion.div>
      )}
    </div>
  );
}

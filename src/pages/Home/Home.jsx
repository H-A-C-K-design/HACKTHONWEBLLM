import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ChevronDown,
  ArrowUp,
  Users,
  Trophy,
  FileText,
  Sparkles,
  Brain,
  Lightbulb,
  Network,
  GraduationCap,
  Heart,
  Plus,
  Minus,
  Mail,
  MapPin,
} from 'lucide-react';
import AnimatedBackground from '../../components/AnimatedBackground';
import Logo from '../../components/Logo';
import GlassCard from '../../components/GlassCard';
import GoldButton from '../../components/GoldButton';
import Robot3D from '../../components/Robot3D';
import useCountdown from '../../hooks/useCountdown';
import { useRealtime } from '../../hooks/useRealtime';
import { listenToStats } from '../../firebase/db';
import { padNumber } from '../../utils/formatDate';
import './Home.css';

export default function Home() {
  const [stats, setStats] = useState({ participants: 0, teams: 0, submissions: 0 });
  const [mobileNav, setMobileNav] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showBackTop, setShowBackTop] = useState(false);

  // Real-time settings
  const { data: settings } = useRealtime('settings');
  const { data: roundsData } = useRealtime('rounds');
  const eventStart = settings?.event?.startDate || null;
  const countdown = useCountdown(eventStart);

  // Tracks
  const tracks = settings?.tracks ? Object.entries(settings.tracks).map(([id, t]) => ({ id, ...t })) : [];

  // Rounds for timeline
  const rounds = roundsData
    ? Object.entries(roundsData).map(([id, r]) => ({ id, ...r })).sort((a, b) => (a.order || 0) - (b.order || 0))
    : [];

  // Prizes
  const prizes = settings?.prizes || {};

  // FAQ — static content (no mock data, just info about the event)
  const faqs = [
    { q: 'Who can participate?', a: 'Any student from any college or university can participate. You need a team of 2-4 members.' },
    { q: 'Is there a registration fee?', a: 'Please check the announcements section after registering for the latest information on fees.' },
    { q: 'What should I build?', a: 'You should build a project using Large Language Models (LLMs). Check the Tracks section for theme ideas.' },
    { q: 'Can I participate solo?', a: 'Teams must have a minimum of 2 members. Find teammates on our platform!' },
    { q: 'What do I need to submit?', a: 'A PPT/PDF presentation and optionally a GitHub repo link and demo video.' },
    { q: 'How are projects judged?', a: 'Projects are evaluated on innovation, technical implementation, impact, and presentation.' },
  ];

  // Stats listener
  useEffect(() => {
    const unsub = listenToStats((updater) => {
      setStats((prev) => {
        const result = updater(prev);
        return result;
      });
    });
    return () => unsub();
  }, []);

  // Scroll handler
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 60);
      setShowBackTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Typewriter effect
  const [typed, setTyped] = useState('');
  const tagline = 'Build. Prompt. Dominate.';
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTyped(tagline.slice(0, i + 1));
      i++;
      if (i >= tagline.length) clearInterval(interval);
    }, 80);
    return () => clearInterval(interval);
  }, []);

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
    setMobileNav(false);
  };

  return (
    <div className="home-page">
      <AnimatedBackground variant="home" />

      {/* ─── Scroll Progress ─── */}
      <ScrollProgress />

      {/* ─── Navbar ─── */}
      <nav className={`home-nav ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner container">
          <Logo variant="full" size={36} />

          <div className={`nav-links ${mobileNav ? 'open' : ''}`}>
            {['about', 'tracks', 'timeline', 'prizes', 'faq'].map((s) => (
              <button key={s} className="nav-link" onClick={() => scrollToSection(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          <div className="nav-actions">
            <Link to="/login"><GoldButton variant="secondary" size="sm">Login</GoldButton></Link>
            <Link to="/register"><GoldButton size="sm">Register</GoldButton></Link>
          </div>

          <button className="hamburger" onClick={() => setMobileNav(!mobileNav)} aria-label="Toggle menu">
            <span className={`bar ${mobileNav ? 'open' : ''}`} />
            <span className={`bar ${mobileNav ? 'open' : ''}`} />
            <span className={`bar ${mobileNav ? 'open' : ''}`} />
          </button>
        </div>

        {/* Mobile drawer */}
        {mobileNav && (
          <motion.div
            className="mobile-drawer"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {['about', 'tracks', 'timeline', 'prizes', 'faq'].map((s) => (
              <button key={s} className="nav-link" onClick={() => scrollToSection(s)}>
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
            <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
              <Link to="/login" style={{ flex: 1 }}><GoldButton variant="secondary" size="sm" fullWidth>Login</GoldButton></Link>
              <Link to="/register" style={{ flex: 1 }}><GoldButton size="sm" fullWidth>Register</GoldButton></Link>
            </div>
          </motion.div>
        )}
      </nav>

      {/* ─── Hero ─── */}
      <section className="hero-section">
        <div className="hero-inner container">
          <div className="hero-left">
            <motion.span
              className="hero-label"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              SANJIVANI UNIVERSITY PRESENTS
            </motion.span>

            <motion.h1
              className="hero-title"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.8 }}
            >
              <span className="hero-title-hex">HEXONA</span>
              <span className="hero-title-llm">-LLM</span>
            </motion.h1>

            <motion.p
              className="hero-tagline"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              {typed}<span className="cursor">|</span>
            </motion.p>

            <motion.p
              className="hero-desc"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
            >
              The ultimate LLM hackathon. Build intelligent applications powered by
              Large Language Models and compete for glory.
            </motion.p>

            <motion.div
              className="hero-ctas"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <Link to="/register"><GoldButton size="lg" icon={<Sparkles size={18} />}>Register Now</GoldButton></Link>
              <GoldButton variant="secondary" size="lg" onClick={() => scrollToSection('about')}>Learn More</GoldButton>
            </motion.div>

            {/* Countdown */}
            <motion.div
              className="hero-countdown"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.4 }}
            >
              {eventStart ? (
                <div className="countdown-tiles">
                  {[
                    { val: countdown.days, label: 'Days' },
                    { val: countdown.hours, label: 'Hours' },
                    { val: countdown.minutes, label: 'Minutes' },
                    { val: countdown.seconds, label: 'Seconds' },
                  ].map(({ val, label }) => (
                    <div key={label} className="countdown-tile glass-panel">
                      <span className="countdown-val">{padNumber(val)}</span>
                      <span className="countdown-label">{label}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="countdown-soon glass-panel">
                  <span>⏱ Dates announced soon</span>
                </div>
              )}
            </motion.div>
          </div>

          <motion.div
            className="hero-right"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6, duration: 0.8 }}
          >
            <div className="robot-wrapper" style={{ width: '100%', maxWidth: '520px', minHeight: '480px' }}>
              <div className="robot-glow" />
              <Robot3D size="hero" className="hero-3d-robot" />

              {/* Floating chips */}
              <motion.div
                className="floating-chip chip-1"
                animate={{ y: [0, -10, 0], rotate: [0, 5, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
              >
                <Brain size={16} /> LLM
              </motion.div>
              <motion.div
                className="floating-chip chip-2"
                animate={{ y: [0, -8, 0], rotate: [0, -5, 0] }}
                transition={{ duration: 5, repeat: Infinity, delay: 1 }}
              >
                <Network size={16} /> AI
              </motion.div>
              <motion.div
                className="floating-chip chip-3"
                animate={{ y: [0, -12, 0], rotate: [0, 3, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, delay: 0.5 }}
              >
                <Sparkles size={16} /> GPT
              </motion.div>
            </div>
          </motion.div>
        </div>

        <motion.div
          className="scroll-indicator"
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          onClick={() => scrollToSection('stats')}
        >
          <ChevronDown size={24} color="var(--gold-400)" />
        </motion.div>
      </section>

      {/* ─── Live Stats ─── */}
      <section id="stats" className="stats-strip">
        <div className="container">
          <div className="stats-grid">
            <AnimatedStat icon={<Users size={28} />} value={stats.participants} label="Participants" />
            <AnimatedStat icon={<Trophy size={28} />} value={stats.teams} label="Teams Formed" />
            <AnimatedStat icon={<FileText size={28} />} value={stats.submissions} label="Submissions" />
          </div>
        </div>
      </section>

      {/* ─── About ─── */}
      <section id="about" className="section">
        <div className="container">
          <FadeInSection>
            <div className="about-grid">
              <div className="about-text">
                <h2 className="section-title">About the Hackathon</h2>
                <p className="section-subtitle" style={{ maxWidth: '100%' }}>
                  HEXONA-LLM is a premier hackathon focused on building innovative applications using
                  Large Language Models. Hosted at Sanjivani University, this event brings together the
                  brightest minds to explore the frontiers of AI.
                </p>
                <p style={{ color: 'var(--text-muted)', marginTop: '16px', lineHeight: 1.7 }}>
                  Whether you're a seasoned developer or just starting your AI journey, HEXONA-LLM offers
                  mentorship, resources, and a competitive platform to showcase your skills.
                </p>
              </div>

              <div className="about-cards">
                {[
                  { icon: <Brain size={28} />, title: 'Build with LLMs', desc: 'Harness the power of GPT, Claude, Gemini and more' },
                  { icon: <GraduationCap size={28} />, title: 'Mentorship', desc: 'Get guidance from industry experts and professors' },
                  { icon: <Trophy size={28} />, title: 'Prizes', desc: 'Win exciting prizes and recognition' },
                  { icon: <Network size={28} />, title: 'Networking', desc: 'Connect with fellow innovators and tech leaders' },
                ].map((card, i) => (
                  <motion.div
                    key={card.title}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.12 }}
                  >
                    <GlassCard className="about-feature-card">
                      <div className="feature-icon">{card.icon}</div>
                      <h3>{card.title}</h3>
                      <p>{card.desc}</p>
                    </GlassCard>
                  </motion.div>
                ))}
              </div>
            </div>
          </FadeInSection>
        </div>
      </section>

      {/* ─── Tracks ─── */}
      <section id="tracks" className="section">
        <div className="container">
          <FadeInSection>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Tracks & Themes</h2>
            <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 40px' }}>
              Choose a track that inspires you
            </p>
          </FadeInSection>

          <div className="tracks-grid">
            {tracks.length > 0 ? tracks.map((track, i) => (
              <motion.div
                key={track.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <GlassCard className="track-card">
                  <div className="track-icon">
                    {i % 4 === 0 && <Brain size={32} />}
                    {i % 4 === 1 && <Heart size={32} />}
                    {i % 4 === 2 && <Network size={32} />}
                    {i % 4 === 3 && <Lightbulb size={32} />}
                  </div>
                  <h3 className="track-title">{track.title}</h3>
                  <p className="track-desc">{track.description}</p>
                </GlassCard>
              </motion.div>
            )) : (
              <GlassCard className="track-card empty-track" style={{ gridColumn: '1 / -1', textAlign: 'center' }}>
                <Lightbulb size={36} color="var(--gold-500)" />
                <h3 style={{ marginTop: '12px' }}>Tracks Coming Soon</h3>
                <p style={{ color: 'var(--text-muted)' }}>Check back for announced themes and tracks</p>
              </GlassCard>
            )}
          </div>
        </div>
      </section>

      {/* ─── Timeline ─── */}
      <section id="timeline" className="section">
        <div className="container">
          <FadeInSection>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Event Timeline</h2>
            <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 40px' }}>
              Key milestones and rounds
            </p>
          </FadeInSection>

          <div className="timeline">
            {rounds.length > 0 ? rounds.map((round, i) => (
              <motion.div
                key={round.id}
                className={`timeline-item ${round.open ? 'active' : ''}`}
                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="timeline-dot" />
                <GlassCard className="timeline-card">
                  <span className="timeline-round-label">Round {round.order || i + 1}</span>
                  <h3>{round.name}</h3>
                  <p>{round.description}</p>
                  {round.deadline && (
                    <span className="timeline-date">
                      Deadline: {new Date(round.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}
                  {round.open && <span className="badge badge-gold" style={{ marginTop: '8px' }}>Active</span>}
                </GlassCard>
              </motion.div>
            )) : (
              <div className="timeline-empty">
                <GlassCard style={{ textAlign: 'center', maxWidth: '400px', margin: '0 auto' }}>
                  <FileText size={36} color="var(--gold-500)" />
                  <h3 style={{ marginTop: '12px' }}>Timeline Coming Soon</h3>
                  <p style={{ color: 'var(--text-muted)' }}>Round details will appear here when announced</p>
                </GlassCard>
              </div>
            )}
            {rounds.length > 0 && <div className="timeline-line" />}
          </div>
        </div>
      </section>

      {/* ─── Prizes ─── */}
      <section id="prizes" className="section">
        <div className="container">
          <FadeInSection>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Prizes</h2>
            <p className="section-subtitle" style={{ textAlign: 'center', margin: '0 auto 40px' }}>
              Glory and rewards await the best teams
            </p>
          </FadeInSection>

          <div className="prizes-grid">
            {[
              { place: '2nd', prize: prizes.second, color: '#C0C0C0', delay: 0 },
              { place: '1st', prize: prizes.first, color: '#D4AF37', delay: 0.1, raised: true },
              { place: '3rd', prize: prizes.third, color: '#CD7F32', delay: 0.2 },
            ].map(({ place, prize, color, delay, raised }) => (
              <motion.div
                key={place}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay }}
                className={`prize-card-wrapper ${raised ? 'raised' : ''}`}
              >
                <GlassCard className="prize-card" style={{ borderColor: `${color}40` }}>
                  <div className="prize-medal" style={{ background: `linear-gradient(135deg, ${color}60, ${color})` }}>
                    <Trophy size={32} color="#0B0B0D" />
                  </div>
                  <span className="prize-place" style={{ color }}>{place} Place</span>
                  <p className="prize-value">{prize || 'To be announced'}</p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Rules ─── */}
      <section id="rules" className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <FadeInSection>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Rules & Eligibility</h2>
          </FadeInSection>
          <div style={{ marginTop: '32px' }}>
            {[
              { title: 'Team Size', content: 'Teams must have 2-4 members. Solo participation is not allowed.' },
              { title: 'Project Originality', content: 'All projects must be original work created during the hackathon. Pre-existing codebases are not allowed.' },
              { title: 'LLM Usage', content: 'Projects must meaningfully integrate at least one Large Language Model API or framework.' },
              { title: 'Submission Requirements', content: 'Teams must submit a presentation (PPT/PDF) before the deadline. Late submissions will not be accepted.' },
              { title: 'Code of Conduct', content: 'All participants must adhere to professional conduct. Plagiarism, harassment, or cheating will result in disqualification.' },
            ].map((rule, i) => (
              <Accordion key={i} title={rule.title} content={rule.content} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <FadeInSection>
            <h2 className="section-title" style={{ textAlign: 'center' }}>Frequently Asked Questions</h2>
          </FadeInSection>
          <div style={{ marginTop: '32px' }}>
            {faqs.map((faq, i) => (
              <Accordion key={i} title={faq.q} content={faq.a} />
            ))}
          </div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="home-footer">
        <div className="footer-divider">
          <div className="shimmer-line" />
        </div>
        <div className="container">
          <div className="footer-grid">
            <div className="footer-brand">
              <Logo variant="full" size={32} />
              <p style={{ color: 'var(--text-muted)', marginTop: '12px', fontSize: '0.9rem', maxWidth: '300px' }}>
                The premier LLM hackathon at Sanjivani University. Build. Prompt. Dominate.
              </p>
            </div>

            <div className="footer-links">
              <h4>Quick Links</h4>
              <button onClick={() => scrollToSection('about')}>About</button>
              <button onClick={() => scrollToSection('tracks')}>Tracks</button>
              <button onClick={() => scrollToSection('prizes')}>Prizes</button>
              <button onClick={() => scrollToSection('faq')}>FAQ</button>
            </div>

            <div className="footer-contact">
              <h4>Contact</h4>
              <p><MapPin size={14} /> Sanjivani University, Kopargaon</p>
              <p><Mail size={14} /> hexona@sanjivani.edu.in</p>
            </div>
          </div>

          <div className="footer-bottom">
            <p>© {new Date().getFullYear()} HEXONA-LLM. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ─── Back to Top ─── */}
      {showBackTop && (
        <motion.button
          className="back-to-top"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          aria-label="Back to top"
        >
          <ArrowUp size={20} />
        </motion.button>
      )}
    </div>
  );
}

// ─── Sub-components ───

function ScrollProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const handleScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(total > 0 ? (window.scrollY / total) * 100 : 0);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="scroll-progress-bar" style={{ width: `${progress}%` }} />
  );
}

function AnimatedStat({ icon, value, label }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const target = value;
    if (target === 0) { setDisplay(0); return; }
    let start = 0;
    const duration = 1500;
    const startTime = performance.now();
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(animate);
    };
    requestAnimationFrame(animate);
  }, [isInView, value]);

  return (
    <div ref={ref} className="stat-item">
      <div className="stat-icon">{icon}</div>
      <span className="stat-value">{display}</span>
      <span className="stat-label">{label}</span>
    </div>
  );
}

function Accordion({ title, content }) {
  const [open, setOpen] = useState(false);

  return (
    <div className={`accordion-item ${open ? 'open' : ''}`}>
      <button className="accordion-trigger" onClick={() => setOpen(!open)}>
        <span>{title}</span>
        {open ? <Minus size={18} color="var(--gold-500)" /> : <Plus size={18} color="var(--gold-500)" />}
      </button>
      <motion.div
        className="accordion-content"
        initial={false}
        animate={{ height: open ? 'auto' : 0, opacity: open ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        style={{ overflow: 'hidden' }}
      >
        <p>{content}</p>
      </motion.div>
    </div>
  );
}

function FadeInSection({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.6 }}
    >
      {children}
    </motion.div>
  );
}

import { motion } from 'framer-motion';
import {
  Sparkles,
  MapPin,
  Mail,
  Phone,
  GraduationCap,
  Award,
  ShieldCheck,
  Cpu,
  Brain,
  Globe,
} from 'lucide-react';
import { useRealtime } from '../../hooks/useRealtime';
import GlassCard from '../../components/GlassCard';
import Robot3D from '../../components/Robot3D';

export default function About() {
  const { data: settings } = useRealtime('settings');
  const aboutData = settings?.about || {};

  const organizers = aboutData.organizers || [
    { name: 'Department of Computer Engineering', role: 'Host & Academic Partner' },
    { name: 'AI & Data Science Student Council', role: 'Operations & Mentorship' },
    { name: 'Sanjivani University Tech Labs', role: 'Compute & Infrastructure Support' },
  ];

  return (
    <div className="about-dashboard-page">
      <div className="dash-section-header">
        <div>
          <h2 className="dash-heading">About HEXONA-LLM</h2>
          <p className="dash-subheading">
            Sanjivani University’s Premier Flagship Generative AI & LLM Hackathon
          </p>
        </div>
      </div>

      {/* Mascot + Vision Hero Card */}
      <div className="dash-welcome-card" style={{ marginBottom: '28px' }}>
        <div className="dash-welcome-text">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="priority-tag priority-important">THE HEXONA INITIATIVE</span>
          </div>
          <h2 className="dash-welcome-title">Engineering the Autonomous Future</h2>
          <p className="dash-welcome-desc">
            {aboutData.text ||
              'HEXONA-LLM is engineered to push the frontier of Large Language Model applications. From multi-agent orchestration and reasoning architectures to clinical AI and agentic software development, participants converge at Sanjivani University to build transformative AI technologies.'}
          </p>
        </div>

        <div style={{ width: '220px', height: '220px', flexShrink: 0 }}>
          <Robot3D size="card" />
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: '28px' }}>
        {/* Venue & Host Institution */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <GraduationCap size={24} color="var(--gold-400)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>
              Host Institution
            </h3>
          </div>

          <p style={{ color: 'var(--text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '16px' }}>
            <strong>Sanjivani University</strong> is renowned for pioneering research, engineering excellence, and producing top-tier technology leaders.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.88rem', color: 'var(--text-muted)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={16} color="var(--gold-500)" />
              <span>{aboutData.venue || 'Sanjivani University Campus, Kopargaon, Maharashtra, India'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={16} color="var(--gold-500)" />
              <span>{aboutData.contact || 'hexona@sanjivani.edu.in'}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={16} color="var(--gold-500)" />
              <span>https://sanjivani.edu.in</span>
            </div>
          </div>
        </GlassCard>

        {/* Core Rules & Code of Conduct */}
        <GlassCard>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <ShieldCheck size={24} color="var(--gold-400)" />
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff' }}>
              Code of Conduct & Guidelines
            </h3>
          </div>

          <ul style={{ paddingLeft: '18px', color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: 1.7, display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <li>All team members must be enrolled students from recognized universities or colleges.</li>
            <li>Projects must leverage Large Language Models or Generative AI architectures.</li>
            <li>Code written must be original or open source with appropriate attribution.</li>
            <li>Strict adherence to deadline timers; no submissions accepted post-cutoff.</li>
            <li>Fair play, ethical AI safety protocols, and mutual respect are strictly enforced.</li>
          </ul>
        </GlassCard>
      </div>

      {/* Organizing Committee */}
      <GlassCard>
        <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', color: '#fff', marginBottom: '16px' }}>
          Organizing Bodies & Support
        </h3>

        <div className="grid-3">
          {organizers.map((org, idx) => (
            <div
              key={idx}
              style={{
                padding: '16px',
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: '10px',
              }}
            >
              <div style={{ fontSize: '0.95rem', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                {org.name}
              </div>
              <div style={{ fontSize: '0.8rem', color: 'var(--gold-400)' }}>
                {org.role}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}

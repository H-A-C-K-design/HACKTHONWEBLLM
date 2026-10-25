import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { forgotPasswordSchema } from '../../utils/validators';
import { resetPassword, getAuthErrorMessage } from '../../firebase/auth';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import Logo from '../../components/Logo';
import GoldButton from '../../components/GoldButton';
import Robot3D from '../../components/Robot3D';
import './Auth.css';

export default function ForgotPassword() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(forgotPasswordSchema),
  });

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      setSubmitted(true);
      toast.success('Password reset link sent to your email!');
    } catch (err) {
      toast.error(getAuthErrorMessage(err.code || err.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AnimatedBackground variant="auth" />

      <div className="auth-container">
        {/* Left: branding */}
        <div className="auth-branding">
          <Logo variant="full" size={48} />
          <h2 className="auth-branding-title">Account Recovery</h2>
          <p className="auth-branding-tagline">Build. Prompt. Dominate.</p>
          <div style={{ width: '100%', maxWidth: '380px', height: '380px', marginTop: '10px' }}>
            <Robot3D size="auth" />
          </div>
        </div>

        {/* Right: form */}
        <motion.div
          className="auth-form-card glass-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="auth-title">Reset Password</h1>
          <p className="auth-subtitle">
            Enter your email address and we will send you a recovery link to restore access.
          </p>

          {submitted ? (
            <div style={{ textAlign: 'center', padding: '24px 0' }}>
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(212, 175, 55, 0.1)',
                  border: '1px solid var(--gold-500)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto',
                  color: 'var(--gold-400)',
                  fontSize: '24px',
                }}
              >
                ✓
              </div>
              <h3 style={{ color: 'var(--text-primary)', marginBottom: '8px' }}>Check Your Inbox</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '24px' }}>
                Instructions have been dispatched. Check your spam folder if you do not see it shortly.
              </p>
              <Link to="/login">
                <GoldButton variant="secondary" fullWidth>
                  Return to Login
                </GoldButton>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="auth-form">
              <div className="form-group">
                <label className="input-label">Email</label>
                <input
                  {...register('email')}
                  type="email"
                  className={`input-field ${errors.email ? 'input-error' : ''}`}
                  placeholder="you@example.com"
                  autoComplete="email"
                />
                {errors.email && <span className="error-message">{errors.email.message}</span>}
              </div>

              <GoldButton type="submit" fullWidth loading={loading} size="lg">
                Send Reset Link
              </GoldButton>

              <div style={{ textAlign: 'center', marginTop: '12px' }}>
                <Link to="/login" className="auth-forgot" style={{ fontSize: '0.9rem' }}>
                  ← Back to Login
                </Link>
              </div>
            </form>
          )}

          <p className="auth-footer-text" style={{ marginTop: '24px' }}>
            Remember your credentials? <Link to="/login">Sign in</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

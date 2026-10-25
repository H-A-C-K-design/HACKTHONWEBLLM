import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { loginSchema } from '../../utils/validators';
import { loginUser, signInWithGoogle, getAuthErrorMessage } from '../../firebase/auth';
import { useAuth } from '../../context/AuthContext';
import AnimatedBackground from '../../components/AnimatedBackground';
import Logo from '../../components/Logo';
import GoldButton from '../../components/GoldButton';
import Robot3D from '../../components/Robot3D';
import './Auth.css';

export default function Login() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  const [googleLoading, setGoogleLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  if (user) return <Navigate to="/dashboard" replace />;

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const loggedUser = await loginUser(data.email, data.password);
      if (!loggedUser?.emailVerified) {
        toast('Welcome back! Please verify your email via the link sent to your inbox.', {
          icon: '✉️',
          duration: 6000,
        });
      } else {
        toast.success('Welcome back to HEXONA-LLM!');
      }
      navigate('/dashboard');
    } catch (err) {
      console.error('Login Error:', err);
      toast.error(getAuthErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await signInWithGoogle();
      toast.success('Welcome to HEXONA-LLM!');
      navigate('/dashboard');
    } catch (err) {
      console.error('Google Sign-In Error:', err);
      toast.error(getAuthErrorMessage(err));
    } finally {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <AnimatedBackground variant="auth" />

      <div className="auth-container">
        {/* Left: branding */}
        <div className="auth-branding">
          <Logo variant="full" size={48} />
          <h2 className="auth-branding-title">Welcome Back</h2>
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
          <h1 className="auth-title">Access Portal</h1>
          <p className="auth-subtitle">Sign in to manage your team and submissions</p>

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

            <div className="form-group">
              <label className="input-label">Password</label>
              <input
                {...register('password')}
                type="password"
                className={`input-field ${errors.password ? 'input-error' : ''}`}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              {errors.password && <span className="error-message">{errors.password.message}</span>}
            </div>

            <div className="auth-options">
              <label className="auth-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Remember me</span>
              </label>

              <Link to="/forgot-password" className="auth-forgot">
                Forgot password?
              </Link>
            </div>

            <GoldButton type="submit" fullWidth loading={loading} size="lg">
              Sign In
            </GoldButton>
          </form>

          <div className="auth-divider">
            <span>or</span>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={googleLoading || loading}
            className="google-btn"
          >
            <svg className="google-icon" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 0 0 1 12c0 1.77.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>{googleLoading ? 'Connecting to Google...' : 'Continue with Google'}</span>
          </button>

          <p className="auth-footer-text">
            Don't have an account? <Link to="/register">Register now</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

import React, { useState, useRef } from 'react';

import type { UserRole } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (user: any) => void;
}

type LoginStep = 'options' | 'phone' | 'otp' | 'email-auth' | 'loading';

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [step, setStep] = useState<LoginStep>('options');
  const [role, setRole] = useState<UserRole>('customer');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');
  const [error, setError] = useState('');
  const [resendTimer, setResendTimer] = useState(0);
  const [devOtp, setDevOtp] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const startResendTimer = () => {
    setResendTimer(30);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setResendTimer(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleGoogleLogin = () => {
    setStep('loading');
    setLoadingMsg(`Redirecting to Google for ${role} login...`);
    setTimeout(() => {
      onLogin({
        id: role === 'admin' ? 'mock-admin-id' : role === 'owner' ? 'mock-owner-id' : 'mock-customer-id',
        name: `Google ${role === 'admin' ? 'Admin' : role === 'owner' ? 'Owner' : 'Customer'}`,
        phone: '+91 99999 88888',
        role: role
      });
      onClose();
    }, 1500);
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setLoadingMsg(isSignUp ? `Creating original ${role} account...` : `Logging in as ${role}...`);
    
    setTimeout(() => {
      onLogin({
        id: role === 'admin' ? 'mock-admin-id' : role === 'owner' ? 'mock-owner-id' : 'mock-customer-id',
        name: email.split('@')[0],
        email: email,
        role: role
      });
      onClose();
    }, 1500);
  };

  const handleGetOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (phoneNumber.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setStep('loading');
    setLoadingMsg('Sending OTP to your mobile...');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, role }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setStep('otp');
        setOtp(['', '', '', '', '', '']);
        setDevOtp(data.devMode ? data.devOtp : '');
        startResendTimer();
        // Focus first OTP input after render
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error || 'Failed to send OTP');
        setStep('phone');
      }
    } catch (err) {
      console.error('Send OTP error:', err);
      setError('Network error. Please check your connection.');
      setStep('phone');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) {
      // Handle paste
      const digits = value.replace(/\D/g, '').slice(0, 6).split('');
      const newOtp = [...otp];
      digits.forEach((d, i) => {
        if (index + i < 6) newOtp[index + i] = d;
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + digits.length, 5);
      otpRefs.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, '');
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next input
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const otpValue = otp.join('');
    if (otpValue.length !== 6) {
      setError('Please enter the complete 6-digit OTP');
      return;
    }

    setStep('loading');
    setLoadingMsg('Verifying OTP...');

    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, otp: otpValue, role }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLoadingMsg(`Welcome, ${data.user.name}! Logging you in...`);
        setTimeout(() => {
          onLogin(data.user);
          onClose();
        }, 1000);
      } else {
        setError(data.error || 'Invalid OTP');
        setStep('otp');
      }
    } catch (err) {
      console.error('Verify OTP error:', err);
      setError('Network error. Please try again.');
      setStep('otp');
    }
  };

  const handleResendOTP = async () => {
    if (resendTimer > 0) return;
    setError('');
    setStep('loading');
    setLoadingMsg('Resending OTP...');

    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber, role }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setStep('otp');
        setOtp(['', '', '', '', '', '']);
        setDevOtp(data.devMode ? data.devOtp : '');
        startResendTimer();
        setTimeout(() => otpRefs.current[0]?.focus(), 100);
      } else {
        setError(data.error || 'Failed to resend OTP');
        setStep('otp');
      }
    } catch {
      setError('Network error. Please try again.');
      setStep('otp');
    }
  };

  const renderRolePicker = () => (
    <div className="role-selector">
      <button 
        className={`role-tab ${role === 'customer' ? 'active' : ''}`}
        onClick={() => setRole('customer')}
      >
        Customer
      </button>
      <button 
        className={`role-tab ${role === 'owner' ? 'active' : ''}`}
        onClick={() => setRole('owner')}
      >
        Owner
      </button>
      <button 
        className={`role-tab ${role === 'admin' ? 'active' : ''}`}
        onClick={() => setRole('admin')}
      >
        Admin
      </button>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 'options':
        return (
          <>
            <h2 className="modal-title">Welcome</h2>
            <p className="modal-subtitle">Choose your role and sign in</p>
            {renderRolePicker()}
            <div className="login-options">
              <button className="auth-button google" onClick={handleGoogleLogin}>
                <svg className="auth-icon" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>
              <button className="auth-button mobile" onClick={() => { setStep('phone'); setError(''); }}>
                <svg className="auth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
                  <line x1="12" y1="18" x2="12.01" y2="18"></line>
                </svg>
                Sign In with Mobile OTP
              </button>
              <div className="divider"><span>OR</span></div>
              <button className="auth-button email" onClick={() => setStep('email-auth')}>
                <svg className="auth-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Sign In/Up with Email
              </button>
            </div>
          </>
        );
      case 'email-auth':
        return (
          <form onSubmit={handleEmailAuth} className="login-form">
            <button type="button" className="back-btn" onClick={() => setStep('options')}>&larr; Back</button>
            <h2 className="modal-title">{isSignUp ? 'Create Account' : 'Welcome Back'}</h2>
            <p className="modal-subtitle">As a {role}</p>
            <div className="input-group">
              <input type="email" placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className="login-input" required autoFocus />
            </div>
            <div className="input-group">
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="login-input" required />
            </div>
            <button type="submit" className="auth-button mobile">{isSignUp ? 'Sign Up' : 'Log In'}</button>
            <p className="auth-switch">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <span onClick={() => setIsSignUp(!isSignUp)}>{isSignUp ? ' Log In' : ' Sign Up'}</span>
            </p>
          </form>
        );
      case 'phone':
        return (
          <form onSubmit={handleGetOTP} className="login-form">
            <button type="button" className="back-btn" onClick={() => { setStep('options'); setError(''); }}>&larr; Back</button>
            <h2 className="modal-title">Mobile Login</h2>
            <p className="modal-subtitle">As a {role}</p>

            {error && <div className="otp-error">{error}</div>}

            <div className="input-group phone-input-group">
              <span className="country-code">+91</span>
              <input
                type="tel"
                placeholder="Enter 10-digit mobile number"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className="login-input phone-input"
                required
                autoFocus
              />
            </div>
            <p className="otp-hint">A 6-digit OTP will be sent via SMS to this number</p>
            <button type="submit" className="auth-button mobile" disabled={phoneNumber.length < 10}>
              Send OTP
            </button>
          </form>
        );
      case 'otp':
        return (
          <form onSubmit={handleVerifyOTP} className="login-form">
            <button type="button" className="back-btn" onClick={() => { setStep('phone'); setError(''); }}>&larr; Back</button>
            <h2 className="modal-title">Verify OTP</h2>
            <p className="modal-subtitle">
              {devOtp ? 'Dev Mode — use the OTP shown below' : `Enter the 6-digit code sent to +91 ${phoneNumber}`}
            </p>

            {devOtp && (
              <div className="dev-otp-banner">
                <span className="dev-badge">DEV MODE</span>
                <span className="dev-otp-code">{devOtp}</span>
                <p className="dev-otp-note">SMS not available — OTP shown here for testing</p>
              </div>
            )}

            {error && <div className="otp-error">{error}</div>}

            <div className="otp-inputs">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={(el) => { otpRefs.current[i] = el; }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(i, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(i, e)}
                  onPaste={(e) => {
                    e.preventDefault();
                    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                    handleOtpChange(0, pasted);
                  }}
                  className="otp-box"
                  autoFocus={i === 0}
                />
              ))}
            </div>

            <button type="submit" className="auth-button mobile" disabled={otp.join('').length < 6}>
              Verify & Login
            </button>

            <div className="resend-row">
              {resendTimer > 0 ? (
                <p className="resend-timer">Resend OTP in <strong>{resendTimer}s</strong></p>
              ) : (
                <button type="button" className="resend-btn" onClick={handleResendOTP}>
                  Resend OTP
                </button>
              )}
            </div>
          </form>
        );
      case 'loading':
        return (
          <div className="loading-container">
            <div className="loader"></div>
            <p className="loading-text">{loadingMsg}</p>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        {renderStep()}
      </div>

      <style>{`
        .phone-input-group {
          display: flex;
          align-items: center;
          gap: 0;
          border: 2px solid #e2e8f0;
          border-radius: 16px;
          overflow: hidden;
          transition: border-color 0.2s;
        }
        .phone-input-group:focus-within {
          border-color: #3b82f6;
        }
        .country-code {
          background: #f1f5f9;
          padding: 1rem 1rem;
          font-weight: 700;
          color: #334155;
          font-size: 1rem;
          border-right: 2px solid #e2e8f0;
          user-select: none;
        }
        .phone-input {
          border: none !important;
          border-radius: 0 !important;
          padding-left: 1rem !important;
          flex: 1;
        }
        .phone-input:focus {
          outline: none !important;
          box-shadow: none !important;
        }

        .otp-inputs {
          display: flex;
          gap: 0.5rem;
          justify-content: center;
          margin: 1.5rem 0;
        }
        .otp-box {
          width: 48px;
          height: 56px;
          text-align: center;
          font-size: 1.5rem;
          font-weight: 800;
          border: 2px solid #e2e8f0;
          border-radius: 12px;
          outline: none;
          transition: all 0.2s;
          color: #0f172a;
          background: #f8fafc;
        }
        .otp-box:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
        }

        .otp-error {
          background: #fef2f2;
          color: #dc2626;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          margin-bottom: 1rem;
          text-align: center;
          border: 1px solid #fecaca;
        }

        .otp-hint {
          color: #94a3b8;
          font-size: 0.8rem;
          text-align: center;
          margin: 0.5rem 0 1rem;
        }

        .resend-row {
          text-align: center;
          margin-top: 1rem;
        }
        .resend-timer {
          color: #94a3b8;
          font-size: 0.875rem;
        }
        .resend-btn {
          background: none;
          border: none;
          color: #3b82f6;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          transition: background 0.2s;
        }
        .resend-btn:hover {
          background: #eff6ff;
        }

        .dev-otp-banner {
          background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%);
          border: 2px solid #f59e0b;
          border-radius: 16px;
          padding: 1.25rem;
          text-align: center;
          margin-bottom: 1rem;
          animation: devPulse 2s ease-in-out infinite;
        }
        @keyframes devPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(245, 158, 11, 0.2); }
          50% { box-shadow: 0 0 0 8px rgba(245, 158, 11, 0); }
        }
        .dev-badge {
          display: inline-block;
          background: #f59e0b;
          color: white;
          font-size: 0.65rem;
          font-weight: 800;
          padding: 0.2rem 0.6rem;
          border-radius: 6px;
          letter-spacing: 0.08em;
          margin-bottom: 0.5rem;
        }
        .dev-otp-code {
          display: block;
          font-size: 2rem;
          font-weight: 900;
          letter-spacing: 0.5em;
          color: #92400e;
          margin: 0.25rem 0;
          font-family: 'Courier New', monospace;
        }
        .dev-otp-note {
          font-size: 0.7rem;
          color: #b45309;
          margin: 0.25rem 0 0;
          font-weight: 500;
        }
      `}</style>
    </div>
  );
};

export default LoginModal;

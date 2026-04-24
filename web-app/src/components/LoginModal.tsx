import React, { useState } from 'react';

import type { UserRole } from '../types';

interface LoginModalProps {
  onClose: () => void;
  onLogin: (role: UserRole) => void;
}

type LoginStep = 'options' | 'phone' | 'otp' | 'email-auth' | 'loading';

const LoginModal: React.FC<LoginModalProps> = ({ onClose, onLogin }) => {
  const [step, setStep] = useState<LoginStep>('options');
  const [role, setRole] = useState<UserRole>('customer');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loadingMsg, setLoadingMsg] = useState('');

  const handleGoogleLogin = () => {
    setStep('loading');
    setLoadingMsg(`Redirecting to Google for ${role} login...`);
    setTimeout(() => {
      onLogin(role);
      onClose();
    }, 1500);
  };

  const handleEmailAuth = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('loading');
    setLoadingMsg(isSignUp ? `Creating original ${role} account...` : `Logging in as ${role}...`);
    
    setTimeout(() => {
      onLogin(role);
      onClose();
    }, 1500);
  };

  const handleGetOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) {
      setStep('otp');
    }
  };

  const handleVerifyOTP = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length === 4) {
      onLogin(role);
      onClose();
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
              <button className="auth-button mobile" onClick={() => setStep('phone')}>
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
            <button type="button" className="back-btn" onClick={() => setStep('options')}>&larr; Back</button>
            <h2 className="modal-title">Mobile Login</h2>
            <p className="modal-subtitle">As a {role}</p>
            <div className="input-group">
              <input type="tel" placeholder="Mobile Number" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))} className="login-input" required autoFocus />
            </div>
            <button type="submit" className="auth-button mobile" disabled={phoneNumber.length < 10}>Get OTP</button>
          </form>
        );
      case 'otp':
        return (
          <form onSubmit={handleVerifyOTP} className="login-form">
            <button type="button" className="back-btn" onClick={() => setStep('phone')}>&larr; Back</button>
            <h2 className="modal-title">Verify OTP</h2>
            <p className="modal-subtitle">sent to your phone for {role} access</p>
            <div className="input-group">
              <input type="text" placeholder="0000" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 4))} className="login-input otp-input-field" required autoFocus />
            </div>
            <button type="submit" className="auth-button mobile" disabled={otp.length < 4}>Verify & Login</button>
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
    </div>
  );
};

export default LoginModal;

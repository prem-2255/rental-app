import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionModal from '../components/SubscriptionModal';

const LandingPage: React.FC<{ onOpenLogin: () => void, onSetPlan: (plan: any) => void }> = ({ onOpenLogin, onSetPlan }) => {
  const navigate = useNavigate();
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  return (
    <div className="landing-page">

      {/* ===================== HERO SECTION ===================== */}
      <section className="hero-section">
        {/* Animated aurora gradient mesh */}
        <div className="aurora-mesh" />
        <div className="aurora-mesh mesh-2" />
        <div className="aurora-mesh mesh-3" />

        {/* Floating ambient particles */}
        <div className="hero-particle p1" />
        <div className="hero-particle p2" />
        <div className="hero-particle p3" />
        <div className="hero-particle p4" />

        <div className="hero-inner">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-dot" />
              Aurora Living | Redefining Rentals
            </div>
            <h1>
              Find Your
              <br />
              <span className="gradient-text">Dream Space.</span>
            </h1>
            <p>
              The all-in-one platform for modern living. Whether you're searching
              for your dream home or managing a property portfolio, experience
              luxury management reimagined.
            </p>
            <div className="hero-cta-row">
              <button className="cta-primary" onClick={onOpenLogin}>
                <span>Get Started</span>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="cta-secondary" onClick={() => setIsSubModalOpen(true)}>
                View Plans
              </button>
            </div>
          </div>

          <div className="hero-visual">
            {/* Layered glow behind image */}
            <div className="hero-img-glow glow-1" />
            <div className="hero-img-glow glow-2" />
            <div className="hero-img-glow glow-3" />

            <img
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
              alt="Modern Luxury Home"
            />

            {/* Floating glassmorphism tags */}
            <div className="floating-tag tag-1">
              <span className="tag-icon">🏠</span>
              <div>
                <strong>500+ Homes</strong>
                <small>Premium listings</small>
              </div>
            </div>
            <div className="floating-tag tag-2">
              <span className="tag-icon">⚡</span>
              <div>
                <strong>Instant Booking</strong>
                <small>Zero paperwork</small>
              </div>
            </div>
            <div className="floating-tag tag-3">
              <span className="tag-icon">🛡️</span>
              <div>
                <strong>Verified</strong>
                <small>100% secure</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== STATS SECTION ===================== */}
      <section className="stats-section">
        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-number green-glow">500+</span>
            <span className="stat-label">Premium Properties</span>
            <div className="stat-bar green" />
          </div>
          <div className="stat-card">
            <span className="stat-number violet-glow">1.2k</span>
            <span className="stat-label">Happy Tenants</span>
            <div className="stat-bar violet" />
          </div>
          <div className="stat-card">
            <span className="stat-number amber-glow">98%</span>
            <span className="stat-label">Satisfaction Rate</span>
            <div className="stat-bar amber" />
          </div>
          <div className="stat-card">
            <span className="stat-number coral-glow">24/7</span>
            <span className="stat-label">Support Available</span>
            <div className="stat-bar coral" />
          </div>
        </div>
      </section>

      {/* ===================== ABOUT SECTION ===================== */}
      <section className="about-section" id="about">
        <div className="about-inner">
          <div className="about-text">
            <div className="section-label">Why Aurora Living</div>
            <h2>
              Designed for the
              <br />
              <span className="gradient-text-2">Modern Ecosystem</span>
            </h2>
            <p>
              We bridge the gap between property owners and tenants through
              transparency, automation, and premium design. No more paperwork,
              no more delays.
            </p>
            <ul className="feature-bullets">
              <li>
                <span className="bullet-icon green-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9.5l4 4 8-8" stroke="#00E5A0" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                Seamless online booking system
              </li>
              <li>
                <span className="bullet-icon violet-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9.5l4 4 8-8" stroke="#7C3AED" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                Verified identity and document management
              </li>
              <li>
                <span className="bullet-icon amber-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9.5l4 4 8-8" stroke="#FFB547" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                Dedicated maintenance support with photo proof
              </li>
              <li>
                <span className="bullet-icon coral-icon">
                  <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M3 9.5l4 4 8-8" stroke="#FF6B6B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                </span>
                Automated utility and rent payment tracking
              </li>
            </ul>
          </div>

          <div className="about-visual">
            <div className="about-card-glow" />
            <div className="about-card">
              <div className="about-card-header">
                <div className="about-card-dot green-dot" />
                <div className="about-card-dot violet-dot" />
                <div className="about-card-dot amber-dot" />
              </div>
              <div className="about-card-body">
                <div className="about-card-row">
                  <span className="acr-icon">🏡</span>
                  <div className="acr-info">
                    <strong>Luxury Apartment</strong>
                    <small>$2,400/mo - Downtown</small>
                  </div>
                  <span className="acr-badge">Live</span>
                </div>
                <div className="about-card-row">
                  <span className="acr-icon">📊</span>
                  <div className="acr-info">
                    <strong>Revenue This Month</strong>
                    <small>+12% from last month</small>
                  </div>
                  <span className="acr-amount">$18.4k</span>
                </div>
                <div className="about-card-row">
                  <span className="acr-icon">✅</span>
                  <div className="acr-info">
                    <strong>Maintenance Resolved</strong>
                    <small>Plumbing - Unit 4B</small>
                  </div>
                  <span className="acr-badge done">Done</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== ROLE SELECTION SECTION ===================== */}
      <section className="roles-section">
        <div className="roles-aurora-bg" />
        <div className="roles-inner">
          <div className="section-label light">Choose Your Path</div>
          <h2 className="roles-title">
            How Will You Use
            <br />
            <span className="gradient-text-3">Aurora Living?</span>
          </h2>
          <p className="roles-subtitle">
            Select your role to unlock a tailored experience built just for you.
          </p>

          <div className="role-cards">
            {/* Customer Path */}
            <div className="role-card customer-card" onClick={() => navigate('/customer')}>
              <div className="role-card-glow customer-glow" />
              <div className="role-card-content">
                <div className="role-icon-wrap customer-icon-bg">
                  <span>🔑</span>
                </div>
                <h3>I am a Customer</h3>
                <p>
                  Search for rentals, pay bills, and manage your stay with ease.
                  Everything you need in one beautiful dashboard.
                </p>
                <ul className="role-features">
                  <li>Browse verified listings</li>
                  <li>One-click rent payments</li>
                  <li>Maintenance requests</li>
                </ul>
                <button className="role-cta customer-cta">
                  Go to Tenant Portal
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>

            {/* Owner Path */}
            <div className="role-card owner-card" onClick={() => navigate('/owner')}>
              <div className="role-card-glow owner-glow" />
              <div className="role-card-content">
                <div className="role-icon-wrap owner-icon-bg">
                  <span>🏢</span>
                </div>
                <h3>I am an Owner</h3>
                <p>
                  List your properties, manage tenants, and track performance.
                  Grow your portfolio with powerful insights.
                </p>
                <ul className="role-features">
                  <li>Property analytics</li>
                  <li>Tenant management</li>
                  <li>Revenue tracking</li>
                </ul>
                <button className="role-cta owner-cta">
                  Go to Owner Portal
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path d="M3 8h10m0 0l-3-3m3 3l-3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ===================== FOOTER CTA ===================== */}
      <section className="footer-cta-section">
        <div className="footer-cta-glow" />
        <h2>Ready to Experience Aurora?</h2>
        <p>Join thousands of happy tenants and property owners today.</p>
        <button className="cta-primary large" onClick={onOpenLogin}>
          <span>Start Your Journey</span>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12m0 0l-4-4m4 4l-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </section>

      <SubscriptionModal
        isOpen={isSubModalOpen}
        onClose={() => setIsSubModalOpen(false)}
        onSelectPlan={(plan) => {
          onSetPlan(plan.id);
          alert(`You selected the ${plan.name} plan! Features have been updated.`);
          setIsSubModalOpen(false);
        }}
      />

      <style>{`
        /* ============================================
           AURORA LIVING - LANDING PAGE STYLES
           ============================================ */

        .landing-page {
          overflow-x: hidden;
          background: #060B18;
          color: #E2E8F0;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }

        /* ---- GRADIENT TEXT UTILITIES ---- */
        .gradient-text {
          background: linear-gradient(135deg, #00E5A0 0%, #00D4AA 40%, #7C3AED 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-text-2 {
          background: linear-gradient(135deg, #7C3AED 0%, #FFB547 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }
        .gradient-text-3 {
          background: linear-gradient(135deg, #00E5A0 0%, #7C3AED 50%, #FF6B6B 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-label {
          display: inline-block;
          font-size: 0.8rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #00E5A0;
          margin-bottom: 1.5rem;
          padding: 0.5rem 1.25rem;
          border: 1px solid rgba(0, 229, 160, 0.3);
          border-radius: 100px;
          background: rgba(0, 229, 160, 0.06);
        }
        .section-label.light {
          color: #FFB547;
          border-color: rgba(255, 181, 71, 0.3);
          background: rgba(255, 181, 71, 0.06);
        }

        /* ===========================================
           HERO SECTION
           =========================================== */
        .hero-section {
          position: relative;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem 4rem;
          overflow: hidden;
        }

        /* Aurora gradient meshes */
        .aurora-mesh {
          position: absolute;
          width: 800px;
          height: 800px;
          border-radius: 50%;
          filter: blur(120px);
          opacity: 0.4;
          animation: auroraPulse 8s ease-in-out infinite;
          pointer-events: none;
        }
        .aurora-mesh:first-child {
          top: -20%;
          right: -10%;
          background: radial-gradient(circle, rgba(0, 229, 160, 0.4) 0%, transparent 70%);
        }
        .aurora-mesh.mesh-2 {
          bottom: -30%;
          left: -15%;
          background: radial-gradient(circle, rgba(124, 58, 237, 0.35) 0%, transparent 70%);
          animation-delay: 3s;
          animation-duration: 10s;
        }
        .aurora-mesh.mesh-3 {
          top: 30%;
          left: 40%;
          width: 500px;
          height: 500px;
          background: radial-gradient(circle, rgba(255, 181, 71, 0.15) 0%, transparent 70%);
          animation-delay: 5s;
          animation-duration: 12s;
        }

        @keyframes auroraPulse {
          0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.4; }
          33% { transform: scale(1.15) translate(30px, -20px); opacity: 0.5; }
          66% { transform: scale(0.95) translate(-20px, 15px); opacity: 0.35; }
        }

        /* Hero ambient particles */
        .hero-particle {
          position: absolute;
          border-radius: 50%;
          pointer-events: none;
          animation: particleDrift 6s ease-in-out infinite;
        }
        .hero-particle.p1 {
          width: 6px; height: 6px;
          background: #00E5A0;
          top: 20%; left: 10%;
          opacity: 0.6;
          animation-duration: 5s;
        }
        .hero-particle.p2 {
          width: 4px; height: 4px;
          background: #7C3AED;
          top: 60%; right: 15%;
          opacity: 0.5;
          animation-delay: 2s;
          animation-duration: 7s;
        }
        .hero-particle.p3 {
          width: 8px; height: 8px;
          background: #FFB547;
          bottom: 25%; left: 25%;
          opacity: 0.4;
          animation-delay: 1s;
          animation-duration: 8s;
        }
        .hero-particle.p4 {
          width: 5px; height: 5px;
          background: #FF6B6B;
          top: 35%; right: 30%;
          opacity: 0.5;
          animation-delay: 3.5s;
          animation-duration: 6s;
        }

        @keyframes particleDrift {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(15px, -25px) scale(1.3); }
          50% { transform: translate(-10px, 10px) scale(0.8); }
          75% { transform: translate(20px, 5px) scale(1.1); }
        }

        .hero-inner {
          position: relative;
          z-index: 2;
          max-width: 1400px;
          width: 100%;
          display: grid;
          grid-template-columns: 1.1fr 1fr;
          gap: 5rem;
          align-items: center;
        }

        /* Hero badge */
        .hero-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 0.55rem 1.25rem;
          background: rgba(0, 229, 160, 0.08);
          border: 1px solid rgba(0, 229, 160, 0.25);
          border-radius: 100px;
          font-size: 0.8rem;
          font-weight: 600;
          color: #00E5A0;
          letter-spacing: 0.05em;
          margin-bottom: 2.5rem;
        }
        .badge-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #00E5A0;
          animation: dotPulse 2s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 1; box-shadow: 0 0 0 0 rgba(0, 229, 160, 0.5); }
          50% { opacity: 0.6; box-shadow: 0 0 0 6px rgba(0, 229, 160, 0); }
        }

        .hero-content h1 {
          font-size: 5rem;
          font-weight: 900;
          line-height: 1.05;
          color: #FFFFFF;
          margin-bottom: 2rem;
          letter-spacing: -0.03em;
        }
        .hero-content p {
          font-size: 1.2rem;
          color: rgba(226, 232, 240, 0.65);
          margin-bottom: 3rem;
          line-height: 1.8;
          max-width: 520px;
        }

        /* CTA buttons */
        .hero-cta-row {
          display: flex;
          gap: 1rem;
          align-items: center;
        }
        .cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.6rem;
          padding: 1rem 2.2rem;
          background: linear-gradient(135deg, #00E5A0 0%, #00C98D 100%);
          color: #060B18;
          border: none;
          border-radius: 16px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 0 30px rgba(0, 229, 160, 0.25), 0 4px 15px rgba(0, 229, 160, 0.2);
        }
        .cta-primary:hover {
          transform: translateY(-2px) scale(1.02);
          box-shadow: 0 0 50px rgba(0, 229, 160, 0.35), 0 8px 25px rgba(0, 229, 160, 0.3);
        }
        .cta-primary.large {
          padding: 1.2rem 3rem;
          font-size: 1.1rem;
          border-radius: 20px;
        }
        .cta-secondary {
          padding: 1rem 2.2rem;
          background: transparent;
          color: #E2E8F0;
          border: 1px solid rgba(226, 232, 240, 0.2);
          border-radius: 16px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          backdrop-filter: blur(10px);
        }
        .cta-secondary:hover {
          border-color: rgba(124, 58, 237, 0.6);
          background: rgba(124, 58, 237, 0.1);
          transform: translateY(-2px);
        }

        /* Hero visual / image area */
        .hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .hero-img-glow {
          position: absolute;
          border-radius: 40px;
          pointer-events: none;
        }
        .hero-img-glow.glow-1 {
          inset: -20px;
          background: linear-gradient(135deg, rgba(0, 229, 160, 0.2) 0%, rgba(124, 58, 237, 0.2) 100%);
          filter: blur(40px);
          animation: glowShift 6s ease-in-out infinite;
        }
        .hero-img-glow.glow-2 {
          inset: -10px;
          background: linear-gradient(225deg, rgba(255, 181, 71, 0.15) 0%, rgba(255, 107, 107, 0.15) 100%);
          filter: blur(30px);
          animation: glowShift 6s ease-in-out infinite 2s;
        }
        .hero-img-glow.glow-3 {
          inset: -5px;
          background: rgba(124, 58, 237, 0.1);
          filter: blur(20px);
          animation: glowShift 6s ease-in-out infinite 4s;
        }
        @keyframes glowShift {
          0%, 100% { opacity: 0.6; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.03); }
        }

        .hero-visual img {
          position: relative;
          z-index: 1;
          width: 100%;
          max-height: 540px;
          object-fit: cover;
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }

        /* Floating glassmorphism tags */
        .floating-tag {
          position: absolute;
          z-index: 5;
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.85rem 1.2rem;
          background: rgba(255, 255, 255, 0.06);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          color: #fff;
          animation: floatSmooth 5s ease-in-out infinite;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        .floating-tag strong {
          font-size: 0.85rem;
          display: block;
          line-height: 1.2;
        }
        .floating-tag small {
          font-size: 0.7rem;
          color: rgba(255, 255, 255, 0.5);
          display: block;
        }
        .tag-icon {
          font-size: 1.4rem;
        }
        .floating-tag.tag-1 {
          top: 8%;
          left: -12%;
          border-color: rgba(0, 229, 160, 0.25);
          box-shadow: 0 8px 32px rgba(0, 229, 160, 0.1);
        }
        .floating-tag.tag-2 {
          bottom: 12%;
          right: -8%;
          animation-delay: 1.8s;
          border-color: rgba(124, 58, 237, 0.25);
          box-shadow: 0 8px 32px rgba(124, 58, 237, 0.1);
        }
        .floating-tag.tag-3 {
          top: 55%;
          left: -8%;
          animation-delay: 3.5s;
          border-color: rgba(255, 181, 71, 0.25);
          box-shadow: 0 8px 32px rgba(255, 181, 71, 0.1);
        }

        @keyframes floatSmooth {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          33% { transform: translateY(-12px) rotate(1deg); }
          66% { transform: translateY(6px) rotate(-0.5deg); }
        }

        /* ===========================================
           STATS SECTION
           =========================================== */
        .stats-section {
          position: relative;
          padding: 8rem 2rem;
          background: linear-gradient(180deg, #060B18 0%, #0A1628 100%);
        }
        .stats-grid {
          max-width: 1200px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 2rem;
        }
        .stat-card {
          text-align: center;
          padding: 2.5rem 1.5rem;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 24px;
          transition: all 0.3s ease;
        }
        .stat-card:hover {
          background: rgba(255, 255, 255, 0.06);
          transform: translateY(-4px);
        }
        .stat-number {
          display: block;
          font-size: 3.5rem;
          font-weight: 900;
          letter-spacing: -0.03em;
          margin-bottom: 0.5rem;
        }
        .stat-number.green-glow {
          background: linear-gradient(135deg, #00E5A0, #00FFB2);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(0, 229, 160, 0.3));
        }
        .stat-number.violet-glow {
          background: linear-gradient(135deg, #7C3AED, #A78BFA);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(124, 58, 237, 0.3));
        }
        .stat-number.amber-glow {
          background: linear-gradient(135deg, #FFB547, #FFD700);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(255, 181, 71, 0.3));
        }
        .stat-number.coral-glow {
          background: linear-gradient(135deg, #FF6B6B, #FF8E8E);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          filter: drop-shadow(0 0 20px rgba(255, 107, 107, 0.3));
        }
        .stat-label {
          display: block;
          font-size: 0.85rem;
          color: rgba(226, 232, 240, 0.5);
          text-transform: uppercase;
          letter-spacing: 0.12em;
          font-weight: 600;
          margin-bottom: 1.5rem;
        }
        .stat-bar {
          height: 3px;
          border-radius: 3px;
          width: 60px;
          margin: 0 auto;
          opacity: 0.6;
        }
        .stat-bar.green { background: linear-gradient(90deg, #00E5A0, transparent); }
        .stat-bar.violet { background: linear-gradient(90deg, #7C3AED, transparent); }
        .stat-bar.amber { background: linear-gradient(90deg, #FFB547, transparent); }
        .stat-bar.coral { background: linear-gradient(90deg, #FF6B6B, transparent); }

        /* ===========================================
           ABOUT SECTION
           =========================================== */
        .about-section {
          position: relative;
          padding: 8rem 2rem;
          background: #0A1628;
          overflow: hidden;
        }
        .about-inner {
          max-width: 1300px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6rem;
          align-items: center;
        }

        .about-text h2 {
          font-size: 3.2rem;
          font-weight: 900;
          color: #FFFFFF;
          margin-bottom: 1.5rem;
          line-height: 1.15;
          letter-spacing: -0.02em;
        }
        .about-text p {
          font-size: 1.15rem;
          color: rgba(226, 232, 240, 0.6);
          line-height: 1.8;
          margin-bottom: 2.5rem;
          max-width: 480px;
        }

        .feature-bullets {
          list-style: none;
          padding: 0;
          margin: 0;
        }
        .feature-bullets li {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 0;
          font-size: 1.05rem;
          font-weight: 600;
          color: rgba(226, 232, 240, 0.85);
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .feature-bullets li:last-child {
          border-bottom: none;
        }
        .bullet-icon {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 12px;
          flex-shrink: 0;
        }
        .bullet-icon.green-icon {
          background: rgba(0, 229, 160, 0.1);
          box-shadow: 0 0 15px rgba(0, 229, 160, 0.1);
        }
        .bullet-icon.violet-icon {
          background: rgba(124, 58, 237, 0.1);
          box-shadow: 0 0 15px rgba(124, 58, 237, 0.1);
        }
        .bullet-icon.amber-icon {
          background: rgba(255, 181, 71, 0.1);
          box-shadow: 0 0 15px rgba(255, 181, 71, 0.1);
        }
        .bullet-icon.coral-icon {
          background: rgba(255, 107, 107, 0.1);
          box-shadow: 0 0 15px rgba(255, 107, 107, 0.1);
        }

        /* About floating 3D-like card */
        .about-visual {
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 450px;
        }
        .about-card-glow {
          position: absolute;
          inset: -30px;
          background: linear-gradient(135deg, rgba(0, 229, 160, 0.12) 0%, rgba(124, 58, 237, 0.12) 50%, rgba(255, 181, 71, 0.08) 100%);
          border-radius: 40px;
          filter: blur(40px);
          animation: cardGlow 5s ease-in-out infinite;
          pointer-events: none;
        }
        @keyframes cardGlow {
          0%, 100% { opacity: 0.7; transform: scale(1) rotate(0deg); }
          50% { opacity: 1; transform: scale(1.04) rotate(1deg); }
        }

        .about-card {
          position: relative;
          width: 100%;
          max-width: 440px;
          background: rgba(255, 255, 255, 0.04);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 40px 80px rgba(0, 0, 0, 0.4);
          animation: floatCard 6s ease-in-out infinite;
        }
        @keyframes floatCard {
          0%, 100% { transform: translateY(0) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(0.5deg); }
        }

        .about-card-header {
          display: flex;
          gap: 8px;
          padding: 1.2rem 1.5rem;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .about-card-dot {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .green-dot { background: #00E5A0; }
        .violet-dot { background: #7C3AED; }
        .amber-dot { background: #FFB547; }

        .about-card-body {
          padding: 0.5rem;
        }
        .about-card-row {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.1rem 1.2rem;
          border-radius: 16px;
          transition: background 0.2s;
          cursor: default;
        }
        .about-card-row:hover {
          background: rgba(255, 255, 255, 0.04);
        }
        .acr-icon {
          font-size: 1.5rem;
          flex-shrink: 0;
        }
        .acr-info {
          flex: 1;
          min-width: 0;
        }
        .acr-info strong {
          display: block;
          font-size: 0.9rem;
          color: #fff;
          margin-bottom: 2px;
        }
        .acr-info small {
          display: block;
          font-size: 0.75rem;
          color: rgba(226, 232, 240, 0.45);
        }
        .acr-badge {
          padding: 0.3rem 0.8rem;
          border-radius: 100px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          background: rgba(0, 229, 160, 0.12);
          color: #00E5A0;
          border: 1px solid rgba(0, 229, 160, 0.2);
        }
        .acr-badge.done {
          background: rgba(124, 58, 237, 0.12);
          color: #A78BFA;
          border-color: rgba(124, 58, 237, 0.2);
        }
        .acr-amount {
          font-weight: 800;
          font-size: 1rem;
          color: #FFB547;
        }

        /* ===========================================
           ROLE SELECTION SECTION
           =========================================== */
        .roles-section {
          position: relative;
          padding: 8rem 2rem;
          background: #060B18;
          overflow: hidden;
        }
        .roles-aurora-bg {
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 60% 50% at 20% 80%, rgba(124, 58, 237, 0.12) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 20%, rgba(0, 229, 160, 0.08) 0%, transparent 70%),
            radial-gradient(ellipse 40% 30% at 50% 50%, rgba(255, 107, 107, 0.06) 0%, transparent 70%);
          pointer-events: none;
        }

        .roles-inner {
          position: relative;
          max-width: 1200px;
          margin: 0 auto;
          text-align: center;
        }
        .roles-title {
          font-size: 3.5rem;
          font-weight: 900;
          color: #FFFFFF;
          margin-bottom: 1.25rem;
          line-height: 1.1;
          letter-spacing: -0.03em;
        }
        .roles-subtitle {
          font-size: 1.15rem;
          color: rgba(226, 232, 240, 0.5);
          margin-bottom: 4rem;
          max-width: 500px;
          margin-left: auto;
          margin-right: auto;
          line-height: 1.7;
        }

        .role-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2.5rem;
        }

        .role-card {
          position: relative;
          border-radius: 32px;
          overflow: hidden;
          cursor: pointer;
          transition: all 0.5s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .role-card:hover {
          transform: translateY(-8px) scale(1.01);
        }

        .role-card-glow {
          position: absolute;
          inset: 0;
          border-radius: 32px;
          opacity: 0;
          transition: opacity 0.5s ease;
          pointer-events: none;
        }
        .role-card:hover .role-card-glow {
          opacity: 1;
        }
        .customer-glow {
          box-shadow: 0 0 60px rgba(0, 229, 160, 0.15), inset 0 0 60px rgba(0, 229, 160, 0.03);
        }
        .owner-glow {
          box-shadow: 0 0 60px rgba(124, 58, 237, 0.15), inset 0 0 60px rgba(124, 58, 237, 0.03);
        }

        .role-card-content {
          position: relative;
          z-index: 1;
          padding: 3rem;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 32px;
          text-align: left;
          transition: all 0.5s ease;
        }
        .role-card:hover .role-card-content {
          border-color: rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.05);
        }
        .customer-card:hover .role-card-content {
          border-color: rgba(0, 229, 160, 0.3);
        }
        .owner-card:hover .role-card-content {
          border-color: rgba(124, 58, 237, 0.3);
        }

        .role-icon-wrap {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 64px;
          height: 64px;
          border-radius: 20px;
          font-size: 1.8rem;
          margin-bottom: 1.5rem;
        }
        .customer-icon-bg {
          background: rgba(0, 229, 160, 0.1);
          border: 1px solid rgba(0, 229, 160, 0.2);
        }
        .owner-icon-bg {
          background: rgba(124, 58, 237, 0.1);
          border: 1px solid rgba(124, 58, 237, 0.2);
        }

        .role-card h3 {
          font-size: 1.75rem;
          font-weight: 800;
          color: #FFFFFF;
          margin-bottom: 0.75rem;
        }
        .role-card p {
          color: rgba(226, 232, 240, 0.55);
          font-size: 1rem;
          line-height: 1.7;
          margin-bottom: 1.5rem;
        }

        .role-features {
          list-style: none;
          padding: 0;
          margin: 0 0 2rem 0;
        }
        .role-features li {
          position: relative;
          padding: 0.45rem 0 0.45rem 1.3rem;
          font-size: 0.9rem;
          color: rgba(226, 232, 240, 0.6);
          font-weight: 500;
        }
        .role-features li::before {
          content: '';
          position: absolute;
          left: 0;
          top: 50%;
          transform: translateY(-50%);
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }
        .customer-card .role-features li::before {
          background: #00E5A0;
          box-shadow: 0 0 8px rgba(0, 229, 160, 0.4);
        }
        .owner-card .role-features li::before {
          background: #7C3AED;
          box-shadow: 0 0 8px rgba(124, 58, 237, 0.4);
        }

        .role-cta {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          width: 100%;
          justify-content: center;
          padding: 1rem;
          border: none;
          border-radius: 16px;
          font-weight: 700;
          font-size: 0.95rem;
          cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .customer-cta {
          background: rgba(0, 229, 160, 0.1);
          color: #00E5A0;
          border: 1px solid rgba(0, 229, 160, 0.25);
        }
        .customer-card:hover .customer-cta {
          background: linear-gradient(135deg, #00E5A0, #00C98D);
          color: #060B18;
          border-color: transparent;
          box-shadow: 0 0 30px rgba(0, 229, 160, 0.3);
        }
        .owner-cta {
          background: rgba(124, 58, 237, 0.1);
          color: #A78BFA;
          border: 1px solid rgba(124, 58, 237, 0.25);
        }
        .owner-card:hover .owner-cta {
          background: linear-gradient(135deg, #7C3AED, #6D28D9);
          color: #FFFFFF;
          border-color: transparent;
          box-shadow: 0 0 30px rgba(124, 58, 237, 0.3);
        }

        /* ===========================================
           FOOTER CTA
           =========================================== */
        .footer-cta-section {
          position: relative;
          text-align: center;
          padding: 8rem 2rem;
          background: linear-gradient(180deg, #060B18 0%, #0A1628 50%, #060B18 100%);
          overflow: hidden;
        }
        .footer-cta-glow {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          width: 600px;
          height: 300px;
          background: radial-gradient(ellipse, rgba(0, 229, 160, 0.12) 0%, rgba(124, 58, 237, 0.08) 40%, transparent 70%);
          filter: blur(60px);
          pointer-events: none;
        }
        .footer-cta-section h2 {
          position: relative;
          font-size: 3rem;
          font-weight: 900;
          color: #FFFFFF;
          margin-bottom: 1rem;
          letter-spacing: -0.02em;
        }
        .footer-cta-section p {
          position: relative;
          font-size: 1.15rem;
          color: rgba(226, 232, 240, 0.5);
          margin-bottom: 2.5rem;
        }
        .footer-cta-section .cta-primary {
          position: relative;
        }

        /* ===========================================
           RESPONSIVE
           =========================================== */
        @media (max-width: 1024px) {
          .hero-inner {
            grid-template-columns: 1fr;
            gap: 3rem;
            text-align: center;
          }
          .hero-content p {
            max-width: 100%;
          }
          .hero-content h1 {
            font-size: 3.5rem;
          }
          .hero-cta-row {
            justify-content: center;
          }
          .hero-visual {
            order: -1;
            max-width: 500px;
            margin: 0 auto;
          }
          .floating-tag.tag-1 { left: -5%; }
          .floating-tag.tag-2 { right: -5%; }
          .floating-tag.tag-3 { left: -5%; }
          .stats-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .about-inner {
            grid-template-columns: 1fr;
            gap: 4rem;
          }
          .about-text {
            text-align: center;
          }
          .about-text p {
            max-width: 100%;
          }
          .about-text h2 {
            font-size: 2.5rem;
          }
          .role-cards {
            grid-template-columns: 1fr;
            max-width: 500px;
            margin-left: auto;
            margin-right: auto;
          }
          .roles-title {
            font-size: 2.5rem;
          }
        }

        @media (max-width: 640px) {
          .hero-content h1 {
            font-size: 2.5rem;
          }
          .hero-cta-row {
            flex-direction: column;
            width: 100%;
          }
          .cta-primary, .cta-secondary {
            width: 100%;
            justify-content: center;
            text-align: center;
          }
          .stats-grid {
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }
          .stat-number {
            font-size: 2.5rem;
          }
          .floating-tag {
            display: none;
          }
          .about-card {
            max-width: 100%;
          }
          .roles-title {
            font-size: 2rem;
          }
          .footer-cta-section h2 {
            font-size: 2rem;
          }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

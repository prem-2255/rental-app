import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import SubscriptionModal from '../components/SubscriptionModal';

const LandingPage: React.FC<{ onOpenLogin: () => void, onSetPlan: (plan: any) => void }> = ({ onOpenLogin, onSetPlan }) => {
  const navigate = useNavigate();
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1>Premium Rentals. <br/><span>Simplified Management.</span></h1>
          <p>The all-in-one platform for modern living. Whether you're searching for your dream home or managing a property portfolio, we've got you covered.</p>
          <div style={{ marginBottom: '2.5rem', display: 'flex', gap: '1rem' }}>
            <button className="enter-btn" onClick={onOpenLogin} style={{ width: 'auto', padding: '1rem 2rem', background: '#3b82f6', color: 'white' }}>
              Get Started Now
            </button>
            <button className="enter-btn" onClick={() => setIsSubModalOpen(true)} style={{ width: 'auto', padding: '1rem 2rem', border: '1px solid #3b82f6', color: '#3b82f6', background: 'transparent' }}>
              View Plans
            </button>
          </div>
          <div className="hero-stats">
            <div className="stat-item"><strong>500+</strong><span>Properties</span></div>
            <div className="stat-item"><strong>1.2k</strong><span>Happy Tenants</span></div>
            <div className="stat-item"><strong>98%</strong><span>Satisfaction</span></div>
          </div>
        </div>
        <div className="hero-visual">
          <div className="floating-card c1">🏠 Sweet Home</div>
          <div className="floating-card c2">💳 Let's Live</div>
          <img 
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Modern Luxury Home" 
          />
        </div>
      </section>

      {/* About Our Service */}
      <section className="about-section" id="about">
        <div className="section-header">
          <h2>About Our Service</h2>
          <div className="divider"></div>
        </div>
        <div className="features-showcase">
          <div className="feature-info">
            <h3>Designed for the Modern Ecosystem</h3>
            <p>We bridge the gap between property owners and tenants through transparency, automation, and premium design. No more paperwork, no more delays.</p>
            <ul className="feature-bullets">
              <li>✨ Seamless online booking system</li>
              <li>🛡️ Verified identity and document management</li>
              <li>🛠️ Dedicated maintenance support with photo proof</li>
              <li>⚡ Automated utility and rent payment tracking</li>
            </ul>
          </div>
          <div className="feature-illustration">
             <div className="illus-circle"></div>
             <div className="illus-content">
                <span>Premium Experience</span>
             </div>
          </div>
        </div>
      </section>

      {/* Role Selection Section */}
      <section className="entry-section">
        <div className="section-header">
          <h2>Choose Your Path</h2>
          <p>Select how you want to use rentapp today</p>
        </div>
        
        <div className="role-cards">
          {/* Customer Path */}
          <div className="role-card customer" onClick={() => navigate('/customer')}>
            <div className="role-icon">🔑</div>
            <h3>I am a Customer</h3>
            <p>Search for rentals, pay bills, and manage your stay with ease.</p>
            <button className="enter-btn">Go to Tenant Portal</button>
          </div>

          {/* Owner Path */}
          <div className="role-card owner" onClick={() => navigate('/owner')}>
            <div className="role-icon">🏢</div>
            <h3>I am an Owner</h3>
            <p>List your properties, manage tenants, and track performance.</p>
            <button className="enter-btn">Go to Owner Portal</button>
          </div>
        </div>
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
        .landing-page {
          overflow-x: hidden;
        }
        
        /* Hero Section */
        .hero-section {
          min-height: calc(100vh - 80px);
          margin-top: 80px;
          padding: 4rem 2rem;
          max-width: 1600px;
          margin-left: auto;
          margin-right: auto;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 4rem;
          align-items: center;
        }
        .hero-content h1 {
          font-size: 4.5rem;
          font-weight: 900;
          line-height: 1.1;
          color: #0f172a;
          margin-bottom: 2rem;
        }
        .hero-content h1 span {
          color: #3b82f6;
        }
        .hero-content p {
          font-size: 1.5rem;
          color: #64748b;
          margin-bottom: 3.5rem;
          line-height: 1.6;
          max-width: 800px;
        }
        .hero-stats {
          display: flex;
          gap: 4rem;
        }
        .stat-item {
          display: flex;
          flex-direction: column;
        }
        .stat-item strong {
          font-size: 2.5rem;
          color: #0f172a;
        }
        .stat-item span {
          font-size: 0.875rem;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-weight: 700;
        }
        
        .hero-visual {
          position: relative;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .hero-visual img {
          width: 100%;
          max-height: 70vh;
          object-fit: cover;
          border-radius: 60px;
          box-shadow: 20px 20px 60px #d1d9e6, -20px -20px 60px #ffffff;
        }
        .floating-card {
          position: absolute;
          background: white;
          padding: 1rem 1.5rem;
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
          font-weight: 700;
          color: #0f172a;
          z-index: 10;
          animation: float 4s ease-in-out infinite;
        }
        .floating-card.c1 { top: 20%; left: -20px; }
        .floating-card.c2 { bottom: 20%; right: -20px; animation-delay: 2s; }
        
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        /* About Section */
        .about-section {
          background: #f8fafc;
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 8rem 2rem;
        }
        .section-header {
          text-align: center;
          margin-bottom: 5rem;
        }
        .section-header h2 {
          font-size: 3.5rem;
          font-weight: 900;
          color: #0f172a;
          margin-bottom: 1.5rem;
        }
        .divider {
          width: 100px;
          height: 8px;
          background: #3b82f6;
          margin: 0 auto;
          border-radius: 4px;
        }
        
        .features-showcase {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 6rem;
          align-items: center;
        }
        .feature-info h3 {
          font-size: 2.5rem;
          margin-bottom: 2rem;
          color: #1e293b;
          font-weight: 800;
        }
        .feature-info p {
          font-size: 1.25rem;
          color: #64748b;
          margin-bottom: 3rem;
          line-height: 1.8;
        }
        .feature-bullets li {
          margin-bottom: 1.5rem;
          font-size: 1.125rem;
          font-weight: 600;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        
        .feature-illustration {
          position: relative;
          height: 500px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .illus-circle {
          width: 450px;
          height: 450px;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          border-radius: 50%;
          filter: blur(60px);
          opacity: 0.15;
        }
        .illus-content {
           position: absolute;
           background: white;
           padding: 4rem;
           border-radius: 40px;
           box-shadow: 0 40px 80px rgba(0,0,0,0.08);
           border: 1px solid #f1f5f9;
           font-weight: 900;
           font-size: 2rem;
           color: #3b82f6;
        }

        /* Entry Section */
        .entry-section {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          justify-content: center;
          padding: 8rem 2rem;
          max-width: 1200px;
          margin: 0 auto;
        }
        .role-cards {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
          margin-top: 4rem;
        }
        .role-card {
           padding: 3.5rem 3rem;
           background: rgba(255, 255, 255, 0.03); /* Glassmorphism background */
           backdrop-filter: blur(20px);
           -webkit-backdrop-filter: blur(20px);
           border-radius: 40px;
           border: 1px solid rgba(255, 255, 255, 0.1);
           text-align: center;
           cursor: pointer;
           transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
           /* Premium Rounded Shadow */
           box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.5), 
                       0 18px 36px -18px rgba(0, 0, 0, 0.5);
           position: relative;
        }
        .role-card:hover {
           transform: translateY(-16px) scale(1.02);
           box-shadow: 0 50px 100px -20px rgba(0, 0, 0, 0.3), 
                       0 30px 60px -30px rgba(0, 0, 0, 0.3);
           border-color: rgba(59, 130, 246, 0.5);
           background: rgba(255, 255, 255, 0.05);
        }
        .role-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
        }
        .role-card h3 {
          font-size: 2rem;
          margin-bottom: 1.25rem;
          color: #ffffff;
          font-weight: 800;
        }
        .role-card p {
          color: rgba(255, 255, 255, 0.7);
          margin-bottom: 2.5rem;
          font-size: 1.1rem;
          line-height: 1.6;
        }
        .enter-btn {
          width: 100%;
          padding: 1rem;
          border-radius: 16px;
          border: none;
          background: #f1f5f9;
          color: #1e293b;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .role-card:hover .enter-btn {
          background: #3b82f6;
          color: white;
        }

        @media (max-width: 900px) {
          .hero-section, .features-showcase, .role-cards {
            grid-template-columns: 1fr;
          }
          .hero-section { text-align: center; }
          .hero-stats { justify-content: center; }
          .hero-content h1 { font-size: 2.5rem; }
          .hero-visual { order: -1; }
        }
      `}</style>
    </div>
  );
};

export default LandingPage;

import React from 'react';

const AboutUsPage: React.FC = () => {
  return (
    <main className="main-content" style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto' }}>
      <section className="about-hero" style={{ textAlign: 'center', marginBottom: '4rem', padding: '4rem 2rem', background: 'linear-gradient(135deg, #EEF2FF 0%, #E0E7FF 100%)', borderRadius: '24px', position: 'relative', overflow: 'hidden' }}>
        <div className="bg-circle" style={{ position: 'absolute', top: '-10%', left: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(255,255,255,0) 70%)' }}></div>
        <div className="bg-circle" style={{ position: 'absolute', bottom: '-20%', right: '-10%', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(236,72,153,0.1) 0%, rgba(255,255,255,0) 70%)' }}></div>
        
        <h1 style={{ fontSize: '3.5rem', color: '#1E293B', marginBottom: '1.5rem', position: 'relative', zIndex: 1, letterSpacing: '-0.02em', fontWeight: '800' }}>
          Redefining Property Management
        </h1>
        <p style={{ fontSize: '1.25rem', color: '#475569', maxWidth: '800px', margin: '0 auto', lineHeight: '1.8', position: 'relative', zIndex: 1 }}>
          Your all-in-one platform for a premium, hassle-free rental experience. Whether you're a tenant looking for a seamless living experience or an owner streamlining property management, we provide the ultimate digital solution.
        </p>
      </section>

      <section style={{ marginBottom: '5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '3rem' }}>
          <h2 style={{ fontSize: '2.5rem', color: '#0F172A', marginBottom: '1rem', fontWeight: '700' }}>Services We Provide</h2>
          <p style={{ fontSize: '1.1rem', color: '#64748B' }}>Discover the powerful features designed to make your life easier.</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2rem' }}>
          {/* Service Card 1 */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9', transition: 'transform 0.3s ease, boxShadow 0.3s ease' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#FEFCE8', color: '#F59E0B', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>
              🏠
            </div>
            <h3 style={{ fontSize: '1.5rem', color: '#1E293B', marginBottom: '1rem', fontWeight: '600' }}>Premium Rental Booking</h3>
            <p style={{ color: '#475569', lineHeight: '1.7' }}>
              Browse through curated top-tier properties. Find your next home easily, negotiate terms, and sign leases completely online with absolute transparency.
            </p>
          </div>

          {/* Service Card 2 */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#FFF7ED', color: '#EA580C', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>
              💳
            </div>
            <h3 style={{ fontSize: '1.5rem', color: '#1E293B', marginBottom: '1rem', fontWeight: '600' }}>Seamless Rent Payments</h3>
            <p style={{ color: '#475569', lineHeight: '1.7' }}>
              Never miss a rent due date again. Make secure, instant online payments through UPI, credit cards, or bank transfers right from your portal.
            </p>
          </div>

          {/* Service Card 3 */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#FEFCE8', color: '#FBBF24', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>
              ⚡
            </div>
            <h3 style={{ fontSize: '1.5rem', color: '#1E293B', marginBottom: '1rem', fontWeight: '600' }}>Utility & Electricity Admin</h3>
            <p style={{ color: '#475569', lineHeight: '1.7' }}>
              Track meter readings, calculate usage directly, and manage all electricity bills directly in the app. Automatic calculations based on current unit rates.
            </p>
          </div>

          {/* Service Card 4 */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#F0FDFA', color: '#0D9488', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>
              🛠️
            </div>
            <h3 style={{ fontSize: '1.5rem', color: '#1E293B', marginBottom: '1rem', fontWeight: '600' }}>Maintenance Hub</h3>
            <p style={{ color: '#475569', lineHeight: '1.7' }}>
              Raise tickets for repairs instantly! Provide photos and descriptions, directly coordinate with property managers, and track repair status right to completion.
            </p>
          </div>

          {/* Service Card 5 */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#EEF2FF', color: '#4F46E5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>
              🏢
            </div>
            <h3 style={{ fontSize: '1.5rem', color: '#1E293B', marginBottom: '1rem', fontWeight: '600' }}>Owner Property Management</h3>
            <p style={{ color: '#475569', lineHeight: '1.7' }}>
              Dedicated tools for facility owners. Broadcast crucial announcements, handle tenant requests, add new property units in minutes, and view complete rent history.
            </p>
          </div>

          {/* Service Card 6 */}
          <div style={{ background: '#ffffff', borderRadius: '20px', padding: '2.5rem', boxShadow: '0 10px 40px rgba(0,0,0,0.05)', border: '1px solid #F1F5F9' }}>
            <div style={{ width: '64px', height: '64px', borderRadius: '16px', background: '#F5F3FF', color: '#8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', marginBottom: '1.5rem' }}>
              📄
            </div>
            <h3 style={{ fontSize: '1.5rem', color: '#1E293B', marginBottom: '1rem', fontWeight: '600' }}>Legal & Document Vault</h3>
            <p style={{ color: '#475569', lineHeight: '1.7' }}>
              E-sign your agreements seamlessly. Upload KYC, police verifications, and rent receipts into a secure cloud storage accessible 24/7.
            </p>
          </div>
        </div>
      </section>

      <section style={{ background: '#1E293B', borderRadius: '24px', padding: '4rem 2rem', textAlign: 'center', color: '#fff' }}>
        <h2 style={{ fontSize: '2.5rem', marginBottom: '1.5rem', fontWeight: '700' }}>Our Commitment to You</h2>
        <p style={{ fontSize: '1.1rem', maxWidth: '700px', margin: '0 auto', lineHeight: '1.8', color: '#CBD5E1', marginBottom: '2.5rem' }}>
          At the core of our platform is a promise to bridge the gap between owners and tenants. We ensure transparency, elevate efficiency, and redefine what it means to manage rentals in the modern digital age.
        </p>
      </section>
    </main>
  );
};

export default AboutUsPage;

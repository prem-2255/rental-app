import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { UserRole } from '../types';

interface ProfilePageProps {
  userRole: UserRole | null;
  onLogout: () => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ userRole, onLogout }) => {
  const navigate = useNavigate();

  const [profile, setProfile] = React.useState({
    name: '',
    email: '',
    phone: '',
    memberSince: 'January 2026',
    avatar: '?'
  });

  React.useEffect(() => {
    if (!userRole) return;
    fetch('/api/users')
      .then(res => res.json())
      .then(users => {
        const user = users.find((u: any) => u.role === userRole);
        if (user) {
          setProfile({
            name: user.name,
            email: user.email,
            phone: user.phone || '+91 91234 56789',
            memberSince: new Date(user.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
            avatar: user.name.charAt(0).toUpperCase()
          });
        }
      })
      .catch(console.error);
  }, [userRole]);

  const stats = userRole === 'owner' ? [
    { label: 'Properties Managed', value: '12', icon: '🏢' },
    { label: 'Active Tenants', value: '8', icon: '👨‍👩‍👧‍👦' },
    { label: 'Verified Listing', value: '100%', icon: '✅' },
  ] : [
    { label: 'Active Leases', value: '1', icon: '📜' },
    { label: 'Payment Status', value: 'Up to Date', icon: '💳' },
    { label: 'Document Status', value: 'Verified', icon: '🛡️' },
  ];

  if (!userRole) {
    return (
      <div className="profile-page auth-fallback">
        <div className="login-prompt-card">
          <h1>Your Profile</h1>
          <p>Please log in to view and manage your account details.</p>
          <button onClick={() => navigate('/')} className="action-button">Go back to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="profile-header-gradient"></div>
      
      <div className="profile-container">
        <div className="profile-card main-info">
          <div className="profile-avatar">{profile.avatar}</div>
          <div className="profile-info-content">
            <h1>{profile.name}</h1>
            <p className="role-badge">{userRole.toUpperCase()}</p>
            <div className="contact-info">
              <span>📧 {profile.email}</span>
              <span>📞 {profile.phone}</span>
            </div>
            <p className="meta-info">Member Since {profile.memberSince}</p>
          </div>
          <button className="logout-inline-btn" onClick={onLogout}>Log Out</button>
        </div>

        <div className="stats-grid">
          {stats.map((stat, i) => (
            <div key={i} className="stat-card">
              <span className="stat-icon">{stat.icon}</span>
              <div className="stat-details">
                <span className="stat-label">{stat.label}</span>
                <span className="stat-value">{stat.value}</span>
              </div>
            </div>
          ))}
        </div>

        <div className="profile-sections">
          <div className="profile-section-card">
            <h3>Account Settings</h3>
            <div className="settings-list">
              <div className="setting-item">
                <div className="setting-label">Customer Portal</div>
                <button className="setting-action" onClick={() => navigate('/customer')}>Go</button>
              </div>
              <div className="setting-item">
                <div className="setting-label">Owner Portal</div>
                <button className="setting-action" onClick={() => navigate('/owner')}>Go</button>
              </div>
              <div className="setting-item">
                <div className="setting-label">Change Password</div>
                <button className="setting-action">Update</button>
              </div>
              <div className="setting-item">
               <div className="setting-label">Email Notifications</div>
               <div className="toggle-sim active"></div>
              </div>

            </div>
          </div>

          <div className="profile-section-card">
            <h3>Security & Logs</h3>
            <div className="log-list">
              <div className="log-item">
                <span className="log-date">Today, 10:45 AM</span>
                <span className="log-text">Successful Login from Chrome (Windows)</span>
              </div>
              <div className="log-item">
                <span className="log-date">Yesterday, 08:20 PM</span>
                <span className="log-text">Profile Information Updated</span>
              </div>
            </div>
            <button className="view-more-btn">Clear All Sessions</button>
          </div>
        </div>
      </div>

      <style>{`
        .profile-page {
          min-height: 100vh;
          background: #f8fafc;
          position: relative;
        }
        .profile-header-gradient {
          height: 300px;
          background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 0;
        }
        .profile-container {
          position: relative;
          z-index: 1;
          max-width: 1000px;
          margin: 0 auto;
          padding: 100px 2rem 5rem;
        }
        .profile-card {
          background: white;
          padding: 3rem;
          border-radius: 32px;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255,255,255,0.1);
          display: flex;
          align-items: center;
          gap: 3rem;
          margin-bottom: 2rem;
          position: relative;
        }
        .profile-avatar {
          width: 120px;
          height: 120px;
          background: #3b82f6;
          color: white;
          border-radius: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          font-weight: 800;
          box-shadow: 0 10px 20px rgba(59, 130, 246, 0.3);
        }
        .profile-info-content h1 {
          margin: 0;
          font-size: 2.5rem;
          color: #0f172a;
        }
        .role-badge {
          display: inline-block;
          background: #eff6ff;
          color: #3b82f6;
          padding: 0.25rem 1rem;
          border-radius: 99px;
          font-weight: 800;
          font-size: 0.75rem;
          letter-spacing: 0.05em;
          margin: 0.5rem 0 1rem;
        }
        .contact-info {
          display: flex;
          gap: 2rem;
          color: #64748b;
          font-weight: 500;
          margin-bottom: 1rem;
        }
        .meta-info {
          color: #94a3b8;
          font-size: 0.875rem;
        }
        .logout-inline-btn {
          position: absolute;
          top: 3rem;
          right: 3rem;
          background: #fee2e2;
          color: #ef4444;
          border: none;
          padding: 0.5rem 1.5rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .logout-inline-btn:hover {
          background: #ef4444;
          color: white;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 24px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }
        .stat-icon {
          font-size: 2rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 20px;
        }
        .stat-label {
          display: block;
          color: #64748b;
          font-size: 0.875rem;
          font-weight: 600;
        }
        .stat-value {
          display: block;
          color: #0f172a;
          font-size: 1.5rem;
          font-weight: 800;
        }

        .profile-sections {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        .profile-section-card {
          background: white;
          padding: 2.5rem;
          border-radius: 24px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }
        .profile-section-card h3 {
          margin: 0 0 2rem;
          color: #0f172a;
          font-size: 1.25rem;
        }
        .setting-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .setting-label {
          font-weight: 600;
          color: #334155;
        }
        .setting-action {
          background: #f1f5f9;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          color: #64748b;
        }
        .toggle-sim {
          width: 48px;
          height: 24px;
          background: #e2e8f0;
          border-radius: 99px;
          position: relative;
          cursor: pointer;
        }
        .toggle-sim::after {
          content: '';
          position: absolute;
          width: 18px;
          height: 18px;
          background: white;
          border-radius: 50%;
          top: 3px;
          left: 3px;
          transition: all 0.2s;
        }
        .toggle-sim.active { background: #3b82f6; }
        .toggle-sim.active::after { transform: translateX(24px); }

        .log-item {
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
          padding: 1rem 0;
          border-bottom: 1px solid #f1f5f9;
        }
        .log-date {
          font-size: 0.75rem;
          color: #94a3b8;
          font-weight: 600;
        }
        .log-text {
          color: #475569;
          font-weight: 500;
          font-size: 0.875rem;
        }
        .view-more-btn {
          margin-top: 2rem;
          background: none;
          border: 1px solid #e2e8f0;
          width: 100%;
          padding: 0.75rem;
          border-radius: 12px;
          color: #64748b;
          font-weight: 700;
          cursor: pointer;
        }

        @media (max-width: 900px) {
          .profile-card { flex-direction: column; text-align: center; gap: 1.5rem; }
          .contact-info { flex-direction: column; gap: 0.5rem; }
          .stats-grid, .profile-sections { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default ProfilePage;

import React, { useState, useEffect } from 'react';

interface AdminStats {
  totalUsers: number;
  totalTenants: number;
  totalOwners: number;
  totalProperties: number;
  totalRevenue: string;
}

const AdminDashboardPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'properties'>('overview');

  useEffect(() => {
    fetchStatsAndUsers();
  }, []);

  const fetchStatsAndUsers = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, propertiesRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users'),
        fetch('/api/properties')
      ]);

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const propertiesData = await propertiesRes.json();

      setStats(statsData);
      setUsers(usersData);
      setProperties(propertiesData);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching admin data:', err);
      setLoading(false);
    }
  };

  const handleToggleBlockUser = async (userId: string) => {
    try {
      const res = await fetch(`/api/admin/users/${userId}/block`, {
        method: 'PUT'
      });
      if (res.ok) {
        const updatedUser = await res.json();
        setUsers(prev => prev.map(u => u.id === userId ? updatedUser : u));
      }
    } catch (err) {
      console.error('Error blocking user:', err);
    }
  };

  const handleDeleteProperty = async (propertyId: string) => {
    if (!window.confirm('Are you sure you want to remove this property listing from the platform?')) return;
    try {
      const res = await fetch(`/api/properties/${propertyId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProperties(prev => prev.filter(p => p.id !== propertyId));
      }
    } catch (err) {
      console.error('Error deleting property:', err);
    }
  };

  return (
    <div className="admin-dashboard-page">
      <header className="dashboard-header">
        <h1>Admin Control Room</h1>
        <p>Monitor platform statistics, verify listings, and manage system access.</p>
      </header>

      <div className="tab-navigation">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📈 Overview & Analytics
        </button>
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👤 User Management
        </button>
        <button 
          className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          🏢 Property Auditing
        </button>
      </div>

      {loading ? (
        <div className="loading-state">Gathering system intelligence...</div>
      ) : (
        <div className="dashboard-content">
          {activeTab === 'overview' && stats && (
            <div className="overview-pane animate-fade-in">
              <div className="stats-grid">
                <div className="stat-card">
                  <span className="icon">💰</span>
                  <h3>Total Platform Volume</h3>
                  <div className="value">{stats.totalRevenue}</div>
                </div>
                <div className="stat-card">
                  <span className="icon">👥</span>
                  <h3>Registered Users</h3>
                  <div className="value">{stats.totalUsers}</div>
                  <p className="subtext">{stats.totalTenants} Tenants / {stats.totalOwners} Owners</p>
                </div>
                <div className="stat-card">
                  <span className="icon">🏢</span>
                  <h3>Total Listings</h3>
                  <div className="value">{stats.totalProperties}</div>
                </div>
              </div>

              <div className="analytics-charts">
                <div className="chart-card">
                  <h3>Revenue Share</h3>
                  <div className="donut-chart-mock">
                    <div className="donut-circle">
                      <div className="center-value">84%</div>
                    </div>
                    <div className="chart-legend">
                      <div><span className="dot rent"></span> Rent Payments (84%)</div>
                      <div><span className="dot deposit"></span> Deposit Escrows (16%)</div>
                    </div>
                  </div>
                </div>
                <div className="chart-card">
                  <h3>Platform Occupancy</h3>
                  <div className="bar-chart-mock">
                    <div className="bar-container">
                      <div className="bar-label">Available</div>
                      <div className="bar-track">
                        <div className="bar-fill available" style={{ width: '45%' }}></div>
                      </div>
                      <div className="bar-value">45%</div>
                    </div>
                    <div className="bar-container">
                      <div className="bar-label">Occupied</div>
                      <div className="bar-track">
                        <div className="bar-fill occupied" style={{ width: '55%' }}></div>
                      </div>
                      <div className="bar-value">55%</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-pane animate-fade-in">
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Contact Info</th>
                      <th>System Role</th>
                      <th>Access Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <tr key={u.id}>
                        <td>
                          <div className="user-profile-cell">
                            <span className="avatar">{u.name.charAt(0)}</span>
                            <div>
                              <strong>{u.name}</strong>
                              <p className="user-id">ID: {u.id.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <p>📧 {u.email || 'N/A'}</p>
                          <p>📞 {u.phone || 'N/A'}</p>
                        </td>
                        <td>
                          <span className={`role-badge ${u.role}`}>
                            {u.role.toUpperCase()}
                          </span>
                        </td>
                        <td>
                          <span className={`status-badge-dot ${u.isBlocked ? 'blocked' : 'active'}`}>
                            {u.isBlocked ? 'Blocked' : 'Active'}
                          </span>
                        </td>
                        <td>
                          {u.role !== 'admin' && (
                            <button 
                              onClick={() => handleToggleBlockUser(u.id)}
                              className={`action-btn-table ${u.isBlocked ? 'unban' : 'ban'}`}
                            >
                              {u.isBlocked ? '🟢 Unblock' : '🔴 Block User'}
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'properties' && (
            <div className="properties-pane animate-fade-in">
              <div className="table-wrapper">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Property Detail</th>
                      <th>Location</th>
                      <th>Rental Details</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map(p => (
                      <tr key={p.id}>
                        <td>
                          <div className="property-cell">
                            <img src={p.image} alt={p.title} className="prop-thumb" />
                            <div>
                              <strong>{p.title}</strong>
                              <p className="type">{p.type} • {p.beds} BHK</p>
                            </div>
                          </div>
                        </td>
                        <td>📍 {p.location}</td>
                        <td>
                          <p className="price">{p.price}</p>
                          <p className="deposit">Deposit: {p.deposit || '₹10,000'}</p>
                        </td>
                        <td>
                          <button 
                            onClick={() => handleDeleteProperty(p.id)}
                            className="action-btn-table ban"
                          >
                            🗑️ Remove Listing
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      <style>{`
        .admin-dashboard-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          min-height: 100vh;
        }
        .dashboard-header {
          margin-bottom: 2.5rem;
        }
        .dashboard-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
        }
        .dashboard-header p {
          color: #64748b;
          margin: 0.5rem 0 0 0;
          font-size: 1.1rem;
        }

        .tab-navigation {
          display: flex;
          gap: 1rem;
          margin-bottom: 2.5rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 1rem;
        }
        .tab-btn {
          padding: 0.75rem 1.5rem;
          border: none;
          background: none;
          font-size: 1rem;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          border-radius: 12px;
          transition: all 0.2s;
        }
        .tab-btn:hover {
          color: #0f172a;
          background: #f8fafc;
        }
        .tab-btn.active {
          color: white;
          background: #0f172a;
        }

        .loading-state {
          text-align: center;
          padding: 5rem;
          font-size: 1.25rem;
          color: #64748b;
        }

        /* Stats Grid */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .stat-card {
          background: white;
          padding: 2rem;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          position: relative;
        }
        .stat-card .icon {
          font-size: 2.5rem;
          position: absolute;
          top: 2rem;
          right: 2rem;
          opacity: 0.8;
        }
        .stat-card h3 {
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          margin: 0;
        }
        .stat-card .value {
          font-size: 2.25rem;
          font-weight: 800;
          color: #0f172a;
          margin-top: 0.75rem;
        }
        .stat-card .subtext {
          font-size: 0.85rem;
          color: #94a3b8;
          margin: 0.5rem 0 0 0;
        }

        /* Charts */
        .analytics-charts {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
        }
        .chart-card {
          background: white;
          padding: 2rem;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .chart-card h3 {
          margin: 0 0 1.5rem 0;
          font-size: 1.1rem;
          color: #1e293b;
        }

        .donut-chart-mock {
          display: flex;
          align-items: center;
          gap: 3rem;
        }
        .donut-circle {
          width: 140px;
          height: 140px;
          border-radius: 50%;
          background: conic-gradient(#4f46e5 0% 84%, #f43f5e 84% 100%);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .center-value {
          width: 100px;
          height: 100px;
          background: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 800;
          color: #0f172a;
        }
        .chart-legend {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
          font-size: 0.9rem;
        }
        .chart-legend .dot {
          display: inline-block;
          width: 12px;
          height: 12px;
          border-radius: 50%;
          margin-right: 0.5rem;
        }
        .chart-legend .dot.rent { background: #4f46e5; }
        .chart-legend .dot.deposit { background: #f43f5e; }

        .bar-chart-mock {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .bar-container {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .bar-label { width: 80px; font-size: 0.9rem; color: #475569; }
        .bar-track {
          flex: 1;
          height: 16px;
          background: #f1f5f9;
          border-radius: 99px;
          overflow: hidden;
        }
        .bar-fill { height: 100%; border-radius: 99px; }
        .bar-fill.available { background: #10b981; }
        .bar-fill.occupied { background: #3b82f6; }
        .bar-value { width: 40px; font-weight: 700; font-size: 0.9rem; text-align: right; }

        /* Tables */
        .table-wrapper {
          background: white;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }
        .admin-table th {
          background: #f8fafc;
          padding: 1rem 1.5rem;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          border-bottom: 1px solid #e2e8f0;
        }
        .admin-table td {
          padding: 1.25rem 1.5rem;
          border-bottom: 1px solid #f1f5f9;
          font-size: 0.9rem;
          color: #334155;
        }
        
        .user-profile-cell {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .avatar {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #4f46e5;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 1.1rem;
        }
        .user-id {
          margin: 0;
          font-size: 0.75rem;
          color: #94a3b8;
        }

        .role-badge {
          font-size: 0.7rem;
          font-weight: 800;
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
        }
        .role-badge.customer { background: #dbeafe; color: #1e40af; }
        .role-badge.owner { background: #fdf2f8; color: #9d174d; }
        .role-badge.admin { background: #fef3c7; color: #92400e; }

        .status-badge-dot {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
        }
        .status-badge-dot::before {
          content: '';
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .status-badge-dot.active::before { background: #10b981; }
        .status-badge-dot.blocked::before { background: #ef4444; }

        .action-btn-table {
          padding: 0.4rem 0.8rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: all 0.2s;
        }
        .action-btn-table.ban { background: #fee2e2; color: #b91c1c; }
        .action-btn-table.ban:hover { background: #fecaca; }
        .action-btn-table.unban { background: #dcfce7; color: #15803d; }
        .action-btn-table.unban:hover { background: #bbf7d0; }

        .property-cell {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .prop-thumb {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
        }
        .property-cell .type {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0.25rem 0 0 0;
        }
        
        .animate-fade-in {
          animation: fadeIn 0.3s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(5px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboardPage;

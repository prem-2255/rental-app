import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Tenant } from '../types';

const TenantListPage: React.FC = () => {
  const navigate = useNavigate();

  const [tenants, setTenants] = React.useState<Partial<Tenant>[]>([]);

  React.useEffect(() => {
    fetch('/api/tenants')
      .then(res => res.json())
      .then(data => setTenants(data))
      .catch(console.error);
  }, []);

  const handleViewTenant = (tenantId: string) => {
    navigate(`/owner/tenants/${tenantId}`);
  };

  return (
    <div className="tenant-list-page">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>Your Tenants</h1>
      </header>

      <div className="tenant-grid">
        {tenants.map(tenant => (
          <div key={tenant.id} className="tenant-card">
            <div className="tenant-avatar">
              {tenant.name?.charAt(0)}
            </div>
            <div className="tenant-info">
              <h3>{tenant.name}</h3>
              <p className="tenant-phone">{tenant.phone}</p>
              <div className="property-tag">Property ID: {tenant.propertyId}</div>
            </div>
            <button 
              className="view-details-btn"
              onClick={() => handleViewTenant(tenant.id!)}
            >
              View Full Profile
            </button>
          </div>
        ))}
      </div>

      <style>{`
        .tenant-list-page {
          padding: 2rem;
          max-width: 1000px;
          margin: 0 auto;
          min-height: 100vh;
        }
        .page-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .back-button {
          background: none;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 1rem;
          border-radius: 99px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-weight: 500;
          transition: all 0.2s;
        }
        .back-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .page-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
        }
        .tenant-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 2rem;
        }
        .tenant-card {
          background: white;
          padding: 2rem;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          transition: all 0.2s;
        }
        .tenant-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
        .tenant-avatar {
          width: 64px;
          height: 64px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          font-weight: 700;
          margin-bottom: 1rem;
        }
        .tenant-info h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #1e293b;
        }
        .tenant-phone {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0.5rem 0;
        }
        .property-tag {
          font-size: 0.75rem;
          background: #f1f5f9;
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          color: #475569;
          font-weight: 600;
          margin-top: 0.5rem;
        }
        .view-details-btn {
          margin-top: 2rem;
          width: 100%;
          padding: 0.75rem;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .view-details-btn:hover {
          background: #1e293b;
        }
      `}</style>
    </div>
  );
};

export default TenantListPage;

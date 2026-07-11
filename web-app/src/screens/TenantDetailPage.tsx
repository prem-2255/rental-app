import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import type { Tenant } from '../types';

const TenantDetailPage: React.FC = () => {
  const { tenantId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'docs' | 'agreement' | 'maintenance' | 'bills' | 'payments'>('docs');

  const [tenant, setTenant] = useState<Tenant | null>(null);

  React.useEffect(() => {
    if (!tenantId) return;
    fetch(`/api/tenants/${tenantId}`)
      .then(res => res.json())
      .then(data => setTenant(data))
      .catch(console.error);
  }, [tenantId]);

  const handleUpdateStatus = async (requestId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/maintenance/${requestId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        setTenant(prev => {
          if (!prev) return null;
          return {
            ...prev,
            maintenance: prev.maintenance.map(m => m.id === requestId ? { ...m, status: newStatus as any } : m)
          };
        });
      } else {
        alert('Failed to update maintenance status');
      }
    } catch (err) {
      console.error(err);
      alert('Error updating status');
    }
  };

  if (!tenant) {
    return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading tenant profile...</div>;
  }

  const tabs = [
    { id: 'docs', label: 'Documents', icon: '📄' },
    { id: 'agreement', label: 'Agreement', icon: '📜' },
    { id: 'maintenance', label: 'Maintenance', icon: '🛠️' },
    { id: 'bills', label: 'Electricity', icon: '⚡' },
    { id: 'payments', label: 'Payments', icon: '💳' },
  ];

  return (
    <div className="tenant-detail-page">
      <header className="page-header">
        <button onClick={() => navigate('/owner/tenants')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <div className="tenant-profile-header">
          <div className="tenant-avatar">{tenant.name.charAt(0)}</div>
          <div className="tenant-main-info">
            <h1>{tenant.name}</h1>
            <p>{tenant.email} • {tenant.phone}</p>
          </div>
        </div>
      </header>

      <div className="detail-container">
        <nav className="detail-tabs">
          {tabs.map(tab => (
            <button 
              key={tab.id}
              className={`tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as any)}
            >
              <span className="tab-icon">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>

        <div className="tab-content">
          {activeTab === 'docs' && (
            <div className="content-section">
              <h3>Uploaded Documents</h3>
              <div className="doc-list">
                {tenant.documents.map(doc => (
                  <div key={doc.id} className="detail-card doc-item">
                    <div className="doc-info">
                      <span className="doc-icon">📄</span>
                      <div>
                        <div className="doc-name">{doc.name}</div>
                        <div className="doc-date">Uploaded: {doc.date}</div>
                      </div>
                    </div>
                    <div className={`status-pill ${doc.status.toLowerCase()}`}>{doc.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'agreement' && (
            <div className="content-section">
              <h3>Lease Agreement</h3>
              <div className="detail-card info-grid">
                <div className="info-item">
                  <label>Status</label>
                  <span className="status-pill verified">{tenant.agreement.status}</span>
                </div>
                <div className="info-item">
                  <label>Renewal Date</label>
                  <span className="highlight-text">{tenant.agreement.renewalDate}</span>
                </div>
                <div className="info-item">
                  <label>Signed Date</label>
                  <span>{tenant.agreement.signedDate}</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'maintenance' && (
            <div className="content-section">
              <h3>Maintenance History</h3>
              <div className="maintenance-list">
                {tenant.maintenance.map(req => (
                  <div key={req.id} className="detail-card maintenance-item">
                    <div className="maintenance-header">
                      <span className={`status-pill ${req.status.toLowerCase().replace(' ', '-')}`}>{req.status}</span>
                      <span className="req-date">{req.date}</span>
                    </div>
                    <h4>{req.type}</h4>
                    <p>{req.description}</p>
                    
                    {req.status !== 'Resolved' && (
                      <div className="maintenance-actions" style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                        {req.status === 'Reported' && (
                          <button 
                            className="status-action-btn start" 
                            onClick={() => handleUpdateStatus(req.id, 'In Progress')}
                            style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                          >
                            ⚙️ Start Progress
                          </button>
                        )}
                        <button 
                          className="status-action-btn resolve" 
                          onClick={() => handleUpdateStatus(req.id, 'Resolved')}
                          style={{ background: '#10b981', color: 'white', border: 'none', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 'bold' }}
                        >
                          ✅ Resolve Issue
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'bills' && (
            <div className="content-section">
              <h3>Electricity Bills</h3>
              <div className="bill-list">
                {tenant.electricity.map(bill => (
                  <div key={bill.id} className="detail-card bill-item">
                    <div className="bill-info">
                      <span className="bill-month">{bill.month}</span>
                      <span className="bill-amount">{bill.amount}</span>
                    </div>
                    <div className={`status-pill ${bill.status.toLowerCase()}`}>{bill.status}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="content-section">
              <h3>Recent Payments</h3>
              <div className="payment-list">
                {tenant.payments.map(pay => (
                  <div key={pay.id} className="detail-card payment-item">
                    <div className="payment-info">
                      <span className="pay-type">{pay.type} Payment</span>
                      <span className="pay-date">{pay.date}</span>
                    </div>
                    <span className="pay-amount">{pay.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <style>{`
        .tenant-detail-page {
          padding: 2rem;
          max-width: 1100px;
          margin: 0 auto;
          min-height: 100vh;
        }
        .page-header {
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
          margin-bottom: 2rem;
        }
        .back-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }
        .tenant-profile-header {
          display: flex;
          align-items: center;
          gap: 2rem;
        }
        .tenant-avatar {
          width: 80px;
          height: 80px;
          background: #3b82f6;
          color: white;
          border-radius: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
          font-weight: 800;
        }
        .tenant-main-info h1 {
          margin: 0;
          font-size: 2.5rem;
          color: #1e293b;
        }
        .tenant-main-info p {
          margin: 0.5rem 0 0;
          color: #64748b;
          font-size: 1.125rem;
        }
        .detail-container {
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 3rem;
        }
        .detail-tabs {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }
        .tab-btn {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem 1.5rem;
          border: 1px solid transparent;
          background: white;
          border-radius: 16px;
          cursor: pointer;
          font-weight: 600;
          color: #64748b;
          transition: all 0.2s;
          text-align: left;
        }
        .tab-btn:hover {
          background: #f8fafc;
          color: #1e293b;
        }
        .tab-btn.active {
          background: #eff6ff;
          color: #2563eb;
          border-color: #bfdbfe;
        }
        .tab-icon {
          font-size: 1.25rem;
        }
        .content-section h3 {
          margin: 0 0 2rem;
          font-size: 1.5rem;
          color: #1e293b;
        }
        .detail-card {
          background: white;
          padding: 1.5rem;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          margin-bottom: 1rem;
        }
        .doc-item, .bill-item, .payment-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .doc-info, .bill-info, .payment-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .doc-name, .bill-month, .pay-type {
          font-weight: 700;
          color: #1e293b;
          display: block;
        }
        .doc-date, .bill-amount, .pay-date {
          font-size: 0.875rem;
          color: #64748b;
        }
        .status-pill {
          padding: 0.35rem 1rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-pill.verified, .status-pill.paid { background: #dcfce7; color: #15803d; }
        .status-pill.pending, .status-pill.unpaid, .status-pill.in-progress { background: #fef9c3; color: #854d0e; }
        .status-pill.reported { background: #fee2e2; color: #b91c1c; }
        
        .info-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2rem;
        }
        .info-item label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }
        .highlight-text {
          font-size: 1.5rem;
          font-weight: 800;
          color: #2563eb;
        }
        .maintenance-item h4 {
          margin: 0.75rem 0 0.5rem;
          font-size: 1.125rem;
        }
        .pay-amount {
          font-weight: 800;
          color: #059669;
          font-size: 1.125rem;
        }

        @media (max-width: 900px) {
          .detail-container {
            grid-template-columns: 1fr;
          }
          .detail-tabs {
            flex-direction: row;
            overflow-x: auto;
            padding-bottom: 1rem;
          }
          .tab-btn {
            white-space: nowrap;
          }
        }
      `}</style>
    </div>
  );
};

export default TenantDetailPage;

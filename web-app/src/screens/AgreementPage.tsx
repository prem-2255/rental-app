import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AgreementPage: React.FC = () => {
  const navigate = useNavigate();
  const [agreement, setAgreement] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [sigName, setSigName] = useState('');
  const [isSigning, setIsSigning] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const u = JSON.parse(stored);
      fetchAgreement(u.id);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAgreement = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/tenants/${tenantId}`);
      const data = await res.json();
      if (data && data.agreement) {
        setAgreement(data.agreement);
      } else {
        // Mock create an initial draft agreement if none exists
        const createRes = await fetch('/api/agreement', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            tenantId,
            rent: '₹21,000/mo',
            deposit: '₹42,000',
            duration: 11,
            terms: '1. Renter agrees to pay rent on or before 5th of each month.\n2. Renter shall maintain property cleanliness.\n3. Renter shall not make structural alterations without prior consent.'
          })
        });
        const newAgreement = await createRes.json();
        setAgreement(newAgreement);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!sigName.trim() || !agreement) return;
    setIsSigning(true);
    try {
      const res = await fetch(`/api/agreement/${agreement.id}/sign`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signature: sigName,
          role: 'tenant'
        })
      });
      const data = await res.json();
      setAgreement(data);
      alert('Agreement signed digitally!');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSigning(false);
    }
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  return (
    <div className="agreement-page">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>Digital Rental Agreement</h1>
      </header>

      {loading ? (
        <div className="loading-state">Accessing secure agreement escrow...</div>
      ) : !agreement ? (
        <div className="empty-state">No active lease agreement found. Contact owner.</div>
      ) : (
        <div className="agreement-container">
          <div className="renewal-alert">
            <div className="alert-icon">🔔</div>
            <div className="alert-text">
              <h4>Renewal Reminder</h4>
              <p>Your agreement expires on <strong>{agreement.renewalDate}</strong>. Renewal notifications are sent automatically.</p>
            </div>
            <button className="renew-now-btn" onClick={() => alert('Renewal request dispatched to Owner!')}>Ask Renewal</button>
          </div>

          <div className="agreement-details-card">
            <div className="card-header">
              <div className="doc-icon">📜</div>
              <div>
                <h3>Residential Lease Agreement ({agreement.duration} Months)</h3>
                <p className="property-name">Rented Property Premises</p>
              </div>
              <div className={`status-badge ${agreement.status.toLowerCase().replace(' ', '-')}`}>
                {agreement.status}
              </div>
            </div>

            <div className="details-grid">
              <div className="detail-item">
                <label>Agreement Draft Date</label>
                <span>{agreement.signedDate}</span>
              </div>
              <div className="detail-item">
                <label>Lease Expiry Date</label>
                <span>{agreement.renewalDate}</span>
              </div>
              <div className="detail-item">
                <label>Rent amount</label>
                <span>{agreement.rent || '₹21,000/mo'}</span>
              </div>
              <div className="detail-item">
                <label>Escrow Security Deposit</label>
                <span>{agreement.deposit || '₹42,000'}</span>
              </div>
              
              <div className="detail-item highlights">
                <label>Lease Terms & Conditions</label>
                <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', color: '#475569', lineHeight: '1.6' }}>
                  {agreement.terms || 'Standard residential terms apply.'}
                </div>
              </div>

              <div className="detail-item">
                <label>Owner Digital Signature</label>
                <span style={{ fontFamily: 'Dancing Script, cursive', color: '#3b82f6' }}>
                  {agreement.ownerSignature || 'Pending Owner Signature'}
                </span>
              </div>

              <div className="detail-item">
                <label>Tenant Digital Signature</label>
                {agreement.tenantSignature ? (
                  <span style={{ fontFamily: 'Dancing Script, cursive', color: '#10b981', fontSize: '1.5rem' }}>
                    ✍️ {agreement.tenantSignature}
                  </span>
                ) : (
                  <div className="sign-box">
                    <input 
                      type="text" 
                      placeholder="Type name to sign digitally" 
                      value={sigName}
                      onChange={(e) => setSigName(e.target.value)}
                      style={{ padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '8px', fontSize: '0.9rem', outline: 'none' }}
                    />
                    <button 
                      onClick={handleSign} 
                      disabled={!sigName.trim() || isSigning}
                      className="sign-action-btn"
                    >
                      {isSigning ? 'Signing...' : 'Sign Lease'}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="card-actions">
              <button className="download-btn" onClick={handleDownloadPDF}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                  <polyline points="7 10 12 15 17 10"></polyline>
                  <line x1="12" y1="15" x2="12" y2="3"></line>
                </svg>
                Print & Export PDF
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .agreement-page {
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
        .agreement-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .renewal-alert {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 1.5rem 2rem;
          background: #fff7ed;
          border-radius: 20px;
          border: 1px solid #ffedd5;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .alert-icon { font-size: 2rem; }
        .alert-text { flex: 1; }
        .alert-text h4 { color: #9a3412; margin: 0; font-size: 1.125rem; }
        .alert-text p { color: #c2410c; margin: 0.25rem 0 0; }
        .renew-now-btn {
          padding: 0.75rem 1.5rem;
          background: #ea580c;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .renew-now-btn:hover {
          background: #c2410c;
          transform: translateY(-2px);
        }
        .agreement-details-card {
          background: white;
          border-radius: 32px;
          padding: 3rem;
          border: 1px solid #f1f5f9;
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05);
        }
        .card-header {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .doc-icon {
          font-size: 3rem;
          background: #f8fafc;
          padding: 1rem;
          border-radius: 20px;
        }
        .card-header h3 {
          font-size: 1.75rem;
          color: #1e293b;
          margin: 0;
        }
        .property-name {
          color: #64748b;
          font-size: 1.125rem;
          margin: 0.25rem 0 0;
        }
        .status-badge {
          margin-left: auto;
          background: #fee2e2;
          color: #991b1b;
          padding: 0.5rem 1.25rem;
          border-radius: 99px;
          font-weight: 700;
          font-size: 0.875rem;
        }
        .status-badge.active { background: #dcfce7; color: #15803d; }
        .status-badge.partially-signed { background: #fef08a; color: #854d0e; }
        .details-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 2.5rem;
          margin-bottom: 3rem;
        }
        .detail-item {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .detail-item label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }
        .detail-item span {
          font-size: 1.25rem;
          font-weight: 600;
          color: #334155;
        }
        .detail-item.highlights {
          grid-column: span 2;
          background: #f8fafc;
          padding: 1.5rem;
          border-radius: 16px;
        }
        .card-actions {
          display: flex;
          gap: 1rem;
        }
        .download-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
          padding: 1.25rem;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .download-btn:hover { background: #1e293b; }
        .sign-box {
          display: flex;
          gap: 0.5rem;
          align-items: center;
        }
        .sign-action-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          font-weight: 700;
        }
        .sign-action-btn:hover { background: #059669; }
      `}</style>
    </div>
  );
};

export default AgreementPage;

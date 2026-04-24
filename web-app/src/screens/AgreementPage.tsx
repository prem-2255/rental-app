import React from 'react';
import { useNavigate } from 'react-router-dom';

const AgreementPage: React.FC = () => {
  const navigate = useNavigate();
  
  const agreementData = {
    title: 'Residential Lease Agreement',
    property: "Prem's House",
    signedDate: '2025-04-01',
    expiryDate: '2026-03-31',
    renewalDate: '2026-03-15',
    status: 'Active',
    monthlyRent: '₹2,100',
    deposit: '₹4,200',
  };

  const daysToRenewal = Math.ceil((new Date(agreementData.renewalDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24));

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
        <h1>Rental Agreement</h1>
      </header>

      <div className="agreement-container">
        <div className="renewal-alert">
          <div className="alert-icon">🔔</div>
          <div className="alert-text">
            <h4>Renewal Reminder</h4>
            <p>Your agreement is due for renewal on <strong>{agreementData.renewalDate}</strong> (in {daysToRenewal} days).</p>
          </div>
          <button className="renew-now-btn">Renew Now</button>
        </div>

        <div className="agreement-details-card">
          <div className="card-header">
            <div className="doc-icon">📜</div>
            <div>
              <h3>{agreementData.title}</h3>
              <p className="property-name">{agreementData.property}</p>
            </div>
            <div className="status-badge">{agreementData.status}</div>
          </div>

          <div className="details-grid">
            <div className="detail-item">
              <label>Signed Date</label>
              <span>{agreementData.signedDate}</span>
            </div>
            <div className="detail-item">
              <label>Expiry Date</label>
              <span>{agreementData.expiryDate}</span>
            </div>
            <div className="detail-item highlights">
              <label>Renewal Date</label>
              <span className="renewal-date-highlight">{agreementData.renewalDate}</span>
            </div>
            <div className="detail-item">
              <label>Monthly Rent</label>
              <span>{agreementData.monthlyRent}</span>
            </div>
            <div className="detail-item">
              <label>Security Deposit</label>
              <span>{agreementData.deposit}</span>
            </div>
          </div>

          <div className="card-actions">
            <button className="download-btn">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Download PDF
            </button>
            <button className="view-btn">View Full Document</button>
          </div>
        </div>
      </div>

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
        .alert-icon {
          font-size: 2rem;
        }
        .alert-text {
          flex: 1;
        }
        .alert-text h4 {
          color: #9a3412;
          margin: 0;
          font-size: 1.125rem;
        }
        .alert-text p {
          color: #c2410c;
          margin: 0.25rem 0 0;
        }
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
          background: #dcfce7;
          color: #15803d;
          padding: 0.5rem 1.25rem;
          border-radius: 99px;
          font-weight: 700;
          font-size: 0.875rem;
        }
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
        .renewal-date-highlight {
          color: #2563eb !important;
          font-size: 1.5rem !important;
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
          padding: 1rem;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 16px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .view-btn {
          flex: 1;
          padding: 1rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          font-weight: 700;
          color: #475569;
          cursor: pointer;
          transition: all 0.2s;
        }
        .download-btn:hover {
          background: #1e293b;
        }
        .view-btn:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
        }
      `}</style>
    </div>
  );
};

export default AgreementPage;

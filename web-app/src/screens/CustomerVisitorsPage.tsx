import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface Visitor {
  id: string;
  name: string;
  phone: string;
  qrCode: string;
  status: string;
  entryTime?: string;
  exitTime?: string;
}

const CustomerVisitorsPage: React.FC = () => {
  const navigate = useNavigate();
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [userId, setUserId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const u = JSON.parse(stored);
      setUserId(u.id);
      loadVisitors(u.id);
    }
  }, []);

  const loadVisitors = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/visitors/tenant/${tenantId}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setVisitors(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !userId) return;
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/visitors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, tenantId: userId })
      });
      const data = await res.json();
      setVisitors(prev => [data, ...prev]);
      setSelectedVisitor(data);
      setName('');
      setPhone('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="customer-visitors-page">
      <header className="page-header">
        <button onClick={() => navigate('/customer')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>Visitor Pass Management</h1>
      </header>

      <div className="visitor-container">
        <div className="invite-section">
          <div className="card">
            <h2>Generate Guest Pass</h2>
            <p className="card-subtitle">Register your visitor's details to generate a secure entry QR code.</p>

            <form onSubmit={handleInvite} className="invite-form">
              <div className="form-group">
                <label>Visitor Name</label>
                <input 
                  type="text" 
                  placeholder="E.g. Jane Doe" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Mobile Number</label>
                <input 
                  type="tel" 
                  placeholder="10-digit mobile number" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} 
                  required 
                />
              </div>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Creating pass...' : 'Generate Invite QR'}
              </button>
            </form>
          </div>
        </div>

        <div className="history-section">
          <h2>Active & Past Guest Passes</h2>
          <div className="visitors-list">
            {visitors.length === 0 ? (
              <p style={{ fontStyle: 'italic', color: '#94a3b8' }}>No visitors registered yet.</p>
            ) : (
              visitors.map(v => (
                <div key={v.id} className="visitor-card" onClick={() => setSelectedVisitor(v)}>
                  <div className="visitor-main">
                    <div className="visitor-avatar">{v.name.charAt(0)}</div>
                    <div>
                      <h3>{v.name}</h3>
                      <p className="phone">📞 {v.phone}</p>
                    </div>
                  </div>
                  <span className={`status-pill ${v.status.toLowerCase()}`}>
                    {v.status}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {selectedVisitor && (
        <div className="modal-overlay" onClick={() => setSelectedVisitor(null)}>
          <div className="qr-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Gate Pass QR Code</h2>
              <button className="close-x" onClick={() => setSelectedVisitor(null)}>&times;</button>
            </div>
            <div className="modal-body text-center">
              <p>Share this QR Code with <strong>{selectedVisitor.name}</strong> for entry authorization.</p>
              
              <div className="qr-box">
                {/* Simulated QR Code Graphic */}
                <div className="qr-graphic">
                  <div className="qr-finder top-left"></div>
                  <div className="qr-finder top-right"></div>
                  <div className="qr-finder bottom-left"></div>
                  <div className="qr-dots-matrix"></div>
                  <div className="qr-code-text">{selectedVisitor.qrCode}</div>
                </div>
              </div>
              
              <div className="visitor-meta-details">
                <p>Status: <strong className={selectedVisitor.status.toLowerCase()}>{selectedVisitor.status}</strong></p>
                {selectedVisitor.entryTime && <p>Entry: {new Date(selectedVisitor.entryTime).toLocaleTimeString()}</p>}
                {selectedVisitor.exitTime && <p>Exit: {new Date(selectedVisitor.exitTime).toLocaleTimeString()}</p>}
              </div>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .customer-visitors-page {
          padding: 2rem;
          max-width: 1100px;
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
        .visitor-container {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 3rem;
        }
        .card {
          background: white;
          padding: 2.5rem;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .card-subtitle {
          color: #64748b;
          margin-bottom: 2rem;
          font-size: 0.875rem;
        }
        .invite-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #475569;
        }
        input {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 1rem;
          outline: none;
        }
        input:focus {
          border-color: #3b82f6;
          background: white;
        }
        .submit-btn {
          padding: 1rem;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .submit-btn:hover { background: #1e293b; }

        .visitors-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .visitor-card {
          background: white;
          padding: 1.25rem;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          display: flex;
          justify-content: space-between;
          align-items: center;
          cursor: pointer;
          transition: transform 0.2s;
        }
        .visitor-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 10px rgba(0,0,0,0.05);
        }
        .visitor-main {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .visitor-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: #ec4899;
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .visitor-main h3 { margin: 0; font-size: 1rem; color: #1e293b; }
        .visitor-main .phone { margin: 0.25rem 0 0; color: #64748b; font-size: 0.85rem; }

        .status-pill {
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-pill.invited { background: #fef3c7; color: #d97706; }
        .status-pill.entered { background: #dcfce7; color: #15803d; }
        .status-pill.exited { background: #f1f5f9; color: #475569; }

        /* Modal */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.75);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1100;
        }
        .qr-modal {
          background: white;
          width: 90%;
          max-width: 400px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }
        .modal-header {
          padding: 1.25rem 1.5rem;
          display: flex;
          justify-content: space-between;
          border-bottom: 1px solid #f1f5f9;
        }
        .modal-header h2 { margin: 0; font-size: 1.25rem; }
        .close-x { background: none; border: none; font-size: 1.5rem; color: #94a3b8; cursor: pointer; }
        .modal-body { padding: 2rem; text-align: center; }
        
        .qr-box {
          margin: 1.5rem 0;
          display: flex;
          justify-content: center;
        }
        .qr-graphic {
          width: 200px;
          height: 200px;
          border: 12px solid #0f172a;
          border-radius: 20px;
          padding: 10px;
          position: relative;
        }
        .qr-finder {
          width: 40px;
          height: 40px;
          border: 8px solid #0f172a;
          position: absolute;
        }
        .qr-finder.top-left { top: 10px; left: 10px; }
        .qr-finder.top-right { top: 10px; right: 10px; }
        .qr-finder.bottom-left { bottom: 10px; left: 10px; }
        .qr-dots-matrix {
          width: 100%;
          height: 100%;
          background: radial-gradient(circle, #0f172a 30%, transparent 30%) 0 0/10px 10px;
          opacity: 0.85;
        }
        .qr-code-text {
          position: absolute;
          bottom: 25px;
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          color: white;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.05em;
        }
        
        .visitor-meta-details p { margin: 0.5rem 0; font-size: 0.9rem; }
        .visitor-meta-details strong.invited { color: #d97706; }
        .visitor-meta-details strong.entered { color: #15803d; }
        .visitor-meta-details strong.exited { color: #475569; }
      `}</style>
    </div>
  );
};

export default CustomerVisitorsPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSocket } from '../socketService';

interface MaintenanceRequest {
  id: string;
  type: string;
  description: string;
  status: 'Open' | 'Assigned' | 'In Progress' | 'Resolved' | 'Closed';
  date: string;
  servicePerson?: string;
  resolutionNotes?: string;
}

const MaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('General');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const user = JSON.parse(stored);
      setUserId(user.id);
      loadMaintenance(user.id);
    }
  }, []);

  const loadMaintenance = async (tenantId: string) => {
    try {
      const res = await fetch(`/api/tenants/${tenantId}/maintenance`);
      const data = await res.json();
      if (Array.isArray(data)) setRequests(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleMaintenanceUpdate = (data: any) => {
      setRequests(prev => {
        const exists = prev.some(r => r.id === data.id);
        if (exists) {
          alert(`🛠️ Maintenance update: Your "${data.type}" request status is now "${data.status}"!`);
          return prev.map(r => r.id === data.id ? { ...r, status: data.status } : r);
        }
        return prev;
      });
    };

    socket.on('maintenance-update', handleMaintenanceUpdate);
    return () => {
      socket.off('maintenance-update', handleMaintenanceUpdate);
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return;
    setIsSubmitting(true);

    try {
      const newRequest = {
        type: issueType,
        description,
        status: 'Open',
        date: new Date().toLocaleDateString()
      };

      const res = await fetch(`/api/tenants/${userId}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });
      const savedRequest = await res.json();

      setRequests(prev => [savedRequest, ...prev]);
      setDescription('');
      setIssueType('General');
      alert('Maintenance complaint successfully filed!');
    } catch (err) {
      console.error(err);
      alert('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="maintenance-page">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>Maintenance Hub</h1>
      </header>

      <div className="maintenance-container">
        <div className="request-form-section">
          <div className="card">
            <h2>File a Complaint</h2>
            <p className="card-subtitle">Select a category and describe the issue. Our team will verify and resolve it shortly.</p>
            
            <form onSubmit={handleSubmit} className="maintenance-form">
              <div className="form-group">
                <label>Category</label>
                <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
                  <option value="General">General Issue</option>
                  <option value="Roof Leakage">Roof/Wall Leakage</option>
                  <option value="Plumbing">Plumbing & Water</option>
                  <option value="Electrical">Electrical Repairs</option>
                  <option value="Appliance">AC, TV or Refrigerator</option>
                  <option value="Furniture">Bed or Sofa Damage</option>
                </select>
              </div>

              <div className="form-group">
                <label>Details & Description</label>
                <textarea 
                  placeholder="Tell us what needs fixing. E.g. Kitchen tap is leaking when turned on..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Filing Complaint...' : 'Submit Complaint'}
              </button>
            </form>
          </div>
        </div>

        <div className="active-requests-section">
          <h2>Complaint Tracking Status</h2>
          <div className="requests-list">
            {requests.length === 0 ? (
              <p style={{ color: '#94a3b8', fontStyle: 'italic' }}>No complaints filed yet.</p>
            ) : (
              requests.map(req => (
                <div key={req.id} className="request-card-item">
                  <div className="request-details">
                    <div className="request-header">
                      <span className={`status-pill ${req.status.toLowerCase().replace(' ', '-')}`}>
                        {req.status}
                      </span>
                      <span className="request-date">{req.date}</span>
                    </div>
                    <h3>{req.type}</h3>
                    <p className="desc">{req.description}</p>
                    
                    {req.servicePerson && (
                      <div className="assignee-box">
                        🛠️ <strong>Assigned Service Rep:</strong> {req.servicePerson}
                      </div>
                    )}
                    
                    {req.resolutionNotes && (
                      <div className="notes-box">
                        📝 <strong>Resolution Details:</strong> {req.resolutionNotes}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <style>{`
        .maintenance-page {
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
        .maintenance-container {
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
        h2 {
          margin: 0 0 0.5rem;
          font-size: 1.5rem;
          color: #1e293b;
        }
        .card-subtitle {
          color: #64748b;
          margin-bottom: 2rem;
          font-size: 0.875rem;
        }
        .maintenance-form {
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
          letter-spacing: 0.05em;
        }
        select, textarea {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
        }
        textarea {
          min-height: 120px;
          resize: vertical;
        }
        select:focus, textarea:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .submit-btn {
          padding: 1rem;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .submit-btn:hover {
          background: #1e293b;
          transform: translateY(-2px);
        }
        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .request-card-item {
          background: white;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
          overflow: hidden;
        }
        .request-details {
          padding: 1.25rem;
        }
        .request-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .status-pill {
          padding: 0.35rem 0.75rem;
          border-radius: 99px;
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-pill.open { background: #fee2e2; color: #b91c1c; }
        .status-pill.assigned { background: #e0f2fe; color: #0369a1; }
        .status-pill.in-progress { background: #fef9c3; color: #854d0e; }
        .status-pill.resolved { background: #dcfce7; color: #15803d; }
        
        .request-date { font-size: 0.75rem; color: #94a3b8; }
        .request-details h3 { font-size: 1.15rem; margin: 0 0 0.5rem 0; color: #0f172a; }
        .request-details .desc { font-size: 0.9rem; color: #475569; margin: 0 0 1rem 0; }
        
        .assignee-box {
          font-size: 0.8rem;
          background: #f0fdf4;
          padding: 0.5rem;
          border-radius: 8px;
          color: #14532d;
          margin-top: 0.5rem;
        }
        .notes-box {
          font-size: 0.8rem;
          background: #f8fafc;
          padding: 0.5rem;
          border-radius: 8px;
          color: #334155;
          margin-top: 0.5rem;
        }

        @media (max-width: 900px) {
          .maintenance-container {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default MaintenancePage;

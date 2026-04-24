import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface MaintenanceRequest {
  id: string;
  type: string;
  description: string;
  status: 'Reported' | 'In Progress' | 'Resolved';
  date: string;
  image?: string;
}

const MaintenancePage: React.FC = () => {
  const navigate = useNavigate();
  const [description, setDescription] = useState('');
  const [issueType, setIssueType] = useState('General');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [requests, setRequests] = useState<MaintenanceRequest[]>([]);

  React.useEffect(() => {
    fetch('/api/tenants')
      .then(res => res.json())
      .then(tenants => {
        if (tenants.length > 0) {
          return fetch(`/api/tenants/${tenants[0].id}/maintenance`);
        }
        return [];
      })
      .then(res => {
        if (Array.isArray(res)) return res;
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setRequests(data);
      })
      .catch(console.error);
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get the mock tenant first
      const tenantsRes = await fetch('/api/tenants');
      const tenants = await tenantsRes.json();
      if (!tenants || tenants.length === 0) throw new Error("No tenant found");

      const tenantId = tenants[0].id;
      
      const newRequest = {
        type: issueType,
        description,
        status: 'Reported',
        date: new Date().toISOString().split('T')[0],
        image: selectedImage || undefined
      };

      const res = await fetch(`/api/tenants/${tenantId}/maintenance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest)
      });
      const savedRequest = await res.json();

      setRequests(prev => [savedRequest, ...prev]);
      setDescription('');
      setSelectedImage(null);
      setIssueType('General');
      alert('Maintenance request submitted successfully!');
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
        <h1>Maintenance Support</h1>
      </header>

      <div className="maintenance-container">
        <div className="request-form-section">
          <div className="card">
            <h2>Report an Issue</h2>
            <p className="card-subtitle">Tell us what needs fixing and we'll send help right away.</p>
            
            <form onSubmit={handleSubmit} className="maintenance-form">
              <div className="form-group">
                <label>Issue Type</label>
                <select value={issueType} onChange={(e) => setIssueType(e.target.value)}>
                  <option value="General">General Issue</option>
                  <option value="Roof Leakage">Roof Leakage</option>
                  <option value="Tank Leakage">Tank Leakage</option>
                  <option value="Cracks">Wall/Floor Cracks</option>
                  <option value="Electrical">Electrical Issue</option>
                  <option value="Plumbing">Plumbing</option>
                </select>
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea 
                  placeholder="Describe the problem in detail (e.g. Roof is leaking in the bedroom...)" 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label>Photo Evidence</label>
                <div className="photo-upload-container">
                  {selectedImage ? (
                    <div className="image-preview">
                      <img src={selectedImage} alt="Preview" />
                      <button type="button" className="remove-img" onClick={() => setSelectedImage(null)}>&times;</button>
                    </div>
                  ) : (
                    <label className="image-placeholder">
                      <input type="file" accept="image/*" onChange={handleImageChange} style={{ display: 'none' }} />
                      <div className="upload-btn-visual">
                        <span>📸</span>
                        <p>Click to add a photo</p>
                      </div>
                    </label>
                  )}
                </div>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          </div>
        </div>

        <div className="active-requests-section">
          <h2>Active Requests</h2>
          <div className="requests-list">
            {requests.map(req => (
              <div key={req.id} className="request-card">
                {req.image && (
                  <div className="request-image">
                    <img src={req.image} alt="Issue" />
                  </div>
                )}
                <div className="request-details">
                  <div className="request-header">
                    <span className={`status-pill ${req.status.toLowerCase().replace(' ', '-')}`}>
                      {req.status}
                    </span>
                    <span className="request-date">{req.date}</span>
                  </div>
                  <h3>{req.type}</h3>
                  <p>{req.description}</p>
                </div>
              </div>
            ))}
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
        .photo-upload-container {
          height: 180px;
          border-radius: 16px;
          border: 2px dashed #cbd5e1;
          overflow: hidden;
          background: #f1f5f9;
        }
        .image-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }
        .upload-btn-visual {
          text-align: center;
        }
        .upload-btn-visual span {
          font-size: 2.5rem;
        }
        .upload-btn-visual p {
          margin: 0.5rem 0 0;
          font-weight: 600;
          color: #64748b;
        }
        .image-preview {
          position: relative;
          width: 100%;
          height: 100%;
        }
        .image-preview img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .remove-img {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: rgba(0, 0, 0, 0.5);
          color: white;
          border: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
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
        .submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }
        .requests-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          margin-top: 1.5rem;
        }
        .request-card {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          border: 1px solid #f1f5f9;
          display: flex;
          gap: 1rem;
        }
        .request-image {
          width: 120px;
          height: 120px;
          flex-shrink: 0;
        }
        .request-image img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .request-details {
          padding: 1.25rem;
          flex: 1;
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
        .status-reported { background: #fee2e2; color: #b91c1c; }
        .status-in-progress { background: #fef9c3; color: #854d0e; }
        .status-resolved { background: #dcfce7; color: #15803d; }
        .request-date { font-size: 0.75rem; color: #94a3b8; }
        .request-details h3 { font-size: 1rem; margin: 0 0 0.25rem; }
        .request-details p { font-size: 0.875rem; color: #64748b; margin: 0; }

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

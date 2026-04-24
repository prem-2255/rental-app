import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface UserDoc {
  id: string;
  name: string;
  type: string;
  status: 'Pending' | 'Verified' | 'Rejected';
  date: string;
}

const DocumentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<UserDoc[]>([
    { id: '1', name: 'Identity Card', type: 'ID_CARD', status: 'Verified', date: '2026-03-20' },
  ]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsUploading(true);
      setTimeout(() => {
        const newDoc: UserDoc = {
          id: Date.now().toString(),
          name: file.name,
          type: 'DOCUMENT',
          status: 'Pending',
          date: new Date().toISOString().split('T')[0],
        };
        setDocuments(prev => [newDoc, ...prev]);
        setIsUploading(false);
      }, 2000);
    }
  };

  return (
    <div className="documents-page">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>My Documents</h1>
      </header>

      <div className="upload-section">
        <label className="upload-card">
          <input type="file" onChange={handleFileUpload} style={{ display: 'none' }} />
          <div className="upload-icon">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="17 8 12 3 7 8"></polyline>
              <line x1="12" y1="3" x2="12" y2="15"></line>
            </svg>
          </div>
          <h3>Upload Identity Proof</h3>
          <p>Support JPG, PNG, PDF up to 5MB</p>
          {isUploading && <div className="upload-loader">Uploading...</div>}
        </label>
      </div>

      <div className="documents-list">
        <h3>Your Uploaded Documents</h3>
        <div className="doc-grid">
          {documents.map(doc => (
            <div key={doc.id} className="doc-item">
              <div className="doc-info">
                <div className="doc-type-icon">📄</div>
                <div>
                  <div className="doc-name">{doc.name}</div>
                  <div className="doc-meta">{doc.date} • {doc.type}</div>
                </div>
              </div>
              <div className={`doc-status status-${doc.status.toLowerCase()}`}>
                {doc.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .documents-page {
          padding: 2rem;
          max-width: 900px;
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
        .upload-section {
          margin-bottom: 4rem;
        }
        .upload-card {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 4rem 2rem;
          border: 2px dashed #cbd5e1;
          border-radius: 24px;
          background: #f8fafc;
          cursor: pointer;
          transition: all 0.3s;
        }
        .upload-card:hover {
          border-color: #3b82f6;
          background: #f0f9ff;
        }
        .upload-icon {
          margin-bottom: 1.5rem;
          background: white;
          padding: 1.5rem;
          border-radius: 50%;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }
        .upload-card h3 {
          font-size: 1.25rem;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }
        .upload-card p {
          color: #64748b;
          font-size: 0.875rem;
        }
        .upload-loader {
          margin-top: 1rem;
          font-weight: 600;
          color: #3b82f6;
        }
        .documents-list h3 {
          font-size: 1.5rem;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }
        .doc-grid {
          display: grid;
          gap: 1rem;
        }
        .doc-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1.25rem;
          background: white;
          border-radius: 16px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
        }
        .doc-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .doc-type-icon {
          font-size: 2rem;
        }
        .doc-name {
          font-weight: 600;
          color: #1e293b;
        }
        .doc-meta {
          color: #64748b;
          font-size: 0.75rem;
        }
        .doc-status {
          padding: 0.4rem 1rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-verified {
          background: #dcfce7;
          color: #15803d;
        }
        .status-pending {
          background: #fef9c3;
          color: #854d0e;
        }
        .status-rejected {
          background: #fee2e2;
          color: #b91c1c;
        }
      `}</style>
    </div>
  );
};

export default DocumentsPage;

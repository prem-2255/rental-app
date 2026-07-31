import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Property } from '../types';

const SavedPropertiesPage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const u = JSON.parse(stored);
      setUserId(u.id);
      loadSavedAndProperties(u.id);
    } else {
      setLoading(false);
    }
  }, []);

  const loadSavedAndProperties = async (uid: string) => {
    try {
      const [userRes, propRes] = await Promise.all([
        fetch(`/api/tenants/${uid}`),
        fetch('/api/properties')
      ]);
      const user = await userRes.json();
      const allProps = await propRes.json();
      
      if (user && user.savedProperties) {
        setSavedIds(user.savedProperties.split(',').filter(Boolean));
      }
      if (Array.isArray(allProps)) {
        setProperties(allProps);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId: string) => {
    if (!userId) return;
    try {
      const res = await fetch(`/api/users/${userId}/favorites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ propertyId })
      });
      if (res.ok) {
        const data = await res.json();
        setSavedIds(data.savedProperties ? data.savedProperties.split(',').filter(Boolean) : []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const savedProperties = properties.filter(p => savedIds.includes(p.id));

  return (
    <div className="saved-properties-page">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>Saved Properties</h1>
      </header>

      {loading ? (
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading your favorites...</p>
        </div>
      ) : savedProperties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">❤️</div>
          <h2>No Saved Properties Yet</h2>
          <p>Tap the heart icon on any rental property page or listing to save it here for quick access.</p>
          <button onClick={() => navigate('/book-rental')} className="explore-btn">
            Explore Properties
          </button>
        </div>
      ) : (
        <div className="properties-grid">
          {savedProperties.map(p => (
            <div key={p.id} className="property-card">
              <div className="image-wrapper">
                <img src={p.image} alt={p.title} />
                <button className="heart-btn active" onClick={() => handleRemoveFavorite(p.id)}>
                  ❤️
                </button>
                <div className="price-badge">{p.price}</div>
              </div>
              <div className="info-section">
                <h3>{p.title}</h3>
                <p className="location">📍 {p.location}</p>
                <div className="specs">
                  <span>🛏️ {p.beds} Beds</span>
                  <span>🚿 {p.baths} Baths</span>
                  <span>🏠 {p.type}</span>
                </div>
                <div className="actions">
                  <button onClick={() => navigate('/book-rental')} className="book-btn">
                    View & Book
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .saved-properties-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 80px auto 0;
          min-height: calc(100vh - 80px);
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
          font-size: 2.25rem;
          font-weight: 800;
          color: #0f172a;
        }
        .loading-state {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6rem 2rem;
          color: #64748b;
        }
        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid #f3f3f3;
          border-top: 4px solid #3b82f6;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-bottom: 1rem;
        }
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .empty-state {
          text-align: center;
          background: white;
          padding: 4rem 2rem;
          border-radius: 32px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          max-width: 500px;
          margin: 4rem auto;
        }
        .empty-icon {
          font-size: 4rem;
          margin-bottom: 1.5rem;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { transform: scale(1); }
          50% { transform: scale(1.1); }
          100% { transform: scale(1); }
        }
        .empty-state h2 {
          font-size: 1.5rem;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }
        .empty-state p {
          color: #64748b;
          font-size: 0.95rem;
          margin-bottom: 2rem;
          line-height: 1.5;
        }
        .explore-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.8rem 2rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .explore-btn:hover {
          background: #2563eb;
          transform: translateY(-2px);
        }
        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2.5rem;
        }
        .property-card {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .property-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 12px 30px rgba(0, 0, 0, 0.1);
        }
        .image-wrapper {
          position: relative;
          height: 200px;
        }
        .image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .heart-btn {
          position: absolute;
          top: 1rem;
          right: 1rem;
          background: white;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
          cursor: pointer;
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          transition: transform 0.2s;
        }
        .heart-btn:hover {
          transform: scale(1.1);
        }
        .price-badge {
          position: absolute;
          bottom: 1rem;
          left: 1rem;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          color: white;
          padding: 0.4rem 1rem;
          border-radius: 99px;
          font-weight: 700;
          font-size: 0.9rem;
        }
        .info-section {
          padding: 1.5rem;
        }
        .info-section h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          color: #0f172a;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .location {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0 0 1rem 0;
        }
        .specs {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: #475569;
          margin-bottom: 1.5rem;
          background: #f8fafc;
          padding: 0.75rem;
          border-radius: 12px;
        }
        .actions {
          display: flex;
        }
        .book-btn {
          width: 100%;
          background: #10b981;
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .book-btn:hover {
          background: #059669;
        }
        @media(max-width: 640px) {
          .properties-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default SavedPropertiesPage;

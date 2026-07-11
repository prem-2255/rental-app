import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface OwnerPropertiesPageProps {
  currentUser: any;
}

const OwnerPropertiesPage: React.FC<OwnerPropertiesPageProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      fetch(`/api/owner/${currentUser.id}/properties`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setProperties(data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching owner properties:', err);
          setLoading(false);
        });
    }
  }, [currentUser]);

  const handleDeleteProperty = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this property? This will also remove any active tenant association and bookings.')) {
      return;
    }

    try {
      const res = await fetch(`/api/properties/${id}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        setProperties(prev => prev.filter(p => p.id !== id));
      } else {
        alert('Failed to delete property');
      }
    } catch (err) {
      console.error('Error deleting property:', err);
    }
  };

  return (
    <div className="owner-properties-page">
      <header className="page-header">
        <button onClick={() => navigate('/owner')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <div className="header-text-group">
          <h1>Your Listed Properties</h1>
          <p className="subtitle">Manage, edit or delete your active property listings</p>
        </div>
        <button 
          onClick={() => navigate('/owner/add-property')} 
          className="add-property-header-btn"
        >
          ➕ Add Property
        </button>
      </header>

      {loading ? (
        <div className="loading-state">Loading your properties...</div>
      ) : properties.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🏢</div>
          <h3>No Properties Listed Yet</h3>
          <p>Start listing your rental houses or apartments to find tenants.</p>
          <button 
            onClick={() => navigate('/owner/add-property')} 
            className="add-property-btn"
          >
            Add First Property
          </button>
        </div>
      ) : (
        <div className="properties-grid">
          {properties.map(property => (
            <div key={property.id} className="property-card">
              <div className="image-wrapper">
                <img src={property.image} alt={property.title} />
                <span className="type-badge">{property.type}</span>
              </div>
              
              <div className="property-content">
                <div className="title-row">
                  <h3>{property.title}</h3>
                  <div className="price">{property.price}</div>
                </div>
                <p className="location">📍 {property.location}</p>
                
                <div className="amenities">
                  <span>🛏️ {property.beds} Beds</span>
                  <span>🚿 {property.baths} Baths</span>
                </div>

                <div className="tenant-status">
                  {property.tenant ? (
                    <div className="status-banner occupied">
                      <span className="dot"></span>
                      Rented by <strong>{property.tenant.name}</strong>
                    </div>
                  ) : (
                    <div className="status-banner vacant">
                      <span className="dot"></span>
                      Vacant / Available
                    </div>
                  )}
                </div>

                <div className="card-actions">
                  <button 
                    onClick={() => handleDeleteProperty(property.id)} 
                    className="delete-btn"
                  >
                    🗑️ Delete Listing
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .owner-properties-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          min-height: 100vh;
        }
        .page-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 2rem;
          margin-bottom: 3rem;
          flex-wrap: wrap;
        }
        .header-text-group {
          flex: 1;
        }
        .header-text-group h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
          margin: 0;
        }
        .header-text-group .subtitle {
          margin: 0.25rem 0 0 0;
          color: #64748b;
          font-size: 1rem;
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
        
        .add-property-header-btn {
          padding: 0.75rem 1.5rem;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .add-property-header-btn:hover {
          background: #1e293b;
          transform: translateY(-1px);
        }

        .loading-state, .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          background: white;
          border-radius: 24px;
          border: 1px dashed #cbd5e1;
          color: #64748b;
        }
        .empty-icon {
          font-size: 3rem;
          margin-bottom: 1rem;
        }
        .empty-state h3 {
          color: #1e293b;
          font-size: 1.5rem;
          margin-bottom: 0.5rem;
        }
        .add-property-btn {
          margin-top: 1.5rem;
          padding: 0.75rem 1.5rem;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .add-property-btn:hover {
          background: #1e293b;
        }

        .properties-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2rem;
        }
        .property-card {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
          transition: transform 0.2s, box-shadow 0.2s;
          display: flex;
          flex-direction: column;
        }
        .property-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -3px rgba(0, 0, 0, 0.08);
        }
        
        .image-wrapper {
          position: relative;
          height: 180px;
        }
        .image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .type-badge {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(255, 255, 255, 0.9);
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #0f172a;
          backdrop-filter: blur(4px);
        }

        .property-content {
          padding: 1.5rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          flex: 1;
        }
        .title-row {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 1rem;
        }
        .title-row h3 {
          margin: 0;
          font-size: 1.25rem;
          color: #1e293b;
          font-weight: 700;
        }
        .price {
          color: #2563eb;
          font-weight: 800;
          font-size: 1.15rem;
          white-space: nowrap;
        }
        .location {
          margin: 0;
          color: #64748b;
          font-size: 0.875rem;
        }
        .amenities {
          display: flex;
          gap: 1rem;
          color: #475569;
          font-size: 0.85rem;
        }

        .tenant-status {
          margin-top: 0.5rem;
        }
        .status-banner {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.85rem;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
        }
        .status-banner.occupied {
          background: #eff6ff;
          color: #1e40af;
        }
        .status-banner.occupied .dot {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          border-radius: 50%;
        }
        .status-banner.vacant {
          background: #f0fdf4;
          color: #166534;
        }
        .status-banner.vacant .dot {
          width: 8px;
          height: 8px;
          background: #22c55e;
          border-radius: 50%;
        }

        .card-actions {
          margin-top: auto;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }
        .delete-btn {
          width: 100%;
          padding: 0.75rem;
          background: #fee2e2;
          color: #b91c1c;
          border: none;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .delete-btn:hover {
          background: #fecaca;
        }
      `}</style>
    </div>
  );
};

export default OwnerPropertiesPage;

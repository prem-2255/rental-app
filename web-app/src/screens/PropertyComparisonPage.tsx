import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Property } from '../types';

const PropertyComparisonPage: React.FC = () => {
  const navigate = useNavigate();
  const [properties, setProperties] = useState<Property[]>([]);
  const [selectedProps, setSelectedProps] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [locationQuery, setLocationQuery] = useState('Metro Station');

  useEffect(() => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setProperties(data);
          // Pre-populate first two if available
          if (data.length >= 2) {
            setSelectedProps([data[0].id, data[1].id]);
          } else if (data.length >= 1) {
            setSelectedProps([data[0].id]);
          }
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggleSelect = (id: string) => {
    if (selectedProps.includes(id)) {
      setSelectedProps(prev => prev.filter(x => x !== id));
    } else {
      if (selectedProps.length >= 3) {
        alert('You can compare a maximum of 3 properties.');
        return;
      }
      setSelectedProps(prev => [...prev, id]);
    }
  };

  const getDistanceMock = (location: string, target: string) => {
    // Generate a consistent distance based on names
    const code = (location.charCodeAt(0) || 0) + (target.charCodeAt(0) || 0);
    return `${(code % 5 + 0.5).toFixed(1)} km`;
  };

  const activeProperties = properties.filter(p => selectedProps.includes(p.id));

  return (
    <div className="compare-page">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>Property Comparison</h1>
      </header>

      {loading ? (
        <div className="loading-state">Loading property data...</div>
      ) : (
        <div className="compare-container">
          <div className="selector-bar card">
            <h3>Select Properties to Compare ({selectedProps.length}/3)</h3>
            <p>Check the properties you want to see side-by-side.</p>
            <div className="checkboxes">
              {properties.map(p => (
                <label key={p.id} className={`checkbox-label ${selectedProps.includes(p.id) ? 'checked' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={selectedProps.includes(p.id)} 
                    onChange={() => handleToggleSelect(p.id)} 
                  />
                  <span>{p.title} - {p.price}</span>
                </label>
              ))}
            </div>

            <div className="location-settings">
              <label>Calculate distance from:</label>
              <input 
                type="text" 
                value={locationQuery} 
                onChange={(e) => setLocationQuery(e.target.value)} 
                placeholder="Selected location..."
              />
            </div>
          </div>

          {activeProperties.length === 0 ? (
            <div className="empty-state">
              <p>Please select at least one property to start comparing.</p>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="compare-table">
                <thead>
                  <tr>
                    <th>Feature</th>
                    {activeProperties.map(p => (
                      <th key={p.id} className="prop-header-cell">
                        <img src={p.image} alt={p.title} className="compare-thumb" />
                        <div className="title">{p.title}</div>
                        <div className="price-tag">{p.price}</div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td><strong>Monthly Rent</strong></td>
                    {activeProperties.map(p => (
                      <td key={p.id} className="highlight">{p.price}</td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Security Deposit</strong></td>
                    {activeProperties.map(p => (
                      <td key={p.id}>{(p as any).deposit || '₹10,000'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Maintenance</strong></td>
                    {activeProperties.map(p => (
                      <td key={p.id}>{(p as any).maintenance || '₹1,000'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Bedrooms</strong></td>
                    {activeProperties.map(p => (
                      <td key={p.id}>{p.beds} BHK</td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Furnished Status</strong></td>
                    {activeProperties.map(p => (
                      <td key={p.id}>{(p as any).furnishedStatus || 'Semi-Furnished'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Parking Rules</strong></td>
                    {activeProperties.map(p => (
                      <td key={p.id}>{(p as any).parking ? '✅ Included' : '❌ No Dedicated Parking'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Approx. Area</strong></td>
                    {activeProperties.map(p => (
                      <td key={p.id}>{p.beds === 1 ? '650 sq ft' : p.beds === 2 ? '1100 sq ft' : '1600 sq ft'}</td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Amenities</strong></td>
                    {activeProperties.map(p => (
                      <td key={p.id} className="amenities-cell">
                        {((p as any).amenities || 'WiFi, AC, Lift, CCTV').split(',').map((am: string, idx: number) => (
                          <span key={idx} className="amenity-tag">{am.trim()}</span>
                        ))}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td><strong>Distance to {locationQuery}</strong></td>
                    {activeProperties.map(p => (
                      <td key={p.id} className="distance-cell">
                        📍 {getDistanceMock(p.title, locationQuery)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      <style>{`
        .compare-page {
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
        .compare-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .card {
          background: white;
          padding: 2rem;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .selector-bar h3 {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          color: #0f172a;
        }
        .selector-bar p {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
        }
        .checkboxes {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-bottom: 1.5rem;
        }
        .checkbox-label {
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          padding: 0.75rem 1.25rem;
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-weight: 600;
          color: #475569;
          transition: all 0.2s;
        }
        .checkbox-label.checked {
          background: #eff6ff;
          border-color: #3b82f6;
          color: #2563eb;
        }
        .checkbox-label input {
          width: 16px;
          height: 16px;
          cursor: pointer;
        }
        .location-settings {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          max-width: 300px;
        }
        .location-settings label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #475569;
        }
        .location-settings input {
          padding: 0.75rem 1rem;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          background: #f8fafc;
          outline: none;
          font-size: 0.95rem;
        }
        .location-settings input:focus {
          border-color: #3b82f6;
          background: white;
        }
        .compare-table {
          width: 100%;
          border-collapse: collapse;
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
        }
        .compare-table th, .compare-table td {
          padding: 1.5rem;
          text-align: center;
          border-bottom: 1px solid #f1f5f9;
        }
        .compare-table th:first-child, .compare-table td:first-child {
          text-align: left;
          background: #f8fafc;
          font-weight: 600;
          width: 250px;
          color: #334155;
        }
        .prop-header-cell {
          width: calc((100% - 250px) / 3);
        }
        .compare-thumb {
          width: 120px;
          height: 80px;
          object-fit: cover;
          border-radius: 12px;
          margin-bottom: 0.75rem;
          box-shadow: 0 4px 6px rgba(0,0,0,0.05);
        }
        .prop-header-cell .title {
          font-weight: 700;
          font-size: 1.1rem;
          color: #0f172a;
          margin-bottom: 0.25rem;
        }
        .prop-header-cell .price-tag {
          font-weight: 800;
          color: #3b82f6;
          font-size: 0.95rem;
        }
        .highlight {
          font-weight: 800;
          color: #059669;
          font-size: 1.125rem;
        }
        .amenities-cell {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          justify-content: center;
        }
        .amenity-tag {
          background: #f1f5f9;
          color: #475569;
          padding: 0.25rem 0.6rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .distance-cell {
          font-weight: 700;
          color: #475569;
        }
        .empty-state {
          text-align: center;
          padding: 4rem;
          background: #f8fafc;
          border-radius: 24px;
          color: #94a3b8;
          border: 2px dashed #cbd5e1;
        }
        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }
        @media(max-width: 768px) {
          .compare-table th:first-child, .compare-table td:first-child {
            width: 150px;
          }
        }
      `}</style>
    </div>
  );
};

export default PropertyComparisonPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Property } from '../types';

interface BookingPageProps {
  properties: Property[];
  currentUser: any;
}

const BookingPage: React.FC<BookingPageProps> = ({ properties, currentUser }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isAiSearch, setIsAiSearch] = useState(false);
  const [loadingAi, setLoadingAi] = useState(false);
  const [aiSearchResults, setAiSearchResults] = useState<Property[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<any | null>(null);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);
  const [visitDate, setVisitDate] = useState('');
  
  // Custom enhanced states
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [compareBucket, setCompareBucket] = useState<string[]>([]);

  useEffect(() => {
    if (currentUser?.id) {
      loadSavedIds(currentUser.id);
    }
  }, [currentUser]);

  const loadSavedIds = async (uid: string) => {
    try {
      const res = await fetch(`/api/tenants/${uid}`);
      const tenant = await res.json();
      if (tenant && tenant.savedProperties) {
        setSavedIds(tenant.savedProperties.split(',').filter(Boolean));
      }
    } catch(err) {
      console.error(err);
    }
  };

  const handleToggleFavorite = async (propertyId: string) => {
    if (!currentUser) {
      alert("Please log in to save properties.");
      return;
    }
    try {
      const res = await fetch(`/api/users/${currentUser.id}/favorites`, {
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

  const handleToggleCompare = (propertyId: string) => {
    if (compareBucket.includes(propertyId)) {
      setCompareBucket(prev => prev.filter(x => x !== propertyId));
    } else {
      if (compareBucket.length >= 3) {
        alert("You can select up to 3 properties for comparison.");
        return;
      }
      setCompareBucket(prev => [...prev, propertyId]);
    }
  };

  const handleBookNow = (property: Property) => {
    // Enrich property fields for high fidelity display
    setSelectedProperty({
      ...property,
      deposit: (property as any).deposit || '₹10,000',
      maintenance: (property as any).maintenance || '₹1,000',
      suitability: (property as any).suitability || 'Family / Bachelors',
      furnishedStatus: (property as any).furnishedStatus || 'Semi-Furnished',
      parking: (property as any).parking ?? true,
      houseRules: (property as any).houseRules || 'No Smoking, No Pets, Quiet Hours after 10 PM, Gated Parking, Visitor Check-in Required',
      nearbyPlaces: (property as any).nearbyPlaces || 'Grocery Store (0.3km), Apex Hospital (1.2km), Pharmacy (0.2km), ATM (0.1km), Bus Stop (0.4km), Metro Station (0.6km), Gym (0.5km), School (1.0km)',
      safetyCctv: (property as any).safetyCctv ?? true,
      safetySecurityGuard: (property as any).safetySecurityGuard ?? true,
      safetyGated: (property as any).safetyGated ?? true,
      safetyFire: (property as any).safetyFire ?? true,
      safetyLighting: (property as any).safetyLighting ?? true,
      responseTime: (property as any).responseTime || 'Replies within 10 minutes',
      ownerPhone: (property as any).ownerPhone || '+91 99887 76655'
    });
    setIsBookingConfirmed(false);
  };

  const handleSearchSubmit = async () => {
    if (isAiSearch && search.trim()) {
      setLoadingAi(true);
      try {
        const res = await fetch('/api/ai/search', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ query: search })
        });
        const data = await res.json();
        if (Array.isArray(data)) {
          setAiSearchResults(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingAi(false);
      }
    }
  };

  const confirmBooking = async () => {
    if (!selectedProperty || !currentUser) return;
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          propertyId: selectedProperty.id,
          customerId: currentUser.id,
          visitDate: visitDate || undefined
        })
      });
      if (res.ok) {
        setIsBookingConfirmed(true);
      } else {
        console.error('Failed to submit booking');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const closeModal = () => {
    setSelectedProperty(null);
    setIsBookingConfirmed(false);
    setVisitDate('');
  };

  const propertiesToRender = isAiSearch ? (search.trim() ? aiSearchResults : properties) : properties.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="booking-page">
      <header className="booking-header">
        <button onClick={() => navigate('/')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>Book Your Perfect Rental</h1>
      </header>

      <div className="filter-section">
        <button 
          className={`ai-search-toggle ${isAiSearch ? 'active' : ''}`}
          onClick={() => {
            setIsAiSearch(!isAiSearch);
            setSearch('');
          }}
        >
          🤖 {isAiSearch ? 'AI Smart Search Enabled' : 'Enable AI Search (Natural Language)'}
        </button>

        <div className="search-bar-wrapper">
          <input 
            type="text" 
            placeholder={isAiSearch ? 'Try "2BHK under ₹15000 fully furnished"' : 'Search by location, property name...'} 
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSearchSubmit();
            }}
            className="search-input"
          />
          <button className="search-button" onClick={handleSearchSubmit}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        {loadingAi && <p style={{ fontSize: '0.85rem', color: '#3b82f6' }}>🤖 AI Recommendation Engine parsing query...</p>}
      </div>

      <div className="property-grid">
        {propertiesToRender.map(property => {
          const isSaved = savedIds.includes(property.id);
          const isComparing = compareBucket.includes(property.id);
          const propStatus = property.status || 'Available Now';
          
          return (
            <div key={property.id} className="property-card-alt">
              <div className="property-image-wrapper">
                <img src={property.image} alt={property.title} />
                <button 
                  className={`heart-icon-btn ${isSaved ? 'active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); handleToggleFavorite(property.id); }}
                >
                  {isSaved ? '❤️' : '🤍'}
                </button>
                <div className={`status-badge-pill ${propStatus.toLowerCase().replace(' ', '-')}`}>
                  {propStatus}
                </div>
              </div>
              <div className="property-details">
                <div className="property-price">{property.price}</div>
                <h3 className="property-title">{property.title}</h3>
                <p className="property-location">📍 {property.location}</p>
                <div className="property-info">
                  <span>🛏️ {property.beds} Beds</span>
                  <span>🚿 {property.baths} Baths</span>
                </div>
                
                <div className="action-buttons-row">
                  <button className="book-now-btn" onClick={() => handleBookNow(property)}>
                    View & Book
                  </button>
                  <button 
                    className={`compare-toggle-btn ${isComparing ? 'active' : ''}`}
                    onClick={() => handleToggleCompare(property.id)}
                  >
                    ⚖️ Compare
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Comparison Drawer Banner */}
      {compareBucket.length > 0 && (
        <div className="compare-sticky-banner">
          <span>Comparing <strong>{compareBucket.length}</strong> properties</span>
          <button onClick={() => navigate(`/compare?ids=${compareBucket.join(',')}`)} className="go-compare-btn">
            Open Side-by-Side Comparison
          </button>
        </div>
      )}

      {selectedProperty && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="booking-modal" onClick={e => e.stopPropagation()}>
            {!isBookingConfirmed ? (
              <>
                <div className="modal-header">
                  <h2>{selectedProperty.title} Details</h2>
                  <button className="close-x" onClick={closeModal}>&times;</button>
                </div>
                
                <div className="modal-body" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                  <img src={selectedProperty.image} alt="" className="modal-hero-img" />
                  
                  {/* Title & Core Price */}
                  <div className="detail-price-strip">
                    <span className="price">{selectedProperty.price}</span>
                    <span className="availability-pill">{selectedProperty.status || 'Available Now'}</span>
                  </div>

                  {/* Owner Response Time */}
                  <div className="owner-response-time-badge">
                    ⚡ Owner response time: <strong>{selectedProperty.responseTime}</strong>
                  </div>

                  {/* Cost breakdown */}
                  <div className="financials-card">
                    <div>Deposit: <strong>{selectedProperty.deposit}</strong></div>
                    <div>Maintenance: <strong>{selectedProperty.maintenance}</strong></div>
                    <div>Furnishing: <strong>{selectedProperty.furnishedStatus}</strong></div>
                  </div>

                  {/* Safety Score progress indicator */}
                  <div className="safety-score-card">
                    <h4>Safety Score (Progress Indicator)</h4>
                    {(() => {
                      const features = [
                        { label: 'CCTV', val: selectedProperty.safetyCctv },
                        { label: 'Security Guard', val: selectedProperty.safetySecurityGuard },
                        { label: 'Gated Community', val: selectedProperty.safetyGated },
                        { label: 'Fire Safety Equipment', val: selectedProperty.safetyFire },
                        { label: 'Good Lighting', val: selectedProperty.safetyLighting },
                      ];
                      const activeCount = features.filter(f => f.val).length;
                      const scorePercent = (activeCount / 5) * 100;
                      return (
                        <div className="safety-progress-wrapper">
                          <div className="progress-bar-bg">
                            <div className="progress-bar-fill" style={{ width: `${scorePercent}%` }}></div>
                          </div>
                          <div className="score-ratio">{activeCount}/5 Features Confirmed ({scorePercent}%)</div>
                          <div className="features-tags-list">
                            {features.map((f, i) => (
                              <span key={i} className={`feature-tag ${f.val ? 'active' : 'inactive'}`}>
                                {f.val ? '✓' : '✗'} {f.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Property Rating category scores */}
                  <div className="ratings-card">
                    <h4>Property Rating</h4>
                    <div className="ratings-breakdown">
                      <div className="rating-item"><span>Cleanliness</span> <strong>4.8 ★</strong></div>
                      <div className="rating-item"><span>Location</span> <strong>4.7 ★</strong></div>
                      <div className="rating-item"><span>Safety</span> <strong>4.9 ★</strong></div>
                      <div className="rating-item"><span>Value for Money</span> <strong>4.6 ★</strong></div>
                      <div className="rating-item"><span>Owner Communication</span> <strong>4.9 ★</strong></div>
                    </div>
                  </div>

                  {/* House Rules */}
                  <div className="house-rules-card">
                    <h4>House Rules (Before Booking)</h4>
                    <ul className="rules-list">
                      {selectedProperty.houseRules.split(',').map((rule: string, i: number) => (
                        <li key={i}>⚠️ {rule.trim()}</li>
                      ))}
                    </ul>
                  </div>

                  {/* Nearby Places */}
                  <div className="nearby-places-card">
                    <h4>Nearby Places & Distance</h4>
                    <div className="nearby-grid">
                      {selectedProperty.nearbyPlaces.split(',').map((place: string, i: number) => (
                        <div key={i} className="nearby-place-pill">📍 {place.trim()}</div>
                      ))}
                    </div>
                    <a 
                      href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(selectedProperty.location)}`} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="map-btn"
                    >
                      🧭 Get Directions
                    </a>
                  </div>

                  {/* Schedule Visit */}
                  <div className="visit-date-selector">
                    <label>Schedule Visit Date & Time</label>
                    <input 
                      type="date" 
                      value={visitDate}
                      onChange={(e) => setVisitDate(e.target.value)}
                      className="visit-date-input"
                      required
                    />
                  </div>

                  {/* One-Tap contact buttons */}
                  <div className="one-tap-contact-card">
                    <h4>One-Tap Owner Contact</h4>
                    <div className="contact-buttons-row">
                      <a href={`tel:${selectedProperty.ownerPhone}`} className="contact-btn phone">📞 Call</a>
                      <button onClick={() => alert("Opening instant chat with Owner...")} className="contact-btn chat">💬 Chat</button>
                      <a href={`https://wa.me/${selectedProperty.ownerPhone.replace(/\D/g, '')}`} target="_blank" rel="noreferrer" className="contact-btn wa">💬 WhatsApp</a>
                      <a href="mailto:owner@rentapp.com" className="contact-btn mail">✉️ Email</a>
                    </div>
                  </div>
                </div>

                <div className="modal-footer">
                  <button className="cancel-btn" onClick={closeModal}>Cancel</button>
                  <button className="confirm-booking-btn" onClick={confirmBooking}>Confirm Booking Request</button>
                </div>
              </>
            ) : (
              <div className="success-state">
                <div className="success-icon-wrapper">
                  <svg className="success-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                  </svg>
                </div>
                <h2>Booking Request Sent!</h2>
                <p>We've notified the owner of <strong>{selectedProperty.title}</strong> about your interest. They will review your profile and get back to you shortly.</p>
                <div className="owner-reminder">
                  <span>Contact Owner:</span>
                  <strong>{selectedProperty.ownerPhone}</strong>
                </div>
                <button className="done-btn" onClick={closeModal}>Done</button>
              </div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .booking-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 80px auto 0;
          min-height: calc(100vh - 80px);
        }
        .booking-header {
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
        .booking-header h1 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0f172a;
        }
        .filter-section {
          margin-bottom: 3rem;
        }
        .ai-search-toggle {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          color: #1e40af;
          padding: 0.5rem 1rem;
          border-radius: 99px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
          margin-bottom: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          transition: all 0.2s;
        }
        .ai-search-toggle.active {
          background: #2563eb;
          color: white;
          border-color: #2563eb;
        }
        .search-bar-wrapper {
          display: flex;
          background: white;
          border: 1px solid #e2e8f0;
          padding: 0.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
        }
        .search-input {
          flex: 1;
          border: none;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          outline: none;
        }
        .search-button {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 8px;
          cursor: pointer;
        }
        .property-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 2.5rem;
        }
        .property-card-alt {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
          transition: transform 0.3s;
        }
        .property-card-alt:hover {
          transform: translateY(-5px);
        }
        .property-image-wrapper {
          position: relative;
          height: 200px;
        }
        .property-image-wrapper img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .heart-icon-btn {
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
        }
        .status-badge-pill {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(15, 23, 42, 0.85);
          backdrop-filter: blur(8px);
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 800;
          text-transform: uppercase;
        }
        .status-badge-pill.available-now { background: #10b981; }
        .status-badge-pill.available-soon { background: #f59e0b; }
        .status-badge-pill.reserved { background: #f97316; }
        .status-badge-pill.occupied { background: #64748b; }
        
        .property-details {
          padding: 1.5rem;
        }
        .property-price {
          font-size: 1.5rem;
          font-weight: 800;
          color: #3b82f6;
          margin-bottom: 0.5rem;
        }
        .property-title {
          font-size: 1.25rem;
          color: #0f172a;
          margin: 0 0 0.5rem 0;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .property-location {
          color: #64748b;
          font-size: 0.875rem;
          margin: 0 0 1rem 0;
        }
        .property-info {
          display: flex;
          gap: 1rem;
          font-size: 0.85rem;
          color: #475569;
          margin-bottom: 1.5rem;
        }
        .action-buttons-row {
          display: flex;
          gap: 1rem;
        }
        .book-now-btn {
          flex: 1;
          background: #10b981;
          color: white;
          border: none;
          padding: 0.75rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .book-now-btn:hover { background: #059669; }
        .compare-toggle-btn {
          background: #f1f5f9;
          color: #475569;
          border: none;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }
        .compare-toggle-btn.active {
          background: #3b82f6;
          color: white;
        }
        
        /* Sticky compare drawer */
        .compare-sticky-banner {
          position: fixed;
          bottom: 2rem;
          left: 50%;
          transform: translateX(-50%);
          background: #0f172a;
          color: white;
          padding: 1rem 2rem;
          border-radius: 99px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          gap: 2rem;
          z-index: 999;
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { transform: translate(-50%, 50px); opacity: 0; }
          to { transform: translate(-50%, 0); opacity: 1; }
        }
        .go-compare-btn {
          background: #3b82f6;
          color: white;
          border: none;
          padding: 0.5rem 1.25rem;
          border-radius: 99px;
          font-weight: 700;
          cursor: pointer;
        }
        .go-compare-btn:hover { background: #2563eb; }

        /* Modal Details */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0,0,0,0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
        }
        .booking-modal {
          background: white;
          width: 90%;
          max-width: 650px;
          border-radius: 28px;
          overflow: hidden;
          box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 2rem;
          border-bottom: 1px solid #f1f5f9;
        }
        .modal-header h2 { margin: 0; font-size: 1.5rem; color: #0f172a; }
        .close-x { background: none; border: none; font-size: 24px; cursor: pointer; color: #94a3b8; }
        .modal-body { padding: 2rem; }
        .modal-hero-img { width: 100%; height: 240px; object-fit: cover; border-radius: 20px; margin-bottom: 1.5rem; }
        .detail-price-strip { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
        .detail-price-strip .price { font-size: 1.75rem; font-weight: 800; color: #3b82f6; }
        .availability-pill { background: #dcfce7; color: #166534; padding: 0.25rem 0.75rem; border-radius: 99px; font-weight: 700; font-size: 0.85rem; }
        .owner-response-time-badge { background: #eff6ff; border: 1px solid #bfdbfe; color: #1e40af; padding: 0.75rem; border-radius: 12px; font-size: 0.85rem; margin-bottom: 1.5rem; }
        .financials-card { display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; background: #f8fafc; padding: 1rem; border-radius: 16px; margin-bottom: 1.5rem; font-size: 0.9rem; }
        
        .safety-score-card, .ratings-card, .house-rules-card, .nearby-places-card, .one-tap-contact-card {
          margin-bottom: 1.5rem;
          border-top: 1px solid #f1f5f9;
          padding-top: 1rem;
        }
        .safety-score-card h4, .ratings-card h4, .house-rules-card h4, .nearby-places-card h4, .one-tap-contact-card h4 {
          margin: 0 0 1rem 0;
          font-size: 1.1rem;
          color: #0f172a;
        }
        .safety-progress-wrapper {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .progress-bar-bg {
          height: 10px;
          background: #e2e8f0;
          border-radius: 99px;
          overflow: hidden;
        }
        .progress-bar-fill {
          height: 100%;
          background: #10b981;
          border-radius: 99px;
          transition: width 0.4s ease;
        }
        .score-ratio {
          font-size: 0.8rem;
          font-weight: 700;
          color: #64748b;
        }
        .features-tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-top: 0.5rem;
        }
        .feature-tag {
          padding: 0.25rem 0.5rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
        }
        .feature-tag.active { background: #dcfce7; color: #166534; }
        .feature-tag.inactive { background: #fee2e2; color: #991b1b; }

        .ratings-breakdown {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 0.75rem;
        }
        .rating-item {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
          color: #475569;
        }
        .rules-list {
          list-style: none;
          padding: 0;
          margin: 0;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          font-size: 0.875rem;
          color: #475569;
        }
        .nearby-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }
        .nearby-place-pill {
          background: #f1f5f9;
          color: #475569;
          padding: 0.4rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
        }
        .map-btn {
          background: #4f46e5;
          color: white;
          text-decoration: none;
          padding: 0.5rem 1rem;
          border-radius: 8px;
          font-weight: 700;
          font-size: 0.8rem;
          display: inline-block;
        }
        .map-btn:hover { background: #4338ca; }

        .contact-buttons-row {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 1rem;
        }
        .contact-btn {
          border: none;
          text-decoration: none;
          text-align: center;
          padding: 0.75rem 0.5rem;
          border-radius: 12px;
          font-weight: 700;
          font-size: 0.8rem;
          color: white;
          cursor: pointer;
        }
        .contact-btn.phone { background: #10b981; }
        .contact-btn.chat { background: #3b82f6; }
        .contact-btn.wa { background: #25d366; }
        .contact-btn.mail { background: #ea580c; }
        
        .modal-footer {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          padding: 1.5rem 2rem;
          border-top: 1px solid #f1f5f9;
          background: #f8fafc;
        }
        .cancel-btn { background: white; border: 1px solid #e2e8f0; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; color: #64748b; }
        .confirm-booking-btn { background: #10b981; border: none; padding: 0.75rem 1.5rem; border-radius: 12px; font-weight: 700; cursor: pointer; color: white; }
        .confirm-booking-btn:hover { background: #059669; }

        .success-state { text-align: center; padding: 3rem 2rem; }
        .success-icon-wrapper { width: 72px; height: 72px; background: #dcfce7; color: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 1.5rem; }
        .success-svg { width: 36px; height: 36px; }
        .owner-reminder { background: #f8fafc; border: 1px solid #e2e8f0; padding: 1rem; border-radius: 12px; display: flex; justify-content: space-between; margin: 1.5rem 0; font-size: 0.9rem; }
        .done-btn { background: #0f172a; color: white; border: none; padding: 0.75rem 2rem; border-radius: 12px; font-weight: 700; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default BookingPage;

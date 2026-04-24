import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Property } from '../types';

interface BookingPageProps {
  properties: Property[];
}

const BookingPage: React.FC<BookingPageProps> = ({ properties }) => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [isBookingConfirmed, setIsBookingConfirmed] = useState(false);

  const handleBookNow = (property: Property) => {
    setSelectedProperty(property);
    setIsBookingConfirmed(false);
  };

  const confirmBooking = () => {
    // Simulate notification logic
    setIsBookingConfirmed(true);
    // In a real app, this would trigger a backend notification to property.ownerId
  };

  const closeModal = () => {
    setSelectedProperty(null);
    setIsBookingConfirmed(false);
  };

  const filteredProperties = properties.filter(p => 
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
        <div className="search-bar-wrapper">
          <input 
            type="text" 
            placeholder="Search by location, property name..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="search-input"
          />
          <button className="search-button">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8"></circle>
              <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
            </svg>
          </button>
        </div>
        <div className="filter-chips">
          <button className="filter-chip active">All</button>
          <button className="filter-chip">Apartment</button>
          <button className="filter-chip">Loft</button>
          <button className="filter-chip">House</button>
          <button className="filter-chip">2BHK</button>
        </div>
      </div>

      <div className="property-grid">
        {filteredProperties.map(property => (
          <div key={property.id} className="property-card-alt">
            <div className="property-image-wrapper">
              <img src={property.image} alt={property.title} />
              <div className="property-tag">{property.type}</div>
            </div>
            <div className="property-details">
              <div className="property-price">{property.price}</div>
              <h3 className="property-title">{property.title}</h3>
              <p className="property-location">{property.location}</p>
              <div className="property-info">
                <span>🛏️ {property.beds} Beds</span>
                <span>🚿 {property.baths} Baths</span>
                {property.capacity && <span>👥 Max {property.capacity}</span>}
              </div>
              <button 
                className="book-now-btn"
                onClick={() => handleBookNow(property)}
              >
                Book Now
              </button>
            </div>
          </div>
        ))}
      </div>

      {selectedProperty && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="booking-modal" onClick={e => e.stopPropagation()}>
            {!isBookingConfirmed ? (
              <>
                <div className="modal-header">
                  <h2>Confirm Your Booking</h2>
                  <button className="close-x" onClick={closeModal}>&times;</button>
                </div>
                <div className="modal-body">
                  <div className="property-summary-mini">
                    <img src={selectedProperty.image} alt="" />
                    <div className="summary-text">
                      <h4>{selectedProperty.title}</h4>
                      <p>{selectedProperty.price}</p>
                    </div>
                  </div>
                  
                  <div className="owner-contact-card">
                    <div className="contact-header">
                      <span className="contact-icon">📞</span>
                      <div className="contact-label">Owner's Contact Info</div>
                    </div>
                    <div className="owner-phone">
                      {selectedProperty.ownerPhone || '+91 91234 56789'}
                    </div>
                    <p className="contact-subtext">You can reach out to the owner directly for visits or inquiries.</p>
                  </div>

                  <div className="notification-hint">
                    <span className="hint-icon">🔔</span>
                    <p>Click confirm to send an official booking request to the owner.</p>
                  </div>
                </div>
                <div className="modal-footer">
                  <button className="cancel-btn" onClick={closeModal}>Cancel</button>
                  <button className="confirm-booking-btn" onClick={confirmBooking}>Confirm Booking</button>
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
                  <strong>{selectedProperty.ownerPhone || '+91 91234 56789'}</strong>
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
          margin: 0 auto;
          min-height: 100vh;
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
          background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .filter-section {
          margin-bottom: 3rem;
        }
        .search-bar-wrapper {
          display: flex;
          background: white;
          border: 1px solid #e2e8f0;
          padding: 0.5rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
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
          transition: background 0.2s;
        }
        .search-button:hover {
          background: #2563eb;
        }
        .filter-chips {
          display: flex;
          gap: 1rem;
          overflow-x: auto;
          padding-bottom: 0.5rem;
        }
        .filter-chip {
          padding: 0.5rem 1.25rem;
          border-radius: 99px;
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          color: #475569;
          cursor: pointer;
          white-space: nowrap;
          transition: all 0.2s;
        }
        .filter-chip.active {
          background: #0f172a;
          color: white;
          border-color: #0f172a;
        }
        .property-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 2rem;
        }
        .property-card-alt {
          background: white;
          border-radius: 16px;
          overflow: hidden;
          box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
          transition: transform 0.3s, box-shadow 0.3s;
          border: 1px solid #f1f5f9;
        }
        .property-card-alt:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
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
        .property-tag {
          position: absolute;
          top: 1rem;
          left: 1rem;
          background: rgba(255, 255, 255, 0.9);
          padding: 0.25rem 0.75rem;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: #0f172a;
          backdrop-filter: blur(4px);
        }
        .property-details {
          padding: 1.5rem;
        }
        .property-price {
          color: #2563eb;
          font-weight: 700;
          font-size: 1.25rem;
          margin-bottom: 0.5rem;
        }
        .property-title {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }
        .property-location {
          color: #64748b;
          font-size: 0.875rem;
          margin-bottom: 1rem;
        }
        .property-info {
          display: flex;
          gap: 1rem;
          color: #475569;
          font-size: 0.875rem;
          margin-bottom: 1.5rem;
          padding-top: 1rem;
          border-top: 1px solid #f1f5f9;
        }
        .book-now-btn {
          width: 100%;
          padding: 0.75rem;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: background 0.2s;
        }
        .book-now-btn:hover {
          background: #1e293b;
        }

        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(8px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 2rem;
        }
        .booking-modal {
          background: white;
          width: 100%;
          max-width: 500px;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
          animation: modalSlideUp 0.3s ease-out;
        }
        @keyframes modalSlideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
        .modal-header {
          padding: 1.5rem 2rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #f1f5f9;
        }
        .modal-header h2 {
          font-size: 1.25rem;
          color: #0f172a;
          margin: 0;
        }
        .close-x {
          background: none;
          border: none;
          font-size: 1.5rem;
          color: #94a3b8;
          cursor: pointer;
        }
        .modal-body {
          padding: 2rem;
        }
        .property-summary-mini {
          display: flex;
          gap: 1rem;
          background: #f8fafc;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 1.5rem;
        }
        .property-summary-mini img {
          width: 60px;
          height: 60px;
          border-radius: 8px;
          object-fit: cover;
        }
        .summary-text h4 { margin: 0; color: #1e293b; }
        .summary-text p { margin: 0; color: #2563eb; font-weight: 700; }

        .owner-contact-card {
          background: #eff6ff;
          padding: 1.5rem;
          border-radius: 16px;
          border: 1px solid #dbeafe;
          margin-bottom: 1.5rem;
          text-align: center;
        }
        .contact-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #1d4ed8;
          font-weight: 700;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 0.5rem;
        }
        .owner-phone {
          font-size: 1.75rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.5rem;
        }
        .contact-subtext {
          font-size: 0.75rem;
          color: #64748b;
          margin: 0;
        }

        .notification-hint {
          display: flex;
          gap: 0.75rem;
          align-items: center;
          color: #475569;
          font-size: 0.875rem;
        }
        .hint-icon { font-size: 1.25rem; }

        .modal-footer {
          padding: 1.5rem 2rem;
          background: #f8fafc;
          display: flex;
          gap: 1rem;
        }
        .cancel-btn {
          flex: 1;
          padding: 0.75rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
        }
        .confirm-booking-btn {
          flex: 2;
          padding: 0.75rem;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
        }

        .success-state {
          padding: 3rem 2rem;
          text-align: center;
        }
        .success-icon-wrapper {
          width: 64px;
          height: 64px;
          background: #dcfce7;
          color: #22c55e;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1.5rem;
        }
        .success-svg { width: 32px; height: 32px; }
        .success-state h2 { color: #0f172a; margin-bottom: 1rem; }
        .success-state p { color: #64748b; margin-bottom: 2rem; }
        .owner-reminder {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 12px;
          margin-bottom: 2rem;
        }
        .owner-reminder span { display: block; font-size: 0.75rem; color: #94a3b8; }
        .owner-reminder strong { font-size: 1.25rem; color: #1e293b; }
        .done-btn {
          width: 100%;
          padding: 1rem;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
};

export default BookingPage;

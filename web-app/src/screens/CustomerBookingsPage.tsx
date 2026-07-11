import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BookingRequest } from '../types';

interface CustomerBookingsPageProps {
  currentUser: any;
}

const CustomerBookingsPage: React.FC<CustomerBookingsPageProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');

  useEffect(() => {
    if (currentUser?.id) {
      fetch(`/api/customer/${currentUser.id}/bookings`)
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setRequests(data);
          }
          setLoading(false);
        })
        .catch(err => {
          console.error('Error fetching bookings:', err);
          setLoading(false);
        });
    }
  }, [currentUser]);

  const filteredRequests = requests.filter(r => {
    if (filter === 'All') return true;
    return r.status === filter;
  });

  return (
    <div className="customer-bookings-page">
      <header className="page-header">
        <button onClick={() => navigate('/customer')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>My Booking Requests</h1>
      </header>

      <div className="filter-tabs">
        {(['All', 'Pending', 'Approved', 'Rejected'] as const).map(tab => (
          <button 
            key={tab}
            className={`filter-tab ${filter === tab ? 'active' : ''}`}
            onClick={() => setFilter(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="loading-state">Loading booking requests...</div>
      ) : filteredRequests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📂</div>
          <h3>No booking requests found</h3>
          <p>You haven't requested any property bookings in this category.</p>
          <button onClick={() => navigate('/book-rental')} className="browse-btn">
            Browse Properties
          </button>
        </div>
      ) : (
        <div className="requests-grid">
          {filteredRequests.map(request => (
            <div key={request.id} className="request-card">
              <div className="property-summary">
                <img src={request.property.image} alt={request.property.title} />
                <div className="property-info">
                  <h4>{request.property.title}</h4>
                  <p className="property-location">📍 {request.property.location}</p>
                  <p className="property-price">{request.property.price}</p>
                </div>
                <div className={`status-badge ${request.status.toLowerCase()}`}>
                  {request.status}
                </div>
              </div>

              <div className="request-details">
                <div className="detail-row">
                  <span className="detail-label">Request Date:</span>
                  <span className="detail-value">{new Date(request.createdAt).toLocaleDateString()}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Property Type:</span>
                  <span className="detail-value">{request.property.type}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Beds/Baths:</span>
                  <span className="detail-value">🛏️ {request.property.beds} / 🚿 {request.property.baths}</span>
                </div>
              </div>

              <div className="owner-contact">
                <h5>Owner Information</h5>
                <div className="owner-phone">
                  📞 {request.property.ownerPhone || '+91 91234 56789'}
                </div>
                {request.status === 'Approved' && (
                  <div className="approved-notice">
                    🎉 Congratulation! Your booking has been approved. You can contact the owner using the number above or start a chat!
                  </div>
                )}
                {request.status === 'Rejected' && (
                  <div className="rejected-notice">
                    This booking request was rejected. Feel free to browse other available properties.
                  </div>
                )}
                {request.status === 'Pending' && (
                  <div className="pending-notice">
                    Waiting for the owner to review your request.
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .customer-bookings-page {
          padding: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          min-height: 100vh;
        }
        .page-header {
          display: flex;
          align-items: center;
          gap: 2rem;
          margin-bottom: 2rem;
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
          margin: 0;
        }

        .filter-tabs {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 2rem;
          border-bottom: 1px solid #e2e8f0;
          padding-bottom: 0.75rem;
        }
        .filter-tab {
          padding: 0.5rem 1.25rem;
          border: none;
          background: none;
          font-weight: 600;
          color: #64748b;
          cursor: pointer;
          position: relative;
          transition: color 0.2s;
        }
        .filter-tab:hover {
          color: #0f172a;
        }
        .filter-tab.active {
          color: #3b82f6;
        }
        .filter-tab.active::after {
          content: '';
          position: absolute;
          bottom: -0.85rem;
          left: 0;
          right: 0;
          height: 2px;
          background: #3b82f6;
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
        .browse-btn {
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
        .browse-btn:hover {
          background: #1e293b;
        }

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
          gap: 2rem;
        }
        .request-card {
          background: white;
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
          border: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .request-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);
        }

        .property-summary {
          display: flex;
          gap: 1rem;
          align-items: center;
          position: relative;
        }
        .property-summary img {
          width: 80px;
          height: 80px;
          border-radius: 12px;
          object-fit: cover;
        }
        .property-info {
          flex: 1;
        }
        .property-info h4 { margin: 0; color: #1e293b; font-size: 1.1rem; }
        .property-location { margin: 0.25rem 0 0; color: #64748b; font-size: 0.85rem; }
        .property-price { margin: 0.25rem 0 0; color: #2563eb; font-weight: 700; }

        .status-badge {
          position: absolute;
          top: 0;
          right: 0;
          padding: 0.25rem 0.75rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
        }
        .status-badge.pending { background: #fef08a; color: #854d0e; }
        .status-badge.approved { background: #dcfce7; color: #166534; }
        .status-badge.rejected { background: #fee2e2; color: #991b1b; }

        .request-details {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .detail-row {
          display: flex;
          justify-content: space-between;
          font-size: 0.85rem;
        }
        .detail-label { color: #64748b; }
        .detail-value { color: #1e293b; font-weight: 600; }

        .owner-contact {
          border-top: 1px solid #e2e8f0;
          padding-top: 1rem;
        }
        .owner-contact h5 { margin: 0 0 0.5rem 0; color: #475569; font-size: 0.9rem; }
        .owner-phone { font-size: 1.1rem; font-weight: 700; color: #1e293b; margin-bottom: 0.75rem; }
        
        .approved-notice {
          font-size: 0.8rem;
          color: #15803d;
          background: #f0fdf4;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid #bbf7d0;
        }
        .rejected-notice {
          font-size: 0.8rem;
          color: #b91c1c;
          background: #fef2f2;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid #fecaca;
        }
        .pending-notice {
          font-size: 0.8rem;
          color: #a16207;
          background: #fefce8;
          padding: 0.75rem;
          border-radius: 8px;
          border: 1px solid #fef08a;
        }
      `}</style>
    </div>
  );
};

export default CustomerBookingsPage;

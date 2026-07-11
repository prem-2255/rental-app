import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import type { BookingRequest } from '../types';

interface OwnerBookingsPageProps {
  currentUser: any;
}

const OwnerBookingsPage: React.FC<OwnerBookingsPageProps> = ({ currentUser }) => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      fetch(`/api/owner/${currentUser.id}/bookings`)
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

  const handleUpdateStatus = async (id: string, status: 'Approved' | 'Rejected') => {
    try {
      const res = await fetch(`/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const updated = await res.json();
      setRequests(prev => prev.map(r => r.id === id ? updated : r));
    } catch (err) {
      console.error('Failed to update booking status:', err);
    }
  };

  return (
    <div className="owner-bookings-page">
      <header className="page-header">
        <button onClick={() => navigate('/owner')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>Booking Requests</h1>
      </header>

      {loading ? (
        <div className="loading-state">Loading booking requests...</div>
      ) : requests.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📫</div>
          <h3>No Booking Requests</h3>
          <p>You don't have any booking requests for your properties yet.</p>
        </div>
      ) : (
        <div className="requests-grid">
          {requests.map(request => (
            <div key={request.id} className="request-card">
              <div className="property-summary">
                <img src={request.property.image} alt={request.property.title} />
                <div className="property-info">
                  <h4>{request.property.title}</h4>
                  <p>{request.property.price}</p>
                </div>
                <div className={`status-badge ${request.status.toLowerCase()}`}>
                  {request.status}
                </div>
              </div>
              
              <div className="customer-details">
                <div className="customer-header">
                  <div className="customer-avatar">{request.customer.name.charAt(0)}</div>
                  <div>
                    <h5 className="customer-name">{request.customer.name}</h5>
                    <p className="customer-phone">{request.customer.phone || 'No phone provided'}</p>
                  </div>
                </div>
                <div className="request-date">
                  Requested on: {new Date(request.createdAt).toLocaleDateString()}
                </div>
              </div>

              <div className="card-actions">
                {request.status === 'Pending' && (
                  <>
                    <button className="approve-btn" onClick={() => handleUpdateStatus(request.id, 'Approved')}>Approve</button>
                    <button className="reject-btn" onClick={() => handleUpdateStatus(request.id, 'Rejected')}>Reject</button>
                  </>
                )}
                <div className="chat-hint">
                  <span className="hint-icon">💬</span>
                  Click the chat widget to contact this customer!
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <style>{`
        .owner-bookings-page {
          padding: 2rem;
          max-width: 1200px;
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
          margin: 0;
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

        .requests-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
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
          gap: 1.5rem;
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
        .property-info h4 { margin: 0; color: #1e293b; font-size: 1.125rem; }
        .property-info p { margin: 0.25rem 0 0; color: #2563eb; font-weight: 700; }
        
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

        .customer-details {
          background: #f8fafc;
          padding: 1rem;
          border-radius: 12px;
        }
        .customer-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.75rem;
        }
        .customer-avatar {
          width: 40px;
          height: 40px;
          background: #3b82f6;
          color: white;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
        }
        .customer-name { margin: 0; color: #1e293b; font-size: 1rem; }
        .customer-phone { margin: 0; color: #64748b; font-size: 0.875rem; }
        .request-date {
          font-size: 0.75rem;
          color: #94a3b8;
          border-top: 1px solid #e2e8f0;
          padding-top: 0.75rem;
        }

        .card-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 0.5rem;
        }
        .approve-btn, .reject-btn {
          flex: 1;
          padding: 0.75rem;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          border: none;
          transition: background 0.2s;
        }
        .approve-btn {
          background: #0f172a;
          color: white;
        }
        .approve-btn:hover { background: #1e293b; }
        .reject-btn {
          background: #f1f5f9;
          color: #475569;
        }
        .reject-btn:hover { background: #e2e8f0; }
        
        .chat-hint {
          width: 100%;
          text-align: center;
          font-size: 0.8rem;
          color: #3b82f6;
          margin-top: 0.5rem;
          padding: 0.5rem;
          background: #eff6ff;
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
};

export default OwnerBookingsPage;

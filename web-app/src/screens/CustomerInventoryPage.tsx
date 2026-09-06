import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

interface InventoryItem {
  id: string;
  name: string;
  status: string;
  acknowledgedByTenant: boolean;
  acknowledgedByOwner: boolean;
  image?: string;
}

const CustomerInventoryPage: React.FC = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [propertyId, setPropertyId] = useState('');

  const loadInventory = useCallback(async (propId: string) => {
    try {
      const res = await fetch(`/api/properties/${propId}/inventory`);
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        setItems(data);
      } else {
        // Seed some default move-in inventory items for demo
        const seedItems = ['King Size Bed', 'Split AC unit', '3-Seater Sofa', 'Smart LED TV', 'Double Door Refrigerator'];
        const saved: InventoryItem[] = [];
        
        for (const name of seedItems) {
          const createRes = await fetch(`/api/properties/${propId}/inventory`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, status: 'Good' })
          });
          const item = await createRes.json();
          saved.push(item);
        }
        setItems(saved);
      }
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, []);

  const fetchTenantDetails = useCallback(async (tenantId: string) => {
    try {
      const res = await fetch(`/api/tenants/${tenantId}`);
      const data = await res.json();
      if (data && data.propertyId) {
        setPropertyId(data.propertyId);
        loadInventory(data.propertyId);
      } else {
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  }, [loadInventory]);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const u = JSON.parse(stored);
      Promise.resolve().then(() => fetchTenantDetails(u.id));
    } else {
      Promise.resolve().then(() => setLoading(false));
    }
  }, [fetchTenantDetails]);

  const handleAcknowledge = async (id: string) => {
    try {
      const res = await fetch(`/api/inventory/${id}/acknowledge`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'tenant' })
      });
      if (res.ok) {
        const updated = await res.json();
        setItems(prev => prev.map(item => item.id === id ? updated : item));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="customer-inventory-page">
      <header className="page-header">
        <button onClick={() => navigate('/customer')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>Move-In Inventory Verification</h1>
      </header>

      {loading ? (
        <div className="loading-state">Loading move-in inventory checklist...</div>
      ) : !propertyId ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Property Rented Yet</h3>
          <p>You need to book and be assigned to a property to perform inventory sign-off.</p>
        </div>
      ) : (
        <div className="inventory-container">
          <div className="info-banner">
            <strong>⚠️ Tenant Acknowledgment Required:</strong> Please audit the items list below. Verify that all furnishings are intact and click "Acknowledge" to sign off.
          </div>

          <div className="items-list">
            {items.map(item => (
              <div key={item.id} className="inventory-card">
                <div className="item-info">
                  <h3>{item.name}</h3>
                  <div className="status-meta">
                    Condition: <span className="status-good">{item.status}</span>
                  </div>
                </div>

                <div className="acknowledgement-flow">
                  <div className="sign-status">
                    <div>Owner status: <span className="signed">Verified ✓</span></div>
                    <div>
                      Tenant status:{' '}
                      {item.acknowledgedByTenant ? (
                        <span className="signed">Acknowledged ✓</span>
                      ) : (
                        <span className="pending">Pending Sign-off</span>
                      )}
                    </div>
                  </div>
                  
                  {!item.acknowledgedByTenant && (
                    <button 
                      onClick={() => handleAcknowledge(item.id)} 
                      className="ack-btn"
                    >
                      Acknowledge Good Condition
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        .customer-inventory-page {
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
        
        .loading-state, .empty-state {
          text-align: center;
          padding: 5rem;
          background: white;
          border-radius: 24px;
          border: 1px dashed #cbd5e1;
          color: #64748b;
        }
        .empty-icon { font-size: 3rem; margin-bottom: 1rem; }
        .empty-state h3 { color: #1e293b; font-size: 1.5rem; margin-bottom: 0.5rem; }

        .info-banner {
          background: #eff6ff;
          color: #1e40af;
          border: 1px solid #bfdbfe;
          padding: 1.25rem;
          border-radius: 16px;
          font-size: 0.95rem;
          margin-bottom: 2rem;
          line-height: 1.5;
        }

        .items-list {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }
        .inventory-card {
          background: white;
          border-radius: 20px;
          padding: 1.5rem 2rem;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0,0,0,0.03);
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 1.5rem;
        }
        .item-info h3 { margin: 0; font-size: 1.2rem; color: #1e293b; }
        .status-meta { font-size: 0.85rem; color: #64748b; margin-top: 0.5rem; }
        .status-good { color: #10b981; font-weight: 700; }
        
        .acknowledgement-flow {
          display: flex;
          align-items: center;
          gap: 2rem;
          flex-wrap: wrap;
        }
        .sign-status {
          font-size: 0.8rem;
          color: #475569;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }
        .signed { color: #10b981; font-weight: 700; }
        .pending { color: #d97706; font-weight: 700; }

        .ack-btn {
          background: #0f172a;
          color: white;
          border: none;
          padding: 0.6rem 1.25rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: background 0.2s;
        }
        .ack-btn:hover { background: #1e293b; }
      `}</style>
    </div>
  );
};

export default CustomerInventoryPage;

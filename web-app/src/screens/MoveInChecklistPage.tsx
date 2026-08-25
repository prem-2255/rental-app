import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface ChecklistState {
  keys: boolean;
  meter: boolean;
  photos: boolean;
  inventory: boolean;
  agreement: boolean;
}

const MoveInChecklistPage: React.FC = () => {
  const navigate = useNavigate();
  const [role, setRole] = useState<'tenant' | 'owner'>('tenant');
  
  const [tenantChecklist, setTenantChecklist] = useState<ChecklistState>({
    keys: false,
    meter: false,
    photos: false,
    inventory: false,
    agreement: false
  });

  const [ownerChecklist, setOwnerChecklist] = useState<ChecklistState>({
    keys: false,
    meter: false,
    photos: false,
    inventory: false,
    agreement: false
  });

  const [loading, setLoading] = useState(true);
  const [tenantId, setTenantId] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const u = JSON.parse(stored);
      
      // Determine operational role and tenant context
      const userRole = u.role === 'owner' ? 'owner' : 'tenant';
      setRole(userRole);
      
      // In this app, if they are a tenant, the user details contains their checklist.
      // If they are owner, they view the checklist of the tenant they selected (or a default seeded tenant for demo).
      // We will look at query parameter or fetch default tenant.
      const params = new URLSearchParams(window.location.search);
      const tid = params.get('tenantId') || (userRole === 'tenant' ? u.id : '');
      setTenantId(tid);
      
      if (tid) {
        loadChecklist(tid);
      } else {
        // Fallback for owner when no tenant selected: load seeded list
        fetch('/api/users')
          .then(res => res.json())
          .then(users => {
            const firstTenant = users.find((x: any) => x.role === 'tenant');
            if (firstTenant) {
              setTenantId(firstTenant.id);
              loadChecklist(firstTenant.id);
            } else {
              setLoading(false);
            }
          })
          .catch(() => setLoading(false));
      }
    } else {
      setLoading(false);
    }
  }, []);

  const loadChecklist = async (tid: string) => {
    try {
      const res = await fetch(`/api/tenants/${tid}`);
      const data = await res.json();
      if (data) {
        if (data.checklistTenant) {
          if (typeof data.checklistTenant === 'string') {
            try { setTenantChecklist(JSON.parse(data.checklistTenant)); } catch (e) { console.error(e); }
          } else {
            setTenantChecklist(data.checklistTenant);
          }
        }
        if (data.checklistOwner) {
          if (typeof data.checklistOwner === 'string') {
            try { setOwnerChecklist(JSON.parse(data.checklistOwner)); } catch (e) { console.error(e); }
          } else {
            setOwnerChecklist(data.checklistOwner);
          }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleCheck = async (item: keyof ChecklistState) => {
    if (!tenantId) return;
    
    if (role === 'tenant') {
      const updatedTenant = { ...tenantChecklist, [item]: !tenantChecklist[item] };
      setTenantChecklist(updatedTenant);
      await saveChecklist(tenantId, 'tenant', updatedTenant);
    } else {
      const updatedOwner = { ...ownerChecklist, [item]: !ownerChecklist[item] };
      setOwnerChecklist(updatedOwner);
      await saveChecklist(tenantId, 'owner', updatedOwner);
    }
  };

  const saveChecklist = async (tid: string, actionRole: 'tenant' | 'owner', list: ChecklistState) => {
    try {
      await fetch(`/api/users/${tid}/checklist`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          role: actionRole,
          checklist: list
        })
      });
    } catch(err) {
      console.error(err);
    }
  };

  const checklistItems = [
    { key: 'keys' as keyof ChecklistState, label: 'Keys Received', desc: 'Verify physical handover of house keys, mailboxes, and smart lock access.' },
    { key: 'meter' as keyof ChecklistState, label: 'Meter Reading Recorded', desc: 'Take a picture of the electricity and water meters to log reference values.' },
    { key: 'photos' as keyof ChecklistState, label: 'Property Photos Uploaded', desc: 'Upload pre-move-in condition photos of rooms and existing defects.' },
    { key: 'inventory' as keyof ChecklistState, label: 'Inventory Verified', desc: 'Crosscheck furniture, appliances, kitchenware and check status.' },
    { key: 'agreement' as keyof ChecklistState, label: 'Agreement Signed', desc: 'Ensure the digital lease document has been signed by both parties.' },
  ];

  const allDone = 
    tenantChecklist.keys && tenantChecklist.meter && tenantChecklist.photos && tenantChecklist.inventory && tenantChecklist.agreement &&
    ownerChecklist.keys && ownerChecklist.meter && ownerChecklist.photos && ownerChecklist.inventory && ownerChecklist.agreement;

  return (
    <div className="checklist-page">
      <header className="page-header">
        <button onClick={() => navigate(role === 'owner' ? '/owner' : '/customer')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>Move-In Checklist</h1>
      </header>

      {loading ? (
        <div className="loading-state">Loading checklist details...</div>
      ) : !tenantId ? (
        <div className="empty-state">
          <p>No tenant selected. Please open this from a tenant details profile in the owner portal.</p>
        </div>
      ) : (
        <div className="checklist-container">
          {allDone && (
            <div className="success-banner">
              <span className="success-icon">🏡</span>
              <div className="success-text">
                <h3>Move-In Verified & Completed!</h3>
                <p>Both tenant and owner have confirmed all inventory, readings, and keys. Welcome to your new home!</p>
              </div>
            </div>
          )}

          <div className="role-indicator">
            Currently acting as: <strong style={{ color: role === 'owner' ? '#4f46e5' : '#10b981', textTransform: 'capitalize' }}>{role}</strong>
          </div>

          <div className="checklist-list">
            {checklistItems.map(item => {
              const isTenantChecked = tenantChecklist[item.key];
              const isOwnerChecked = ownerChecklist[item.key];
              
              return (
                <div key={item.key} className="checklist-card">
                  <div className="item-detail">
                    <h3 className="item-title">{item.label}</h3>
                    <p className="item-desc">{item.desc}</p>
                  </div>
                  
                  <div className="status-cols">
                    {/* Tenant Status */}
                    <div className="status-col">
                      <span className="party-lbl">Tenant Approval</span>
                      <button 
                        disabled={role !== 'tenant'}
                        onClick={() => handleToggleCheck(item.key)}
                        className={`check-toggle ${isTenantChecked ? 'checked' : ''} ${role !== 'tenant' ? 'disabled' : ''}`}
                      >
                        {isTenantChecked ? '✓ Confirmed' : 'Pending'}
                      </button>
                    </div>

                    {/* Owner Status */}
                    <div className="status-col">
                      <span className="party-lbl">Owner Approval</span>
                      <button 
                        disabled={role !== 'owner'}
                        onClick={() => handleToggleCheck(item.key)}
                        className={`check-toggle ${isOwnerChecked ? 'checked' : ''} ${role !== 'owner' ? 'disabled' : ''}`}
                      >
                        {isOwnerChecked ? '✓ Confirmed' : 'Pending'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <style>{`
        .checklist-page {
          padding: 2rem;
          max-width: 900px;
          margin: 80px auto 0;
          min-height: calc(100vh - 80px);
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
          font-size: 2.25rem;
          font-weight: 800;
          color: #0f172a;
        }
        .checklist-container {
          display: flex;
          flex-direction: column;
          gap: 2rem;
        }
        .success-banner {
          background: #dcfce7;
          border: 1px solid #bbf7d0;
          color: #14532d;
          padding: 2rem;
          border-radius: 24px;
          display: flex;
          align-items: center;
          gap: 1.5rem;
          animation: slideDown 0.4s ease;
        }
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .success-icon {
          font-size: 3rem;
        }
        .success-text h3 {
          margin: 0 0 0.25rem 0;
          font-size: 1.5rem;
        }
        .success-text p {
          margin: 0;
          font-size: 0.95rem;
          opacity: 0.9;
        }
        .role-indicator {
          background: #f1f5f9;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          display: inline-block;
          font-size: 0.9rem;
          font-weight: 600;
          color: #334155;
          align-self: flex-start;
        }
        .checklist-list {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .checklist-card {
          background: white;
          padding: 2rem;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 2rem;
          align-items: center;
        }
        .item-title {
          margin: 0 0 0.5rem 0;
          font-size: 1.25rem;
          color: #0f172a;
        }
        .item-desc {
          margin: 0;
          color: #64748b;
          font-size: 0.9rem;
          line-height: 1.4;
        }
        .status-cols {
          display: flex;
          gap: 1.5rem;
        }
        .status-col {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .party-lbl {
          font-size: 0.7rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #94a3b8;
          letter-spacing: 0.05em;
        }
        .check-toggle {
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          color: #64748b;
          padding: 0.6rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.85rem;
          cursor: pointer;
          transition: all 0.2s;
          text-align: center;
        }
        .check-toggle.checked {
          background: #dcfce7;
          border-color: #86efac;
          color: #166534;
        }
        .check-toggle:hover:not(.disabled) {
          border-color: #3b82f6;
          background: #eff6ff;
          color: #2563eb;
        }
        .check-toggle.disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }
        .loading-state, .empty-state {
          text-align: center;
          padding: 4rem;
          color: #94a3b8;
        }

        @media(max-width: 768px) {
          .checklist-card { grid-template-columns: 1fr; gap: 1.5rem; }
          .status-cols { flex-direction: column; gap: 1rem; }
        }
      `}</style>
    </div>
  );
};

export default MoveInChecklistPage;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface RoommateShare {
  id: string;
  name: string;
  share: number;
  status: 'Paid' | 'Unpaid';
}

const SplitRentPage: React.FC = () => {
  const navigate = useNavigate();
  const [totalRent, setTotalRent] = useState(15000);
  const [roommates, setRoommates] = useState<RoommateShare[]>([
    { id: '1', name: 'You (Tenant)', share: 5000, status: 'Paid' },
    { id: '2', name: 'Rohan Sharma', share: 5000, status: 'Unpaid' },
    { id: '3', name: 'Sneha Patil', share: 5000, status: 'Unpaid' }
  ]);
  const [newRoommateName, setNewRoommateName] = useState('');
  const [newRoommateShare, setNewRoommateShare] = useState('');
  const [userId, _setUserId] = useState(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try { return JSON.parse(stored).id || ''; } catch { return ''; }
    }
    return '';
  });

  const loadSplitData = async (uid: string) => {
    try {
      const res = await fetch(`/api/tenants/${uid}`);
      const tenant = await res.json();
      if (tenant) {
        if (tenant.agreement && tenant.agreement.rent) {
          const numRent = parseInt(tenant.agreement.rent.replace(/[^\d]/g, '')) || 15000;
          setTotalRent(numRent);
        }
        
        if (tenant.splitRent) {
          try {
            const data = JSON.parse(tenant.splitRent);
            if (data.roommates) setRoommates(data.roommates);
            if (data.totalRent) setTotalRent(data.totalRent);
          } catch(e) {
            console.error('Failed to parse splitRent JSON:', e);
          }
        }
      }
    } catch(err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (userId) {
      Promise.resolve().then(() => loadSplitData(userId));
    }
  }, [userId]);

  const handleSaveToDB = async (updatedRoommates: RoommateShare[], currentTotal: number) => {
    if (!userId) return;
    try {
      await fetch(`/api/users/${userId}/split-rent`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          splitRent: {
            totalRent: currentTotal,
            roommates: updatedRoommates
          }
        })
      });
    } catch (err) {
      console.error('Failed to save split rent data:', err);
    }
  };

  const handleToggleStatus = (id: string) => {
    const updated = roommates.map(r => {
      if (r.id === id) {
        return { ...r, status: r.status === 'Paid' ? 'Unpaid' : 'Paid' as any };
      }
      return r;
    });
    setRoommates(updated);
    handleSaveToDB(updated, totalRent);
  };

  const handleAddRoommate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoommateName.trim() || !newRoommateShare) return;
    
    const shareVal = parseFloat(newRoommateShare);
    if (isNaN(shareVal)) return;

    const newR: RoommateShare = {
      id: Math.random().toString(),
      name: newRoommateName,
      share: shareVal,
      status: 'Unpaid'
    };

    const updated = [...roommates, newR];
    setRoommates(updated);
    setNewRoommateName('');
    setNewRoommateShare('');
    handleSaveToDB(updated, totalRent);
  };

  const handleRemoveRoommate = (id: string) => {
    const updated = roommates.filter(r => r.id !== id);
    setRoommates(updated);
    handleSaveToDB(updated, totalRent);
  };

  const totalPaid = roommates
    .filter(r => r.status === 'Paid')
    .reduce((sum, r) => sum + r.share, 0);

  const remainingBalance = totalRent - totalPaid;

  return (
    <div className="split-rent-page">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>Split Rent Utility</h1>
      </header>

      <div className="split-container">
        <div className="stats-cards">
          <div className="stat-box rent">
            <span className="label">Total Property Rent</span>
            <span className="val">₹{totalRent.toLocaleString()}</span>
          </div>
          <div className="stat-box paid">
            <span className="label">Total Paid So Far</span>
            <span className="val">₹{totalPaid.toLocaleString()}</span>
          </div>
          <div className="stat-box balance">
            <span className="label">Remaining Balance</span>
            <span className="val">₹{Math.max(0, remainingBalance).toLocaleString()}</span>
          </div>
        </div>

        <div className="grid-split">
          <div className="card list-section">
            <h2>Roommates Shares & Status</h2>
            <p className="card-subtitle">Tap status badge to mark as Paid/Unpaid</p>
            <div className="roommates-list">
              {roommates.map(r => (
                <div key={r.id} className="roommate-card">
                  <div className="roommate-info">
                    <span className="avatar">👤</span>
                    <div>
                      <div className="name">{r.name}</div>
                      <div className="share-amt">Share: ₹{r.share.toLocaleString()}</div>
                    </div>
                  </div>
                  <div className="roommate-actions">
                    <button 
                      onClick={() => handleToggleStatus(r.id)} 
                      className={`status-btn ${r.status.toLowerCase()}`}
                    >
                      {r.status}
                    </button>
                    {r.id !== '1' && (
                      <button className="delete-btn" onClick={() => handleRemoveRoommate(r.id)}>
                        &times;
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="card form-section">
            <h2>Add Roommate Share</h2>
            <form onSubmit={handleAddRoommate} className="add-roommate-form">
              <div className="form-group">
                <label>Roommate Name</label>
                <input 
                  type="text" 
                  value={newRoommateName} 
                  onChange={(e) => setNewRoommateName(e.target.value)} 
                  placeholder="e.g. Joy Das"
                  required
                />
              </div>
              <div className="form-group">
                <label>Rent Share (₹)</label>
                <input 
                  type="number" 
                  value={newRoommateShare} 
                  onChange={(e) => setNewRoommateShare(e.target.value)} 
                  placeholder="e.g. 5000"
                  required
                />
              </div>
              <button type="submit" className="add-btn">Add to Split</button>
            </form>

            <div className="warning-note" style={{ marginTop: '2rem', padding: '1rem', background: '#fff9db', borderRadius: '12px', border: '1px solid #ffe3e3', fontSize: '0.8rem', color: '#854d0e', lineHeight: 1.4 }}>
              <strong>Note:</strong> Splitting rent does not alter your primary lease terms with the landlord. The primary tenant remains legally responsible for full rent payment.
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .split-rent-page {
          padding: 2rem;
          max-width: 1100px;
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
        .stats-cards {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
          margin-bottom: 3rem;
        }
        .stat-box {
          background: white;
          padding: 1.5rem 2rem;
          border-radius: 24px;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          border: 1px solid #f1f5f9;
          display: flex;
          flex-direction: column;
        }
        .stat-box.rent { border-left: 6px solid #3b82f6; }
        .stat-box.paid { border-left: 6px solid #10b981; }
        .stat-box.balance { border-left: 6px solid #ef4444; }
        .stat-box .label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 0.5rem;
        }
        .stat-box .val {
          font-size: 1.75rem;
          font-weight: 800;
          color: #0f172a;
        }
        .grid-split {
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 3rem;
        }
        .card {
          background: white;
          padding: 2.5rem;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        h2 {
          margin: 0 0 0.5rem 0;
          font-size: 1.5rem;
          color: #0f172a;
        }
        .card-subtitle {
          color: #64748b;
          margin-bottom: 2rem;
          font-size: 0.875rem;
        }
        .roommates-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .roommate-card {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.25rem;
          border-radius: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
        }
        .roommate-info {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .roommate-info .avatar {
          font-size: 1.5rem;
          background: white;
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .roommate-info .name {
          font-weight: 700;
          color: #334155;
        }
        .roommate-info .share-amt {
          font-size: 0.85rem;
          color: #64748b;
          font-weight: 500;
        }
        .roommate-actions {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }
        .status-btn {
          border: none;
          padding: 0.4rem 1rem;
          border-radius: 99px;
          font-weight: 700;
          font-size: 0.75rem;
          cursor: pointer;
          text-transform: uppercase;
        }
        .status-btn.paid { background: #dcfce7; color: #15803d; }
        .status-btn.unpaid { background: #fee2e2; color: #b91c1c; }
        .delete-btn {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 20px;
          cursor: pointer;
        }
        .delete-btn:hover { color: #ef4444; }
        
        .add-roommate-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .form-group label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          color: #475569;
        }
        .form-group input {
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid #cbd5e1;
          background: #f8fafc;
          font-size: 1rem;
          outline: none;
        }
        .form-group input:focus {
          border-color: #3b82f6;
          background: white;
        }
        .add-btn {
          padding: 1rem;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 12px;
          font-weight: 700;
          font-size: 1rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .add-btn:hover {
          background: #1e293b;
          transform: translateY(-2px);
        }

        @media (max-width: 900px) {
          .stats-cards { grid-template-columns: 1fr; }
          .grid-split { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
};

export default SplitRentPage;

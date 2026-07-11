import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface BroadcastLog {
  id: string;
  title: string;
  text: string;
  date: string;
}

const BroadcastPage: React.FC = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [logs, setLogs] = useState<BroadcastLog[]>([
    { id: '1', title: 'Water Maintenance Notice', text: 'Water supply will be temporarily suspended tomorrow between 10:00 AM and 1:00 PM for pipeline repairs.', date: '2026-06-20' },
    { id: '2', title: 'Community Guidelines', text: 'Please ensure garbage is disposed of in the designated bins. Let\'s keep our community clean.', date: '2026-06-15' }
  ]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setIsSending(true);
    const broadcastTitle = title.trim() || 'Urgent Notice';

    try {
      const res = await fetch('/api/broadcast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: broadcastTitle,
          text: message.trim()
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setLogs(prev => [data.broadcast, ...prev]);
        setTitle('');
        setMessage('');
        alert('📢 Broadcast sent in real-time to all online tenants!');
      } else {
        alert(data.error || 'Failed to send broadcast');
      }
    } catch (err) {
      console.error('Error sending broadcast:', err);
      alert('Failed to send broadcast due to network error.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="broadcast-page-container">
      <header className="page-header">
        <button onClick={() => navigate('/owner')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back to Portal
        </button>
        <h1 className="main-title">Live Announcement Hub</h1>
        <p className="subtitle">Push critical notifications and alerts to all your tenants in real-time.</p>
      </header>

      <div className="broadcast-grid">
        {/* Composer Card */}
        <div className="broadcast-card composer">
          <h2 className="card-title">Compose Broadcast</h2>
          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <label htmlFor="b-title">Notice Title</label>
              <input 
                id="b-title"
                type="text" 
                placeholder="e.g. Fire Drill Schedule, Maintenance Notice" 
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="broadcast-input"
              />
            </div>
            
            <div className="input-group">
              <label htmlFor="b-msg">Broadcast Message</label>
              <textarea 
                id="b-msg"
                placeholder="Type the message details here..." 
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="broadcast-textarea"
                required
              />
            </div>

            <button 
              type="submit" 
              className="broadcast-send-btn" 
              disabled={isSending || !message.trim()}
            >
              {isSending ? 'Sending...' : '📢 Push Live Broadcast'}
            </button>
          </form>
        </div>

        {/* Live Status Monitor & Logs */}
        <div className="broadcast-sidebar">
          {/* Real-time Status Card */}
          <div className="broadcast-card status-card">
            <div className="status-header">
              <div className="pulse-indicator"></div>
              <h3>WebSocket Gateway Active</h3>
            </div>
            <p className="status-desc">All tenants logged into the portal will instantly receive alerts on their screen.</p>
          </div>

          {/* Broadcast Logs */}
          <div className="broadcast-card logs-card">
            <h2 className="card-title">Broadcast History</h2>
            <div className="logs-list">
              {logs.map(log => (
                <div key={log.id} className="log-item">
                  <div className="log-header">
                    <h4>{log.title}</h4>
                    <span className="log-date">{log.date}</span>
                  </div>
                  <p className="log-text">{log.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .broadcast-page-container {
          padding: 2rem;
          max-width: 1100px;
          margin: 0 auto;
          min-height: 90vh;
          font-family: 'Inter', sans-serif;
        }

        .page-header {
          margin-bottom: 2.5rem;
        }

        .back-button {
          background: none;
          border: 1px solid #e2e8f0;
          padding: 0.5rem 1.25rem;
          border-radius: 99px;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          color: #64748b;
          font-weight: 600;
          transition: all 0.2s;
          margin-bottom: 1.5rem;
          font-size: 14px;
        }
        .back-button:hover {
          background: #f8fafc;
          border-color: #cbd5e1;
          color: #0f172a;
        }

        .main-title {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0f172a;
          margin: 0;
          letter-spacing: -0.02em;
        }

        .subtitle {
          color: #64748b;
          font-size: 1.1rem;
          margin: 0.5rem 0 0;
        }

        .broadcast-grid {
          display: grid;
          grid-template-columns: 1.2fr 0.8fr;
          gap: 2rem;
        }

        .broadcast-card {
          background: white;
          border-radius: 24px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 4px 20px rgba(0,0,0,0.02);
          padding: 2rem;
        }

        .card-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 1.5rem;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        .input-group label {
          font-size: 13px;
          font-weight: 600;
          color: #64748b;
        }

        .broadcast-input {
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          padding: 0.8rem 1.2rem;
          font-size: 14px;
          outline: none;
          transition: all 0.2s;
        }
        .broadcast-input:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .broadcast-textarea {
          border: 2px solid #e2e8f0;
          border-radius: 14px;
          padding: 1rem 1.2rem;
          font-size: 14px;
          outline: none;
          min-height: 150px;
          resize: vertical;
          transition: all 0.2s;
          font-family: inherit;
        }
        .broadcast-textarea:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.1);
        }

        .broadcast-send-btn {
          width: 100%;
          background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
          color: white;
          border: none;
          border-radius: 16px;
          padding: 1rem;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
        }
        .broadcast-send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3);
        }
        .broadcast-send-btn:disabled {
          background: #cbd5e1;
          color: #94a3b8;
          cursor: not-allowed;
          box-shadow: none;
        }

        .broadcast-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .status-card {
          background: #eff6ff;
          border: 1px solid #bfdbfe;
          padding: 1.5rem;
        }

        .status-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }

        .status-header h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #1e3a8a;
        }

        .pulse-indicator {
          width: 12px;
          height: 12px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.4);
          animation: pulse 1.5s infinite;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
          }
          70% {
            transform: scale(1);
            box-shadow: 0 0 0 8px rgba(16, 185, 129, 0);
          }
          100% {
            transform: scale(0.95);
            box-shadow: 0 0 0 0 rgba(16, 185, 129, 0);
          }
        }

        .status-desc {
          margin: 0;
          font-size: 13px;
          color: #1e40af;
          line-height: 1.5;
        }

        .logs-card {
          flex: 1;
          max-height: 380px;
          display: flex;
          flex-direction: column;
        }

        .logs-list {
          flex: 1;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .log-item {
          padding: 1rem;
          background: #f8fafc;
          border-radius: 16px;
          border: 1px solid #e2e8f0;
        }

        .log-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .log-header h4 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #1e293b;
        }

        .log-date {
          font-size: 11px;
          color: #94a3b8;
        }

        .log-text {
          margin: 0;
          font-size: 13px;
          color: #475569;
          line-height: 1.4;
        }
      `}</style>
    </div>
  );
};

export default BroadcastPage;

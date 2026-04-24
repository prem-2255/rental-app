import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Payment {
  id: string;
  type: 'rent' | 'electricity' | 'other';
  amount: number;
  date: string;
  forMonth?: string;
}

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = React.useState<Payment[]>([]);

  React.useEffect(() => {
    fetch('/api/tenants')
      .then(res => res.json())
      .then(tenants => {
        if (tenants.length > 0) {
          return fetch(`/api/tenants/${tenants[0].id}/payments`);
        }
        return [];
      })
      .then(res => {
        if (Array.isArray(res)) return res;
        return res.json();
      })
      .then(data => {
        if (Array.isArray(data)) setPayments(data);
      })
      .catch(console.error);
  }, []);

  return (
    <div className="payments-page">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>Payment History</h1>
      </header>

      <div className="payments-list">
        {payments.length === 0 ? (
          <div className="empty-state">
            <p>No payments recorded yet.</p>
          </div>
        ) : (
          payments.map((payment) => (
            <div key={payment.id} className="payment-card-item">
              <div className="payment-main">
                <div className={`payment-icon ${payment.type}`}>
                  {payment.type === 'rent' ? '🏠' : '⚡'}
                </div>
                <div className="payment-details">
                  <div className="payment-type-text">
                    {payment.type === 'rent' ? 'Rent Payment' : 'Electricity Bill'}
                  </div>
                  <div className="payment-meta">
                    {payment.forMonth && <span className="month">{payment.forMonth} • </span>}
                    <span className="date">{new Date(payment.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
              <div className="payment-amount">
                ₹{payment.amount.toLocaleString()}
              </div>
            </div>
          ))
        )}
      </div>

      <style>{`
        .payments-page {
          padding: 2rem;
          max-width: 800px;
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
          font-size: 2rem;
          font-weight: 800;
          color: #111827;
        }
        .payments-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .payment-card-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 1.5rem;
          border-radius: 20px;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          border: 1px solid #f1f5f9;
          transition: transform 0.2s;
        }
        .payment-card-item:hover {
          transform: scale(1.02);
        }
        .payment-main {
          display: flex;
          align-items: center;
          gap: 1.25rem;
        }
        .payment-icon {
          width: 52px;
          height: 52px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }
        .payment-icon.rent {
          background: #eff6ff;
        }
        .payment-icon.electricity {
          background: #fefce8;
        }
        .payment-details {
          display: flex;
          flex-direction: column;
        }
        .payment-type-text {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
        }
        .payment-meta {
          font-size: 0.875rem;
          color: #64748b;
        }
        .payment-amount {
          font-size: 1.5rem;
          font-weight: 800;
          color: #10b981;
        }
        .empty-state {
          text-align: center;
          padding: 4rem 2rem;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default PaymentsPage;

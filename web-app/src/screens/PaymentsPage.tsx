import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface Payment {
  id: string;
  type: string;
  amount: string;
  date: string;
}

const PaymentsPage: React.FC = () => {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadPayments = async () => {
      try {
        const stored = localStorage.getItem('currentUser');
        if (stored) {
          const user = JSON.parse(stored);
          const res = await fetch(`/api/tenants/${user.id}/payments`);
          const data = await res.json();
          if (Array.isArray(data)) {
            setPayments(data);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadPayments();
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
        <h1>Payment Receipts & History</h1>
      </header>

      {loading ? (
        <div className="loading-state">Fetching billing history...</div>
      ) : (
        <div className="payments-list">
          {payments.length === 0 ? (
            <div className="empty-state">
              <p>No payments recorded yet.</p>
            </div>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="payment-card-item">
                <div className="payment-main">
                  <div className={`payment-icon ${payment.type.toLowerCase()}`}>
                    {payment.type === 'Electricity' ? '⚡' : '🏠'}
                  </div>
                  <div className="payment-details">
                    <div className="payment-type-text">
                      {payment.type} Payment
                    </div>
                    <div className="payment-meta">
                      <span className="date">Paid on {payment.date}</span>
                    </div>
                  </div>
                </div>
                <div className="amount-action">
                  <div className="payment-amount">
                    {payment.amount}
                  </div>
                  <button 
                    className="receipt-btn" 
                    onClick={() => alert(`Receipt downloaded for transaction ID: ${payment.id}`)}
                  >
                    📄 Receipt
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

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
        .loading-state {
          text-align: center;
          padding: 4rem;
          color: #64748b;
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
          transform: scale(1.01);
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
        .payment-icon.electricity { background: #fefce8; }
        .payment-icon.rent { background: #eff6ff; }
        .payment-icon.deposit { background: #f0fdf4; }
        .payment-icon.maintenance { background: #fdf2f8; }

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
        .amount-action {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .payment-amount {
          font-size: 1.5rem;
          font-weight: 800;
          color: #10b981;
        }
        .receipt-btn {
          background: #f1f5f9;
          border: none;
          color: #475569;
          padding: 0.5rem 0.75rem;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 700;
          cursor: pointer;
        }
        .receipt-btn:hover { background: #e2e8f0; }

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

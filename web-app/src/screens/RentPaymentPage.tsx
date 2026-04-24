import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UPIPaymentModal from '../components/UPIPaymentModal';

const RentPaymentPage: React.FC = () => {
  const navigate = useNavigate();
  const [month, setMonth] = useState('');
  const [amount, setAmount] = useState('2100');
  const [isUPIModalOpen, setIsUPIModalOpen] = useState(false);

  const handlePay = () => {
    console.log('Payment processed');
    setIsUPIModalOpen(false);
    navigate('/pay-history');
  };

  return (
    <div className="rent-payment-page">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>Secure Rent Payment</h1>
      </header>

      <div className="payment-content">
        <div className="summary-card">
          <div className="summary-row">
            <span className="label">Property</span>
            <span className="value">Prem's House</span>
          </div>
          <div className="summary-row">
            <span className="label">Fixed Rent</span>
            <span className="value">₹2,100</span>
          </div>
          <div className="summary-divider"></div>
          <div className="summary-row total">
            <span className="total-label">Paying Now</span>
            <span className="total-value">₹{amount || '0'}</span>
          </div>
        </div>

        <div className="payment-form">
          <div className="input-field">
            <label>For Month</label>
            <input 
              type="text" 
              placeholder="e.g. Nov 2026" 
              value={month}
              onChange={(e) => setMonth(e.target.value)}
            />
          </div>

          <div className="input-field">
            <label>Amount (₹)</label>
            <input 
              type="number" 
              placeholder="Enter amount" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <button 
            className={`pay-now-button ${(!month || !amount) ? 'disabled' : ''}`}
            disabled={!month || !amount}
            onClick={() => setIsUPIModalOpen(true)}
          >
            Proceed to Pay
          </button>
        </div>

        <div className="security-info">
          <span>🔒</span>
          <p>Secure encrypted payment via UPI</p>
        </div>
      </div>

      <UPIPaymentModal 
        isOpen={isUPIModalOpen}
        onClose={() => setIsUPIModalOpen(false)}
        amount={parseFloat(amount) || 0}
        description={`Rent for ${month}`}
        onConfirm={handlePay}
      />

      <style>{`
        .rent-payment-page {
          padding: 2rem;
          max-width: 600px;
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
        .summary-card {
          background: #4f46e5;
          color: white;
          padding: 2.5rem;
          border-radius: 32px;
          margin-bottom: 2rem;
          box-shadow: 0 20px 25px -5px rgba(79, 70, 229, 0.2);
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.75rem;
        }
        .summary-row .label {
          font-size: 0.875rem;
          color: #e0e7ff;
        }
        .summary-row .value {
          font-weight: 700;
          font-size: 1.125rem;
        }
        .summary-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.1);
          margin: 1.5rem 0;
        }
        .summary-row.total .total-label {
          font-size: 1.125rem;
          font-weight: 700;
        }
        .summary-row.total .total-value {
          font-size: 1.75rem;
          font-weight: 800;
        }
        .payment-form {
          background: white;
          padding: 2.5rem;
          border-radius: 32px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
          margin-bottom: 2rem;
        }
        .input-field {
          margin-bottom: 1.5rem;
        }
        .input-field label {
          display: block;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #475569;
          margin-bottom: 0.5rem;
        }
        .input-field input {
          width: 100%;
          padding: 1rem 1.25rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
        }
        .input-field input:focus {
          border-color: #4f46e5;
          background: white;
          box-shadow: 0 0 0 4px rgba(79, 70, 229, 0.1);
        }
        .pay-now-button {
          width: 100%;
          padding: 1.25rem;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.2);
        }
        .pay-now-button:hover:not(.disabled) {
          background: #059669;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
        }
        .pay-now-button.disabled {
          background: #cbd5e1;
          cursor: not-allowed;
          box-shadow: none;
        }
        .security-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          color: #94a3b8;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default RentPaymentPage;

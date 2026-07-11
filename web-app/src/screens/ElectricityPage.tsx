import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import UPIPaymentModal from '../components/UPIPaymentModal';

interface Bill {
  id: string;
  month: string;
  units: number;
  ratePerUnit: number;
  amount: number;
  status: 'paid' | 'unpaid';
}

const ElectricityPage: React.FC = () => {
  const navigate = useNavigate();
  const [bills, setBills] = useState<Bill[]>([]);

  React.useEffect(() => {
    const loadBills = async () => {
      try {
        const tenantsRes = await fetch('/api/tenants');
        const tenants = await tenantsRes.json();
        if (tenants && tenants.length > 0) {
          const billsRes = await fetch(`/api/tenants/${tenants[0].id}/electricity`);
          const data = await billsRes.json();
          if (Array.isArray(data)) setBills(data);
        }
      } catch (err) {
        console.error(err);
      }
    };
    loadBills();
  }, []);
  const [isUPIModalOpen, setIsUPIModalOpen] = useState(false);
  const [payingBill, setPayingBill] = useState<Bill | null>(null);

  // Calculator State
  const [calcUnits, setCalcUnits] = useState<string>('');
  const [calcTotalBill, setCalcTotalBill] = useState<string>('');

  const pricePerUnit = (calcUnits && calcTotalBill && parseFloat(calcUnits) !== 0) 
    ? (parseFloat(calcTotalBill) / parseFloat(calcUnits)).toFixed(2)
    : '0.00';

  const handlePay = () => {
    if (!payingBill) return;
    setBills(prev => prev.map(b => b.id === payingBill.id ? { ...b, status: 'paid' } : b));
    setIsUPIModalOpen(false);
    navigate('/pay-history');
  };

  const openPayment = (bill: Bill) => {
    setPayingBill(bill);
    setIsUPIModalOpen(true);
  };

  return (
    <div className="electricity-page">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>Utility Management</h1>
      </header>

      <div className="utility-content">
        <div className="info-card">
          <div className="info-icon">⚡</div>
          <div className="info-text">
            <h3>Electricity Bills</h3>
            <p>Track and pay your monthly utility charges easily.</p>
          </div>
        </div>

        <div className="calculator-card">
          <div className="calc-header">
            <h3>⚡ Unit Rate Calculator</h3>
            <p>Calculate your price per unit quickly.</p>
          </div>
          <div className="calc-grid">
            <div className="input-group">
              <label>Units Consumed</label>
              <input 
                type="number" 
                placeholder="e.g. 120" 
                value={calcUnits}
                onChange={(e) => setCalcUnits(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Total Bill Amount (₹)</label>
              <input 
                type="number" 
                placeholder="e.g. 960" 
                value={calcTotalBill}
                onChange={(e) => setCalcTotalBill(e.target.value)}
              />
            </div>
            <div className="result-group">
              <label>Price Per Unit</label>
              <div className="result-value">₹{pricePerUnit}</div>
            </div>
          </div>
        </div>

        <div className="bills-section">
          <h2>Recent Bills</h2>
          <div className="bills-list">
            {bills.map(bill => (
              <div key={bill.id} className="bill-card-item">
                <div className="bill-main">
                  <div className="bill-icon">📋</div>
                  <div className="bill-details">
                    <div className="bill-month">{bill.month}</div>
                    <div className="bill-meta">{bill.units} units @ ₹{bill.ratePerUnit}</div>
                  </div>
                </div>
                <div className="bill-action">
                  <div className="bill-amount">₹{bill.amount}</div>
                  {bill.status === 'unpaid' ? (
                    <button className="pay-bill-btn" onClick={() => openPayment(bill)}>Pay Now</button>
                  ) : (
                    <span className="paid-badge">Paid</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {payingBill && (
        <UPIPaymentModal 
          isOpen={isUPIModalOpen}
          onClose={() => setIsUPIModalOpen(false)}
          amount={payingBill.amount}
          description={`Electricity bill for ${payingBill.month}`}
          onConfirm={handlePay}
        />
      )}

      <style>{`
        .electricity-page {
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
        .info-card {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          background: #f8fafc;
          padding: 2rem;
          border-radius: 24px;
          margin-bottom: 3rem;
          border: 1px solid #e2e8f0;
        }
        .info-icon {
          width: 64px;
          height: 64px;
          background: #fef3c7;
          border-radius: 20px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 2rem;
        }
        .info-text h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }
        .info-text p {
          color: #64748b;
          font-size: 1rem;
        }
        .calculator-card {
          background: white;
          padding: 2rem;
          border-radius: 24px;
          margin-bottom: 3rem;
          border: 1px solid #e2e8f0;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .calc-header {
          margin-bottom: 1.5rem;
        }
        .calc-header h3 {
          font-size: 1.25rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 0.25rem;
        }
        .calc-header p {
          color: #64748b;
          font-size: 0.875rem;
        }
        .calc-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1.5rem;
          align-items: flex-end;
        }
        .input-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }
        .input-group label {
          font-size: 0.875rem;
          font-weight: 600;
          color: #64748b;
        }
        .input-group input {
          width: 100%;
          padding: 0.75rem 1rem;
          border-radius: 12px;
          border: 1px solid #e2e8f0;
          background: #f8fafc;
          font-size: 1rem;
          font-weight: 600;
          color: #1e293b;
          transition: all 0.2s;
        }
        .input-group input:focus {
          outline: none;
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
        }
        .result-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          background: #eff6ff;
          padding: 1rem;
          border-radius: 16px;
          border: 1px solid #dbeafe;
        }
        .result-group label {
          font-size: 0.75rem;
          font-weight: 700;
          color: #2563eb;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }
        .result-value {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e40af;
        }
        .bills-section h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
          margin-bottom: 1.5rem;
        }
        .bills-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        .bill-card-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: white;
          padding: 1.5rem;
          border-radius: 20px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        .bill-main {
          display: flex;
          align-items: center;
          gap: 1rem;
        }
        .bill-icon {
          width: 48px;
          height: 48px;
          background: #f1f5f9;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.25rem;
        }
        .bill-month {
          font-size: 1.125rem;
          font-weight: 700;
          color: #1e293b;
        }
        .bill-meta {
          font-size: 0.875rem;
          color: #64748b;
        }
        .bill-action {
          text-align: right;
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 0.5rem;
        }
        .bill-amount {
          font-size: 1.25rem;
          font-weight: 800;
          color: #0f172a;
        }
        .pay-bill-btn {
          background: #10b981;
          color: white;
          border: none;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pay-bill-btn:hover {
          background: #059669;
          transform: translateY(-2px);
        }
        .paid-badge {
          background: #ecfdf5;
          color: #059669;
          padding: 0.5rem 1rem;
          border-radius: 10px;
          font-weight: 700;
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default ElectricityPage;

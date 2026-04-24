import React from 'react';

interface UPIPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  amount: number;
  description: string;
  onConfirm: (app: string) => void;
}

const upiApps = [
  { id: 'gpay', name: 'Google Pay', icon: 'https://upload.wikimedia.org/wikipedia/commons/b/b5/Google_Pay_Logo.svg' },
  { id: 'phonepe', name: 'PhonePe', icon: 'https://download.logo.wine/logo/PhonePe/PhonePe-Logo.wine.png' },
  { id: 'paytm', name: 'Paytm', icon: 'https://upload.wikimedia.org/wikipedia/commons/2/24/Paytm_Logo_%28standalone%29.svg' },
  { id: 'bhim', name: 'BHIM UPI', icon: 'https://upload.wikimedia.org/wikipedia/commons/e/e1/BHIM_logo.svg' },
];

const UPIPaymentModal: React.FC<UPIPaymentModalProps> = ({ isOpen, onClose, amount, description, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content upi-modal">
        <div className="modal-header">
          <h2>Select UPI App</h2>
          <button onClick={onClose} className="close-btn">&times;</button>
        </div>
        
        <div className="payment-summary">
          <div className="summary-item">
            <span className="label">Amount</span>
            <span className="value">₹{amount.toFixed(2)}</span>
          </div>
          <p className="description">{description}</p>
        </div>

        <div className="upi-apps-grid">
          {upiApps.map((app) => (
            <button key={app.id} className="upi-app-btn" onClick={() => onConfirm(app.id)}>
              <div className="app-icon-wrapper">
                <img src={app.icon} alt={app.name} />
              </div>
              <span>{app.name}</span>
            </button>
          ))}
        </div>

        <div className="modal-footer">
          <p className="security-note">🔒 Secure encrypted UPI payment</p>
        </div>
      </div>

      <style>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(4px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        .upi-modal {
          background: white;
          width: 90%;
          max-width: 400px;
          border-radius: 24px;
          padding: 2rem;
          box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .modal-header h2 {
          font-size: 1.5rem;
          font-weight: 800;
          color: #1e293b;
        }
        .close-btn {
          background: none;
          border: none;
          font-size: 2rem;
          color: #94a3b8;
          cursor: pointer;
        }
        .payment-summary {
          background: #f8fafc;
          padding: 1.25rem;
          border-radius: 16px;
          margin-bottom: 2rem;
          text-align: center;
        }
        .summary-item {
          display: flex;
          flex-direction: column;
          align-items: center;
          margin-bottom: 0.5rem;
        }
        .summary-item .label {
          font-size: 0.875rem;
          color: #64748b;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          font-weight: 600;
        }
        .summary-item .value {
          font-size: 2rem;
          font-weight: 800;
          color: #0f172a;
        }
        .payment-summary .description {
          font-size: 0.875rem;
          color: #64748b;
        }
        .upi-apps-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin-bottom: 2rem;
        }
        .upi-app-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.25rem;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .upi-app-btn:hover {
          border-color: #3b82f6;
          background: #eff6ff;
          transform: translateY(-2px);
        }
        .app-icon-wrapper {
          width: 48px;
          height: 48px;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .app-icon-wrapper img {
          max-width: 100%;
          max-height: 100%;
        }
        .upi-app-btn span {
          font-size: 0.875rem;
          font-weight: 600;
          color: #1e293b;
        }
        .security-note {
          text-align: center;
          font-size: 0.75rem;
          color: #94a3b8;
        }
      `}</style>
    </div>
  );
};

export default UPIPaymentModal;

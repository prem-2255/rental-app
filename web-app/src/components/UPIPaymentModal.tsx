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
          background: rgba(6, 11, 24, 0.85);
          backdrop-filter: blur(16px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
        }
        .upi-modal {
          background: rgba(10, 22, 40, 0.95);
          backdrop-filter: blur(32px);
          border: 1px solid rgba(255, 255, 255, 0.12);
          width: 90%;
          max-width: 420px;
          border-radius: 28px;
          padding: 2.25rem;
          color: #ffffff;
          box-shadow: 0 30px 60px -15px rgba(0, 0, 0, 0.7);
        }
        .modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }
        .modal-header h2 {
          font-size: 1.6rem;
          font-weight: 800;
          color: #ffffff;
        }
        .close-btn {
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.2s;
        }
        .close-btn:hover {
          background: rgba(255, 255, 255, 0.18);
          color: #ffffff;
        }
        .payment-summary {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          padding: 1.5rem;
          border-radius: 20px;
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
          font-size: 0.8rem;
          color: var(--text-secondary);
          text-transform: uppercase;
          letter-spacing: 0.08em;
          font-weight: 700;
        }
        .summary-item .value {
          font-size: 2.25rem;
          font-weight: 800;
          color: var(--aurora-green);
        }
        .payment-summary .description {
          font-size: 0.9rem;
          color: var(--text-secondary);
        }
        .upi-apps-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.15rem;
          margin-bottom: 2rem;
        }
        .upi-app-btn {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 0.75rem;
          padding: 1.35rem;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.12);
          border-radius: 20px;
          cursor: pointer;
          transition: all 0.25s ease;
        }
        .upi-app-btn:hover {
          border-color: var(--aurora-green);
          background: rgba(0, 229, 160, 0.12);
          transform: translateY(-3px);
        }
        .app-icon-wrapper {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 6px;
        }
        .app-icon-wrapper img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }
        .upi-app-btn span {
          font-size: 0.9rem;
          font-weight: 700;
          color: #ffffff;
        }
        .security-note {
          text-align: center;
          font-size: 0.8rem;
          color: var(--text-muted);
        }
      `}</style>
    </div>
  );
};

export default UPIPaymentModal;

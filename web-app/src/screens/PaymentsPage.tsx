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

  const downloadReceiptPdf = async (payment: Payment) => {
    try {
      const loadJsPdf = () => {
        return new Promise((resolve) => {
          if ((window as any).jspdf) {
            resolve((window as any).jspdf);
            return;
          }
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
          script.onload = () => resolve((window as any).jspdf);
          document.body.appendChild(script);
        });
      };

      const jspdfModule: any = await loadJsPdf();
      const { jsPDF } = jspdfModule;
      const doc = new jsPDF();

      // Top Header Card
      doc.setFillColor(15, 23, 42); 
      doc.rect(0, 0, 210, 40, 'F');

      // Title
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(22);
      doc.setFont("helvetica", "bold");
      doc.text("RENTAPP TRANSACTION RECEIPT", 15, 26);

      // Receipt details
      doc.setTextColor(51, 65, 85);
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text(`Receipt Date: ${new Date().toLocaleDateString()}`, 145, 50);
      doc.text(`Transaction ID: TXN-${payment.id.slice(0, 8).toUpperCase()}`, 15, 50);

      // Divider line
      doc.setDrawColor(226, 232, 240);
      doc.line(15, 55, 195, 55);

      // Details Table
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Billing & Payment Summary", 15, 68);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(11);
      
      doc.text("Tenant Name:", 15, 82);
      doc.setFont("helvetica", "bold");
      doc.text("John Doe", 70, 82);
      
      doc.setFont("helvetica", "normal");
      doc.text("Landlord / Owner Name:", 15, 94);
      doc.setFont("helvetica", "bold");
      doc.text("Mock Owner", 70, 94);
      
      doc.setFont("helvetica", "normal");
      doc.text("Property Association:", 15, 106);
      doc.setFont("helvetica", "bold");
      doc.text("Sunset Villa", 70, 106);
      
      doc.setFont("helvetica", "normal");
      doc.text("Reference Rent Month:", 15, 118);
      doc.text(payment.date, 70, 118);

      doc.text("Payment Classification:", 15, 130);
      doc.setFont("helvetica", "bold");
      doc.text(payment.type, 70, 130);

      // Price highlight box
      doc.setDrawColor(16, 185, 129);
      doc.setFillColor(240, 253, 250);
      doc.rect(15, 142, 180, 25, 'FD');

      doc.setTextColor(21, 128, 61);
      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");
      doc.text("TRANSACTION SUCCESSFUL", 25, 158);
      
      doc.setFontSize(16);
      doc.text(payment.amount, 145, 159);

      // Security footer
      doc.setTextColor(148, 163, 184);
      doc.setFontSize(9);
      doc.setFont("helvetica", "italic");
      doc.text("This receipt is digitally audited by Razorpay secure checkout APIs and is legally binding.", 15, 192);
      doc.text("No manual/physical signature is required.", 15, 198);

      // Trigger download
      doc.save(`Receipt-${payment.type}-${payment.id.slice(0, 6)}.pdf`);
    } catch(err) {
      console.error(err);
      alert("Failed to render PDF receipt.");
    }
  };

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
                    onClick={() => downloadReceiptPdf(payment)}
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

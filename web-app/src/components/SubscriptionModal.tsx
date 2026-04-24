import React from 'react';

interface Plan {
  id: string;
  name: string;
  price: string;
  features: string[];
  color: string;
  isPopular?: boolean;
}

const plans: Plan[] = [
  {
    id: 'basic',
    name: 'Basic',
    price: 'Free',
    features: ['Search Rentals', 'View Documents', 'Standard Support'],
    color: '#64748b',
  },
  {
    id: 'premium',
    name: 'Premium',
    price: '₹499/mo',
    features: ['Instant Booking', 'Unlimited Documents', 'Priority Support', 'Electricity Tracker'],
    color: '#3b82f6',
    isPopular: true,
  },
  {
    id: 'elite',
    name: 'Elite',
    price: '₹1,299/mo',
    features: ['Full Portfolio Management', 'Advanced Analytics', 'Owner Dashboard', 'Agreement Automation'],
    color: '#8b5cf6',
  },
];

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: Plan) => void;
}

const SubscriptionModal: React.FC<SubscriptionModalProps> = ({ isOpen, onClose, onSelectPlan }) => {
  if (!isOpen) return null;

  return (
    <div className="subscription-overlay">
      <div className="subscription-content">
        <button className="close-btn" onClick={onClose}>&times;</button>
        <div className="sub-header">
          <h2>Upgrade to Premium</h2>
          <p>Choose the plan that fits your lifestyle and management needs.</p>
        </div>

        <div className="plans-grid">
          {plans.map((plan) => (
            <div 
              key={plan.id} 
              className={`plan-card ${plan.isPopular ? 'popular' : ''}`}
              style={{ '--plan-color': plan.color } as React.CSSProperties}
            >
              {plan.isPopular && <div className="popular-badge">Most Popular</div>}
              <div className="plan-name">{plan.name}</div>
              <div className="plan-price">{plan.price}</div>
              <ul className="plan-features">
                {plan.features.map((feature, i) => (
                  <li key={i}><span>✓</span> {feature}</li>
                ))}
              </ul>
              <button 
                className="select-plan-btn"
                onClick={() => onSelectPlan(plan)}
              >
                Choose {plan.name}
              </button>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .subscription-overlay {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.8);
          backdrop-filter: blur(12px);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 2000;
          padding: 2rem;
          animation: fadeIn 0.3s ease-out;
        }

        .subscription-content {
          background: white;
          width: 100%;
          max-width: 1000px;
          border-radius: 32px;
          padding: 3rem;
          position: relative;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .close-btn {
          position: absolute;
          top: 1.5rem;
          right: 1.5rem;
          background: #f1f5f9;
          border: none;
          width: 40px;
          height: 40px;
          border-radius: 50%;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s;
          color: #64748b;
        }

        .close-btn:hover {
          background: #e2e8f0;
          color: #0f172a;
          transform: rotate(90deg);
        }

        .sub-header {
          text-align: center;
          margin-bottom: 3rem;
        }

        .sub-header h2 {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 0.5rem;
        }

        .sub-header p {
          color: #64748b;
          font-size: 1.125rem;
        }

        .plans-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .plan-card {
          padding: 2.5rem;
          border-radius: 24px;
          border: 1px solid #e2e8f0;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
          position: relative;
          background: #fff;
        }

        .plan-card.popular {
          border-color: var(--plan-color);
          box-shadow: 0 20px 40px -10px rgba(59, 130, 246, 0.2);
          transform: scale(1.05);
          z-index: 1;
        }

        .plan-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.1);
        }

        .popular-badge {
          position: absolute;
          top: -12px;
          left: 50%;
          transform: translateX(-50%);
          background: var(--plan-color);
          color: white;
          padding: 0.25rem 1rem;
          border-radius: 99px;
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .plan-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #64748b;
          margin-bottom: 0.5rem;
        }

        .plan-price {
          font-size: 2.5rem;
          font-weight: 800;
          color: #0f172a;
          margin-bottom: 2rem;
        }

        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 2.5rem 0;
          flex: 1;
        }

        .plan-features li {
          margin-bottom: 1rem;
          color: #475569;
          font-size: 1rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .plan-features li span {
          color: var(--plan-color);
          font-weight: 900;
        }

        .select-plan-btn {
          width: 100%;
          padding: 1rem;
          border-radius: 12px;
          border: 2px solid #e2e8f0;
          background: transparent;
          color: #0f172a;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }

        .plan-card.popular .select-plan-btn {
          background: var(--plan-color);
          border-color: var(--plan-color);
          color: white;
        }

        .plan-card:hover .select-plan-btn {
          background: var(--plan-color);
          border-color: var(--plan-color);
          color: white;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }

        @media (max-width: 768px) {
          .subscription-content {
            padding: 2rem;
          }
          .plan-card.popular {
            transform: none;
          }
        }
      `}</style>
    </div>
  );
};

export default SubscriptionModal;

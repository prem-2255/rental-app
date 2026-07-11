import React from 'react';
import { useNavigate } from 'react-router-dom';

const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => {
  const navigate = useNavigate();
  return (
    <div className="placeholder-page" style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>{title}</h1>
      <p>This feature is coming soon to the web app.</p>
      <button 
        onClick={() => navigate('/')}
        className="action-button"
        style={{ marginTop: '2rem' }}
      >
        Back to Dashboard
      </button>
    </div>
  );
};

export const PayRentPage = () => <PlaceholderPage title="Pay Rent" />;
export const ElectricityPage = () => <PlaceholderPage title="Electricity" />;
export const BroadcastPage = () => <PlaceholderPage title="Broadcast" />;
export const CompletedWorkPage = () => <PlaceholderPage title="Completed Work" />;
export const InventoryPage = () => <PlaceholderPage title="Inventory" />;
export const SystemStatusPage = () => <PlaceholderPage title="System Status" />;
export const EmergencyPage = () => <PlaceholderPage title="Emergency" />;

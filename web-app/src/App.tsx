import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import './App.css';
import LoginModal from './components/LoginModal';
import type { UserRole, Property, SubscriptionPlan } from './types';
import FeatureGrid from './components/FeatureGrid';
import BookingPage from './screens/BookingPage';
import RentPaymentPage from './screens/RentPaymentPage';
import ElectricityPage from './screens/ElectricityPage';
import PaymentsPage from './screens/PaymentsPage';
import AddPropertyPage from './screens/AddPropertyPage';
import DocumentsPage from './screens/DocumentsPage';
import AgreementPage from './screens/AgreementPage';
import MaintenancePage from './screens/MaintenancePage';
import TenantListPage from './screens/TenantListPage';
import TenantDetailPage from './screens/TenantDetailPage';
import LandingPage from './screens/LandingPage';
import ProfilePage from './screens/ProfilePage';
import AboutUsPage from './screens/AboutUsPage';

import * as Placeholders from './screens/PlaceholderPages';

interface Feature {
  id: string;
  title: string;
  icon: string | React.ReactNode;
  color: string;
  bgColor: string;
  path: string;
}

interface DashboardConfig {
  id: string;
  type: UserRole;
  title: string;
  description: string;
  buttonText: string;
  cssClass: string;
  features?: Feature[];
}

const dashboards: DashboardConfig[] = [
  {
    id: 'customer',
    type: 'customer',
    title: 'Customer Dashboard',
    description: 'Find your next home, pay rent seamlessly, and manage your stay directly from your personalized tenant space.',
    buttonText: 'Go to Tenant Portal',
    cssClass: 'section-customer',
    features: [
      { id: 'c1', icon: '🏠', title: 'Book Rental', color: '#F59E0B', bgColor: '#FFFAF0', path: '/book-rental' },
      { id: 'c2', icon: '📄', title: 'My Documents', color: '#3B82F6', bgColor: '#F0F9FF', path: '/documents' },
      { id: 'c3', icon: '💳', title: 'Pay Rent', color: '#EA580C', bgColor: '#FFF7ED', path: '/pay-rent' },
      { id: 'c4', icon: '⚡', title: 'Electricity', color: '#FBBF24', bgColor: '#FEFCE8', path: '/electricity' },
      { id: 'c5', icon: '🔄', title: 'Agreement', color: '#8B5CF6', bgColor: '#F5F3FF', path: '/agreement' },
      { id: 'c6', icon: '🛠️', title: 'Maintenance Hub', color: '#0D9488', bgColor: '#F0FDFA', path: '/maintenance' },
    ]
  },
  {
    id: 'owner',
    type: 'owner',
    title: 'Owner Dashboard',
    description: 'Manage your properties, add new listings, and oversee your rental portfolio with streamlined management tools.',
    buttonText: 'Go to Owner Portal',
    cssClass: 'section-owner',
    features: [
      { id: 'o1', icon: '🏢', title: 'Your Properties', color: '#4F46E5', bgColor: '#EEF2FF', path: '/owner/properties' },
      { id: 'o2', icon: '➕', title: 'Add Property', color: '#6366F1', bgColor: '#F5F3FF', path: '/owner/add-property' },
      { id: 'o3', icon: '👨‍👩‍👧‍👦', title: 'Tenant List', color: '#EC4899', bgColor: '#FDF2F8', path: '/owner/tenants' },
      { id: 'o4', icon: '📢', title: 'Broadcast', color: '#F97316', bgColor: '#FFF7ED', path: '/owner/broadcast' },
    ]
  }
];

function CustomerDashboard({ userRole, userPlan }: { userRole: UserRole | null, userPlan: SubscriptionPlan }) {
  const dashboard = dashboards.find(d => d.id === 'customer')!;
  
  // Basic: Book Rental (c1), Documents (c2)
  // Premium: Basic + Pay Rent (c3), Electricity (c4), Maintenance (c6)
  // Elite: All + Agreement (c5)
  const filteredFeatures = dashboard.features?.filter(f => {
    if (userPlan === 'elite') return true;
    if (userPlan === 'premium') return ['c1', 'c2', 'c3', 'c4', 'c6'].includes(f.id);
    return ['c1', 'c2'].includes(f.id);
  });

  return (
    <main className="main-content">
      <section id={dashboard.id} className={`dashboard-section ${dashboard.cssClass}`}>
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
        
        <div className="background-house-wrapper">
          <div className="house-shadow-circle"></div>
          <img 
            src="https://images.unsplash.com/photo-1512917774080-9991f1c4c750?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" 
            alt="Prem's House" 
            className="background-house-img"
          />
        </div>
        
        <div className="dashboard-content">
          <h1 className="dashboard-title">
            {dashboard.title} 
            {userRole && <span style={{ fontSize: '1rem', verticalAlign: 'middle', marginLeft: '1rem', opacity: 0.8 }}>(Plan: {userPlan})</span>}
          </h1>
          <p className="dashboard-description">{dashboard.description}</p>
          
          {filteredFeatures && (
            <FeatureGrid features={filteredFeatures} />
          )}
          
          <div style={{ marginTop: '3rem' }}>
            <button className="action-button">{dashboard.buttonText}</button>
          </div>
        </div>
      </section>
    </main>
  );
}

function OwnerDashboard({ userRole, userPlan }: { userRole: UserRole | null, userPlan: SubscriptionPlan }) {
  const dashboard = dashboards.find(d => d.id === 'owner')!;

  const filteredFeatures = dashboard.features?.filter(f => {
    if (userPlan === 'elite') return true;
    // Owners need Elite for everything except basic listing
    return ['o2'].includes(f.id);
  });

  return (
    <main className="main-content">
      <section id={dashboard.id} className={`dashboard-section ${dashboard.cssClass}`}>
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
        
        <div className="dashboard-content">
          <h1 className="dashboard-title">
            {dashboard.title} 
            {userRole && <span style={{ fontSize: '1rem', verticalAlign: 'middle', marginLeft: '1rem', opacity: 0.8 }}>(Plan: {userPlan})</span>}
          </h1>
          <p className="dashboard-description">{dashboard.description}</p>
          
          {filteredFeatures && (
            <FeatureGrid features={filteredFeatures} />
          )}
          
          <div style={{ marginTop: '3rem' }}>
            <button className="action-button">{dashboard.buttonText}</button>
          </div>
        </div>
      </section>
    </main>
  );
}

function ProtectedRoute({ 
  children, 
  userRole, 
  requiredRole, 
  onOpenLogin 
}: { 
  children: React.ReactNode, 
  userRole: UserRole | null, 
  requiredRole: UserRole,
  onOpenLogin: () => void
}) {
  if (userRole === requiredRole) {
    return <>{children}</>;
  }

  return (
    <div className="auth-fallback">
      <h2>Please Log In as {requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)}</h2>
      <p>Access to this portal is restricted to registered members.</p>
      <button onClick={onOpenLogin} className="action-button">Enter {requiredRole.charAt(0).toUpperCase() + requiredRole.slice(1)} Portal</button>
    </div>
  );
}

function App() {
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userPlan, setUserPlan] = useState<SubscriptionPlan>('basic');
  const [properties, setProperties] = useState<Property[]>([]);

  useEffect(() => {
    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProperties(data);
        }
      })
      .catch(err => console.error("Failed to load properties:", err));
  }, []);

  const handleLogin = (role: UserRole) => {
    setUserRole(role);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setUserRole(null);
  };

  const handleAddProperty = (newProperty: Property) => {
    setProperties(prev => [...prev, newProperty]);
  };

  const openLogin = () => setIsLoginModalOpen(true);

  return (
    <BrowserRouter>
      <div className="app-container">
        <header className="app-header">
          <Link to="/" className="logo">
            <div className="logo-visual">
              <svg className="logo-house float-letter" style={{ animationDelay: '0s' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12l9-9 9 9"></path>
                <path d="M5 12v10h14V12"></path>
                <path d="M9 22v-6h6v6"></path>
                <path d="M17 7V4h2v5"></path>
              </svg>
              <span className="logo-text">
                {'rentapp'.split('').map((char, index) => (
                  <span key={index} className="float-letter" style={{ animationDelay: `${(index + 1) * 0.1}s` }}>
                    {char}
                  </span>
                ))}
              </span>
            </div>
          </Link>
          <nav className="app-nav">
            <Link to="/" className="nav-link">Home</Link>
            <Link to="/customer" className="nav-link">Customer</Link>
            <Link to="/owner" className="nav-link">Owner</Link>
            <Link to="/profile" className="nav-link">Profile</Link>
          </nav>
          {userRole ? (
            <button className="login-btn" style={{ background: '#ef4444' }} onClick={handleLogout}>Log Out</button>
          ) : (
            <button className="login-btn" onClick={openLogin}>Log In</button>
          )}
        </header>

        <Routes>
          <Route path="/" element={
            userRole === 'owner' ? <Navigate to="/owner" replace /> :
            userRole === 'customer' ? <Navigate to="/customer" replace /> :
            <LandingPage onOpenLogin={openLogin} onSetPlan={setUserPlan} />
          } />
          <Route path="/about-us" element={<AboutUsPage />} />
          
          {/* Customer Routes */}
          <Route path="/customer" element={
            <ProtectedRoute userRole={userRole} requiredRole="customer" onOpenLogin={openLogin}>
              <CustomerDashboard userRole={userRole} userPlan={userPlan} />
            </ProtectedRoute>
          } />
          <Route path="/book-rental" element={
            <ProtectedRoute userRole={userRole} requiredRole="customer" onOpenLogin={openLogin}>
              <BookingPage properties={properties} />
            </ProtectedRoute>
          } />
          <Route path="/documents" element={
            <ProtectedRoute userRole={userRole} requiredRole="customer" onOpenLogin={openLogin}>
              <DocumentsPage />
            </ProtectedRoute>
          } />
          <Route path="/pay-rent" element={
            <ProtectedRoute userRole={userRole} requiredRole="customer" onOpenLogin={openLogin}>
              <RentPaymentPage />
            </ProtectedRoute>
          } />
          <Route path="/electricity" element={
            <ProtectedRoute userRole={userRole} requiredRole="customer" onOpenLogin={openLogin}>
              <ElectricityPage />
            </ProtectedRoute>
          } />
          <Route path="/pay-history" element={
            <ProtectedRoute userRole={userRole} requiredRole="customer" onOpenLogin={openLogin}>
              <PaymentsPage />
            </ProtectedRoute>
          } />
          <Route path="/agreement" element={
            <ProtectedRoute userRole={userRole} requiredRole="customer" onOpenLogin={openLogin}>
              <AgreementPage />
            </ProtectedRoute>
          } />
          <Route path="/maintenance" element={
            <ProtectedRoute userRole={userRole} requiredRole="customer" onOpenLogin={openLogin}>
              <MaintenancePage />
            </ProtectedRoute>
          } />

          {/* Owner Routes */}
          <Route path="/owner" element={
            <ProtectedRoute userRole={userRole} requiredRole="owner" onOpenLogin={openLogin}>
              <OwnerDashboard userRole={userRole} userPlan={userPlan} />
            </ProtectedRoute>
          } />
          <Route path="/owner/properties" element={
            <ProtectedRoute userRole={userRole} requiredRole="owner" onOpenLogin={openLogin}>
              <Placeholders.PropertiesPage />
            </ProtectedRoute>
          } />
          <Route path="/owner/add-property" element={
            <ProtectedRoute userRole={userRole} requiredRole="owner" onOpenLogin={openLogin}>
              <AddPropertyPage onAddProperty={handleAddProperty} />
            </ProtectedRoute>
          } />
          <Route path="/owner/tenants" element={
            <ProtectedRoute userRole={userRole} requiredRole="owner" onOpenLogin={openLogin}>
              <TenantListPage />
            </ProtectedRoute>
          } />
          <Route path="/owner/tenants/:tenantId" element={
            <ProtectedRoute userRole={userRole} requiredRole="owner" onOpenLogin={openLogin}>
              <TenantDetailPage />
            </ProtectedRoute>
          } />
          <Route path="/owner/broadcast" element={
            <ProtectedRoute userRole={userRole} requiredRole="owner" onOpenLogin={openLogin}>
              <Placeholders.BroadcastPage />
            </ProtectedRoute>
          } />

          <Route path="/maintenance/emergency" element={<Placeholders.EmergencyPage />} />
          
          <Route path="/profile" element={<ProfilePage userRole={userRole} onLogout={handleLogout} />} />
        </Routes>

        <footer className="app-footer">
          <div className="footer-links">
            <Link to="/about-us">About Us</Link>
            <Link to="/customer">Tenant Services</Link>
            <Link to="/owner">Property Management</Link>
          </div>
          <p>&copy; 2026 rentapp. All rights reserved. Premium Rental Experience.</p>
        </footer>

        {isLoginModalOpen && (
          <LoginModal onClose={() => setIsLoginModalOpen(false)} onLogin={handleLogin} />
        )}
      </div>

      <style>{`
        .auth-fallback {
          min-height: 60vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 2rem;
          text-align: center;
          padding: 2rem;
        }
        .auth-fallback h2 {
          font-size: 2.5rem;
          color: #1e293b;
        }
      `}</style>
    </BrowserRouter>
  );
}

export default App;

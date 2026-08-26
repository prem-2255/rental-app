import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import './App.css';
import LoginModal from './components/LoginModal';
import type { UserRole, Property, SubscriptionPlan } from './types';
import _FeatureGrid from './components/FeatureGrid';
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
import OwnerBookingsPage from './screens/OwnerBookingsPage';
import CustomerBookingsPage from './screens/CustomerBookingsPage';
import OwnerPropertiesPage from './screens/OwnerPropertiesPage';
import CustomerVisitorsPage from './screens/CustomerVisitorsPage';
import CustomerInventoryPage from './screens/CustomerInventoryPage';
import AdminDashboardPage from './screens/AdminDashboardPage';
import SubscriptionModal from './components/SubscriptionModal';

import SavedPropertiesPage from './screens/SavedPropertiesPage';
import PropertyComparisonPage from './screens/PropertyComparisonPage';
import SplitRentPage from './screens/SplitRentPage';
import MoveInChecklistPage from './screens/MoveInChecklistPage';

import * as Placeholders from './screens/PlaceholderPages';
import BroadcastPage from './screens/BroadcastPage';
import RealtimeChatWidget from './components/RealtimeChatWidget';
import { connectSocket, disconnectSocket, getSocket } from './socketService';

// Dashboard configurations are managed dynamically per view

function CustomerDashboard({ userRole: _userRole, userPlan }: { userRole: UserRole | null, userPlan: SubscriptionPlan }) {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [rentedProperty, setRentedProperty] = useState<any>(null);
  const [_loading, setLoading] = useState(true);
  const [visits, setVisits] = useState<any[]>([]);
  const [activeMaintenance, setActiveMaintenance] = useState<any[]>([]);
  const [savedCount, setSavedCount] = useState(0);

  useEffect(() => {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      const u = JSON.parse(stored);
      setCurrentUser(u);
      loadTenantData(u.id);
    } else {
      setLoading(false);
    }
  }, []);

  const loadTenantData = async (uid: string) => {
    try {
      const res = await fetch(`/api/tenants/${uid}`);
      const data = await res.json();
      if (data) {
        if (data.propertyId) {
          const propRes = await fetch('/api/properties');
          const allProps = await propRes.json();
          const p = allProps.find((x: any) => x.id === data.propertyId);
          if (p) {
            setRentedProperty(p);
            if (p.visitDate) {
              setVisits([{
                date: p.visitDate,
                time: p.visitTime || "11:00 AM",
                property: p.title,
                ownerContact: "+91 99887 76655",
                location: p.location
              }]);
            }
          }
        }
        
        if (Array.isArray(data.maintenance)) {
          setActiveMaintenance(data.maintenance.filter((m: any) => m.status !== 'Resolved' && m.status !== 'Closed'));
        }
        
        if (data.savedProperties) {
          setSavedCount(data.savedProperties.split(',').filter(Boolean).length);
        }
      }
    } catch(err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Mock countdown - say 5 days left (Yellow)
  const daysUntilDue = 5;
  let countdownClass = 'green';
  const countdownText = `Rent Due in ${daysUntilDue} Days`;
  if (daysUntilDue < 3) {
    countdownClass = 'red';
  } else if (daysUntilDue <= 7) {
    countdownClass = 'yellow';
  }

  const handleQuickAction = (action: string) => {
    if (action === 'pay') navigate('/pay-rent');
    else if (action === 'issue') navigate('/maintenance');
    else if (action === 'agreement') navigate('/agreement');
    else if (action === 'contact') {
      alert("📞 Owner Contact: +91 99887 76655\nEmail: owner@rentapp.com\nOpening chat portal...");
      const chatWidget = document.querySelector('.chat-widget-toggle') as HTMLElement;
      if (chatWidget) chatWidget.click();
    }
    else if (action === 'saved') navigate('/saved-properties');
    else if (action === 'compare') navigate('/compare');
    else if (action === 'split') navigate('/split-rent');
    else if (action === 'checklist') navigate('/checklist');
  };

  return (
    <main className="main-content">
      <section className="dashboard-section section-customer">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
        
        <div className="dashboard-content modern-dashboard">
          <div className="welcome-header">
            <h1 className="dashboard-title">Welcome Back, {currentUser?.name || 'Tenant'} 👋</h1>
            <p className="plan-info">Plan: <span className="plan-badge">{userPlan.toUpperCase()}</span></p>
          </div>

          <div className="dashboard-grid">
            {/* Left Column: Quick Actions & Countdown */}
            <div className="left-column">
              {/* Countdown card */}
              <div className={`countdown-card ${countdownClass}`}>
                <div className="countdown-bell">🔔</div>
                <div className="countdown-details">
                  <h3>{countdownText}</h3>
                  <p>Pay before the due date to avoid late fees.</p>
                </div>
                <button className="pay-inline-btn" onClick={() => navigate('/pay-rent')}>Pay Now</button>
              </div>

              {/* Quick Actions Grid */}
              <div className="quick-actions-card card">
                <h3>Quick Actions</h3>
                <div className="actions-grid">
                  <button className="qa-btn" onClick={() => handleQuickAction('pay')}>
                    <span className="qa-icon">💳</span>
                    <span className="qa-label">Pay Rent</span>
                  </button>
                  <button className="qa-btn" onClick={() => handleQuickAction('issue')}>
                    <span className="qa-icon">🛠️</span>
                    <span className="qa-label">Report Issue</span>
                  </button>
                  <button className="qa-btn" onClick={() => handleQuickAction('agreement')}>
                    <span className="qa-icon">📜</span>
                    <span className="qa-label">Agreement</span>
                  </button>
                  <button className="qa-btn" onClick={() => handleQuickAction('contact')}>
                    <span className="qa-icon">📞</span>
                    <span className="qa-label">Contact Owner</span>
                  </button>
                  <button className="qa-btn" onClick={() => handleQuickAction('saved')}>
                    <span className="qa-icon">❤️</span>
                    <span className="qa-label">Saved ({savedCount})</span>
                  </button>
                  <button className="qa-btn" onClick={() => handleQuickAction('compare')}>
                    <span className="qa-icon">⚖️</span>
                    <span className="qa-label">Compare</span>
                  </button>
                  <button className="qa-btn" onClick={() => handleQuickAction('split')}>
                    <span className="qa-icon">✂️</span>
                    <span className="qa-label">Split Rent</span>
                  </button>
                  <button className="qa-btn" onClick={() => handleQuickAction('checklist')}>
                    <span className="qa-icon">📋</span>
                    <span className="qa-label">Checklist</span>
                  </button>
                </div>
              </div>

              {/* Upcoming Visit card */}
              <div className="visit-card card">
                <h3>Upcoming Visit Reminders</h3>
                {visits.length === 0 ? (
                  <div className="empty-substate">No visits scheduled.</div>
                ) : (
                  visits.map((v, i) => (
                    <div key={i} className="visit-item">
                      <div className="visit-meta">
                        <span className="visit-date">📅 {v.date}</span>
                        <span className="visit-time">⏰ {v.time}</span>
                      </div>
                      <div className="visit-prop">Property: <strong>{v.property}</strong></div>
                      <div className="visit-contact">Owner Contact: {v.ownerContact}</div>
                      <a 
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.location)}`} 
                        target="_blank" 
                        rel="noreferrer" 
                        className="nav-btn"
                      >
                        🧭 Navigate Directions
                      </a>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Right Column: Rented Property & Maintenance */}
            <div className="right-column">
              {/* Rented Property Info */}
              <div className="rented-property-card card">
                <h3>Rented Property</h3>
                {!rentedProperty ? (
                  <div className="empty-substate">
                    <span className="empty-icon">🏠</span>
                    <p>You have not rented any properties yet.</p>
                    <button className="explore-btn" onClick={() => navigate('/book-rental')}>Find a Home</button>
                  </div>
                ) : (
                  <div className="rented-prop-details">
                    <img src={rentedProperty.image} alt={rentedProperty.title} className="rented-prop-img" />
                    <div className="rented-info">
                      <h4>{rentedProperty.title}</h4>
                      <p className="loc">📍 {rentedProperty.location}</p>
                      <div className="specs">
                        <span>🛏️ {rentedProperty.beds} BHK</span>
                        <span>🚿 {rentedProperty.baths} Baths</span>
                        <span>Rent: <strong>{rentedProperty.price}</strong>/mo</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Active Maintenance */}
              <div className="maintenance-status-card card">
                <h3>Active Maintenance Requests</h3>
                {activeMaintenance.length === 0 ? (
                  <div className="empty-substate">No active maintenance issues. Great!</div>
                ) : (
                  <div className="active-maintenance-list">
                    {activeMaintenance.map((m, i) => (
                      <div key={i} className="maintenance-item-strip">
                        <span className="category">🛠️ {m.type}</span>
                        <span className={`status-badge ${m.status.toLowerCase()}`}>{m.status}</span>
                        <p className="desc">{m.description}</p>
                        <span className="date">Reported: {m.date}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function OwnerDashboard({ userRole: _userRole, userPlan, currentUser, onSetPlan }: { userRole: UserRole | null, userPlan: SubscriptionPlan, currentUser: any, onSetPlan: (plan: SubscriptionPlan) => void }) {
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      fetch(`/api/owner/${currentUser.id}/dashboard-stats`)
        .then(res => res.json())
        .then(data => setStats(data))
        .catch(console.error);
    }
  }, [currentUser]);

  const handleQuickAction = (action: string) => {
    if (action === 'add') navigate('/owner/add-property');
    else if (action === 'bookings') navigate('/owner/bookings');
    else if (action === 'collect') {
      alert("🔔 Rent demand sent to all active tenants. Payment gateways updated.");
    }
    else if (action === 'manage') navigate('/owner/properties');
    else if (action === 'checklist') navigate('/checklist');
  };

  return (
    <main className="main-content">
      <section className="dashboard-section section-owner">
        <div className="bg-circle circle-1"></div>
        <div className="bg-circle circle-2"></div>
        <div className="bg-circle circle-3"></div>
        
        <div className="dashboard-content modern-dashboard">
          <div className="welcome-header">
            <h1 className="dashboard-title">Owner Control Center 🏢</h1>
            <div className="plan-section">
              Plan Level: <span className="plan-badge owner">{userPlan.toUpperCase()}</span>
              <button onClick={() => setIsSubModalOpen(true)} className="upgrade-inline-btn">Upgrade Plan</button>
            </div>
          </div>

          {stats ? (
            <div className="stats-dashboard-grid">
              <div className="stat-card shadow-card bg-indigo">
                <span className="icon">🏢</span>
                <div className="details">
                  <span className="label">Total Properties</span>
                  <span className="val">{stats.totalProperties}</span>
                </div>
              </div>
              <div className="stat-card shadow-card bg-emerald">
                <span className="icon">👨‍👩‍👧‍👦</span>
                <div className="details">
                  <span className="label">Occupied Listings</span>
                  <span className="val">{stats.occupiedProperties}</span>
                </div>
              </div>
              <div className="stat-card shadow-card bg-amber">
                <span className="icon">🔓</span>
                <div className="details">
                  <span className="label">Vacant Listings</span>
                  <span className="val">{stats.vacantProperties}</span>
                </div>
              </div>
              <div className="stat-card shadow-card bg-teal">
                <span className="icon">💵</span>
                <div className="details">
                  <span className="label">Monthly Rental Income</span>
                  <span className="val">{stats.monthlyIncome}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="loading-stats">Loading dashboard stats...</div>
          )}

          <div className="owner-layout-grid">
            {/* Left Block: Notifications & Requests */}
            <div className="stats-column">
              <div className="card shadow-card">
                <h3>Pending Tasks & Action Items</h3>
                {stats && (
                  <div className="action-items-list">
                    <div className="action-item-strip pointer" onClick={() => navigate('/owner/bookings')}>
                      <span className="bullet request">⏱️</span>
                      <div className="details">
                        <strong>New Booking Requests</strong>
                        <p>You have {stats.bookingRequests} booking requests waiting for approval.</p>
                      </div>
                    </div>
                    <div className="action-item-strip pointer" onClick={() => navigate('/owner/tenants')}>
                      <span className="bullet payment">💳</span>
                      <div className="details">
                        <strong>Pending Rent Payments</strong>
                        <p>2 tenants have outstanding balances for this month.</p>
                      </div>
                    </div>
                    <div className="action-item-strip pointer" onClick={() => navigate('/owner/tenants')}>
                      <span className="bullet maintenance">🛠️</span>
                      <div className="details">
                        <strong>Active Maintenance Issues</strong>
                        <p>You have {stats.maintenanceRequests} unresolved repair requests from tenants.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Block: Owner quick actions */}
            <div className="actions-column">
              <div className="card shadow-card">
                <h3>Quick Controls</h3>
                <div className="owner-actions-grid">
                  <button className="qa-btn owner" onClick={() => handleQuickAction('add')}>
                    <span className="qa-icon">🏢</span>
                    <span className="qa-label">Add Property</span>
                  </button>
                  <button className="qa-btn owner" onClick={() => handleQuickAction('bookings')}>
                    <span className="qa-icon">📝</span>
                    <span className="qa-label">View Bookings</span>
                  </button>
                  <button className="qa-btn owner" onClick={() => handleQuickAction('collect')}>
                    <span className="qa-icon">💰</span>
                    <span className="qa-label">Collect Rent</span>
                  </button>
                  <button className="qa-btn owner" onClick={() => handleQuickAction('manage')}>
                    <span className="qa-icon">⚙️</span>
                    <span className="qa-label">Manage Properties</span>
                  </button>
                  <button className="qa-btn owner" onClick={() => handleQuickAction('checklist')}>
                    <span className="qa-icon">📋</span>
                    <span className="qa-label">Move-In Checklist</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <SubscriptionModal 
            isOpen={isSubModalOpen}
            onClose={() => setIsSubModalOpen(false)}
            onSelectPlan={(plan) => {
              onSetPlan(plan.id as SubscriptionPlan);
              alert(`You selected the ${plan.name} plan! Features have been updated.`);
              setIsSubModalOpen(false);
            }}
          />
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
  const [currentUser, setCurrentUser] = useState<any | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try { return JSON.parse(storedUser); } catch { return null; }
    }
    return null;
  });
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
      try {
        const u = JSON.parse(storedUser);
        return u.role === 'tenant' ? 'customer' : u.role;
      } catch { return null; }
    }
    return null;
  });
  const [userPlan, setUserPlan] = useState<SubscriptionPlan>('basic');
  const [properties, setProperties] = useState<Property[]>([]);
  const [liveNotification, setLiveNotification] = useState<{ id: string; title: string; text: string; date: string } | null>(null);

  // Restore session on mount
  useEffect(() => {
    if (currentUser?.id) {
      connectSocket(currentUser.id);
    }

    fetch('/api/properties')
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          setProperties(data);
        }
      })
      .catch(err => console.error("Failed to load properties:", err));
  }, [currentUser?.id]);

  // Set up socket listener for live broadcasts
  useEffect(() => {
    if (!currentUser) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewBroadcast = (data: any) => {
      setLiveNotification(data);
    };

    socket.on('new-broadcast', handleNewBroadcast);

    return () => {
      socket.off('new-broadcast', handleNewBroadcast);
    };
  }, [currentUser]);

  const handleLogin = (user: any) => {
    setCurrentUser(user);
    const mappedRole = user.role === 'tenant' ? 'customer' : user.role;
    setUserRole(mappedRole);
    localStorage.setItem('currentUser', JSON.stringify(user));
    connectSocket(user.id);
    setIsLoginModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setUserRole(null);
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    disconnectSocket();
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
              <div className="logo-icon-badge">
                <svg className="logo-house" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12l9-9 9 9"></path>
                  <path d="M5 12v10h14V12"></path>
                  <path d="M9 22v-6h6v6"></path>
                  <path d="M17 7V4h2v5"></path>
                </svg>
              </div>
              <div className="logo-text-wrap">
                <span>Rent</span><span className="logo-accent">App</span>
              </div>
            </div>
          </Link>
          <nav className="app-nav">
            <Link to="/" className="nav-link">Home</Link>
            {userRole === 'admin' && (
              <Link to="/admin" className="nav-link" style={{ color: '#ea580c', fontWeight: 700 }}>Admin Console</Link>
            )}
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
              <BookingPage properties={properties} currentUser={currentUser} />
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
          <Route path="/customer/bookings" element={
            <ProtectedRoute userRole={userRole} requiredRole="customer" onOpenLogin={openLogin}>
              <CustomerBookingsPage currentUser={currentUser} />
            </ProtectedRoute>
          } />
          <Route path="/customer/visitors" element={
            <ProtectedRoute userRole={userRole} requiredRole="customer" onOpenLogin={openLogin}>
              <CustomerVisitorsPage />
            </ProtectedRoute>
          } />
          <Route path="/customer/inventory" element={
            <ProtectedRoute userRole={userRole} requiredRole="customer" onOpenLogin={openLogin}>
              <CustomerInventoryPage />
            </ProtectedRoute>
          } />

          <Route path="/saved-properties" element={
            <ProtectedRoute userRole={userRole} requiredRole="customer" onOpenLogin={openLogin}>
              <SavedPropertiesPage />
            </ProtectedRoute>
          } />
          <Route path="/compare" element={<PropertyComparisonPage />} />
          <Route path="/split-rent" element={
            <ProtectedRoute userRole={userRole} requiredRole="customer" onOpenLogin={openLogin}>
              <SplitRentPage />
            </ProtectedRoute>
          } />
          <Route path="/checklist" element={<MoveInChecklistPage />} />

          {/* Owner Routes */}
          <Route path="/owner" element={
            <ProtectedRoute userRole={userRole} requiredRole="owner" onOpenLogin={openLogin}>
              <OwnerDashboard userRole={userRole} userPlan={userPlan} currentUser={currentUser} onSetPlan={setUserPlan} />
            </ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute userRole={userRole} requiredRole="admin" onOpenLogin={openLogin}>
              <AdminDashboardPage />
            </ProtectedRoute>
          } />
          <Route path="/owner/properties" element={
            <ProtectedRoute userRole={userRole} requiredRole="owner" onOpenLogin={openLogin}>
              <OwnerPropertiesPage currentUser={currentUser} />
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
              <BroadcastPage />
            </ProtectedRoute>
          } />
          <Route path="/owner/bookings" element={
            <ProtectedRoute userRole={userRole} requiredRole="owner" onOpenLogin={openLogin}>
              <OwnerBookingsPage currentUser={currentUser} />
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

        <RealtimeChatWidget currentUser={currentUser} />

        {liveNotification && (
          <div className="live-broadcast-toast">
            <div className="toast-header">
              <span className="toast-icon">📢</span>
              <h4>{liveNotification.title}</h4>
              <button className="toast-close" onClick={() => setLiveNotification(null)}>&times;</button>
            </div>
            <p className="toast-body">{liveNotification.text}</p>
          </div>
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

        .live-broadcast-toast {
          position: fixed;
          top: 24px;
          left: 50%;
          transform: translateX(-50%);
          width: 90%;
          max-width: 450px;
          background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
          color: white;
          padding: 1.25rem;
          border-radius: 20px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.25);
          z-index: 9999;
          animation: slideDownToast 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          border: 1px solid rgba(255,255,255,0.1);
        }
        @keyframes slideDownToast {
          from { opacity: 0; transform: translate(-50%, -20px); }
          to { opacity: 1; transform: translate(-50%, 0); }
        }
        .toast-header {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          margin-bottom: 0.5rem;
        }
        .toast-header h4 {
          margin: 0;
          flex: 1;
          font-size: 15px;
          font-weight: 700;
        }
        .toast-icon {
          font-size: 18px;
        }
        .toast-close {
          background: none;
          border: none;
          color: #94a3b8;
          font-size: 20px;
          cursor: pointer;
        }
        .toast-body {
          margin: 0;
          font-size: 13px;
          color: #cbd5e1;
          line-height: 1.4;
        }
      `}</style>
    </BrowserRouter>
  );
}

export default App;

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Property } from '../types';

interface AddPropertyPageProps {
  onAddProperty: (property: Property) => void;
}

const AddPropertyPage: React.FC<AddPropertyPageProps> = ({ onAddProperty }) => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    beds: 1,
    baths: 0,
    type: 'BHK',
    capacity: 0,
    ownerPhone: '',
    image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Fetch an owner ID to attach to this property (simulating logged-in owner)
      const usersRes = await fetch('/api/users');
      const users = await usersRes.json();
      const mockOwner = users.find((u: any) => u.role === 'owner');

      if (!mockOwner) {
        throw new Error("No owner found in DB to attach property to.");
      }

      const propertyData = {
        title: formData.title,
        price: `₹${formData.price}/mo`,
        location: formData.location,
        beds: formData.beds,
        baths: formData.baths,
        type: formData.type,
        image: formData.image || undefined,
        ownerId: mockOwner.id
      };

      const res = await fetch('/api/properties', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(propertyData)
      });

      if (!res.ok) throw new Error("Failed to create property");

      const savedProperty = await res.json();
      onAddProperty(savedProperty);
      navigate('/book-rental');
    } catch (err) {
      console.error(err);
      alert('Failed to add property. Make sure backend is running.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="add-property-page">
      <header className="page-header">
        <button onClick={() => navigate('/')} className="back-button">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          Back
        </button>
        <h1>Add New Property</h1>
      </header>

      <div className="form-container">
        <form onSubmit={handleSubmit} className="add-property-form">
          <div className="form-section">
            <label>Property Title</label>
            <input 
              type="text" 
              placeholder="e.g. Luxury 2BHK Apartment" 
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              required
            />
          </div>

          <div className="form-group">
            <label>Owner Phone Number</label>
            <input 
              type="text" 
              placeholder="+91 98765 43210" 
              value={formData.ownerPhone}
              onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-section">
              <label>Monthly Rent (₹)</label>
              <input 
                type="number" 
                placeholder="2100" 
                value={formData.price}
                onChange={(e) => setFormData({...formData, price: e.target.value})}
                required
              />
            </div>
            <div className="form-section">
              <label>Property Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
              >
                <option value="Apartment">Apartment</option>
                <option value="House">House</option>
                <option value="Loft">Loft</option>
                <option value="Studio">Studio</option>
              </select>
            </div>
          </div>

          <div className="form-section">
            <label>Location</label>
            <input 
              type="text" 
              placeholder="e.g. suburban Area, NYC" 
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
              required
            />
          </div>

          <div className="form-row triplet">
            <div className="form-section">
              <label>Beds</label>
              <input 
                type="number" 
                value={formData.beds}
                onChange={(e) => setFormData({...formData, beds: parseInt(e.target.value)})}
                min="1"
              />
            </div>
            <div className="form-section">
              <label>Baths</label>
              <input 
                type="number" 
                value={formData.baths}
                onChange={(e) => setFormData({...formData, baths: parseInt(e.target.value)})}
                min="1"
              />
            </div>
            <div className="form-section">
              <label>Max Guests</label>
              <input 
                type="number" 
                value={formData.capacity}
                onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                min="1"
              />
            </div>
          </div>

          <div className="form-section">
            <label>Image URL</label>
            <input 
              type="text" 
              placeholder="https://images.unsplash.com/..." 
              value={formData.image}
              onChange={(e) => setFormData({...formData, image: e.target.value})}
            />
          </div>

          <button type="submit" className="submit-property-btn" disabled={isSubmitting}>
            {isSubmitting ? 'Listing Property...' : 'List Property'}
          </button>
        </form>
      </div>

      <style>{`
        .add-property-page {
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
          font-size: 2.5rem;
          font-weight: 800;
          color: #1e293b;
        }
        .form-container {
          background: white;
          padding: 3rem;
          border-radius: 32px;
          border: 1px solid #f1f5f9;
          box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
        }
        .add-property-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }
        .form-section {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
          flex: 1;
        }
        .form-row {
          display: flex;
          gap: 1.5rem;
        }
        .form-row.triplet .form-section {
          flex: 1;
        }
        label {
          font-size: 0.75rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #475569;
        }
        input, select {
          padding: 1rem 1.25rem;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 1rem;
          outline: none;
          transition: all 0.2s;
        }
        input:focus, select:focus {
          border-color: #3b82f6;
          background: white;
          box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1);
        }
        .submit-property-btn {
          margin-top: 1rem;
          padding: 1.25rem;
          background: #0f172a;
          color: white;
          border: none;
          border-radius: 16px;
          font-size: 1.125rem;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
        }
        .submit-property-btn:hover {
          background: #1e293b;
          transform: translateY(-2px);
          box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        }
      `}</style>
    </div>
  );
};

export default AddPropertyPage;

import React, { type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage: React.FC<{ onOpenLogin: () => void }> = ({ onOpenLogin }) => {
  const navigate = useNavigate();

  const searchHomes = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    navigate('/book-rental');
  };

  return (
    <main className="marketplace-page">
      <section className="marketplace-hero">
        <div className="marketplace-hero-copy">
          <p className="eyebrow">Renting, made straightforward</p>
          <h1>Find a rental that <em>feels like home.</em></h1>
          <p className="hero-description">
            Verified homes, clear pricing, and practical support from your first search to move-in day.
          </p>

          <form className="home-search" onSubmit={searchHomes} aria-label="Search homes">
            <label>
              <span>Location</span>
              <input defaultValue="Bengaluru, Karnataka" aria-label="Location" />
            </label>
            <label>
              <span>Budget</span>
              <span className="select-control">
                <select defaultValue="20-45" aria-label="Monthly rent budget">
                  <option value="20-45">₹20k–45k</option>
                  <option value="45-70">₹45k–70k</option>
                  <option value="70-plus">₹70k+</option>
                </select>
              </span>
            </label>
            <label>
              <span>Home type</span>
              <span className="select-control">
                <select defaultValue="any" aria-label="Home type">
                  <option value="any">Any BHK</option>
                  <option value="1">1 BHK</option>
                  <option value="2">2 BHK</option>
                  <option value="3">3 BHK+</option>
                </select>
              </span>
            </label>
            <button type="submit">Search homes</button>
          </form>

          <button className="owner-inline-link" type="button" onClick={() => navigate('/owner')}>
            Own a property? <span>List and manage it with RentApp →</span>
          </button>
        </div>

        <article className="featured-home" aria-label="Featured verified property">
          <img
            src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=85"
            alt="Bright modern home surrounded by trees"
          />
          <div className="listing-preview">
            <div className="listing-topline"><span>2 BHK · HSR Layout</span><b>Verified</b></div>
            <h2>Bright, move-in ready apartment</h2>
            <p>Available now · 2 beds · 2 baths</p>
            <strong>₹32,000 <small>/ month</small></strong>
          </div>
        </article>
      </section>

      <section className="trust-strip" aria-label="RentApp benefits">
        <article><span>✓</span><p><b>Verified listings</b><br />Know what you are booking.</p></article>
        <article><span>✓</span><p><b>Clear rent details</b><br />See the costs before you decide.</p></article>
        <article><span>✓</span><p><b>Support after move-in</b><br />Payments, repairs, and documents in one place.</p></article>
      </section>

      <section className="paths-section" id="how-it-works">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Made for both sides</p>
            <h2>One place for both sides of renting.</h2>
          </div>
          <p>The first screen answers the visitor’s real question, then sends each person to the right next step.</p>
        </div>
        <div className="path-grid">
          <button className="path-card tenant-path" type="button" onClick={() => navigate('/book-rental')}>
            <span>For tenants</span>
            <h3>Find and settle in</h3>
            <p>Browse, book a visit, pay rent, and request maintenance without losing track of the details.</p>
            <b>Explore homes →</b>
          </button>
          <button className="path-card owner-path" type="button" onClick={() => navigate('/owner')}>
            <span>For owners</span>
            <h3>Manage with confidence</h3>
            <p>List properties, review requests, collect rent, and keep your portfolio running smoothly.</p>
            <b>Manage a property →</b>
          </button>
        </div>
      </section>

      <section className="workflow-section">
        <p className="eyebrow">Less rental runaround</p>
        <h2>Everything you need, once you find the right home.</h2>
        <div className="workflow-grid">
          <article><span>01</span><h3>Book with confidence</h3><p>Review a verified home and schedule a visit at a time that works.</p></article>
          <article><span>02</span><h3>Move in with clarity</h3><p>Keep documents, agreements, and important details close at hand.</p></article>
          <article><span>03</span><h3>Manage everyday life</h3><p>Pay rent, request repairs, and stay connected after move-in.</p></article>
        </div>
      </section>

      <section className="owner-callout">
        <div><p className="eyebrow">For property owners</p><h2>Make your property easier to run.</h2><p>Bring listings, tenants, payments, and maintenance into one practical workspace.</p></div>
        <button type="button" onClick={onOpenLogin}>Get started as an owner</button>
      </section>
    </main>
  );
};

export default LandingPage;

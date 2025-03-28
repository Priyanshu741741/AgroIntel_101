import React from 'react';

export default function Hero() {
  return (
    <section className="hero">
      <div className="container">
        <h1 className="slide-up">
          Smart Crop Monitoring
          <br />
          <span style={{ color: 'var(--text-dim)' }}>for Modern Agriculture</span>
        </h1>
        <p className="slide-up" style={{ 
          fontSize: '1.25rem', 
          color: 'var(--text-dim)', 
          maxWidth: '800px', 
          margin: '0 auto 2rem' 
        }}>
          Advanced AI-powered platform for real-time crop monitoring, soil analysis, and agricultural insights.
          Make data-driven decisions to optimize your yield and sustainability.
        </p>
        <button className="btn slide-up" style={{ 
          padding: '1rem 2rem',
          fontSize: '1.1rem'
        }}>
          Start Monitoring
          <div className="glow-hover" />
        </button>
      </div>
    </section>
  );
}
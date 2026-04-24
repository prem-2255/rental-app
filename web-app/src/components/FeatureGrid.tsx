import React from 'react';
import { useNavigate } from 'react-router-dom';

interface Feature {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  path?: string;
}

interface FeatureGridProps {
  features: Feature[];
}

const FeatureGrid: React.FC<FeatureGridProps> = ({ features }) => {
  const navigate = useNavigate();

  return (
    <div className="feature-grid">
      {features.map((feature) => (
        <div 
          key={feature.id} 
          className="feature-card" 
          style={{ '--feature-color': feature.color, '--feature-bg': feature.bgColor } as React.CSSProperties}
          onClick={() => feature.path && navigate(feature.path)}
        >
          <div className="feature-icon-wrapper">
            {feature.icon}
          </div>
          <h3 className="feature-title">{feature.title}</h3>
        </div>
      ))}
    </div>
  );
};

export default FeatureGrid;

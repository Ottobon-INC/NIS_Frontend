import React from 'react';
import styles from './TrustBadge.module.css';

export type TrustLevel = 'FACT' | 'SIGNAL' | 'INFERENCE' | 'HYPOTHESIS' | 'CONFIRMED';

interface TrustBadgeProps {
  level: TrustLevel;
}

export const TrustBadge: React.FC<TrustBadgeProps> = ({ level }) => {
  const levelClass = level.toLowerCase();
  
  return (
    <span className={`${styles.badge} ${styles[levelClass]}`}>
      {level}
    </span>
  );
};

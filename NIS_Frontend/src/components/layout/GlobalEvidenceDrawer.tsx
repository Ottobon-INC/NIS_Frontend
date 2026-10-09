import React from 'react';
import { X, ExternalLink } from 'lucide-react';
import { useUIStore } from '../../store/uiStore';
import styles from './GlobalEvidenceDrawer.module.css';

export const GlobalEvidenceDrawer: React.FC = () => {
  const { evidenceDrawer, closeEvidenceDrawer } = useUIStore();
  
  if (!evidenceDrawer.isOpen) return null;

  return (
    <>
      <div className={styles.overlay} onClick={closeEvidenceDrawer} />
      <div className={styles.drawer}>
        <div className={styles.header}>
          <div>
            <h3 className={styles.title}>Evidence Details</h3>
            {evidenceDrawer.contentTitle && (
              <p className={styles.subtitle}>{evidenceDrawer.contentTitle}</p>
            )}
          </div>
          <button onClick={closeEvidenceDrawer} className={styles.closeBtn}>
            <X size={20} />
          </button>
        </div>
        
        <div className={styles.content}>
          <div className={styles.tagGroup}>
            <span className={`${styles.typeBadge} ${styles[evidenceDrawer.type?.toLowerCase() || '']}`}>
              {evidenceDrawer.type}
            </span>
          </div>
          
          <div className={styles.mockContent}>
            <p className={styles.label}>Source</p>
            <div className={styles.sourceBox}>
              <p>LinkedIn Profile Analysis</p>
              <a href="#" className={styles.link}><ExternalLink size={14} /> View Original</a>
            </div>
            
            <p className={styles.label}>Extracted Text</p>
            <div className={styles.extractBox}>
              "Led the migration of legacy monolith to cloud-native microservices architecture, managing a team of 45 engineers..."
            </div>
            
            <p className={styles.label}>AI Confidence</p>
            <div className={styles.confidenceBox}>
              <div className={styles.confidenceBar}><div className={styles.confidenceFill} style={{width: '92%'}}></div></div>
              <span>92% - High</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

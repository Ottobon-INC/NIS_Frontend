import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TopNavigation } from './TopNavigation';
import { GlobalEvidenceDrawer } from './GlobalEvidenceDrawer';
import styles from './AppShell.module.css';

export const AppShell: React.FC = () => {
  return (
    <div className={styles.appContainer}>
      <Sidebar />
      <div className={styles.mainContent}>
        <TopNavigation />
        <main className={styles.pageContent}>
          <Outlet />
        </main>
      </div>
      <GlobalEvidenceDrawer />
    </div>
  );
};

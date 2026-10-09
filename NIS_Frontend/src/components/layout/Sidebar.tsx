import React from 'react';
import { NavLink } from 'react-router-dom';
import { Users, Target, Network, BookOpen } from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { path: '/people', label: 'People / Relationships', icon: Users },
  { path: '/opportunities', label: 'Opportunities', icon: Target },
  { path: '/network', label: 'Network Intelligence', icon: Network },
  { path: '/capabilities', label: 'Capability Intelligence', icon: BookOpen },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <h2 className={styles.logo}>NetworkOS</h2>
        <span className={styles.subtitle}>Client Intelligence</span>
      </div>
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `${styles.navItem} ${isActive ? styles.active : ''}`}
            >
              <Icon size={20} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

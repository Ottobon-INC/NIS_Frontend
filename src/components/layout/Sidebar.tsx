import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Target, Calendar, Network, Send, Layers } from 'lucide-react';
import styles from './Sidebar.module.css';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/people', label: 'People', icon: Users },
  { path: '/opportunities', label: 'Opportunities', icon: Target },
  { path: '/meetings', label: 'Meetings', icon: Calendar },
  { path: '/network', label: 'Network', icon: Network },
  { path: '/introductions', label: 'Introductions', icon: Send },
  { path: '/capabilities', label: 'Capabilities', icon: Layers },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoBadge}>
          <Network size={18} color="#fff" />
        </div>
        <h2 className={styles.logo}>NetworkOS</h2>
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
              <Icon size={18} className={styles.navIcon} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>
    </aside>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, Target, Calendar, Network, Send } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './TopNavigation.module.css';

interface NotificationItem {
  id: string;
  type: 'OPPORTUNITY' | 'MEETING' | 'NETWORK' | 'INTRO';
  title: string;
  message: string;
  time: string;
  read: boolean;
  actionUrl: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'OPPORTUNITY',
    title: 'New Opportunity Identified',
    message: 'AI inferred compliance need for Apex Financial Group.',
    time: '15m ago',
    read: false,
    actionUrl: '/opportunities'
  },
  {
    id: 'notif-2',
    type: 'MEETING',
    title: 'Meeting Brief Prepared',
    message: 'Brief ready for TechCorp Partnership Discussion with Alex Chen.',
    time: '1h ago',
    read: false,
    actionUrl: '/meetings/meet-1/brief'
  },
  {
    id: 'notif-3',
    type: 'NETWORK',
    title: 'Warm Connection Identified',
    message: 'Priya Sharma is connected to target executive at Global Logistics.',
    time: '3h ago',
    read: false,
    actionUrl: '/network'
  },
  {
    id: 'notif-4',
    type: 'INTRO',
    title: 'Introduction Draft Ready',
    message: 'Calibrated outreach ready for your review and approval.',
    time: 'Yesterday',
    read: true,
    actionUrl: '/introductions'
  }
];

export const TopNavigation: React.FC = () => {
  const [query, setQuery] = useState('');
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const inputRef = useRef<HTMLInputElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      } else if (e.key === 'Escape') {
        setIsNotifOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
    };
    if (isNotifOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isNotifOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/people?q=${encodeURIComponent(query)}`);
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, read: true } : n));
    setIsNotifOpen(false);
    navigate(item.actionUrl);
  };

  const handleMarkAllRead = (e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const getNotifIcon = (type: NotificationItem['type']) => {
    switch (type) {
      case 'OPPORTUNITY':
        return <Target size={16} color="#DC2626" />;
      case 'MEETING':
        return <Calendar size={16} color="#9333EA" />;
      case 'NETWORK':
        return <Network size={16} color="#16A34A" />;
      case 'INTRO':
        return <Send size={16} color="#D97706" />;
    }
  };

  const getNotifIconBg = (type: NotificationItem['type']) => {
    switch (type) {
      case 'OPPORTUNITY':
        return 'var(--badge-red-bg)';
      case 'MEETING':
        return 'var(--badge-purple-bg)';
      case 'NETWORK':
        return 'var(--badge-green-bg)';
      case 'INTRO':
        return 'var(--badge-amber-bg)';
    }
  };

  return (
    <header className={styles.topbar}>
      <form className={styles.searchContainer} onSubmit={handleSearch}>
        <Search size={16} className={styles.searchIcon} />
        <input 
          ref={inputRef}
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search people, companies, opportunities..." 
          className={styles.searchInput} 
        />
        <span className={styles.searchShortcut}>⌘K</span>
      </form>
      <div className={styles.actions}>
        <span className={styles.dateText}>{currentDate}</span>
        
        {/* Notification Bell & Dropdown */}
        <div className={styles.notifWrapper} ref={notifRef}>
          <button 
            className={styles.iconBtn} 
            title="Notifications" 
            aria-label="Notifications"
            onClick={() => setIsNotifOpen(prev => !prev)}
            aria-expanded={isNotifOpen}
          >
            <Bell size={18} />
            {unreadCount > 0 && <span className={styles.notificationDot} />}
          </button>

          {isNotifOpen && (
            <div className={styles.notifDropdown} role="dialog" aria-label="Notifications popover">
              <div className={styles.notifHeader}>
                <div className={styles.notifTitleGroup}>
                  <h3 className={styles.notifTitle}>Notifications</h3>
                  {unreadCount > 0 && (
                    <span className={styles.notifCountBadge}>{unreadCount} new</span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button className={styles.markReadBtn} onClick={handleMarkAllRead}>
                    Mark all read
                  </button>
                )}
              </div>

              <div className={styles.notifList}>
                {notifications.length === 0 ? (
                  <div className={styles.emptyNotifs}>No notifications at this time.</div>
                ) : (
                  notifications.map(item => (
                    <div
                      key={item.id}
                      className={`${styles.notifItem} ${!item.read ? styles.notifItemUnread : ''}`}
                      onClick={() => handleNotificationClick(item)}
                    >
                      <div 
                        className={styles.notifItemIcon}
                        style={{ backgroundColor: getNotifIconBg(item.type) }}
                      >
                        {getNotifIcon(item.type)}
                      </div>
                      <div className={styles.notifContent}>
                        <div className={styles.notifItemTitle}>{item.title}</div>
                        <div className={styles.notifItemMessage}>{item.message}</div>
                        <div className={styles.notifItemMeta}>
                          <span>{item.time}</span>
                        </div>
                      </div>
                      {!item.read && <span className={styles.unreadDot} />}
                    </div>
                  ))
                )}
              </div>

              <div className={styles.notifFooter}>
                <button 
                  className={styles.viewAllNotifs}
                  onClick={() => {
                    setIsNotifOpen(false);
                    navigate('/dashboard');
                  }}
                >
                  View intelligence feed
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar */}
        <div className={styles.avatar} title="Ottobon Enterprise (Admin)">
          <span>OT</span>
        </div>
      </div>
    </header>
  );
};


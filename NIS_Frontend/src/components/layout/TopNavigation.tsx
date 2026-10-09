import React, { useState, useEffect, useRef } from 'react';
import { Search, Bell, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import styles from './TopNavigation.module.css';

export const TopNavigation: React.FC = () => {
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/people?q=${encodeURIComponent(query)}`);
    }
  };

  return (
    <header className={styles.topbar}>
      <form className={styles.searchContainer} onSubmit={handleSearch}>
        <Search size={18} className={styles.searchIcon} />
        <input 
          ref={inputRef}
          type="text" 
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search (Cmd/Ctrl + K)" 
          className={styles.searchInput} 
        />
      </form>
      <div className={styles.actions}>
        <button className={styles.createBtn} onClick={() => navigate('/contacts/new')}>
          <PlusCircle size={16} />
          <span>Add Connection</span>
        </button>
        <button className={styles.iconBtn}>
          <Bell size={20} />
        </button>
        <div className={styles.avatar}>
          <span>JD</span>
        </div>
      </div>
    </header>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Users, Target, Calendar, Send, Network, ArrowUpRight, ChevronRight } from 'lucide-react';
import { dashboardApi } from '../../../services/api/dashboard.api';
import styles from './ExecutiveDashboard.module.css';

export const ExecutiveDashboard: React.FC = () => {
  const navigate = useNavigate();

  const { data: dashboardData } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: dashboardApi.get,
    staleTime: 60000,
    retry: 1
  });

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  // Numbers prioritize live stats when available, fallback to design specification defaults
  const peopleCount = dashboardData?.stats.researched || dashboardData?.stats.networkNodes || 124;
  const oppsCount = dashboardData?.stats.openOpportunities || dashboardData?.stats.activeOpportunities || 18;
  const meetingsCount = dashboardData?.stats.conversations || 12;
  const introsCount = dashboardData?.stats.outcomes || dashboardData?.stats.introductionsSent || 6;

  const statCards = [
    {
      label: 'People',
      value: peopleCount,
      growth: '+3.5%',
      growthPositive: true,
      icon: Users,
      color: '#16A34A',
      bgColor: '#DCFCE7',
      path: '/people'
    },
    {
      label: 'Opportunities',
      value: oppsCount,
      growth: '+12.0%',
      growthPositive: true,
      icon: Target,
      color: '#DC2626',
      bgColor: '#FEE2E2',
      path: '/opportunities'
    },
    {
      label: 'Meetings',
      value: meetingsCount,
      growth: '+2.0%',
      growthPositive: true,
      icon: Calendar,
      color: '#9333EA',
      bgColor: '#F3E8FF',
      path: '/meetings'
    },
    {
      label: 'Introductions',
      value: introsCount,
      growth: '+15.0%',
      growthPositive: true,
      icon: Send,
      color: '#D97706',
      bgColor: '#FEF3C7',
      path: '/introductions'
    }
  ];

  const recentActivities = [
    {
      id: 'act-1',
      title: 'New opportunity identified',
      subtitle: 'TechCorp · Strategic Expansion',
      time: '2h ago',
      icon: Target,
      color: '#2563EB',
      bgColor: '#EFF6FF',
      path: '/opportunities'
    },
    {
      id: 'act-2',
      title: 'Meeting brief prepared',
      subtitle: 'MediTech · AI Roadmap',
      time: '4h ago',
      icon: Calendar,
      color: '#9333EA',
      bgColor: '#F3E8FF',
      path: '/meetings'
    },
    {
      id: 'act-3',
      title: 'Introduction request sent',
      subtitle: 'David Kim · Nexus AI',
      time: '1d ago',
      icon: Send,
      color: '#D97706',
      bgColor: '#FEF3C7',
      path: '/introductions'
    },
    {
      id: 'act-4',
      title: 'Network match found',
      subtitle: 'Sarah Connor · Cyberdyne',
      time: '2d ago',
      icon: Network,
      color: '#16A34A',
      bgColor: '#DCFCE7',
      path: '/network'
    }
  ];

  const topOpportunities = [
    {
      id: 'opp-1',
      title: 'AI Platform Partnership',
      company: 'TechCorp',
      priority: 'High',
      priorityClass: styles.priorityHigh,
      path: '/opportunities'
    },
    {
      id: 'opp-2',
      title: 'Healthcare Market Entry',
      company: 'HealthAll',
      priority: 'Medium',
      priorityClass: styles.priorityMedium,
      path: '/opportunities'
    },
    {
      id: 'opp-3',
      title: 'Product Distribution',
      company: 'BuildCorp',
      priority: 'Medium',
      priorityClass: styles.priorityMedium,
      path: '/opportunities'
    },
    {
      id: 'opp-4',
      title: 'Strategic Investment',
      company: 'Horizon VC',
      priority: 'Low',
      priorityClass: styles.priorityLow,
      path: '/opportunities'
    }
  ];

  return (
    <div className={styles.container}>
      {/* Welcome Header */}
      <div className={styles.headerRow}>
        <div className={styles.titleArea}>
          <h1 className="page-title">Welcome back</h1>
          <p className="page-subtitle">Here's what's happening in your network</p>
        </div>
        <div className={styles.dateDisplay}>
          {currentDate}
        </div>
      </div>

      {/* 4 KPI Metric Cards */}
      <section className={styles.statsGrid} aria-label="Key Performance Indicators">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className={styles.statCard}
              onClick={() => navigate(card.path)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && navigate(card.path)}
            >
              <div className={styles.statCardTop}>
                <div 
                  className={styles.statIconContainer}
                  style={{ backgroundColor: card.bgColor, color: card.color }}
                >
                  <Icon size={20} />
                </div>
                <span 
                  className={styles.badgeGrowth}
                  style={{ backgroundColor: card.bgColor, color: card.color }}
                >
                  <ArrowUpRight size={13} />
                  {card.growth}
                </span>
              </div>
              <div className={styles.statCardBottom}>
                <span className={styles.statValue}>{card.value}</span>
                <span className={styles.statLabel}>{card.label}</span>
              </div>
            </div>
          );
        })}
      </section>

      {/* Main 2-Column Content */}
      <div className={styles.mainGrid}>
        {/* Left Column: Recent Activity */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionCardHeader}>
            <h2 className={styles.sectionCardTitle}>Recent activity</h2>
          </div>
          <div className={styles.activityList}>
            {recentActivities.map((act) => {
              const Icon = act.icon;
              return (
                <div
                  key={act.id}
                  className={styles.activityItem}
                  onClick={() => navigate(act.path)}
                >
                  <div
                    className={styles.activityIcon}
                    style={{ backgroundColor: act.bgColor, color: act.color }}
                  >
                    <Icon size={18} />
                  </div>
                  <div className={styles.activityDetails}>
                    <span className={styles.activityTitle}>{act.title}</span>
                    <span className={styles.activitySubtitle}>{act.subtitle}</span>
                  </div>
                  <span className={styles.activityTime}>{act.time}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: Top Opportunities */}
        <section className={styles.sectionCard}>
          <div className={styles.sectionCardHeader}>
            <h2 className={styles.sectionCardTitle}>Top opportunities</h2>
            <button
              className={styles.viewAllLink}
              onClick={() => navigate('/opportunities')}
            >
              View all <ChevronRight size={14} />
            </button>
          </div>
          <div className={styles.opportunityList}>
            {topOpportunities.map((opp) => (
              <div
                key={opp.id}
                className={styles.opportunityItem}
                onClick={() => navigate(opp.path)}
              >
                <div className={styles.opportunityInfo}>
                  <span className={styles.opportunityTitle}>{opp.title}</span>
                  <span className={styles.opportunityCompany}>{opp.company}</span>
                </div>
                <span className={`${styles.priorityBadge} ${opp.priorityClass}`}>
                  {opp.priority}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
};

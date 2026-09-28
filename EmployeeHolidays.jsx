import React, { useState } from 'react';
import { useHRMS } from '../../context/HRMSContext';
import { Badge } from '../../components/common/Badge';
import {
  Calendar,
  Sparkles,
  PartyPopper,
  Clock,
  Filter,
  CheckCircle
} from 'lucide-react';

export const EmployeeHolidays = () => {
  const { holidays } = useHRMS();
  const [filterType, setFilterType] = useState('ALL');

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];

  // Sort holidays chronologically
  const sortedHolidays = [...holidays].sort((a, b) => new Date(a.date) - new Date(b.date));

  // Find next upcoming holiday
  const upcomingHolidays = sortedHolidays.filter(h => h.date >= todayStr);
  const nextHoliday = upcomingHolidays[0];

  // Calculate days until next holiday
  const daysUntilNext = nextHoliday
    ? Math.ceil((new Date(nextHoliday.date) - today) / (1000 * 60 * 60 * 24))
    : null;

  const filteredHolidays = filterType === 'ALL'
    ? sortedHolidays
    : sortedHolidays.filter(h => (h.type || 'Public').toUpperCase() === filterType);

  return (
    <div className="page-body">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Company Holiday Calendar 2026</h1>
          <p className="page-subtitle">Official public holidays, festival observances, and company-wide scheduled off days</p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['ALL', 'PUBLIC', 'COMPANY', 'OPTIONAL'].map(type => (
            <button
              key={type}
              onClick={() => setFilterType(type)}
              className={`btn btn-sm ${filterType === type ? 'btn-primary' : 'btn-ghost'}`}
              style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* Next Holiday Banner */}
      {nextHoliday && (
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '1.75rem 2rem',
          color: '#ffffff',
          marginBottom: '2rem',
          boxShadow: 'var(--shadow-lg)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.25rem'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.08em', color: '#a5b4fc', fontWeight: 700 }}>
              <PartyPopper size={16} /> Next Upcoming Observance
            </div>
            <div style={{ fontSize: '1.85rem', fontWeight: 800, fontFamily: 'Outfit', color: '#ffffff', marginTop: '0.35rem' }}>
              {nextHoliday.name}
            </div>
            <div style={{ fontSize: '0.9rem', color: '#e0e7ff', marginTop: '0.25rem' }}>
              {new Date(nextHoliday.date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
            </div>
          </div>

          <div style={{
            background: 'rgba(255, 255, 255, 0.15)',
            backdropFilter: 'blur(8px)',
            borderRadius: 'var(--radius-lg)',
            padding: '1rem 1.5rem',
            textAlign: 'center'
          }}>
            <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'Outfit', color: '#34d399' }}>
              {daysUntilNext > 0 ? daysUntilNext : 'Today'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#cbd5e1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {daysUntilNext === 1 ? 'Day Left' : 'Days Remaining'}
            </div>
          </div>
        </div>
      )}

      {/* Holidays Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.25rem' }}>
        {filteredHolidays.map((holiday, idx) => {
          const holDate = new Date(holiday.date);
          const isPast = holiday.date < todayStr;
          const isNext = holiday.id === nextHoliday?.id;

          const monthShort = holDate.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
          const dayNum = holDate.getDate();
          const weekday = holDate.toLocaleDateString('en-US', { weekday: 'long' });

          return (
            <div
              key={holiday.id || idx}
              className="card card-hover"
              style={{
                display: 'flex',
                gap: '1.25rem',
                alignItems: 'center',
                padding: '1.25rem',
                border: isNext ? '2px solid var(--primary)' : '1px solid var(--border-color)',
                opacity: isPast ? 0.65 : 1
              }}
            >
              {/* Date Badge */}
              <div style={{
                width: '60px',
                height: '65px',
                borderRadius: 'var(--radius-md)',
                background: isNext ? 'var(--primary)' : 'var(--bg-tertiary)',
                color: isNext ? '#ffffff' : 'var(--text-primary)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ fontSize: '0.7rem', fontWeight: 800, letterSpacing: '0.05em' }}>
                  {monthShort}
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, fontFamily: 'Outfit', lineHeight: 1 }}>
                  {dayNum}
                </div>
              </div>

              {/* Details */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {holiday.name}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {weekday}
                </div>
                <div style={{ marginTop: '0.5rem' }}>
                  <Badge variant={holiday.type === 'Company' ? 'purple' : holiday.type === 'Optional' ? 'secondary' : 'primary'} size="sm">
                    {holiday.type || 'Public Holiday'}
                  </Badge>
                  {isPast && (
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                      Passed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

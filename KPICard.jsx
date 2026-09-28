import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

export const KPICard = ({
  title,
  value,
  subtitle,
  trend,
  trendType = 'up', // 'up' | 'down' | 'neutral'
  icon: Icon,
  iconColor = 'var(--primary)',
  iconBg = 'var(--primary-light)',
  onClick,
  style = {}
}) => {
  return (
    <div
      className="kpi-card"
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...style
      }}
    >
      {Icon && (
        <div
          className="kpi-icon-box"
          style={{
            background: iconBg,
            color: iconColor
          }}
        >
          <Icon size={22} />
        </div>
      )}

      <div className="kpi-info" style={{ flex: 1 }}>
        <div className="kpi-label">{title}</div>
        <div className="kpi-value">{value}</div>

        {(trend || subtitle) && (
          <div
            className="kpi-trend"
            style={{
              color: trendType === 'up'
                ? 'var(--success-text)'
                : trendType === 'down'
                ? 'var(--danger-text)'
                : 'var(--text-secondary)'
            }}
          >
            {trend && (
              trendType === 'up' ? <TrendingUp size={13} /> : trendType === 'down' ? <TrendingDown size={13} /> : null
            )}
            <span>{trend || subtitle}</span>
          </div>
        )}
      </div>
    </div>
  );
};

import React from 'react';

export const Badge = ({
  children,
  variant = 'neutral', // 'primary' | 'success' | 'warning' | 'danger' | 'purple' | 'neutral'
  dot = false,
  size = 'md',        // 'sm' | 'md'
  className = '',
  style = {}
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'primary': return 'badge-primary';
      case 'success': return 'badge-success';
      case 'warning': return 'badge-warning';
      case 'danger': return 'badge-danger';
      case 'purple': return 'badge-purple';
      default: return 'badge-neutral';
    }
  };

  const getDotColor = () => {
    switch (variant) {
      case 'primary': return 'var(--primary)';
      case 'success': return 'var(--success)';
      case 'warning': return 'var(--warning)';
      case 'danger': return 'var(--danger)';
      case 'purple': return 'var(--purple)';
      default: return 'var(--text-muted)';
    }
  };

  return (
    <span
      className={`badge ${getVariantClass()} ${className}`}
      style={{
        fontSize: size === 'sm' ? '0.675rem' : '0.75rem',
        padding: size === 'sm' ? '0.15rem 0.45rem' : '0.25rem 0.65rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        ...style
      }}
    >
      {dot && (
        <span
          style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: getDotColor()
          }}
        />
      )}
      {children}
    </span>
  );
};

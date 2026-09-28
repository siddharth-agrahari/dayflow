import React from 'react';

export const ProgressBar = ({
  progress = 0, // 0 to 100
  color = 'var(--primary)',
  height = '8px',
  label = null,
  valueText = null,
  className = '',
  style = {}
}) => {
  const clampedProgress = Math.min(100, Math.max(0, progress));

  return (
    <div style={{ width: '100%', ...style }} className={className}>
      {(label || valueText) && (
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '0.75rem',
          marginBottom: '0.35rem',
          color: 'var(--text-secondary)'
        }}>
          {label && <span>{label}</span>}
          {valueText ? <strong>{valueText}</strong> : <strong>{Math.round(clampedProgress)}%</strong>}
        </div>
      )}

      <div style={{
        width: '100%',
        height,
        background: 'var(--bg-tertiary)',
        borderRadius: '9999px',
        overflow: 'hidden'
      }}>
        <div
          style={{
            width: `${clampedProgress}%`,
            height: '100%',
            background: color,
            borderRadius: '9999px',
            transition: 'width 0.4s ease-out'
          }}
        />
      </div>
    </div>
  );
};

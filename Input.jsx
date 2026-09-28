import React from 'react';

export const Input = ({
  label,
  error,
  helperText,
  icon: Icon,
  className = '',
  style = {},
  id,
  type = 'text',
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 6)}`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', width: '100%' }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-secondary)'
          }}
        >
          {label}
        </label>
      )}

      <div style={{ position: 'relative', width: '100%' }}>
        {Icon && (
          <div style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--text-muted)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none'
          }}>
            <Icon size={16} />
          </div>
        )}

        <input
          id={inputId}
          type={type}
          className={`form-input ${className}`}
          style={{
            width: '100%',
            paddingLeft: Icon ? '2.4rem' : '0.85rem',
            borderColor: error ? 'var(--danger)' : undefined,
            ...style
          }}
          {...props}
        />
      </div>

      {error ? (
        <div style={{ fontSize: '0.725rem', color: 'var(--danger)', fontWeight: 500 }}>
          {error}
        </div>
      ) : helperText ? (
        <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
          {helperText}
        </div>
      ) : null}
    </div>
  );
};

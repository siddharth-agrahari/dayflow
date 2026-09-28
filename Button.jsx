import React from 'react';
import { Loader2 } from 'lucide-react';

export const Button = ({
  children,
  variant = 'primary', // 'primary' | 'secondary' | 'danger' | 'ghost' | 'success' | 'outline'
  size = 'md',        // 'sm' | 'md' | 'lg'
  loading = false,
  disabled = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  style = {},
  onClick,
  type = 'button',
  ...props
}) => {
  const getVariantClass = () => {
    switch (variant) {
      case 'secondary': return 'btn-secondary';
      case 'danger': return 'btn-danger';
      case 'ghost': return 'btn-ghost';
      case 'success': return 'btn-success';
      case 'outline': return 'btn-secondary';
      default: return 'btn-primary';
    }
  };

  const getSizeClass = () => {
    switch (size) {
      case 'sm': return 'btn-sm';
      case 'lg': return 'btn-lg';
      default: return '';
    }
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      onClick={onClick}
      className={`btn ${getVariantClass()} ${getSizeClass()} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.45rem',
        opacity: (disabled || loading) ? 0.65 : 1,
        cursor: (disabled || loading) ? 'not-allowed' : 'pointer',
        ...style
      }}
      {...props}
    >
      {loading ? (
        <Loader2 size={size === 'sm' ? 14 : 18} className="spin-animation" />
      ) : (
        Icon && iconPosition === 'left' && <Icon size={size === 'sm' ? 14 : 17} />
      )}

      <span>{children}</span>

      {!loading && Icon && iconPosition === 'right' && <Icon size={size === 'sm' ? 14 : 17} />}
    </button>
  );
};

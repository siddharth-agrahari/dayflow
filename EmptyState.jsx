import React from 'react';
import { Inbox } from 'lucide-react';

export const EmptyState = ({
  icon: Icon = Inbox,
  title = 'No Data Found',
  description = 'There are currently no records available in this view.',
  action = null
}) => {
  return (
    <div style={{
      textAlign: 'center',
      padding: '3.5rem 1.5rem',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'var(--text-muted)'
    }}>
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '14px',
        background: 'var(--bg-tertiary)',
        color: 'var(--text-muted)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1rem'
      }}>
        <Icon size={28} />
      </div>

      <h3 style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
        {title}
      </h3>

      <p style={{
        fontSize: '0.85rem',
        color: 'var(--text-secondary)',
        maxWidth: '360px',
        margin: '0.35rem 0 1.25rem 0',
        lineHeight: 1.5
      }}>
        {description}
      </p>

      {action && <div>{action}</div>}
    </div>
  );
};

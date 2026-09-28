import React from 'react';

export const Table = ({
  columns = [], // [{ key, label, render, align }]
  data = [],
  loading = false,
  emptyMessage = 'No records found.',
  keyField = 'id',
  className = '',
  style = {}
}) => {
  return (
    <div className="table-container" style={{ overflowX: 'auto', width: '100%', ...style }}>
      <table className={`hrms-table ${className}`} style={{ width: '100%' }}>
        <thead>
          <tr>
            {columns.map((col, idx) => (
              <th
                key={col.key || idx}
                style={{
                  textAlign: col.align || 'left',
                  whiteSpace: 'nowrap'
                }}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.6rem', color: 'var(--text-muted)' }}>
                  <span className="spin-animation" style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid var(--primary)', borderTopColor: 'transparent', borderRadius: '50%' }} />
                  <span>Loading records...</span>
                </div>
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td
                colSpan={columns.length}
                style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, rowIdx) => (
              <tr key={row[keyField] || rowIdx}>
                {columns.map((col, colIdx) => (
                  <td
                    key={col.key || colIdx}
                    style={{
                      textAlign: col.align || 'left',
                      verticalAlign: 'middle'
                    }}
                  >
                    {col.render ? col.render(row[col.key], row, rowIdx) : (row[col.key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

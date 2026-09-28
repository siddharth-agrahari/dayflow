import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export const Pagination = ({
  currentPage = 1,
  totalPages = 1,
  totalItems = 0,
  pageSize = 10,
  onPageChange
}) => {
  if (totalPages <= 1) return null;

  const start = (currentPage - 1) * pageSize + 1;
  const end = Math.min(currentPage * pageSize, totalItems);

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '1rem 0.5rem',
      flexWrap: 'wrap',
      gap: '0.75rem',
      fontSize: '0.825rem',
      color: 'var(--text-secondary)'
    }}>
      <div>
        Showing <strong style={{ color: 'var(--text-primary)' }}>{start}</strong> to <strong style={{ color: 'var(--text-primary)' }}>{end}</strong> of <strong style={{ color: 'var(--text-primary)' }}>{totalItems}</strong> entries
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.25rem 0.5rem' }}
          title="Previous Page"
        >
          <ChevronLeft size={16} />
        </button>

        <span style={{ padding: '0 0.5rem', fontWeight: 600 }}>
          Page {currentPage} of {totalPages}
        </span>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="btn btn-secondary btn-sm"
          style={{ padding: '0.25rem 0.5rem' }}
          title="Next Page"
        >
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
};

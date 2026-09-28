import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Input } from '../../components/common/Input';
import { useToast } from '../../context/ToastContext';
import {
  Shield,
  Search,
  Download,
  Filter,
  Calendar,
  User,
  Clock,
  RefreshCw,
  Eye
} from 'lucide-react';

export const AdminAuditLogs = () => {
  const toast = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('All');
  const [inspectLog, setInspectLog] = useState(null);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.auditLogs.getAll({ limit: 150 });
      if (Array.isArray(res)) {
        setLogs(res);
      } else if (res?.logs) {
        setLogs(res.logs);
      }
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      toast.error('Failed to retrieve audit trail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const actionTypes = ['All', ...new Set(logs.map(l => l.action).filter(Boolean))];

  const filteredLogs = logs.filter(log => {
    const matchesAction = selectedAction === 'All' || log.action === selectedAction;
    const matchesSearch =
      log.actorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.entityType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAction && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['ID', 'Timestamp', 'Actor Name', 'Actor ID', 'Action', 'Entity Type', 'Entity ID', 'Details', 'IP Address'];
    const rows = filteredLogs.map(l => [
      l.id,
      `"${l.timestamp}"`,
      `"${l.actorName || ''}"`,
      `"${l.actorId || ''}"`,
      `"${l.action || ''}"`,
      `"${l.entityType || ''}"`,
      `"${l.entityId || ''}"`,
      `"${String(l.details || '').replace(/"/g, '""')}"`,
      `"${l.ip || '127.0.0.1'}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Dayflow_Audit_Trail_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Audit trail logs exported to CSV.');
  };

  const getActionBadgeVariant = (action = '') => {
    if (action.includes('DELETE') || action.includes('REJECT') || action.includes('DEACTIVATE')) return 'danger';
    if (action.includes('APPROVE') || action.includes('LOGIN') || action.includes('PUBLISH')) return 'success';
    if (action.includes('UPDATE') || action.includes('LOCK')) return 'warning';
    return 'primary';
  };

  return (
    <div className="page-body">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 className="page-title">Compliance Audit Trail & Security Logs</h1>
          <p className="page-subtitle">Immutable append-only record of all administrative, authentication, and state modifications</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Button variant="outline" onClick={fetchLogs} loading={loading}>
            <RefreshCw size={15} /> Refresh
          </Button>
          <Button variant="primary" onClick={handleExportCSV}>
            <Download size={15} /> Export Audit Log (.CSV)
          </Button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ marginBottom: '1.5rem', padding: '1rem 1.25rem' }}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, minWidth: '300px', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
              <Search size={16} style={{ position: 'absolute', left: '12px', top: '11px', color: 'var(--text-muted)' }} />
              <input
                type="text"
                placeholder="Search audit trail by actor, action, details..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="form-input"
                style={{ paddingLeft: '2.4rem' }}
              />
            </div>

            <select
              value={selectedAction}
              onChange={e => setSelectedAction(e.target.value)}
              className="form-select"
              style={{ width: 'auto', minWidth: '180px' }}
            >
              {actionTypes.map(act => (
                <option key={act} value={act}>{act === 'All' ? 'All Event Types' : act}</option>
              ))}
            </select>
          </div>

          <Badge variant="secondary">
            <Shield size={13} /> {filteredLogs.length} Events Tracked
          </Badge>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="card">
        <div className="table-container">
          <table className="hrms-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Actor</th>
                <th>Action</th>
                <th>Entity Target</th>
                <th>Activity Description</th>
                <th style={{ textAlign: 'right' }}>Payload</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    Loading audit stream...
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
                    No matching audit records found.
                  </td>
                </tr>
              ) : (
                filteredLogs.map(log => (
                  <tr key={log.id}>
                    <td style={{ fontSize: '0.8rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                        <Clock size={13} />
                        <span>{new Date(log.timestamp).toLocaleString()}</span>
                      </div>
                    </td>

                    <td>
                      <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{log.actorName || 'System'}</div>
                      <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>ID: {log.actorId || 'SYS-00'}</div>
                    </td>

                    <td>
                      <Badge variant={getActionBadgeVariant(log.action)}>
                        {log.action}
                      </Badge>
                    </td>

                    <td style={{ fontSize: '0.825rem' }}>
                      <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{log.entityType}</span>
                      {log.entityId && <span style={{ color: 'var(--text-muted)', marginLeft: '4px' }}>#{log.entityId}</span>}
                    </td>

                    <td style={{ fontSize: '0.825rem', maxWidth: '340px' }}>
                      {typeof log.details === 'object' ? JSON.stringify(log.details) : log.details}
                    </td>

                    <td style={{ textAlign: 'right' }}>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setInspectLog(log)}
                        title="Inspect Raw Audit Payload"
                      >
                        <Eye size={14} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inspect Raw Log Modal */}
      {inspectLog && (
        <div className="modal-overlay" onClick={() => setInspectLog(null)}>
          <div className="modal-dialog" style={{ maxWidth: '600px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Audit Record Inspector #{inspectLog.id}</h3>
              <Button variant="ghost" size="sm" onClick={() => setInspectLog(null)}>✕</Button>
            </div>
            <div className="modal-body">
              <pre style={{
                background: 'var(--bg-tertiary)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                overflowX: 'auto',
                fontSize: '0.8rem',
                lineHeight: 1.5,
                color: 'var(--text-primary)'
              }}>
                {JSON.stringify(inspectLog, null, 2)}
              </pre>
            </div>
            <div className="modal-footer">
              <Button variant="secondary" onClick={() => setInspectLog(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

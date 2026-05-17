import React, { useEffect, useMemo, useState } from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import { apiRequest } from '../../../config/api';
import '../superAdminShared.css';

const buildSeverity = (notification) => {
  const message = String(notification.message || '').toLowerCase();
  if (message.includes('urgent') || message.includes('critical')) return 'High';
  if (notification.type === 'order') return 'High';
  return 'Medium';
};

const severityBadgeClass = (severity) => {
  if (severity === 'High') return 'super-badge super-badge--high';
  return 'super-badge super-badge--medium';
};

const SuperAdminAlerts = () => {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await apiRequest('/notifications/me');
        if (!active) return;
        setAlerts(Array.isArray(result.notifications) ? result.notifications : []);
      } catch (err) {
        if (!active) return;
        setAlerts([]);
        setError(err.message || 'Unable to load alerts');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, []);

  const complaintAlerts = useMemo(() => {
    return alerts
      .filter((alert) => alert.type === 'system' || alert.type === 'order')
      .map((alert) => ({
        id: alert.id,
        customer: alert.customer || 'Customer',
        branch: alert.branch || alert.activeBranch || '-',
        concern: alert.message || alert.title || 'Customer alert',
        severity: buildSeverity(alert),
      }));
  }, [alerts]);

  return (
    <SuperAdminLayout title="Customer Complaint Alerts" subtitle="Critical customer concerns requiring executive review">
      <div className="super-card">
        <div className="super-section-header">
          <h3>Complaint Alert Feed</h3>
          {!loading && complaintAlerts.length > 0 && (
            <span className="super-badge super-badge--high">{complaintAlerts.length} Active</span>
          )}
        </div>

        <div className="super-list">
          {loading && (
            <div style={{ display: 'grid', gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="super-shimmer" style={{ height: 80 }} />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="super-muted" style={{ color: 'var(--status-cancel-text)' }}>{error}</p>
          )}

          {!loading && !error && complaintAlerts.length === 0 && (
            <div className="super-empty">
              <p>No complaint alerts right now. All clear.</p>
            </div>
          )}

          {!loading && complaintAlerts.map((alert) => (
            <div key={alert.id} className="super-list-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <strong>#{alert.id}</strong>
                <span className={severityBadgeClass(alert.severity)}>{alert.severity} Severity</span>
              </div>
              <p>Customer: {alert.customer}</p>
              <p>Branch: {alert.branch}</p>
              <p style={{ color: 'var(--super-text-secondary)' }}>{alert.concern}</p>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminAlerts;
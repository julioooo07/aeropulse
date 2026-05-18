import React, { useEffect, useMemo, useState } from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import { apiRequest } from '../../../config/api';
import '../superAdminShared.css';

const toHours = (value) => Math.max(0, Math.round(value / (1000 * 60 * 60)));
const pickDate = (task) => new Date(task.updatedAt || task.createdAt || Date.now());
const normalizeStatus = (value) => String(value || '').replace(/_/g, ' ');

const agingColor = (hours) => {
  if (hours >= 48) return 'super-badge super-badge--high';
  if (hours >= 24) return 'super-badge super-badge--medium';
  return 'super-badge super-badge--progress';
};

const SuperAdminTasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const result = await apiRequest('/tasks');
        if (!active) return;
        const filtered = Array.isArray(result.tasks) ? result.tasks.filter(t => {
          const status = String(t.status || '').toLowerCase();
          return (status === 'in-progress' || status === 'in_progress') && t.assignedTechnicianId;
        }) : [];
        setTasks(filtered);
      } catch (err) {
        if (!active) return;
        setTasks([]);
        setError(err.message || 'Unable to load tasks');
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => { active = false; };
  }, []);

  const processingTasks = useMemo(() => {
    const now = Date.now();
    return tasks
      .filter((task) => {
        const status = String(task.status || '').toLowerCase();
        return status !== 'completed' && status !== 'cancelled';
      })
      .map((task) => {
        const taskDate = pickDate(task);
        return {
          id: task.taskCode || task.code || task.id,
          technician: task.assignedTechnicianName || 'Unassigned',
          customer: task.customerName || task.customer || 'Customer',
          status: normalizeStatus(task.status || 'Processing'),
          agingHours: toHours(now - taskDate.getTime()),
          branch: task.branch || '-',
        };
      })
      .sort((a, b) => b.agingHours - a.agingHours); // show oldest first
  }, [tasks]);

  return (
    <SuperAdminLayout title="Processing Tech Tasks" subtitle="Overdue or unresolved field work">
      <div className="super-card">
        <div className="super-section-header">
          <h3>Task Escalation Queue</h3>
          {!loading && processingTasks.length > 0 && (
            <span className="super-badge super-badge--progress">{processingTasks.length} In Progress</span>
          )}
        </div>

        <div className="super-list">
          {loading && (
            <div style={{ display: 'grid', gap: 10 }}>
              {[1, 2, 3].map((i) => (
                <div key={i} className="super-shimmer" style={{ height: 90 }} />
              ))}
            </div>
          )}

          {!loading && error && (
            <p className="super-muted" style={{ color: 'var(--status-cancel-text)' }}>{error}</p>
          )}

          {!loading && !error && processingTasks.length === 0 && (
            <div className="super-empty">
              <p>No unresolved tasks right now. All clear.</p>
            </div>
          )}

          {!loading && processingTasks.map((task) => (
            <div key={task.id} className="super-list-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <strong>#{task.id}</strong>
                <span className={agingColor(task.agingHours)}>{task.agingHours}h aging</span>
              </div>
              <p>Technician: {task.technician}</p>
              <p>Customer: {task.customer}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 2 }}>
                <span className="super-badge super-badge--progress">{task.status}</span>
                <span className="super-muted">Branch: {task.branch}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminTasks;
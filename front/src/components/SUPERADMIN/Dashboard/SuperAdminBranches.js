import React, { useState, useEffect } from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import { apiRequest } from '../../../config/api';
import '../superAdminShared.css';

const SuperAdminBranches = () => {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [draft, setDraft] = useState({ name: '', location: '', manager: '', adminId: '', needs: '', requests: '' });

  useEffect(() => {
    let active = true;
    const load = async () => {
      setLoading(true);
      setError('');
      try {
        const adminData = await apiRequest('/users?role=admin');
        const adminsList = Array.isArray(adminData?.users) ? adminData.users : [];
        if (active) setAdmins(adminsList);
      } catch (err) {
        if (active) {
          setError(err.message || 'Failed to load admins');
          setAdmins([]);
        }
      } finally {
        if (active) setLoading(false);
      }
    };
    load();
    return () => { active = false; };
  }, []);

  const formatLastLogin = (date) => {
    if (!date) return 'Never';
    const d = new Date(date);
    const now = new Date();
    const diffMs = now - d;
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return d.toLocaleDateString();
  };

  const assignedAdmins = admins.filter(a => a.assignedBranch);

  return (
    <SuperAdminLayout title="Branch Location Handling" subtitle="Monitor branch allocation, network status, needs, and requests">
      <div className="super-grid-2">

        {/* Branch Allocation panel */}
        <div className="super-card">
          <div className="super-section-header">
            <h3>Branch Allocation & Admin Assignment</h3>
            {!loading && (
              <span className="super-badge super-badge--complete">{assignedAdmins.length} Assigned</span>
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
              <p style={{ color: 'var(--status-cancel-text)', fontSize: 13 }}>{error}</p>
            )}

            {!loading && assignedAdmins.length === 0 && !error && (
              <div className="super-empty">
                <p>No admins assigned to branches yet.</p>
              </div>
            )}

            {!loading && assignedAdmins.map((admin) => (
              <div key={admin.id} className="super-list-item">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 6 }}>
                  <strong>{admin.assignedBranch}</strong>
                  <span className="super-badge super-badge--progress">
                    {formatLastLogin(admin.lastLogin)}
                  </span>
                </div>
                <p>Admin: {admin.name}</p>
                <p>Email: {admin.email}</p>
                {admin.phone && <p>Phone: {admin.phone}</p>}
                {admin.address && <p>Address: {admin.address}</p>}
              </div>
            ))}
          </div>
        </div>

        {/* Manage Branch form */}
        <form
          className="super-card"
          onSubmit={(e) => {
            e.preventDefault();
            alert('Branch assignment feature coming soon. Use admin user management to assign branches.');
            setDraft({ name: '', location: '', manager: '', adminId: '', needs: '', requests: '' });
          }}
        >
          <div className="super-section-header">
            <h3>Manage Branch</h3>
          </div>

          <label>
            Select Admin
            <select
              value={draft.adminId}
              onChange={(e) => setDraft((p) => ({ ...p, adminId: e.target.value }))}
            >
              <option value="">Select Admin…</option>
              {admins.filter(a => !a.assignedBranch).map(admin => (
                <option key={admin.id} value={admin.id}>{admin.name} ({admin.email})</option>
              ))}
            </select>
          </label>

          <label>
            Branch Name
            <input
              placeholder="e.g. Makati Main"
              value={draft.name}
              onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
            />
          </label>

          <label>
            Location
            <input
              placeholder="e.g. 123 Ayala Ave, Makati"
              value={draft.location}
              onChange={(e) => setDraft((p) => ({ ...p, location: e.target.value }))}
            />
          </label>

          <label>
            Current Need
            <input
              placeholder="e.g. Additional technician"
              value={draft.needs}
              onChange={(e) => setDraft((p) => ({ ...p, needs: e.target.value }))}
            />
          </label>

          <label>
            Request for HQ
            <input
              placeholder="e.g. Inventory restock"
              value={draft.requests}
              onChange={(e) => setDraft((p) => ({ ...p, requests: e.target.value }))}
            />
          </label>

          <button type="submit">Assign Branch to Admin</button>
        </form>

      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminBranches;
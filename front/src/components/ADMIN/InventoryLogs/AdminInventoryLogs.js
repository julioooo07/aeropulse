import { useCallback, useEffect, useMemo, useState } from 'react';
import AdminLayout from '../Common/AdminLayout';
import { apiRequest } from '../../../config/api';
import { BRANCHES } from '../../../domain/branches/branches';
import '../adminShared.css';

function AdminInventoryLogs() {
  const [filters, setFilters] = useState({
    product: '',
    supplier: '',
    actionType: '',
    trackingNumber: '',
    branch: '',
    from: '',
    to: '',
  });
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadLogs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      if (filters.product) params.append('product', filters.product);
      if (filters.supplier) params.append('supplier', filters.supplier);
      if (filters.actionType) params.append('actionType', filters.actionType);
      if (filters.trackingNumber) params.append('trackingNumber', filters.trackingNumber);
      if (filters.branch) params.append('branch', filters.branch);
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      const response = await apiRequest(`/reports/inventory-transactions?${params.toString()}`);
      setLogs(response.transactions || []);
    } catch (err) {
      setError(err.message || 'Failed to load inventory logs');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadLogs();
  }, [loadLogs]);

  const summary = useMemo(() => ({
    total: logs.length,
  }), [logs]);

  return (
    <AdminLayout title="Inventory Logs" subtitle="Track stock receipts, delivery details, and transaction history">
      <div className="admin-grid-2">
        <div className="admin-card">
          <h3>Filters</h3>
          <div className="admin-field-group">
            <label>
              Product contains
              <input
                value={filters.product}
                onChange={(e) => setFilters((prev) => ({ ...prev, product: e.target.value }))}
                placeholder="Product name or SKU"
              />
            </label>
            <label>
              Supplier contains
              <input
                value={filters.supplier}
                onChange={(e) => setFilters((prev) => ({ ...prev, supplier: e.target.value }))}
                placeholder="Supplier name"
              />
            </label>
            <label>
              Action type
              <select
                value={filters.actionType}
                onChange={(e) => setFilters((prev) => ({ ...prev, actionType: e.target.value }))}
              >
                <option value="">All actions</option>
                <option value="stock_addition">Stock Addition</option>
                <option value="stock_deduction">Stock Deduction</option>
                <option value="stock_adjustment">Stock Adjustment</option>
                <option value="restock_receipt">Restock Receipt</option>
                <option value="order_deduction">Order Deduction</option>
              </select>
            </label>
            <label>
              Reference / tracking
              <input
                value={filters.trackingNumber}
                onChange={(e) => setFilters((prev) => ({ ...prev, trackingNumber: e.target.value }))}
                placeholder="Order code or tracking #"
              />
            </label>
            <label>
              Branch
              <select
                value={filters.branch}
                onChange={(e) => setFilters((prev) => ({ ...prev, branch: e.target.value }))}
              >
                <option value="">All Branches</option>
                {BRANCHES.map((branch) => (
                  <option key={branch} value={branch}>{branch}</option>
                ))}
              </select>
            </label>
            <label>
              Date from
              <input type="date" value={filters.from} onChange={(e) => setFilters((prev) => ({ ...prev, from: e.target.value }))} />
            </label>
            <label>
              Date to
              <input type="date" value={filters.to} onChange={(e) => setFilters((prev) => ({ ...prev, to: e.target.value }))} />
            </label>
          </div>
          <div className="admin-card-actions">
            <button type="button" onClick={loadLogs} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </button>
          </div>
        </div>

        <div className="admin-card">
          <h3>Summary</h3>
          <div className="admin-summary-list">
            <div className="admin-summary-item">
              <span>Total records</span>
              <strong>{summary.total}</strong>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-card admin-card--spacious admin-card--spaced">
        <h3>Transaction history</h3>
        {error && <div className="admin-error">{error}</div>}
        {loading ? (
          <div className="admin-empty-state">Loading inventory logs...</div>
        ) : logs.length === 0 ? (
          <div className="admin-empty-state">No inventory logs match the selected filters.</div>
        ) : (
          <div className="admin-table-wrap">
            <table className="admin-table admin-audit-table">
              <thead>
                <tr>
                    <th>Date</th>
                  <th>Action</th>
                  <th>Product</th>
                  <th>Qty</th>
                  <th>Branch</th>
                  <th>Reference</th>
                  <th>Responsible</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((row) => (
                  <tr key={row.id}>
                    <td>{new Date(row.createdAt).toLocaleString()}</td>
                    <td>{row.actionType || 'Unknown'}</td>
                    <td>{row.product}</td>
                    <td>{row.quantity}</td>
                    <td>{row.branch || '—'}</td>
                    <td>{row.reference || '—'}</td>
                    <td>{row.responsible || 'Unknown'}</td>
                    <td>{row.notes || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}

export default AdminInventoryLogs;

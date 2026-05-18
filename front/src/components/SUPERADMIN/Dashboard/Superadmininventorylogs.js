import React, { useEffect, useState, useMemo, useCallback } from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import { apiRequest } from '../../../config/api';
import '../superAdminShared.css';

/* ── helpers ── */
const ACTION_LABELS = {
  restock: 'Restock',
  sale: 'Sale',
  transfer: 'Transfer',
  adjustment: 'Adjustment',
  removal: 'Removal',
};

const actionClass = (action = '') => {
  const key = String(action).toLowerCase();
  if (key.includes('restock') || key.includes('stock_in') || key.includes('add')) return 'super-logs-action super-logs-action--restock';
  if (key.includes('sale') || key.includes('order') || key.includes('stock_out')) return 'super-logs-action super-logs-action--sale';
  if (key.includes('transfer')) return 'super-logs-action super-logs-action--transfer';
  if (key.includes('adjust')) return 'super-logs-action super-logs-action--adjustment';
  if (key.includes('remov') || key.includes('delete') || key.includes('discard')) return 'super-logs-action super-logs-action--removal';
  return 'super-logs-action super-logs-action--adjustment';
};

const actionLabel = (action = '') => {
  const lower = String(action).toLowerCase();
  for (const [k, v] of Object.entries(ACTION_LABELS)) {
    if (lower.includes(k)) return v;
  }
  // Prettify raw action strings
  return String(action).replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) || 'Unknown';
};

const qtyClass = (qty) => {
  if (qty > 0) return 'super-logs-qty super-logs-qty--in';
  if (qty < 0) return 'super-logs-qty super-logs-qty--out';
  return 'super-logs-qty super-logs-qty--neutral';
};

const formatQty = (qty) => {
  if (qty === undefined || qty === null || qty === '') return '—';
  const n = Number(qty);
  if (isNaN(n)) return String(qty);
  return n > 0 ? `+${n}` : String(n);
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  if (isNaN(d)) return String(dateStr);
  return d.toLocaleDateString('en-PH', { month: 'short', day: 'numeric', year: 'numeric' })
    + ' · '
    + d.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' });
};

const PAGE_SIZE = 20;

const SuperAdminInventoryLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('all');
  const [filterBranch, setFilterBranch] = useState('all');
  const [page, setPage] = useState(1);
  const [sortDir, setSortDir] = useState('desc'); // newest first

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      // Try common inventory log endpoints
      let result;
      try {
        result = await apiRequest('/inventory/logs');
      } catch {
        result = await apiRequest('/inventory-logs');
      }
      const data = Array.isArray(result?.logs)
        ? result.logs
        : Array.isArray(result?.data)
        ? result.data
        : Array.isArray(result)
        ? result
        : [];
      setLogs(data);
    } catch (err) {
      setError(err.message || 'Unable to load inventory logs.');
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  /* Derived branch list */
  const branches = useMemo(() => {
    const set = new Set();
    logs.forEach(l => { if (l.branch) set.add(l.branch); });
    return Array.from(set).sort();
  }, [logs]);

  /* Derived action list */
  const actionTypes = useMemo(() => {
    const set = new Set();
    logs.forEach(l => { if (l.action || l.type) set.add(l.action || l.type); });
    return Array.from(set).sort();
  }, [logs]);

  /* Filtered + searched */
  const filtered = useMemo(() => {
    let list = [...logs];

    if (filterBranch !== 'all') {
      list = list.filter(l => (l.branch || '') === filterBranch);
    }

    if (filterAction !== 'all') {
      list = list.filter(l => {
        const a = String(l.action || l.type || '').toLowerCase();
        return a.includes(filterAction.toLowerCase());
      });
    }

    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(l =>
        String(l.productName || l.product || l.item || '').toLowerCase().includes(q) ||
        String(l.branch || '').toLowerCase().includes(q) ||
        String(l.action || l.type || '').toLowerCase().includes(q) ||
        String(l.user || l.performedBy || l.createdBy || '').toLowerCase().includes(q) ||
        String(l.id || '').toLowerCase().includes(q)
      );
    }

    list.sort((a, b) => {
      const da = new Date(a.createdAt || a.date || 0);
      const db = new Date(b.createdAt || b.date || 0);
      return sortDir === 'desc' ? db - da : da - db;
    });

    return list;
  }, [logs, search, filterAction, filterBranch, sortDir]);

  /* Pagination */
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const goPage = (p) => setPage(Math.max(1, Math.min(totalPages, p)));

  /* Reset page on filter change */
  useEffect(() => { setPage(1); }, [search, filterAction, filterBranch]);

  /* Summary counts */
  const summary = useMemo(() => ({
    total: logs.length,
    restocks: logs.filter(l => String(l.action || l.type || '').toLowerCase().includes('restock') || String(l.action || l.type || '').toLowerCase().includes('stock_in')).length,
    sales: logs.filter(l => String(l.action || l.type || '').toLowerCase().includes('sale') || String(l.action || l.type || '').toLowerCase().includes('stock_out')).length,
    transfers: logs.filter(l => String(l.action || l.type || '').toLowerCase().includes('transfer')).length,
  }), [logs]);

  /* Page window for pagination */
  const pageWindow = useMemo(() => {
    const w = [];
    const delta = 2;
    for (let i = Math.max(1, page - delta); i <= Math.min(totalPages, page + delta); i++) w.push(i);
    return w;
  }, [page, totalPages]);

  return (
    <SuperAdminLayout title="Inventory Logs" subtitle="Full audit trail of all stock movements across branches">

      {/* Summary tiles */}
      {!loading && !error && logs.length > 0 && (
        <div className="super-logs-summary">
          <div className="super-logs-summary-item">
            <span className="super-logs-summary-label">Total Entries</span>
            <span className="super-logs-summary-value">{summary.total.toLocaleString()}</span>
          </div>
          <div className="super-logs-summary-item">
            <span className="super-logs-summary-label">Restocks</span>
            <span className="super-logs-summary-value" style={{ color: 'var(--status-complete-text)' }}>{summary.restocks}</span>
          </div>
          <div className="super-logs-summary-item">
            <span className="super-logs-summary-label">Sales</span>
            <span className="super-logs-summary-value" style={{ color: 'var(--status-progress-text)' }}>{summary.sales}</span>
          </div>
          <div className="super-logs-summary-item">
            <span className="super-logs-summary-label">Transfers</span>
            <span className="super-logs-summary-value" style={{ color: 'var(--super-primary-dark)' }}>{summary.transfers}</span>
          </div>
        </div>
      )}

      <div className="super-card">
        {/* Toolbar */}
        <div className="super-logs-toolbar">
          <div className="super-logs-search">
            <span className="super-logs-search-icon">🔍</span>
            <input
              type="search"
              placeholder="Search product, branch, user…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          {actionTypes.length > 0 && (
            <select
              className="super-logs-select"
              value={filterAction}
              onChange={e => setFilterAction(e.target.value)}
            >
              <option value="all">All actions</option>
              {actionTypes.map(a => (
                <option key={a} value={a}>{actionLabel(a)}</option>
              ))}
            </select>
          )}

          {branches.length > 0 && (
            <select
              className="super-logs-select"
              value={filterBranch}
              onChange={e => setFilterBranch(e.target.value)}
            >
              <option value="all">All branches</option>
              {branches.map(b => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setSortDir(d => d === 'desc' ? 'asc' : 'desc')}
            style={{
              padding: '9px 14px',
              borderRadius: 'var(--r-md)',
              border: '1.5px solid var(--super-border)',
              background: 'var(--super-bg)',
              color: 'var(--super-text-secondary)',
              fontSize: 12.5,
              fontWeight: 600,
              fontFamily: 'inherit',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              whiteSpace: 'nowrap',
              transition: 'border-color var(--t-fast), background var(--t-fast)',
            }}
          >
            {sortDir === 'desc' ? '↓ Newest' : '↑ Oldest'}
          </button>
        </div>

        {/* Section header */}
        <div className="super-section-header" style={{ marginTop: 4 }}>
          <h3>Log Entries</h3>
          {!loading && (
            <span className="super-badge super-badge--progress">
              {filtered.length.toLocaleString()} {filtered.length === 1 ? 'entry' : 'entries'}
            </span>
          )}
        </div>

        {/* Loading state */}
        {loading && (
          <div style={{ display: 'grid', gap: 10 }}>
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="super-shimmer" style={{ height: 48 }} />
            ))}
          </div>
        )}

        {/* Error state */}
        {!loading && error && (
          <div className="super-empty">
            <p style={{ color: 'var(--status-cancel-text)' }}>{error}</p>
            <button
              type="button"
              onClick={load}
              style={{
                marginTop: 4,
                padding: '8px 18px',
                borderRadius: 'var(--r-md)',
                border: '1.5px solid var(--super-border-accent)',
                background: 'var(--super-primary-softer)',
                color: 'var(--super-primary-dark)',
                fontSize: 13,
                fontWeight: 700,
                fontFamily: 'inherit',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && filtered.length === 0 && (
          <div className="super-empty">
            <p>{search || filterAction !== 'all' || filterBranch !== 'all'
              ? 'No entries match your current filters.'
              : 'No inventory log entries found.'
            }</p>
          </div>
        )}

        {/* Table */}
        {!loading && !error && paginated.length > 0 && (
          <div className="super-logs-table-wrap">
            <table className="super-logs-table">
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>Product</th>
                  <th>Branch</th>
                  <th>Action</th>
                  <th>Qty Change</th>
                  <th>Stock After</th>
                  <th>Performed By</th>
                  <th>Notes</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((log, idx) => {
                  const qty = log.quantityChanged ?? log.quantity ?? log.qty ?? log.change ?? null;
                  const stockAfter = log.stockAfter ?? log.newStock ?? log.currentStock ?? null;
                  const action = log.action || log.type || log.event || '';
                  const performer = log.user || log.performedBy || log.createdBy || log.admin || '—';
                  const product = log.productName || log.product || log.item || log.name || '—';
                  const branch = log.branch || log.location || '—';
                  const notes = log.notes || log.reason || log.description || '—';

                  return (
                    <tr key={log.id || idx}>
                      <td style={{ fontSize: 12, color: 'var(--super-muted)', whiteSpace: 'nowrap' }}>
                        {formatDate(log.createdAt || log.date || log.timestamp)}
                      </td>
                      <td style={{ fontWeight: 600, color: 'var(--super-text)' }}>{product}</td>
                      <td style={{ color: 'var(--super-muted)' }}>{branch}</td>
                      <td><span className={actionClass(action)}>{actionLabel(action)}</span></td>
                      <td>
                        {qty !== null
                          ? <span className={qtyClass(Number(qty))}>{formatQty(qty)}</span>
                          : <span className="super-logs-qty super-logs-qty--neutral">—</span>
                        }
                      </td>
                      <td style={{ fontFamily: 'var(--font-mono, monospace)', fontSize: 13 }}>
                        {stockAfter !== null ? Number(stockAfter).toLocaleString() : '—'}
                      </td>
                      <td style={{ color: 'var(--super-muted)', fontSize: 12.5 }}>{performer}</td>
                      <td style={{ color: 'var(--super-muted)', fontSize: 12, maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {notes !== '—'
                          ? <span title={notes}>{notes}</span>
                          : <span style={{ color: 'var(--super-muted-light)' }}>—</span>
                        }
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && !error && totalPages > 1 && (
          <div className="super-logs-pagination">
            <span className="super-logs-pagination-info">
              Showing {((page - 1) * PAGE_SIZE) + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length.toLocaleString()} entries
            </span>
            <div className="super-logs-pagination-controls">
              <button
                className="super-logs-page-btn"
                onClick={() => goPage(1)}
                disabled={page === 1}
                title="First page"
              >«</button>
              <button
                className="super-logs-page-btn"
                onClick={() => goPage(page - 1)}
                disabled={page === 1}
                title="Previous page"
              >‹</button>
              {pageWindow[0] > 1 && (
                <span style={{ padding: '0 4px', color: 'var(--super-muted-light)', fontSize: 13 }}>…</span>
              )}
              {pageWindow.map(p => (
                <button
                  key={p}
                  className={`super-logs-page-btn${p === page ? ' active' : ''}`}
                  onClick={() => goPage(p)}
                >
                  {p}
                </button>
              ))}
              {pageWindow[pageWindow.length - 1] < totalPages && (
                <span style={{ padding: '0 4px', color: 'var(--super-muted-light)', fontSize: 13 }}>…</span>
              )}
              <button
                className="super-logs-page-btn"
                onClick={() => goPage(page + 1)}
                disabled={page === totalPages}
                title="Next page"
              >›</button>
              <button
                className="super-logs-page-btn"
                onClick={() => goPage(totalPages)}
                disabled={page === totalPages}
                title="Last page"
              >»</button>
            </div>
          </div>
        )}
      </div>

    </SuperAdminLayout>
  );
};

export default SuperAdminInventoryLogs;
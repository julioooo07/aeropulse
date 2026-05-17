import React, { useState, useEffect, useCallback } from 'react';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import { apiRequest } from '../../../config/api';
import { BRANCHES } from '../../../domain/branches/branches';
import '../superAdminShared.css';

const PROCESS_STAGE_LABELS = {
  to_pay: 'Pending',
  to_deliver: 'To be completed',
  to_install: 'To be completed',
  complete: 'Completed',
  cancelled: 'Cancelled',
};

const getProcessStage = (workflowStatus = '') => PROCESS_STAGE_LABELS[workflowStatus] || 'Unknown';

const formatAmount = (amount) => {
  if (amount === undefined || amount === null) return '0';
  return Number(amount || 0).toLocaleString();
};

const stageBadgeClass = (stage) => {
  if (stage === 'Pending') return 'super-badge super-badge--pending';
  if (stage === 'To be completed') return 'super-badge super-badge--progress';
  if (stage === 'Completed') return 'super-badge super-badge--complete';
  if (stage === 'Cancelled') return 'super-badge super-badge--cancel';
  return 'super-badge';
};

const SuperAdminSales = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('All');

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest('/orders');
      setOrders(Array.isArray(result.orders) ? result.orders : []);
    } catch (err) {
      setError(err.message || 'Unable to load branch sales.');
      setOrders([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const branchSummary = orders.reduce((summary, order) => {
    const branch = String(order.stockSourceBranch || order.customerBranch || 'Unknown').trim();
    const stage = getProcessStage(order.workflowStatus);
    if (!summary[branch]) {
      summary[branch] = {
        branch,
        pending: 0,
        toBeCompleted: 0,
        completed: 0,
        cancelled: 0,
        total: 0,
        orders: [],
      };
    }
    summary[branch].total += 1;
    summary[branch].orders.push(order);
    if (stage === 'Pending') summary[branch].pending += 1;
    else if (stage === 'To be completed') summary[branch].toBeCompleted += 1;
    else if (stage === 'Completed') summary[branch].completed += 1;
    else if (stage === 'Cancelled') summary[branch].cancelled += 1;
    return summary;
  }, {});

  const branchList = Object.values(branchSummary).sort((a, b) => b.total - a.total);
  const fullBranchList = BRANCHES.map((branchName) => branchList.find((branch) => branch.branch === branchName) || {
    branch: branchName,
    pending: 0,
    toBeCompleted: 0,
    completed: 0,
    cancelled: 0,
    total: 0,
    orders: [],
  });

  const visibleBranchList = selectedBranch === 'All'
    ? fullBranchList
    : fullBranchList.filter((branch) => branch.branch === selectedBranch);

  const totalPending = orders.filter((order) => getProcessStage(order.workflowStatus) === 'Pending').length;
  const totalToBeCompleted = orders.filter((order) => getProcessStage(order.workflowStatus) === 'To be completed').length;
  const totalCompleted = orders.filter((order) => getProcessStage(order.workflowStatus) === 'Completed').length;
  const totalCancelled = orders.filter((order) => getProcessStage(order.workflowStatus) === 'Cancelled').length;

  return (
    <SuperAdminLayout
      title="Processing Sales"
      subtitle="Branch sales overview with pending, to-be-completed, and completed order stages."
    >
      <div className="super-grid">
        <div className="super-card">
          <h3>Pending</h3>
          <strong>{totalPending}</strong>
        </div>
        <div className="super-card">
          <h3>To be completed</h3>
          <strong>{totalToBeCompleted}</strong>
        </div>
        <div className="super-card">
          <h3>Completed</h3>
          <strong>{totalCompleted}</strong>
        </div>
        <div className="super-card">
          <h3>Cancelled</h3>
          <strong>{totalCancelled}</strong>
        </div>
        <div className="super-card">
          <h3>Branches</h3>
          <strong>{BRANCHES.length}</strong>
        </div>
      </div>

      {/* Filter pills */}
      <div className="super-filter-strip">
        <button
          type="button"
          className={`super-filter-pill${selectedBranch === 'All' ? ' active' : ''}`}
          onClick={() => setSelectedBranch('All')}
        >
          All branches
        </button>
        {fullBranchList.map((branchData) => (
          <button
            key={branchData.branch}
            type="button"
            className={`super-filter-pill${selectedBranch === branchData.branch ? ' active' : ''}`}
            onClick={() => setSelectedBranch(branchData.branch)}
          >
            {branchData.branch} ({branchData.total})
          </button>
        ))}
      </div>

      {error ? <p style={{ color: 'var(--status-cancel-text)', marginBottom: 8, fontSize: 13 }}>{error}</p> : null}
      {loading ? <p style={{ color: 'var(--super-muted)', fontSize: 13 }}>Loading branch sales…</p> : null}

      {!loading && orders.length === 0 ? (
        <div className="super-empty">
          <p>No branch sales were found. Verify that supervisor access is active and orders exist in the backend.</p>
        </div>
      ) : null}

      <div className="super-list">
        {visibleBranchList.map((branchData) => (
          <section key={branchData.branch} className="super-branch-section">
            <div className="super-branch-header">
              <div>
                <h3 className="super-branch-name">{branchData.branch}</h3>
                <p className="super-branch-count">Total orders: {branchData.total}</p>
              </div>
              <div className="super-branch-stats">
                <span className="super-badge super-badge--pending">Pending {branchData.pending}</span>
                <span className="super-badge super-badge--progress">In progress {branchData.toBeCompleted}</span>
                <span className="super-badge super-badge--complete">Completed {branchData.completed}</span>
                {branchData.cancelled > 0 && (
                  <span className="super-badge super-badge--cancel">Cancelled {branchData.cancelled}</span>
                )}
              </div>
            </div>

            {branchData.pending === 0 ? (
              <p style={{ margin: 0, color: 'var(--super-muted)', fontSize: 12.5 }}>
                No pending sales for this branch.
              </p>
            ) : null}

            <div style={{ display: 'grid', gap: 10 }}>
              {branchData.orders.length === 0 ? (
                <div className="super-empty">
                  <p>No branch sales were found for {branchData.branch}.</p>
                </div>
              ) : (
                branchData.orders.map((order) => {
                  const stage = getProcessStage(order.workflowStatus);
                  return (
                    <div key={order.id} className="super-order-card">
                      <div className="super-order-header">
                        <div>
                          <div className="super-order-id">{order.orderCode || order.id}</div>
                          <div className="super-order-customer">Customer: {order.customerName || 'N/A'}</div>
                        </div>
                        <span className={stageBadgeClass(stage)}>{stage}</span>
                      </div>
                      <div className="super-order-meta">
                        <span>₱{formatAmount(order.totalAmount || order.total || 0)}</span>
                        <span>·</span>
                        <span>{order.paymentMethod || 'N/A'}</span>
                        <span>·</span>
                        <span>{order.workflowLabel || order.workflowStatus || 'N/A'}</span>
                      </div>
                      <div className="super-order-meta" style={{ borderTop: '1px solid var(--super-border-soft)', paddingTop: 8 }}>
                        <span>Customer branch: {order.customerBranch || 'N/A'}</span>
                        <span>·</span>
                        <span>Stock branch: {order.stockSourceBranch || 'N/A'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </section>
        ))}
      </div>
    </SuperAdminLayout>
  );
};

export default SuperAdminSales;
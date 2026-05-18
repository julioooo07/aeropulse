import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../config/api';
import { BRANCHES } from '../../../domain/branches/branches';
import SuperAdminLayout from '../Common/SuperAdminLayout';
import SalesAnalyticsChart from '../../ADMIN/Dashboard/SalesAnalyticsChart';
import TopProductsChart from '../../ADMIN/Dashboard/TopProductsChart';
import TechnicianKPIs from '../../ADMIN/Dashboard/TechnicianKPIs';
import CustomerAcquisitionChart from '../../ADMIN/Dashboard/CustomerAcquisitionChart';
import '../superAdminShared.css';

const SuperAdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState('');
  const [stats, setStats] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [selectedSalesPeriod, setSelectedSalesPeriod] = useState('monthly');
  const [report, setReport] = useState({ topProducts: [], monthlySeries: [] });

  useEffect(() => {
    apiRequest('/products')
      .then((data) => setProducts(data.products || []))
      .catch((err) => setError(err.message || 'Unable to load inventory'));
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        const result = await apiRequest('/dashboard/superadmin');
        setStats(result.stats || null);
        setAnalytics(result.analytics || null);
      } catch (e) {
        console.error('Failed to load superadmin dashboard stats:', e);
      }
    };
    load();
  }, []);

  useEffect(() => {
    let mounted = true;
    const loadReport = async () => {
      try {
        const now = new Date();
        const fromTop = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const top = await apiRequest(
          `/reports/sales/superadmin?interval=weekly&from=${encodeURIComponent(fromTop.toISOString())}&to=${encodeURIComponent(now.toISOString())}&topN=5`
        );

        const fromMonthly = new Date(Date.now() - 180 * 24 * 60 * 60 * 1000);
        const monthly = await apiRequest(
          `/reports/sales/superadmin?interval=monthly&from=${encodeURIComponent(fromMonthly.toISOString())}&to=${encodeURIComponent(now.toISOString())}&topN=5`
        );

        if (!mounted) return;
        setReport({
          topProducts: Array.isArray(top.topProducts) ? top.topProducts : [],
          monthlySeries: Array.isArray(monthly.series) ? monthly.series : [],
        });
      } catch (_e) {
        if (!mounted) return;
        setReport({ topProducts: [], monthlySeries: [] });
      }
    };

    loadReport();
    const pollId = window.setInterval(loadReport, 15000);
    const onVisible = () => {
      if (document.visibilityState === 'visible') loadReport();
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      mounted = false;
      window.clearInterval(pollId);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, []);

  const alerts = [];
  products.forEach((product) => {
    const branchStock = product.branchStock || {};
    BRANCHES.forEach((branch) => {
      const stock = Number(branchStock[branch] || 0);
      const threshold = Number(product.threshold || 0);
      if (threshold > 0 && stock < threshold) {
        alerts.push({
          id: `${product.id}-${branch}`,
          item: product.name,
          branch,
          stock,
          threshold,
          level: stock <= Math.floor(threshold * 0.5) ? 'Critical' : 'Low',
        });
      }
    });
  });

  return (
    <SuperAdminLayout title="Super Admin Dashboard" subtitle="Centralized analytics across all branches">

      {/* Stats Cards */}
      {stats && (
        <div className="super-stats-grid">
          <div className="super-stat-card">
            <h4>Total Sales</h4>
            <p className="super-stat-value">₱{stats.totalSales?.toLocaleString() || 0}</p>
            <p className="super-stat-label">Across all branches</p>
          </div>
          <div className="super-stat-card">
            <h4>Total Orders</h4>
            <p className="super-stat-value">{stats.totalOrders || 0}</p>
            <p className="super-stat-label">All branches combined</p>
          </div>
          <div className="super-stat-card">
            <h4>Active Technicians</h4>
            <p className="super-stat-value">{stats.activeTechnicians || 0}</p>
            <p className="super-stat-label">Across all branches</p>
          </div>
          <div className="super-stat-card">
            <h4>Low Stock Alerts</h4>
            <p className="super-stat-value">{alerts.length}</p>
            <p className="super-stat-label">Items below threshold</p>
          </div>
        </div>
      )}

      {/* Analytics Charts */}
      <div className="super-grid-2">
        <div className="super-card">
          <SalesAnalyticsChart
            data={report.monthlySeries}
            period={selectedSalesPeriod}
            onPeriodChange={setSelectedSalesPeriod}
            title="Sales Analytics — All Branches"
          />
        </div>
        <div className="super-card">
          <TopProductsChart
            data={report.topProducts}
            title="Top Products — All Branches"
          />
        </div>
      </div>

      <div className="super-grid-2">
        <div className="super-card">
          <TechnicianKPIs
            data={analytics?.technicianKPIs || []}
            title="Technician Performance — All Branches"
          />
        </div>
        <div className="super-card">
          <CustomerAcquisitionChart
            data={analytics?.customerAcquisition || []}
            title="Customer Acquisition — All Branches"
          />
        </div>
      </div>

      {/* Inventory Risk Board */}
      <div className="super-card">
        <div className="super-section-header">
          <h3>Inventory Risk Board</h3>
          {alerts.length > 0 && (
            <span className="super-badge super-badge--high">{alerts.length} Alerts</span>
          )}
        </div>

        {error && <p style={{ color: 'var(--status-cancel-text)', fontSize: 13 }}>{error}</p>}

        <div className="super-list">
          {alerts.length === 0 && !error && (
            <div className="super-empty">
              <p>No low stock alerts right now. All branches are stocked.</p>
            </div>
          )}
          {alerts.map((alert) => (
            <div key={alert.id} className="super-list-item">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                <strong>{alert.item}</strong>
                <span className={alert.level === 'Critical' ? 'super-badge super-badge--high' : 'super-badge super-badge--medium'}>
                  {alert.level}
                </span>
              </div>
              <p>Branch: {alert.branch}</p>
              <p>Stock: {alert.stock} / Threshold: {alert.threshold}</p>
            </div>
          ))}
        </div>
      </div>

    </SuperAdminLayout>
  );
};

export default SuperAdminDashboard;
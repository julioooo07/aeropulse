import React, { useState, useEffect } from 'react';
import { apiRequest } from '../../../config/api';
import { useUser } from '../../../context/UserContext';
import './IncomingRestockModal.css';

const IncomingRestockModal = ({ isOpen, onClose, onRefresh }) => {
  const [restocks, setRestocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);
  const [receivedQtys, setReceivedQtys] = useState({});
  const [deliveryDetails, setDeliveryDetails] = useState({});
  const [actionInProgress, setActionInProgress] = useState('');
  const { profile } = useUser() || {};

  const currentUserName = profile?.name || '';

  useEffect(() => {
    if (isOpen) {
      loadRestocks();
    }
  }, [isOpen]);

  const loadRestocks = async () => {
    setLoading(true);
    setError('');
    try {
      const result = await apiRequest('/restock-orders/my-deliveries');
      setRestocks(result.restockOrders || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDateRange = (start, end) => {
    const s = new Date(start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const e = new Date(end).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${s} - ${e}`;
  };

  const handleMarkReceived = async (restockId) => {
    const restock = restocks.find((r) => r.id === restockId);
    if (!restock) return;

    const details = deliveryDetails[restockId] || {};
    const missingFields = [];
    if (!details.trackingNumber?.trim()) missingFields.push('Tracking order number');
    if (!details.deliveryCompany?.trim()) missingFields.push('Delivery company');
    if (!details.deliveredBy?.trim()) missingFields.push('Delivered by');
    if (!details.deliveryDate) missingFields.push('Delivery date');

    if (missingFields.length > 0) {
      setError(`Please complete: ${missingFields.join(', ')}`);
      return;
    }

    const receivedProducts = restock.products.map((p) => {
      const rawValue = receivedQtys[`${restockId}-${p.product?.id || p.product}`];
      const quantity = rawValue !== undefined && rawValue !== '' ? Number(rawValue) : p.quantity;
      return {
        productId: p.product?.id || p.product,
        quantity,
      };
    });

    if (receivedProducts.some((item) => !Number.isFinite(item.quantity) || item.quantity <= 0)) {
      setError('All received quantities must be positive numbers');
      return;
    }

    setError('');
    setActionInProgress(restockId);
    try {
      await apiRequest(`/restock-orders/${restockId}/receive`, {
        method: 'PATCH',
        body: JSON.stringify({
          receivedProducts,
          trackingNumber: details.trackingNumber,
          deliveryCompany: details.deliveryCompany,
          deliveredBy: details.deliveredBy,
          deliveryDate: details.deliveryDate,
          notes: details.notes || '',
        }),
      });

      alert('Restock marked as received successfully');
      loadRestocks();
      setExpandedId(null);
      setReceivedQtys({});
      setDeliveryDetails((prev) => ({ ...prev, [restockId]: {} }));
      onRefresh?.();
    } catch (err) {
      setError(err.message || 'Unable to mark as received');
    } finally {
      setActionInProgress('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content incoming-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Incoming Restock Deliveries</h2>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>

        <div className="modal-body">
          {error && <p className="error-message">{error}</p>}

          {loading ? (
            <p className="loading-state">Loading deliveries...</p>
          ) : restocks.length === 0 ? (
            <p className="empty-state">No incoming deliveries</p>
          ) : (
            <div className="restocks-list">
              {restocks.map((restock) => (
                <div key={restock.id} className="restock-item">
                  <div
                    className="restock-header"
                    onClick={() =>
                      setExpandedId(expandedId === restock.id ? null : restock.id)
                    }
                  >
                    <div className="restock-summary">
                      <h4>{restock.supplier?.name || 'Unknown Supplier'}</h4>
                      <p className="date-range">
                        Expected: {formatDateRange(restock.expectedDeliveryStart, restock.expectedDeliveryEnd)}
                      </p>
                      <p className="product-count">{restock.products?.length || 0} products</p>
                    </div>
                    <div className="restock-status">
                      <span className={`status-badge status-${restock.status}`}>
                        {restock.status?.replace(/_/g, ' ').toUpperCase()}
                      </span>
                      <span className="expand-icon">{expandedId === restock.id ? '▼' : '▶'}</span>
                    </div>
                  </div>

                  {expandedId === restock.id && (
                    <div className="restock-details">
                      {restock.supplier?.contact && (
                        <p><strong>Contact:</strong> {restock.supplier.contact}</p>
                      )}
                      {restock.supplier?.phone && (
                        <p><strong>Phone:</strong> {restock.supplier.phone}</p>
                      )}
                      {restock.supplier?.email && (
                        <p><strong>Email:</strong> {restock.supplier.email}</p>
                      )}

                      <h5>Products</h5>
                      <div className="products-table">
                        <div className="table-header">
                          <div className="col-name">Product</div>
                          <div className="col-qty">Ordered</div>
                          <div className="col-qty">Received</div>
                        </div>
                        {restock.products?.map((product, index) => (
                          <div key={index} className="table-row">
                            <div className="col-name">
                              <p className="product-name">{product.product?.name || 'Unknown'}</p>
                              <p className="sku">SKU: {product.product?.sku}</p>
                            </div>
                            <div className="col-qty">{product.quantity}</div>
                            <div className="col-qty">
                              <input
                                type="number"
                                min="0"
                                max={product.quantity}
                                value={
                                  receivedQtys[
                                    `${restock.id}-${product.product?.id || product.product}`
                                  ] ?? product.quantity
                                }
                                onChange={(e) =>
                                  setReceivedQtys({
                                    ...receivedQtys,
                                    [`${restock.id}-${product.product?.id || product.product}`]:
                                      e.target.value,
                                  })
                                }
                                className="qty-input"
                                disabled={actionInProgress === restock.id}
                              />
                            </div>
                          </div>
                        ))}
                      </div>

                      {restock.status === 'incoming' && (
                        <>
                          <div className="delivery-validation-form">
                            <h5>Receive Delivery Details</h5>
                            <div className="form-group">
                              <label htmlFor={`tracking-${restock.id}`}>Tracking Order Number *</label>
                              <input
                                id={`tracking-${restock.id}`}
                                type="text"
                                value={deliveryDetails[restock.id]?.trackingNumber || ''}
                                onChange={(e) =>
                                  setDeliveryDetails({
                                    ...deliveryDetails,
                                    [restock.id]: {
                                      ...(deliveryDetails[restock.id] || {}),
                                      trackingNumber: e.target.value,
                                    },
                                  })
                                }
                                className="form-input"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor={`company-${restock.id}`}>Delivery Company *</label>
                              <input
                                id={`company-${restock.id}`}
                                type="text"
                                value={deliveryDetails[restock.id]?.deliveryCompany || ''}
                                onChange={(e) =>
                                  setDeliveryDetails({
                                    ...deliveryDetails,
                                    [restock.id]: {
                                      ...(deliveryDetails[restock.id] || {}),
                                      deliveryCompany: e.target.value,
                                    },
                                  })
                                }
                                className="form-input"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor={`deliveredBy-${restock.id}`}>Delivered By *</label>
                              <input
                                id={`deliveredBy-${restock.id}`}
                                type="text"
                                value={deliveryDetails[restock.id]?.deliveredBy || ''}
                                onChange={(e) =>
                                  setDeliveryDetails({
                                    ...deliveryDetails,
                                    [restock.id]: {
                                      ...(deliveryDetails[restock.id] || {}),
                                      deliveredBy: e.target.value,
                                    },
                                  })
                                }
                                className="form-input"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor={`deliveryDate-${restock.id}`}>Delivery Date *</label>
                              <input
                                id={`deliveryDate-${restock.id}`}
                                type="date"
                                value={deliveryDetails[restock.id]?.deliveryDate || ''}
                                onChange={(e) =>
                                  setDeliveryDetails({
                                    ...deliveryDetails,
                                    [restock.id]: {
                                      ...(deliveryDetails[restock.id] || {}),
                                      deliveryDate: e.target.value,
                                    },
                                  })
                                }
                                className="form-input"
                              />
                            </div>
                            <div className="form-group">
                              <label>Received By</label>
                              <input
                                type="text"
                                value={currentUserName}
                                disabled
                                className="form-input"
                              />
                            </div>
                            <div className="form-group">
                              <label htmlFor={`notes-${restock.id}`}>Notes / Remarks</label>
                              <textarea
                                id={`notes-${restock.id}`}
                                value={deliveryDetails[restock.id]?.notes || ''}
                                onChange={(e) =>
                                  setDeliveryDetails({
                                    ...deliveryDetails,
                                    [restock.id]: {
                                      ...(deliveryDetails[restock.id] || {}),
                                      notes: e.target.value,
                                    },
                                  })
                                }
                                rows="3"
                                className="form-textarea"
                              />
                            </div>
                          </div>
                          <div className="restock-actions">
                            <button
                              className="btn-receive"
                              onClick={() => handleMarkReceived(restock.id)}
                              disabled={actionInProgress === restock.id}
                            >
                              {actionInProgress === restock.id
                                ? 'Processing...'
                                : 'Mark as Received'}
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IncomingRestockModal;

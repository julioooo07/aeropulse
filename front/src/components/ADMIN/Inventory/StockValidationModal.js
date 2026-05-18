import React, { useEffect, useState } from 'react';
import { apiRequest } from '../../../config/api';
import { useUser } from '../../../context/UserContext';
import './StockValidationModal.css';

const getToday = () => new Date().toISOString().slice(0, 10);

const StockValidationModal = ({ isOpen, product, currentStock, branch, onClose, onSuccess }) => {
  const { user } = useUser();
  const [quantity, setQuantity] = useState('');
  const [addedByName, setAddedByName] = useState('');
  const [deliveredByName, setDeliveredByName] = useState('');
  const [deliveryCompany, setDeliveryCompany] = useState('');
  const [deliveryDate, setDeliveryDate] = useState(getToday());
  const [referenceNumber, setReferenceNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isOpen || !product) return;
    setQuantity('');
    setAddedByName(user?.name || user?.email || '');
    setDeliveredByName('');
    setDeliveryCompany('');
    setDeliveryDate(getToday());
    setReferenceNumber('');
    setNotes('');
    setError('');
  }, [isOpen, product, user]);

  if (!isOpen || !product) return null;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    const qty = Number(quantity);
    if (!Number.isFinite(qty) || qty <= 0) {
      setError('Quantity must be a valid positive number');
      return;
    }

    if (!addedByName.trim() || !deliveredByName.trim()) {
      setError('Added by and delivered by are required');
      return;
    }

    if (!branch) {
      setError('Select a branch before validating stock additions');
      return;
    }

    setLoading(true);
    try {
      await apiRequest(`/products/${product._id || product.id}/stock`, {
        method: 'PATCH',
        body: JSON.stringify({
          action: 'add',
          branch,
          quantity: qty,
          addedByName: addedByName.trim(),
          deliveredByName: deliveredByName.trim(),
          deliveryCompany: deliveryCompany.trim(),
          deliveryDate: deliveryDate || null,
          referenceNumber: referenceNumber.trim(),
          notes: notes.trim(),
        }),
      });

      onSuccess?.();
      onClose?.();
    } catch (err) {
      setError(err.message || 'Failed to validate stock addition');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="stock-validation-overlay" onClick={onClose}>
      <div className="stock-validation-modal" onClick={(event) => event.stopPropagation()}>
        <div className="stock-validation-header">
          <div>
            <h2>Stock Validation</h2>
            <p>Review the incoming stock details before the addition is processed.</p>
          </div>
          <button type="button" className="stock-validation-close" onClick={onClose}>×</button>
        </div>

        <div className="stock-validation-summary">
          <div>
            <span>Product</span>
            <strong>{product.name}</strong>
            <small>SKU: {product.sku}</small>
          </div>
          <div>
            <span>Current Stock</span>
            <strong>{currentStock} units</strong>
            <small>Branch: {branch || 'Select a branch'}</small>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="stock-validation-form">
          <div className="stock-validation-grid">
            <label>
              <span>Quantity to Add *</span>
              <input type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} placeholder="Enter quantity" />
            </label>
            <label>
              <span>Added By *</span>
              <input type="text" value={addedByName} onChange={(event) => setAddedByName(event.target.value)} placeholder="Name of person adding stock" />
            </label>
            <label>
              <span>Delivered By *</span>
              <input type="text" value={deliveredByName} onChange={(event) => setDeliveredByName(event.target.value)} placeholder="Delivery contact or courier" />
            </label>
            <label>
              <span>Delivery Company</span>
              <input type="text" value={deliveryCompany} onChange={(event) => setDeliveryCompany(event.target.value)} placeholder="Optional delivery company" />
            </label>
            <label>
              <span>Delivery Date</span>
              <input type="date" value={deliveryDate} onChange={(event) => setDeliveryDate(event.target.value)} />
            </label>
            <label>
              <span>Reference Number</span>
              <input type="text" value={referenceNumber} onChange={(event) => setReferenceNumber(event.target.value)} placeholder="Invoice, DR, or receipt number" />
            </label>
          </div>

          <label className="stock-validation-notes">
            <span>Validation Notes</span>
            <textarea value={notes} onChange={(event) => setNotes(event.target.value)} rows="4" placeholder="Condition, missing items, branch details, or other validation notes" />
          </label>

          {error && <div className="stock-validation-error">{error}</div>}

          <div className="stock-validation-actions">
            <button type="button" className="stock-validation-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="stock-validation-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Validate & Add Stock'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockValidationModal;
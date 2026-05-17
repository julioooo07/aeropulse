import { useEffect, useMemo, useState } from 'react';
import icons from '../common/icons';

function productPlaceholderIcon(product) {
  if (product?.category === 'window') return icons.windowFrame;
  if (product?.category === 'floor') return icons.houseChimney;
  return icons.temperatureFrigid;
}

function ModalProductImage({ product }) {
  const [broken, setBroken] = useState(false);
  const placeholder = productPlaceholderIcon(product);

  if (product.imageUrl && !broken) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        className="modal-product-img"
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <span className="modal-product-fallback">
      <img src={placeholder} alt="" className="inline-icon inline-icon--xl" />
    </span>
  );
}

function ProductModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  const stockValue = product?.stock;
  const availableStock = useMemo(() => {
    if (typeof stockValue !== 'number' || !Number.isFinite(stockValue)) return 0;
    return Math.max(0, Math.floor(stockValue));
  }, [stockValue]);

  const isOutOfStock = availableStock <= 0;
  const maxQuantity = availableStock > 0 ? availableStock : null;
  const stockState = product?.stockState || (isOutOfStock ? 'out' : availableStock <= 5 ? 'low' : 'normal');
  const stockLabel = product?.stockLabel || (stockState === 'out' ? 'Out of Stock' : stockState === 'low' ? 'Low Stock' : 'Normal');

  useEffect(() => {
    setQuantity(1);
  }, [product?.id, product?.model, product?.sku]);

  useEffect(() => {
    if (!maxQuantity) return;
    setQuantity((prev) => Math.min(prev, maxQuantity));
  }, [maxQuantity]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    onAddToCart(product, quantity);
    onClose();
  };

  if (!product) return null;

  return (
    <div className="product-modal-overlay" onClick={onClose} role="presentation">
      <div className="product-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <button type="button" className="close-modal-btn" onClick={onClose}>×</button>
        <div className="modal-content">
          <div className="modal-image">
            <ModalProductImage product={product} />
          </div>
          <div className="modal-details">
            <h2>{product.name}</h2>
            <div className="modal-brand">{product.brand}</div>
            <div className="modal-price">
              {'\u20b1'}{product.price.toLocaleString()}
              {product.oldPrice && (
                <span className="product-old-price"> {'\u20b1'}{product.oldPrice.toLocaleString()}</span>
              )}
            </div>
            <p className="modal-description">{product.description}</p>
            <ul className="modal-specs">
              <li><span className="spec-label">Model:</span><span>{product.model}</span></li>
              <li><span className="spec-label">Capacity:</span><span>{product.specs || product.capacity}</span></li>
              <li><span className="spec-label">Energy Rating:</span><span>{product.energyRating}</span></li>
              <li><span className="spec-label">Warranty:</span><span>{product.warranty}</span></li>
            </ul>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '10px' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '4px 10px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 800,
                  letterSpacing: '0.02em',
                  background: stockState === 'out' ? '#fef2f2' : stockState === 'low' ? '#fff7ed' : '#ecfdf5',
                  color: stockState === 'out' ? '#b91c1c' : stockState === 'low' ? '#b45309' : '#166534',
                }}
              >
                {stockLabel}
              </span>
              <span style={{ fontSize: '13px', fontWeight: 700, color: stockState === 'low' ? '#b45309' : '#374151' }}>
                Available Stocks: {availableStock}
              </span>
            </div>
            <div className="quantity-selector">
              <button type="button" onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity((prev) => (maxQuantity ? Math.min(maxQuantity, prev + 1) : prev + 1))}
                disabled={Boolean(maxQuantity) && quantity >= maxQuantity}
                aria-label="Increase quantity"
              >
                +
              </button>
            </div>
            <button type="button" className="add-to-cart-modal" onClick={handleAddToCart} disabled={isOutOfStock}>
              {isOutOfStock
                ? 'Out of Stock'
                : `Add to Cart - \u20b1${(product.price * quantity).toLocaleString()}`}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;

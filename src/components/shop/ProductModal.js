import { useState } from 'react';

function ProductModal({ product, onClose, onAddToCart }) {
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = () => {
    onAddToCart(product, quantity);
    onClose();
  };

  return (
    <div className="product-modal-overlay" onClick={onClose}>
      <div className="product-modal" onClick={(e) => e.stopPropagation()}>
        <button className="close-modal-btn" onClick={onClose}>×</button>
        <div className="modal-content">
          <div className="modal-image">
            {product.icon}
          </div>
          <div className="modal-details">
            <h2>{product.name}</h2>
            <div className="modal-brand">{product.brand}</div>
            <div className="modal-price">
              ₱{product.price.toLocaleString()}
              {product.oldPrice && (
                <span className="product-old-price"> ₱{product.oldPrice.toLocaleString()}</span>
              )}
            </div>
            <p className="modal-description">{product.description}</p>
            <ul className="modal-specs">
              <li><span className="spec-label">Model:</span><span>{product.model}</span></li>
              <li><span className="spec-label">Capacity:</span><span>{product.capacity}</span></li>
              <li><span className="spec-label">Energy Rating:</span><span>{product.energyRating}</span></li>
              <li><span className="spec-label">Warranty:</span><span>{product.warranty}</span></li>
            </ul>
            <div className="quantity-selector">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
              <span>{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)}>+</button>
            </div>
            <button className="add-to-cart-modal" onClick={handleAddToCart}>
              Add to Cart - ₱{(product.price * quantity).toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductModal;
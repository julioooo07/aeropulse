function ProductCard({ product, onAddToCart, onClick }) {
  const availableStock = typeof product.stock === 'number' && Number.isFinite(product.stock)
    ? Math.max(0, Math.floor(product.stock))
    : 0;
  const isInStock = availableStock > 0;

  return (
    <div className="product-card" onClick={() => onClick(product)}>
      <div className="product-image">
        {product.icon}
        {product.discount && (
          <div className="product-badge">{product.discount}% OFF</div>
        )}
      </div>
      <div className="product-info">
        <div className="product-brand">{product.brand}</div>
        <div className="product-name">{product.name}</div>
        <div className="product-specs">{product.specs}</div>
        <div className="product-warranty">{isInStock ? `${availableStock} units available` : 'Out of Stock'}</div>
        <div className="product-price">
          ₱{product.price.toLocaleString()}
          {product.oldPrice && (
            <span className="product-old-price">₱{product.oldPrice.toLocaleString()}</span>
          )}
        </div>
        <button 
          className="add-to-cart-btn"
          onClick={(e) => {
            e.stopPropagation();
            onAddToCart(product);
          }}
          disabled={!isInStock}
        >
          {isInStock ? 'Add to Cart' : 'Out of Stock'}
        </button>
      </div>
    </div>
  );
}

export default ProductCard;
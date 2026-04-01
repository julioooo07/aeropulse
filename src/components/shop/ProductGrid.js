import ProductCard from './ProductCard';

function ProductGrid({ products, onAddToCart, onProductClick }) {
  if (products.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
        No products found
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map(product => (
        <ProductCard
          key={product.id}
          product={product}
          onAddToCart={onAddToCart}
          onClick={onProductClick}
        />
      ))}
    </div>
  );
}

export default ProductGrid;
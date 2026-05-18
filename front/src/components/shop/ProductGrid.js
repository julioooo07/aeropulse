import {
  Browser,
  Lightning,
  Package,
  ShieldCheck,
  ShoppingCart,
  Snowflake,
  Star,
  WarningDiamond,
} from "@phosphor-icons/react";
import { useState } from "react";

function productPlaceholderIcon(product) {
  if (product?.category === "window") return Browser;
  if (product?.category === "floor") return Package;
  return Snowflake;
}

function ProductImage({ product }) {
  const [broken, setBroken] = useState(false);
  const IconComp = productPlaceholderIcon(product);

  if (product.imageUrl && !broken) {
    return (
      <img
        src={product.imageUrl}
        alt={product.name}
        className="product-img"
        onError={() => setBroken(true)}
      />
    );
  }

  return (
    <span className="product-img-fallback">
      <IconComp
        size={64}
        weight="bold"
        className="inline-icon"
        style={{ opacity: 0.15 }}
      />
    </span>
  );
}

function ProductGrid({ products, onAddToCart, onBuyNow, onProductClick }) {
  if (products.length === 0) {
    return (
      <div
        className="no-products"
        style={{ textAlign: "center", padding: "60px 20px", color: "#64748b" }}
      >
        <WarningDiamond
          size={64}
          weight="bold"
          style={{ marginBottom: "16px", opacity: 0.2 }}
        />
        <p style={{ fontWeight: 600 }}>
          No products found. Try adjusting your filters.
        </p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map((product) => (
        <div
          key={product.id}
          className={`product-card ${product.featured ? "featured" : ""}`}
          onClick={() => onProductClick(product)}
          role="presentation"
        >
          <div className="product-image">
            <ProductImage product={product} />
            {product.discount && (
              <div className="product-badge">{product.discount}% OFF</div>
            )}
            {product.featured && (
              <div className="product-featured-badge">
                <Star
                  size={12}
                  weight="fill"
                  className="inline-icon"
                  style={{ marginRight: "4px" }}
                />{" "}
                Featured
              </div>
            )}
          </div>
          <div className="product-info">
            <div className="product-brand">{product.brand}</div>
            <div className="product-name">{product.name}</div>
            <div className="product-specs">{product.specs}</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center', marginBottom: '6px' }}>
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
                Available Stocks: {stock}
              </span>
            </div>
            <div className="product-price">
              {"\u20b1"}
              {product.price.toLocaleString()}
              {product.oldPrice && (
                <span className="product-old-price">
                  {" "}
                  {"\u20b1"}
                  {product.oldPrice.toLocaleString()}
                </span>
              )}
            </div>

            {typeof product.stock === "number" && product.stock > 0 && (
              <div className="product-stock-status">
                {product.stock} units available
              </div>
            )}

            <div className="product-actions">
              <button
                type="button"
                className="add-to-cart-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onAddToCart(product);
                }}
                disabled={!product.inStock}
              >
                {product.inStock ? (
                  <>
                    Add to Cart <ShoppingCart size={18} weight="bold" />
                  </>
                ) : (
                  "Out of Stock"
                )}
              </button>
              {product.inStock && (
                <button
                  type="button"
                  className="buy-now-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onBuyNow(product);
                  }}
                >
                  Buy Now <Lightning size={18} weight="fill" />
                </button>
              )}
            </div>

            <div className="product-warranty">
              <ShieldCheck
                size={14}
                weight="bold"
                style={{ marginRight: "6px", color: "#10b981" }}
              />{" "}
              {product.warranty}
            </div>
          </div>
        </div>
          );
        })()
      ))}
    </div>
  );
}

export default ProductGrid;

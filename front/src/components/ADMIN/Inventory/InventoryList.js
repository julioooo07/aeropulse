import React from 'react';
import './styles.css';

const InventoryList = ({ products, loading, onRefresh, onRequestChange, onAddStock, getProductStock }) => {

  const getStockDisplay = (product) => {
    if (getProductStock) {
      return getProductStock(product);
    }
    return product.stock || 0;
  };



  return (
    <div className="admin-card">
      <h3>Inventory List</h3>
      {loading ? (
        <p>Loading…</p>
      ) : null}
      <table className="admin-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Brand</th>
            <th>Category</th>
            <th>HP / Specs</th>
            <th>SKU</th>
            <th>Stock</th>
            <th>Price</th>
            <th>Stock Validation</th>
            {onRequestChange && <th>Manager Actions</th>}
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr key={product.id}>
              <td>{product.name}</td>
              <td>{product.brand || '-'}</td>
              <td>{product.category || '-'}</td>
              <td>{product.specs || '-'}</td>
              <td>{product.sku}</td>
              <td className="stock-cell">
                <span className="stock-badge">{getStockDisplay(product)}</span>
              </td>
              <td>PHP {product.price}</td>
              <td style={{ minWidth: 160 }}>
                <button type="button" onClick={() => onAddStock?.(product)}>
                  Add Stock
                </button>
              </td>

              {onRequestChange && (
                <td>
                  <button 
                    type="button" 
                    className="btn-request-change"
                    onClick={() => onRequestChange(product)}
                  >
                    Request Change
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
      <button type="button" onClick={onRefresh} style={{ marginTop: 10 }}>
        Refresh
      </button>
    </div>
  );
};

export default InventoryList;

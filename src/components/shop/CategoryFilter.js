function CategoryFilter({ categories, selectedCategory, onSelectCategory }) {
  return (
    <div className="category-filter">
      <h3 className="sidebar-title">Categories</h3>
      <ul className="category-list">
        <li 
          className={`category-item ${selectedCategory === 'all' ? 'active' : ''}`}
          onClick={() => onSelectCategory('all')}
        >
          <span>All Products</span>
          <span className="category-count">
            {categories.reduce((sum, cat) => sum + cat.count, 0)}
          </span>
        </li>
        {categories.map(category => (
          <li 
            key={category.id}
            className={`category-item ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => onSelectCategory(category.id)}
          >
            <span>{category.name}</span>
            <span className="category-count">{category.count}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CategoryFilter;
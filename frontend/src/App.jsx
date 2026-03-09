import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [products, setProducts] = useState([]);

useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/products');
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error("Backend connection error:", error);
      }
    };
    fetchProducts();
  }, []);

  return (
    <div className="App">
      <header>
        <h1>Elite Electronics ⚡</h1>
        <p>Excellence in Every Device</p>
      </header>
      
      <div className="product-list">
        {products.map((product) => (
          <div key={product.id} className="product-card">
            <span className="category-tag">{product.category}</span>
            <h3>{product.name}</h3>
            <p className="price-tag">${product.price.toFixed(2)}</p>
            <p className="stock-info" style={{ color: product.stockQuantity > 0 ? '#38a169' : '#e53e3e' }}>
              {product.stockQuantity > 0 ? `● In Stock (${product.stockQuantity})` : '○ Out of Stock'}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default App
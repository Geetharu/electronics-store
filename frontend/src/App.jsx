import { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  // NEW: Notification state
  const [notification, setNotification] = useState(null);

  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Backend connection error:", error);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Helper to show a temporary toast
  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000); // Disappears after 3 seconds
  };

  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id
            ? { ...item, cartQuantity: item.cartQuantity + 1 }
            : item
        );
      } else {
        return [...prevCart, { ...product, cartQuantity: 1 }];
      }
    });
    showToast(`✅ Added ${product.name} to cart!`);
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cart),
      });

      if (response.ok) {
        showToast("🚀 Order placed successfully!"); // No more alert()!
        setCart([]); 
        setIsCartOpen(false);
        fetchProducts(); 
      } else {
        showToast("❌ Checkout failed.");
      }
    } catch (error) {
      showToast("❌ Server connection lost.");
    }
  };

  // ... (keep your increaseQty, decreaseQty, removeFromCart functions) ...
  const increaseQty = (id) => {
    setCart((prevCart) => prevCart.map(item => 
      item.id === id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
    ));
  };

  const decreaseQty = (id) => {
    setCart((prevCart) => prevCart.map(item => 
      item.id === id ? { ...item, cartQuantity: item.cartQuantity - 1 } : item
    ).filter(item => item.cartQuantity > 0));
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== id));
  };

  const totalCartItems = cart.reduce((total, item) => total + item.cartQuantity, 0);
  const cartTotalPrice = cart.reduce((total, item) => total + (item.price * item.cartQuantity), 0);

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="App">
      {/* NEW: The Toast Notification UI */}
      {notification && <div className="toast-notification">{notification}</div>}

      <header className="app-header">
        <div className="header-brand">
          <h1>Elite Electronics ⚡</h1>
          <p>Excellence in Every Device</p>
        </div>
        <button className="nav-cart-btn" onClick={() => setIsCartOpen(true)}>
          🛒 Cart {totalCartItems > 0 && <span className="cart-badge">{totalCartItems}</span>}
        </button>
      </header>
      
      {/* ... (rest of your return statement stays the same) ... */}
      <div className="search-container">
        <input 
          type="text" 
          placeholder="Search products or categories..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-bar"
        />
      </div>
      
      <div className="product-list">
        {filteredProducts.map((product) => (
          <div key={product.id} className="product-card">
            <span className="category-tag">{product.category}</span>
            <h3>{product.name}</h3>
            <p className="price-tag">${product.price.toFixed(2)}</p>
            <p className="stock-info" style={{ color: product.stockQuantity > 0 ? '#38a169' : '#e53e3e' }}>
              {product.stockQuantity > 0 ? `● In Stock (${product.stockQuantity})` : '○ Out of Stock'}
            </p>
            <button 
              className="add-to-cart-btn"
              onClick={() => addToCart(product)}
              disabled={product.stockQuantity === 0}
            >
              Add to Cart
            </button>
          </div>
        ))}
      </div>

      {isCartOpen && (
        <div className="cart-modal-overlay">
          <div className="cart-modal">
            <div className="cart-modal-header">
              <h2>Your Shopping Cart</h2>
              <button className="close-cart-btn" onClick={() => setIsCartOpen(false)}>✖</button>
            </div>
            
            {cart.length === 0 ? (
              <p>Your cart is currently empty.</p>
            ) : (
              <div className="cart-items-list">
                {cart.map((item) => (
                  <div key={item.id} className="cart-item-row">
                    <div className="cart-item-details">
                      <strong>{item.name}</strong>
                      <div className="cart-item-actions">
                        <button className="qty-btn" onClick={() => decreaseQty(item.id)}>-</button>
                        <span className="qty-display">{item.cartQuantity}</span>
                        <button className="qty-btn" onClick={() => increaseQty(item.id)}>+</button>
                        <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
                      </div>
                    </div>
                    <div className="cart-item-price">
                      ${(item.price * item.cartQuantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            <div className="cart-total">
              <h3>Total: ${cartTotalPrice.toFixed(2)}</h3>
              <button 
                className="checkout-btn" 
                disabled={cart.length === 0}
                onClick={handleCheckout}
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
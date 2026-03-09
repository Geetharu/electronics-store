import { useState, useEffect } from 'react';
import './App.css';
import Login from './Login'; 
import Register from './Register';
import AdminDashboard from './AdminDashboard'; // Import our new component

function App() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [view, setView] = useState('shop'); // NEW: 'shop' or 'admin'

  // --- DATA FETCHING ---
  const fetchProducts = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error("Backend connection error:", error);
    }
  };

  useEffect(() => {
    if (token) {
      fetchProducts();
    }
  }, [token]);

  // --- AUTH HANDLERS ---
  const handleLoginSuccess = (data) => {
    localStorage.setItem('token', data.token);
    localStorage.setItem('username', data.username);
    localStorage.setItem('role', data.role);
    setToken(data.token);
    showToast(`👋 Welcome back, ${data.username}!`);
  };

  const handleLogout = () => {
    localStorage.clear();
    setToken(null);
    setCart([]);
    setView('shop');
    showToast("Logged out successfully.");
  };

  // --- UI HELPERS ---
  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

  // --- CART LOGIC ---
  const addToCart = (product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...product, cartQuantity: 1 }];
      }
    });
    showToast(`✅ Added ${product.name} to cart!`);
  };

  const handleCheckout = async () => {
    try {
      const response = await fetch('http://localhost:8080/api/products/checkout', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(cart),
      });

      if (response.ok) {
        showToast("🚀 Order placed successfully!");
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

  // --- COMPUTED VALUES ---
  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalCartItems = cart.reduce((total, item) => total + item.cartQuantity, 0);
  const isAdmin = localStorage.getItem('role') === 'ROLE_ADMIN';

  // --- RENDERING ---
  if (!token) {
    return isRegistering ? (
        <Register onSwitchToLogin={() => setIsRegistering(false)} />
    ) : (
        <Login 
            onLoginSuccess={handleLoginSuccess} 
            onSwitchToRegister={() => setIsRegistering(true)} 
        />
    );
  }

  return (
    <div className="App">
      {notification && <div className="toast-notification">{notification}</div>}

      <header className="app-header">
        <div className="header-brand" onClick={() => setView('shop')} style={{cursor: 'pointer'}}>
          <h1>Elite Electronics ⚡</h1>
          <p>Excellence in Every Device</p>
        </div>
        <div className="header-actions">
          {/* 🛠️ Dashboard Toggle Button */}
          {isAdmin && (
            <button className="nav-btn" onClick={() => setView(view === 'shop' ? 'admin' : 'shop')}>
              {view === 'shop' ? '⚙️ Dashboard' : '🛒 View Shop'}
            </button>
          )}
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
          {view === 'shop' && (
            <button className="nav-cart-btn" onClick={() => setIsCartOpen(true)}>
              🛒 Cart {totalCartItems > 0 && <span className="cart-badge">{totalCartItems}</span>}
            </button>
          )}
        </div>
      </header>
      
      {view === 'admin' ? (
        <AdminDashboard products={products} onProductAction={fetchProducts} />
      ) : (
        <>
          <div className="search-container">
            <input 
              type="text" 
              placeholder="Search products..." 
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
        </>
      )}

      {/* ... Cart Modal Logic remains the same ... */}
    </div>
  );
}

export default App;
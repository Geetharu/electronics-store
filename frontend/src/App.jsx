import { useState, useEffect } from 'react';
import './App.css';
import Login from './Login'; 
import Register from './Register';
import AdminDashboard from './AdminDashboard'; 

function App() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isRegistering, setIsRegistering] = useState(false);
  const [view, setView] = useState('shop'); // 'shop' or 'admin'

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
  const isAdmin = localStorage.getItem('role') === 'ROLE_ADMIN';
  const totalCartItems = cart.reduce((total, item) => total + item.cartQuantity, 0);

  // 🙈 Filter logic: Admins see everything, customers only see visible items
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    
    // If the user is an Admin, ignore the hidden status
    if (isAdmin) {
      return matchesSearch;
    } 
    // If the user is a customer, only return items that are NOT hidden
    else {
      return matchesSearch && !product.isHidden;
    }
  });

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
          {isAdmin && (
            <button className="nav-btn" onClick={() => setView(view === 'shop' ? 'admin' : 'shop')}>
              {view === 'shop' ? '⚙️ Dashboard' : '🛒 View Shop'}
            </button>
          )}
          
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
          
          {!isAdmin && view === 'shop' && (
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
                
                <h3>
                  {product.name}
                  {/* 👁️ NEW: Show a badge if the item is hidden (Admins only) */}
                  {product.isHidden && (
                    <span style={{ backgroundColor: '#e53e3e', color: 'white', padding: '2px 6px', borderRadius: '4px', fontSize: '12px', marginLeft: '10px', verticalAlign: 'middle' }}>
                      Hidden for customers
                    </span>
                  )}
                </h3>

                <p className="price-tag">${product.price.toFixed(2)}</p>
                <p className="stock-info" style={{ color: product.stockQuantity > 0 ? '#38a169' : '#e53e3e' }}>
                  {product.stockQuantity > 0 ? `● In Stock (${product.stockQuantity})` : '○ Out of Stock'}
                </p>
                
                {!isAdmin && (
                  <button 
                    className="add-to-cart-btn"
                    onClick={() => addToCart(product)}
                    disabled={product.stockQuantity === 0}
                  >
                    Add to Cart
                  </button>
                )}
              </div>
            ))}
            
            {filteredProducts.length === 0 && (
              <p style={{ textAlign: 'center', color: '#718096', marginTop: '2rem', gridColumn: '1 / -1' }}>
                No products found.
              </p>
            )}
          </div>
        </>
      )}

      {/* --- CART MODAL --- */}
      {isCartOpen && !isAdmin && (
        <div className="cart-modal-overlay" onClick={() => setIsCartOpen(false)}>
          <div className="cart-modal" onClick={e => e.stopPropagation()}>
            <div className="cart-header">
              <h2>Your Shopping Cart</h2>
              <button className="close-btn" onClick={() => setIsCartOpen(false)}>✖</button>
            </div>
            
            {cart.length === 0 ? (
              <p className="empty-cart">Your cart is empty.</p>
            ) : (
              <>
                <div className="cart-items">
                  {cart.map((item, index) => (
                    <div key={index} className="cart-item">
                      <div>
                        <h4>{item.name}</h4>
                        <p>${item.price.toFixed(2)} x {item.cartQuantity}</p>
                      </div>
                      <p className="item-total">${(item.price * item.cartQuantity).toFixed(2)}</p>
                    </div>
                  ))}
                </div>
                <div className="cart-footer">
                  <h3>Total: ${cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0).toFixed(2)}</h3>
                  <button className="checkout-btn" onClick={handleCheckout}>Checkout</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
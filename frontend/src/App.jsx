import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Login from './Login'; 
import Register from './Register';
import AdminDashboard from './AdminDashboard'; 

// 🛡️ Security Guard Component
const ProtectedRoute = ({ children }) => {
  const isAdmin = localStorage.getItem('role') === 'ROLE_ADMIN';
  return isAdmin ? children : <Navigate to="/" replace />;
};

function MainApp() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState([]); 
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [isRegistering, setIsRegistering] = useState(false);

  const navigate = useNavigate(); 
  const location = useLocation(); 

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
    if (token) fetchProducts();
  }, [token]);

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
    navigate('/'); 
    showToast("Logged out successfully.");
  };

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

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== productId));
    showToast("🗑️ Item removed from cart.");
  };

  const updateQuantity = (productId, delta) => {
    setCart((prevCart) => prevCart.map(item => {
      if (item.id === productId) {
        const newQuantity = item.cartQuantity + delta;
        if (newQuantity >= 1 && newQuantity <= item.stockQuantity) {
          return { ...item, cartQuantity: newQuantity };
        }
      }
      return item;
    }));
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

  const isAdmin = localStorage.getItem('role') === 'ROLE_ADMIN';
  const totalCartItems = cart.reduce((total, item) => total + item.cartQuantity, 0);

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    return isAdmin ? matchesSearch : (matchesSearch && !product.isHidden);
  });

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
        <div className="header-brand" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <h1>Elite Electronics ⚡</h1>
          <p>Excellence in Every Device</p>
        </div>
        <div className="header-actions">
          
          {isAdmin && location.pathname === '/' && (
            <button className="nav-btn" onClick={() => navigate('/admin')}>
              ⚙️ Dashboard
            </button>
          )}
          {isAdmin && location.pathname === '/admin' && (
            <button className="nav-btn" onClick={() => navigate('/')}>
              🛒 View Shop
            </button>
          )}
          
          <button className="logout-btn" onClick={handleLogout}>Logout</button>
          
          {!isAdmin && (
            <button className="nav-cart-btn" onClick={() => setIsCartOpen(true)}>
              🛒 Cart {totalCartItems > 0 && <span className="cart-badge">{totalCartItems}</span>}
            </button>
          )}
        </div>
      </header>
      
      <Routes>
        <Route path="/" element={
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
                  
                  {/* 🖼️ NEW: Render the product image */}
                  <div style={{ width: '100%', height: '200px', backgroundColor: '#f7fafc', marginBottom: '15px', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                    {product.imageUrl ? (
                      <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <span style={{ color: '#a0aec0' }}>No Image</span>
                    )}
                  </div>

                  <span className="category-tag">{product.category}</span>
                  <h3>
                    {product.name}
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
        } />

        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard products={products} onProductAction={fetchProducts} />
          </ProtectedRoute>
        } />
      </Routes>

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
                    <div key={index} className="cart-item" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #eee', paddingBottom: '10px', marginBottom: '10px' }}>
                      <div>
                        <h4 style={{ margin: '0 0 5px 0' }}>{item.name}</h4>
                        <p style={{ margin: '0 0 10px 0', color: '#718096' }}>${item.price.toFixed(2)} each</p>
                        
                        {/* 🎛️ Quantity Controls */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <button 
                            onClick={() => updateQuantity(item.id, -1)} 
                            disabled={item.cartQuantity <= 1} 
                            style={{ padding: '2px 8px', cursor: item.cartQuantity <= 1 ? 'not-allowed' : 'pointer' }}
                          >
                            -
                          </button>
                          <span style={{ fontWeight: 'bold' }}>{item.cartQuantity}</span>
                          <button 
                            onClick={() => updateQuantity(item.id, 1)} 
                            disabled={item.cartQuantity >= item.stockQuantity} 
                            style={{ padding: '2px 8px', cursor: item.cartQuantity >= item.stockQuantity ? 'not-allowed' : 'pointer' }}
                          >
                            +
                          </button>
                          
                          {/* 🗑️ Remove Button */}
                          <button 
                            onClick={() => removeFromCart(item.id)} 
                            style={{ marginLeft: '10px', color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', textDecoration: 'underline' }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                      <p className="item-total" style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>
                        ${(item.price * item.cartQuantity).toFixed(2)}
                      </p>
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

export default function App() {
  return (
    <BrowserRouter>
      <MainApp />
    </BrowserRouter>
  );
}
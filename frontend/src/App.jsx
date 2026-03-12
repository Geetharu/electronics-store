import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import './App.css';
import Login from './Login'; 
import Register from './Register';
import AdminDashboard from './AdminDashboard'; 
import ProductDetails from './ProductDetails';
import Success from './Success'; 
import Cart from './Cart';
import OrderHistory from './OrderHistory';

const ProtectedRoute = ({ children }) => {
  const isAdmin = sessionStorage.getItem('role') === 'ROLE_ADMIN';
  return isAdmin ? children : <Navigate to="/" replace />;
};

function MainApp() {
  const [products, setProducts] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');
  
  // 🛒 CART MEMORY FIX: Load from localStorage on startup
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  }); 

  // 💾 CART MEMORY FIX: Save to localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [notification, setNotification] = useState(null);
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [isRegistering, setIsRegistering] = useState(false);

  const navigate = useNavigate(); 
  const location = useLocation(); 

  const fetchProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
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
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('username', data.username);
    sessionStorage.setItem('role', data.role);
    setToken(data.token);
    showToast(`👋 Welcome back, ${data.username}!`);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('cart'); // 🧹 Clear cart on logout
    setToken(null);
    setCart([]);
    navigate('/'); 
    showToast("Logged out successfully.");
  };

  const showToast = (message) => {
    setNotification(message);
    setTimeout(() => setNotification(null), 3000);
  };

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
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/payment/create-checkout-session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(cart),
      });

      if (response.ok) {
        const data = await response.json();
        window.location.href = data.url; 
      } else {
        showToast("❌ Checkout failed to initialize.");
      }
    } catch (error) {
      showToast("❌ Server connection lost.");
    }
  };

  const isAdmin = sessionStorage.getItem('role') === 'ROLE_ADMIN';
  const totalCartItems = cart.reduce((total, item) => total + item.cartQuantity, 0);
  const uniqueCategories = ['All', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || product.category === selectedCategory;
    const isVisible = isAdmin ? true : !product.isHidden;
    
    return matchesSearch && matchesCategory && isVisible;
  });

  const sortedAndFilteredProducts = [...filteredProducts].sort((a, b) => {
    if (sortOrder === 'price-asc') return a.price - b.price;
    if (sortOrder === 'price-desc') return b.price - a.price;
    return 0; 
  });

  const getBadge = (stock) => {
    if (stock === 0) return { text: 'Sold Out ❌', bg: '#e53e3e' };
    if (stock === 1) return { text: 'Last One! 🚨', bg: '#dd6b20' };
    if (stock > 1 && stock <= 5) return { text: 'Selling Fast! 🔥', bg: '#d69e2e' };
    return null;
  };

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
          
          {/* 🚀 ADDED THE ORDERS BUTTON HERE FOR NORMAL USERS */}
          {!isAdmin && (
            <button className="nav-btn" onClick={() => navigate('/orders')} style={{ marginRight: '10px' }}>
              📦 My Orders
            </button>
          )}

          {!isAdmin && (
            <button className="nav-cart-btn" onClick={() => setIsCartOpen(true)} style={{ marginRight: '10px' }}>
              🛒 Cart {totalCartItems > 0 && <span className="cart-badge">{totalCartItems}</span>}
            </button>
          )}

          <button className="logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </header>
      
      <Routes>
        <Route path="/" element={
          <div style={{ display: 'flex', gap: '2rem', padding: '2rem', width: '100%', boxSizing: 'border-box' }}>
            
            <aside style={{ width: '220px', flexShrink: 0 }}>
              <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '2px solid #edf2f7', paddingBottom: '0.5rem', fontSize: '1rem' }}>Categories</h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {uniqueCategories.map(category => (
                    <li key={category} style={{ marginBottom: '0.25rem' }}>
                      <button
                        onClick={() => setSelectedCategory(category)}
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '8px 10px',
                          backgroundColor: selectedCategory === category ? '#3182ce' : 'transparent',
                          color: selectedCategory === category ? 'white' : '#4a5568',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          fontWeight: selectedCategory === category ? 'bold' : 'normal',
                          fontSize: '0.9rem',
                          transition: 'background-color 0.2s'
                        }}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <main style={{ flex: 1 }}>
              <div className="search-sort-container" style={{ display: 'flex', gap: '15px', marginBottom: '1.5rem' }}>
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-bar"
                  style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.95rem' }}
                />
                <select 
                  value={sortOrder} 
                  onChange={(e) => setSortOrder(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.95rem', cursor: 'pointer', backgroundColor: 'white' }}
                >
                  <option value="default">Sort by: Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>
              
              <div className="product-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1.5rem' }}>
                {sortedAndFilteredProducts.map((product) => {
                  const badge = getBadge(product.stockQuantity); 

                  return (
                    <div key={product.id} className="product-card" style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', display: 'flex', flexDirection: 'column', transition: 'transform 0.2s' }}>
                      
                      <div 
                        onClick={() => navigate(`/product/${product.id}`)}
                        style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: '#f7fafc', marginBottom: '10px', borderRadius: '6px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center', cursor: 'pointer' }}
                      >
                        {badge && (
                          <span style={{ position: 'absolute', top: '8px', right: '8px', backgroundColor: badge.bg, color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', zIndex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                            {badge.text}
                          </span>
                        )}

                        {product.imageUrl ? (
                          <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>No Image</span>
                        )}
                      </div>

                      <span className="category-tag" style={{ alignSelf: 'flex-start', backgroundColor: '#edf2f7', padding: '3px 8px', borderRadius: '4px', fontSize: '0.75rem', color: '#4a5568', marginBottom: '8px', fontWeight: '500' }}>{product.category}</span>
                      <h3 style={{ margin: '0 0 8px 0', fontSize: '1.05rem', lineHeight: '1.3', color: '#2d3748' }}>
                        {product.name}
                        {product.isHidden && (
                          <span style={{ backgroundColor: '#e53e3e', color: 'white', padding: '2px 4px', borderRadius: '3px', fontSize: '10px', marginLeft: '6px', verticalAlign: 'middle' }}>
                            Hidden
                          </span>
                        )}
                      </h3>
                      <p className="price-tag" style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#2b6cb0', margin: '0 0 8px 0' }}>${product.price.toFixed(2)}</p>
                      <p className="stock-info" style={{ color: product.stockQuantity > 0 ? '#38a169' : '#e53e3e', fontSize: '0.85rem', marginBottom: '15px', flex: 1 }}>
                        {product.stockQuantity > 0 ? `● In Stock (${product.stockQuantity})` : '○ Out of Stock'}
                      </p>
                      
                      {!isAdmin && (
                        <button 
                          className="add-to-cart-btn"
                          onClick={() => addToCart(product)}
                          disabled={product.stockQuantity === 0}
                          style={{ width: '100%', padding: '10px', backgroundColor: product.stockQuantity === 0 ? '#cbd5e0' : '#3182ce', color: 'white', border: 'none', borderRadius: '6px', cursor: product.stockQuantity === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', fontSize: '0.95rem', transition: 'background-color 0.2s' }}
                        >
                          {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart 🛒'}
                        </button>
                      )}
                    </div>
                  );
                })}
                
                {sortedAndFilteredProducts.length === 0 && (
                  <p style={{ textAlign: 'center', color: '#718096', marginTop: '2rem', gridColumn: '1 / -1' }}>
                    No products match your criteria.
                  </p>
                )}
              </div>
            </main>
          </div>
        } />

        <Route path="/product/:id" element={
          <ProductDetails addToCart={addToCart} />
        } />
        
        <Route path="/cart" element={
          <Cart 
            cart={cart} 
            updateQuantity={updateQuantity} 
            removeFromCart={removeFromCart} 
            handleCheckout={handleCheckout} 
          />
        } />

        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard products={products} onProductAction={fetchProducts} />
          </ProtectedRoute>
        } />

        <Route path="/orders" element={<OrderHistory />} />

        <Route path="/success" element={
          <Success clearCart={() => {
            setCart([]);
            localStorage.removeItem('cart');
          }} />
        } />
      </Routes>

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
                  {/* 🚀 Changed to navigate to full cart page for final review instead of checking out immediately from modal */}
                  <button className="checkout-btn" onClick={() => { setIsCartOpen(false); navigate('/cart'); }}>Review Cart</button>
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
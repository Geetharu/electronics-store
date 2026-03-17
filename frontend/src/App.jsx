import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useNavigate, Navigate, useLocation } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast'; 
import { Settings, Store, User, Package, Heart, ShoppingCart, LogOut, Menu, X, Plus, Minus, Trash2, ArrowUp } from 'lucide-react'; 
import './App.css';
import Login from './Login'; 
import Register from './Register';
import AdminDashboard from './AdminDashboard'; 
import ProductDetails from './ProductDetails';
import Success from './Success'; 
import Cart from './Cart';
import OrderHistory from './OrderHistory';
import UserProfile from './UserProfile';
import Wishlist from './Wishlist'; 

const ProtectedRoute = ({ children }) => {
  const isAdmin = sessionStorage.getItem('role') === 'ROLE_ADMIN';
  return isAdmin ? children : <Navigate to="/" replace />;
};

const SkeletonCard = () => (
  <div className="product-card skeleton-card">
    <div className="skeleton-img"></div>
    <div className="skeleton-tag"></div>
    <div className="skeleton-title"></div>
    <div className="skeleton-stars"></div>
    <div className="skeleton-price"></div>
    <div className="skeleton-btn"></div>
  </div>
);

function MainApp() {
  const [allProducts, setAllProducts] = useState([]); 
  const [storeProducts, setStoreProducts] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [wishlistItems, setWishlistItems] = useState([]);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [sortOrder, setSortOrder] = useState('default');
  
  const [cart, setCart] = useState(() => {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  }); 

  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    localStorage.setItem('cart', JSON.stringify(cart));
  }, [cart]);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [token, setToken] = useState(sessionStorage.getItem('token'));
  const [isRegistering, setIsRegistering] = useState(false);

  const navigate = useNavigate(); 
  const location = useLocation(); 
  const isAdmin = sessionStorage.getItem('role') === 'ROLE_ADMIN';

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  useEffect(() => {
    scrollToTop();
  }, [currentPage]);

  const fetchWishlistIds = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlist`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setWishlistItems(data.map(item => item.id)); 
      }
    } catch (error) {
      console.error("Failed to fetch wishlist:", error);
    }
  };

  // 🛡️ FRONTEND FIX: Added Safety Nets so the app never crashes!
  const fetchAllProducts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products`, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      
      // Safety Check: Make sure data is actually an array before saving it
      if (Array.isArray(data)) {
        setAllProducts(data);
      } else {
        setAllProducts([]); 
      }
    } catch (error) {
      console.error("Backend connection error:", error);
      setAllProducts([]);
    }
  };

  const fetchStorefrontProducts = async () => {
    setIsLoading(true); 
    try {
      const url = new URL(`${import.meta.env.VITE_API_URL}/api/products/paged`);
      url.searchParams.append('page', currentPage);
      url.searchParams.append('size', 12); 
      url.searchParams.append('search', searchQuery);
      url.searchParams.append('category', selectedCategory);
      url.searchParams.append('sort', sortOrder);

      const response = await fetch(url.toString(), {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      
      // Safety Check: Fallback to empty arrays if backend throws an error object
      setStoreProducts(data.products || []);
      setTotalPages(data.totalPages || 0);
      setTotalItems(data.totalItems || 0);
    } catch (error) {
      console.error("Failed to fetch paginated products:", error);
      setStoreProducts([]);
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllProducts();
      fetchStorefrontProducts();
      if (!isAdmin) fetchWishlistIds(); 
    }
  }, [token, currentPage, searchQuery, selectedCategory, sortOrder, isAdmin]);

  const handleSearch = (val) => { setSearchQuery(val); setCurrentPage(0); };
  const handleCategory = (val) => { setSelectedCategory(val); setCurrentPage(0); };
  const handleSort = (val) => { setSortOrder(val); setCurrentPage(0); };

  const showToast = (message, type = 'success') => {
    if (type === 'error') {
      toast.error(message, { style: { borderRadius: '8px', background: '#333', color: '#fff' }});
    } else {
      toast.success(message, { style: { borderRadius: '8px', background: '#333', color: '#fff' }});
    }
  };

  const handleLoginSuccess = (data) => {
    sessionStorage.setItem('token', data.token);
    sessionStorage.setItem('username', data.username);
    sessionStorage.setItem('role', data.role);
    setToken(data.token);
    showToast(`Welcome back, ${data.username}!`);
  };

  const handleLogout = () => {
    sessionStorage.clear();
    localStorage.removeItem('cart'); 
    setToken(null);
    setCart([]);
    setWishlistItems([]); 
    setIsMobileMenuOpen(false);
    navigate('/'); 
    showToast("Logged out successfully.");
  };

  const toggleWishlist = async (e, productId) => {
    e.stopPropagation(); 
    if (isAdmin) {
      showToast("Admins cannot use the wishlist.", "error");
      return;
    }

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlist/toggle/${productId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.isFavorited) {
          setWishlistItems(prev => [...prev, productId]);
          showToast("Added to Wishlist!");
        } else {
          setWishlistItems(prev => prev.filter(id => id !== productId));
          showToast("Removed from Wishlist!");
        }
      }
    } catch (error) {
      console.error("Failed to toggle wishlist:", error);
    }
  };

  const addToCart = (e, product) => {
    if (e && e.stopPropagation) e.stopPropagation(); 
    const targetProduct = product || e; 

    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === targetProduct.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === targetProduct.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item
        );
      } else {
        return [...prevCart, { ...targetProduct, cartQuantity: 1 }];
      }
    });
    showToast(`Added ${targetProduct.name} to cart!`);
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => prevCart.filter(item => item.id !== productId));
    showToast("Item removed from cart.");
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
        showToast("Checkout failed to initialize.", "error");
      }
    } catch (error) {
      showToast("Server connection lost.", "error");
    }
  };

  const handleMobileNav = (path) => {
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const totalCartItems = cart.reduce((total, item) => total + item.cartQuantity, 0);
  const uniqueCategories = ['All', ...new Set(allProducts.map(p => p.category))];

  const getBadge = (stock) => {
    if (stock === 0) return { text: 'Sold Out', bg: '#e53e3e' };
    if (stock === 1) return { text: 'Last One!', bg: '#dd6b20' };
    if (stock > 1 && stock <= 5) return { text: 'Selling Fast!', bg: '#d69e2e' };
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
      <Toaster position="bottom-right" reverseOrder={false} />

      <header className="app-header">
        <div className="header-brand" onClick={() => navigate('/')} style={{cursor: 'pointer'}}>
          <h1>Elite Electronics ⚡</h1>
          <p>Excellence in Every Device</p>
        </div>
        
        <div className="header-actions">
          {isAdmin && location.pathname === '/' && (
            <button className="nav-btn" onClick={() => navigate('/admin')}><Settings size={18} /> Dashboard</button>
          )}
          {isAdmin && location.pathname === '/admin' && (
            <button className="nav-btn" onClick={() => navigate('/')}><Store size={18} /> View Shop</button>
          )}
          
          <button className="nav-btn" onClick={() => navigate('/profile')}><User size={18} /> Profile</button>

          {!isAdmin && (
            <>
              <button className="nav-btn" onClick={() => navigate('/orders')}><Package size={18} /> My Orders</button>
              <button className="nav-btn" onClick={() => navigate('/wishlist')} style={{ color: '#e53e3e' }}>
                <Heart size={18} color="#e53e3e" fill={wishlistItems.length > 0 ? "#e53e3e" : "transparent"} /> 
                Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
              </button>
              <button className="nav-cart-btn" onClick={() => setIsCartOpen(true)}>
                <ShoppingCart size={18} /> Cart {totalCartItems > 0 && <span className="cart-badge">{totalCartItems}</span>}
              </button>
            </>
          )}

          <button className="logout-btn" onClick={handleLogout}><LogOut size={18} /> Logout</button>
        </div>

        <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>

        {isMobileMenuOpen && (
          <div className="mobile-dropdown">
            {isAdmin && location.pathname === '/' && (
              <button className="nav-btn" onClick={() => handleMobileNav('/admin')}><Settings size={18} /> Dashboard</button>
            )}
            {isAdmin && location.pathname === '/admin' && (
              <button className="nav-btn" onClick={() => handleMobileNav('/')}><Store size={18} /> View Shop</button>
            )}
            
            <button className="nav-btn" onClick={() => handleMobileNav('/profile')}><User size={18} /> Profile</button>

            {!isAdmin && (
              <>
                <button className="nav-btn" onClick={() => handleMobileNav('/orders')}><Package size={18} /> My Orders</button>
                <button className="nav-btn" onClick={() => handleMobileNav('/wishlist')} style={{ color: '#e53e3e' }}>
                  <Heart size={18} color="#e53e3e" fill={wishlistItems.length > 0 ? "#e53e3e" : "transparent"} /> 
                  Wishlist {wishlistItems.length > 0 && `(${wishlistItems.length})`}
                </button>
                <button className="nav-cart-btn" onClick={() => { setIsCartOpen(true); setIsMobileMenuOpen(false); }}>
                  <ShoppingCart size={18} /> Cart {totalCartItems > 0 && <span className="cart-badge">{totalCartItems}</span>}
                </button>
              </>
            )}

            <button className="logout-btn" onClick={handleLogout}><LogOut size={18} /> Logout</button>
          </div>
        )}
      </header>
      
      <Routes>
        <Route path="/" element={
          <div className="store-layout">
            <aside className="store-sidebar">
              <div style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
                <h3 style={{ marginTop: 0, marginBottom: '1rem', borderBottom: '2px solid #edf2f7', paddingBottom: '0.5rem', fontSize: '1rem' }}>Categories</h3>
                <ul className="category-list">
                  {uniqueCategories.map(category => (
                    <li key={category}>
                      <button
                        onClick={() => handleCategory(category)}
                        style={{
                          width: '100%', textAlign: 'left', padding: '8px 10px',
                          backgroundColor: selectedCategory === category ? '#3182ce' : 'transparent',
                          color: selectedCategory === category ? 'white' : '#4a5568',
                          border: 'none', borderRadius: '4px', cursor: 'pointer',
                          fontWeight: selectedCategory === category ? 'bold' : 'normal',
                          fontSize: '0.9rem', transition: 'background-color 0.2s',
                          whiteSpace: 'nowrap' 
                        }}
                      >
                        {category}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            <main className="store-main">
              <div className="search-sort-container">
                <input 
                  type="text" 
                  placeholder="Search products..." 
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="search-bar"
                />
                <select 
                  value={sortOrder} 
                  onChange={(e) => handleSort(e.target.value)}
                  style={{ padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', fontSize: '0.95rem', cursor: 'pointer', backgroundColor: 'white' }}
                >
                  <option value="default">Sort by: Default</option>
                  <option value="price-asc">Price: Low to High</option>
                  <option value="price-desc">Price: High to Low</option>
                </select>
              </div>

              {!isLoading && (
                <p style={{ color: '#718096', fontSize: '0.9rem', marginBottom: '1rem' }}>
                  Showing {storeProducts.length} of {totalItems} results
                </p>
              )}
              
              <div className="product-list">
                {isLoading ? (
                  Array.from({ length: 12 }).map((_, index) => <SkeletonCard key={index} />)
                ) : (
                  storeProducts.map((product) => {
                    const badge = getBadge(product.stockQuantity); 
                    const avgRating = product.averageRating || 0;
                    const reviewCount = product.reviewCount || 0;
                    
                    const isFavorited = wishlistItems.includes(product.id);

                    return (
                      <div 
                        key={product.id} 
                        className="product-card" 
                        onClick={() => navigate(`/product/${product.id}`)}
                      >
                        {!isAdmin && (
                          <button 
                            className="wishlist-btn"
                            onClick={(e) => toggleWishlist(e, product.id)}
                            style={{ color: isFavorited ? '#e53e3e' : '#a0aec0' }}
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={isFavorited ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: '20px', height: '20px', transition: 'fill 0.2s ease' }}>
                              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                            </svg>
                          </button>
                        )}

                        <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: 'white', marginBottom: '15px', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                          
                          {badge && (
                            <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: badge.bg, color: 'white', padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', zIndex: 1, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                              {badge.text}
                            </span>
                          )}

                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                          ) : (
                            <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>No Image</span>
                          )}
                        </div>

                        <span className="category-tag" style={{ alignSelf: 'flex-start', marginBottom: '8px' }}>{product.category}</span>
                        <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', lineHeight: '1.3', color: '#1a202c' }}>
                          {product.name}
                          {product.isHidden && (
                            <span style={{ backgroundColor: '#e53e3e', color: 'white', padding: '2px 4px', borderRadius: '3px', fontSize: '10px', marginLeft: '6px', verticalAlign: 'middle' }}>
                              Hidden
                            </span>
                          )}
                        </h3>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
                          <span style={{ color: '#ecc94b', fontSize: '1rem' }}>
                            {avgRating > 0 ? '★'.repeat(Math.round(avgRating)) + '☆'.repeat(5 - Math.round(avgRating)) : '☆☆☆☆☆'}
                          </span>
                          <span style={{ fontSize: '0.8rem', color: '#718096' }}>
                            {reviewCount > 0 ? `(${reviewCount})` : '(0)'}
                          </span>
                        </div>

                        <p className="price-tag">${product.price.toFixed(2)}</p>
                        
                        <p className="stock-info" style={{ color: product.stockQuantity > 0 ? '#38a169' : '#e53e3e' }}>
                          {isAdmin ? (
                             product.stockQuantity > 0 ? `● In Stock (${product.stockQuantity})` : '○ Out of Stock'
                          ) : (
                             product.stockQuantity > 5 ? '● In Stock' : 
                             product.stockQuantity > 0 ? `● Only ${product.stockQuantity} left in stock - order soon!` : 
                             '○ Out of Stock'
                          )}
                        </p>
                        
                        {!isAdmin && (
                          <button 
                            className="add-to-cart-btn"
                            onClick={(e) => addToCart(e, product)}
                            disabled={product.stockQuantity === 0}
                          >
                            {product.stockQuantity === 0 ? 'Out of Stock' : <><ShoppingCart size={18} /> Add to Cart</>}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
              
              {!isLoading && storeProducts.length === 0 && (
                <p style={{ textAlign: 'center', color: '#718096', marginTop: '2rem' }}>
                  No products match your criteria.
                </p>
              )}

              {!isLoading && totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '3rem' }}>
                  <button 
                    onClick={() => setCurrentPage(prev => Math.max(0, prev - 1))} 
                    disabled={currentPage === 0}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: currentPage === 0 ? '#edf2f7' : 'white', cursor: currentPage === 0 ? 'not-allowed' : 'pointer', fontWeight: 'bold', color: '#4a5568' }}
                  >
                    ←
                  </button>
                  
                  {Array.from({ length: totalPages }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentPage(index)}
                      style={{
                        padding: '8px 14px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', transition: 'all 0.2s',
                        border: currentPage === index ? 'none' : '1px solid #cbd5e0',
                        backgroundColor: currentPage === index ? '#2b6cb0' : 'white',
                        color: currentPage === index ? 'white' : '#4a5568',
                        boxShadow: currentPage === index ? '0 4px 6px rgba(43, 108, 176, 0.2)' : 'none'
                      }}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages - 1, prev + 1))} 
                    disabled={currentPage >= totalPages - 1}
                    style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: currentPage >= totalPages - 1 ? '#edf2f7' : 'white', cursor: currentPage >= totalPages - 1 ? 'not-allowed' : 'pointer', fontWeight: 'bold', color: '#4a5568' }}
                  >
                    →
                  </button>
                </div>
              )}

            </main>
          </div>
        } />

        <Route path="/product/:id" element={<ProductDetails addToCart={addToCart} />} />
        <Route path="/wishlist" element={<Wishlist addToCart={addToCart} toggleWishlist={toggleWishlist} wishlistItems={wishlistItems} />} />
        <Route path="/cart" element={<Cart cart={cart} updateQuantity={updateQuantity} removeFromCart={removeFromCart} handleCheckout={handleCheckout} />} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard products={allProducts} onProductAction={() => { fetchAllProducts(); fetchStorefrontProducts(); }} /></ProtectedRoute>} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/orders" element={<OrderHistory />} />
        <Route path="/success" element={<Success clearCart={() => { setCart([]); localStorage.removeItem('cart'); }} />} />
      </Routes>

      {/* 🚀 PREMIUM UI: Slide-Out Cart Drawer */}
      {!isAdmin && (
        <>
          <div className={`cart-modal-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>

          <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
            <div className="cart-drawer-header">
              <h2>Your Shopping Cart</h2>
              <button onClick={() => setIsCartOpen(false)} style={{background: 'none', border: 'none', cursor: 'pointer', color: '#a0aec0', transition: 'color 0.2s'}} onMouseEnter={e => e.currentTarget.style.color = '#e53e3e'} onMouseLeave={e => e.currentTarget.style.color = '#a0aec0'}>
                <X size={28} />
              </button>
            </div>
            
            <div className="cart-drawer-content">
              {cart.length === 0 ? (
                <div style={{ textAlign: 'center', marginTop: '60px', color: '#a0aec0' }}>
                  <ShoppingCart size={64} style={{ opacity: 0.3, marginBottom: '20px' }} />
                  <p style={{ fontSize: '1.2rem', color: '#718096' }}>Your cart is empty.</p>
                  <button onClick={() => setIsCartOpen(false)} style={{ marginTop: '20px', padding: '10px 20px', borderRadius: '6px', border: '1px solid #cbd5e0', background: 'white', fontWeight: 'bold', color: '#4a5568', cursor: 'pointer' }}>
                    Continue Shopping
                  </button>
                </div>
              ) : (
                <div className="cart-items">
                  {cart.map((item, index) => (
                    <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #edf2f7', paddingBottom: '20px', marginBottom: '20px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 5px 0', color: '#2d3748', fontSize: '1.1rem' }}>{item.name}</h4>
                        <p style={{ margin: '0 0 15px 0', color: '#718096', fontSize: '0.95rem' }}>${item.price.toFixed(2)} each</p>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e0', borderRadius: '6px', overflow: 'hidden' }}>
                            <button onClick={() => updateQuantity(item.id, -1)} disabled={item.cartQuantity <= 1} style={{ padding: '6px 10px', background: '#f7fafc', border: 'none', borderRight: '1px solid #cbd5e0', cursor: item.cartQuantity <= 1 ? 'not-allowed' : 'pointer', color: '#4a5568' }}>
                              <Minus size={14} />
                            </button>
                            <span style={{ fontWeight: 'bold', width: '30px', textAlign: 'center', color: '#2d3748' }}>{item.cartQuantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} disabled={item.cartQuantity >= item.stockQuantity} style={{ padding: '6px 10px', background: '#f7fafc', border: 'none', borderLeft: '1px solid #cbd5e0', cursor: item.cartQuantity >= item.stockQuantity ? 'not-allowed' : 'pointer', color: '#4a5568' }}>
                              <Plus size={14} />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id)} style={{ color: '#e53e3e', background: 'none', border: 'none', cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '4px', padding: '6px' }}>
                            <Trash2 size={16} /> Remove
                          </button>
                        </div>
                      </div>
                      <div style={{ textAlign: 'right', marginLeft: '15px' }}>
                        <p style={{ fontWeight: 'bold', fontSize: '1.2rem', color: '#2b6cb0', margin: 0 }}>
                          ${(item.price * item.cartQuantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-drawer-footer">
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontSize: '1.3rem' }}>
                  <span style={{ color: '#4a5568', fontWeight: '600' }}>Subtotal:</span>
                  <span style={{ fontWeight: '900', color: '#1a202c' }}>${cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0).toFixed(2)}</span>
                </div>
                <button 
                  onClick={() => { setIsCartOpen(false); navigate('/cart'); }} 
                  style={{ width: '100%', padding: '16px', background: '#2b6cb0', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1.1rem', cursor: 'pointer', transition: 'background 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 6px rgba(43, 108, 176, 0.2)' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#2c5282'}
                  onMouseLeave={e => e.currentTarget.style.background = '#2b6cb0'}
                >
                  Review & Checkout →
                </button>
              </div>
            )}
          </div>
        </>
      )}
      
      {showScrollTop && (
        <button 
          onClick={scrollToTop}
          style={{
            position: 'fixed', bottom: '30px', left: '30px', zIndex: 1000,
            backgroundColor: '#2d3748', color: 'white', border: 'none', borderRadius: '50%',
            width: '50px', height: '50px', display: 'flex', justifyContent: 'center', alignItems: 'center',
            cursor: 'pointer', boxShadow: '0 10px 15px rgba(0,0,0,0.2)', transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
          <ArrowUp size={24} />
        </button>
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
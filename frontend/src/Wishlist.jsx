import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Wishlist({ addToCart, toggleWishlist, wishlistItems }) {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/wishlist`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setFavorites(data);
        }
      } catch (error) {
        console.error("Failed to load wishlist:", error);
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchWishlist();
  }, [token, wishlistItems]); 

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.2rem' }}>Loading your favorites... ⏳</div>;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '2px solid #edf2f7', paddingBottom: '1rem' }}>
        <h1 style={{ margin: 0, color: '#2d3748' }}>❤️ My Wishlist</h1>
        <button onClick={() => navigate('/')} style={{ padding: '8px 16px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: 'white', cursor: 'pointer', fontWeight: 'bold', color: '#4a5568' }}>
          Continue Shopping
        </button>
      </div>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
          <p style={{ fontSize: '3rem', margin: '0 0 1rem 0' }}>💔</p>
          <h2 style={{ color: '#4a5568', margin: '0 0 10px 0' }}>Your wishlist is empty</h2>
          <p style={{ color: '#718096' }}>Explore the store and click the heart icon to save your favorite items!</p>
        </div>
      ) : (
        <div className="product-list">
          {favorites.map((product) => (
            <div 
              key={product.id} 
              className="product-card" 
              onClick={() => navigate(`/product/${product.id}`)}
            >
              
              <button 
                className="wishlist-btn"
                onClick={(e) => toggleWishlist(e, product.id)}
                style={{ color: '#4a5568' }}
                title="Remove from wishlist"
              >
                ✖
              </button>

              <div style={{ position: 'relative', width: '100%', height: '180px', backgroundColor: 'white', marginBottom: '15px', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                ) : (
                  <span style={{ color: '#a0aec0', fontSize: '0.8rem' }}>No Image</span>
                )}
              </div>

              <span className="category-tag" style={{ alignSelf: 'flex-start', marginBottom: '8px' }}>{product.category}</span>
              <h3 style={{ margin: '0 0 4px 0', fontSize: '1.1rem', lineHeight: '1.3', color: '#1a202c' }}>
                {product.name}
              </h3>
              
              <p className="price-tag">${product.price.toFixed(2)}</p>
              
              <p className="stock-info" style={{ color: product.stockQuantity > 0 ? '#38a169' : '#e53e3e' }}>
                {product.stockQuantity > 0 ? '● In Stock' : '○ Out of Stock'}
              </p>
              
              <button 
                className="add-to-cart-btn"
                onClick={(e) => addToCart(e, product)}
                disabled={product.stockQuantity === 0}
              >
                {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart 🛒'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
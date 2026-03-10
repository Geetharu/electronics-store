import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function ProductDetails({ addToCart }) {
  const { id } = useParams(); // 🪝 Grabs the ID from the URL
  const [product, setProduct] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const token = localStorage.getItem('token');
        // 🛠️ FIXED: Now uses the environment variable for deployment
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProduct(data);
        }
      } catch (error) {
        console.error("Failed to fetch product", error);
      }
    };
    fetchProduct();
  }, [id]);

  if (!product) return <div style={{textAlign: 'center', marginTop: '50px', fontSize: '1.2rem'}}>Loading product... ⏳</div>;

  return (
    <div style={{ maxWidth: '900px', margin: '2rem auto', padding: '2rem', display: 'flex', gap: '3rem', backgroundColor: 'white', borderRadius: '12px', boxShadow: '0 4px 10px rgba(0,0,0,0.05)' }}>
      {/* 🖼️ Left Side: Big Image */}
      <div style={{ flex: '1' }}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: 'auto', borderRadius: '8px', objectFit: 'contain', backgroundColor: '#f7fafc', padding: '1rem' }} />
        ) : (
          <div style={{ width: '100%', height: '350px', backgroundColor: '#f7fafc', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '8px', color: '#a0aec0' }}>No Image</div>
        )}
      </div>

      {/* 📝 Right Side: Details & Cart */}
      <div style={{ flex: '1', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <span style={{ textTransform: 'uppercase', color: '#718096', fontWeight: 'bold', fontSize: '0.85rem', letterSpacing: '1px' }}>{product.category}</span>
        <h1 style={{ margin: '10px 0 5px 0', fontSize: '2.5rem' }}>{product.name}</h1>
        <p style={{ color: '#a0aec0', marginBottom: '20px' }}>SKU: {product.sku}</p>
        
        <p style={{ fontSize: '2rem', fontWeight: 'bold', color: '#2b6cb0', margin: '0 0 20px 0' }}>${product.price.toFixed(2)}</p>
        
        <p style={{ color: product.stockQuantity > 0 ? '#38a169' : '#e53e3e', fontWeight: 'bold', marginBottom: '30px', padding: '10px', backgroundColor: product.stockQuantity > 0 ? '#f0fff4' : '#fff5f5', borderRadius: '4px', display: 'inline-block' }}>
          {product.stockQuantity > 0 ? `● In Stock (${product.stockQuantity} available)` : '○ Out of Stock'}
        </p>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button 
            onClick={() => addToCart(product)} 
            disabled={product.stockQuantity === 0}
            style={{ padding: '15px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '6px', cursor: product.stockQuantity === 0 ? 'not-allowed' : 'pointer', fontSize: '1.1rem', fontWeight: 'bold', flex: '2' }}
          >
            Add to Cart 🛒
          </button>
          <button 
            onClick={() => navigate('/')}
            style={{ padding: '15px', backgroundColor: '#edf2f7', color: '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '1rem', fontWeight: 'bold', flex: '1' }}
          >
            Back
          </button>
        </div>
      </div>
    </div>
  );
}
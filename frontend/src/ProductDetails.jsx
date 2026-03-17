import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const StarRating = ({ rating, setRating, interactive = false }) => {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <span 
          key={star} 
          onClick={() => interactive && setRating(star)}
          style={{ 
            cursor: interactive ? 'pointer' : 'default', 
            color: star <= rating ? '#ecc94b' : '#e2e8f0', 
            fontSize: '1.5rem',
            transition: 'color 0.2s'
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
};

export default function ProductDetails({ addToCart }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [zoomStyle, setZoomStyle] = useState({ transformOrigin: 'center center', transform: 'scale(1)' });

  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = sessionStorage.getItem('token');
  const isAdmin = sessionStorage.getItem('role') === 'ROLE_ADMIN';

  useEffect(() => {
    const fetchProductAndReviews = async () => {
      try {
        const headers = {};
        if (token) headers['Authorization'] = `Bearer ${token}`;

        const prodRes = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, { headers });
        if (prodRes.ok) {
          const productData = await prodRes.json();
          setProduct(productData);
          setCurrentImageIndex(0); 
        }

        const revRes = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/product/${id}`, { headers });
        if (revRes.ok) setReviews(await revRes.json());

        if (token && !isAdmin) { 
          const authRes = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/product/${id}/can-review`, { headers });
          if (authRes.ok) setCanReview(await authRes.json());
        }

      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductAndReviews();
  }, [id, token, isAdmin]);

  const submitReview = async (e) => {
    e.preventDefault();
    if (newReview.comment.trim() === '') return alert("Please write a comment.");
    
    setIsSubmitting(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/product/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(newReview)
      });

      if (response.ok) {
        const revRes = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/product/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (revRes.ok) setReviews(await revRes.json());
        
        setCanReview(false); 
        alert("🎉 Thank you for your review!");
      } else {
        const errText = await response.text();
        alert(errText);
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.2rem' }}>Loading product details... ⏳</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '4rem', color: '#e53e3e', fontSize: '1.2rem', fontWeight: 'bold' }}>Product not found.</div>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  const allImages = product.imageUrl ? [product.imageUrl, ...(product.imageGallery || [])] : [];

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleMouseMove = (e) => {
    // 🚀 NEW: Disable zoom logic on mobile phones!
    if (window.innerWidth <= 768) return; 

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: 'scale(2.2)' });
  };

  const handleMouseLeave = () => {
    setZoomStyle({ transformOrigin: 'center center', transform: 'scale(1)' });
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '1rem' }}>
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}
      >
        ← Back to Shop
      </button>

      {/* 🚀 UPGRADED: Using CSS class instead of inline styles */}
      <div className="product-details-container">
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          {/* 🚀 UPGRADED: Using CSS class instead of inline styles */}
          <div 
            className="product-image-viewer"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            {allImages.length > 0 ? (
              <img 
                src={allImages[currentImageIndex]} 
                alt={product.name} 
                style={{ 
                  width: '100%', height: '100%', objectFit: 'contain', 
                  transition: 'transform 0.1s ease-out', 
                  ...zoomStyle 
                }} 
              />
            ) : (
              <span style={{ color: '#a0aec0', fontSize: '1.2rem' }}>No Image Available</span>
            )}

            {allImages.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }} 
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid #cbd5e0', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10 }}
              >
                ◀
              </button>
            )}

            {allImages.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleNextImage(); }} 
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.8)', border: '1px solid #cbd5e0', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', fontSize: '1.2rem', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', zIndex: 10 }}
              >
                ▶
              </button>
            )}
          </div>

          {allImages.length > 1 && (
            <div style={{ display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '10px' }}>
              {allImages.map((imgUrl, index) => (
                <div 
                  key={index} 
                  onMouseEnter={() => setCurrentImageIndex(index)}
                  style={{ 
                    width: '70px', height: '70px', flexShrink: 0, cursor: 'pointer', 
                    border: currentImageIndex === index ? '2px solid #3182ce' : '1px solid #e2e8f0', 
                    borderRadius: '6px', overflow: 'hidden', padding: '5px', backgroundColor: 'white',
                    opacity: currentImageIndex === index ? 1 : 0.6,
                    transition: 'all 0.2s'
                  }}
                >
                  <img src={imgUrl} alt={`Thumbnail ${index + 1}`} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ backgroundColor: '#edf2f7', color: '#4a5568', padding: '4px 10px', borderRadius: '4px', fontSize: '0.85rem', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '1rem' }}>
            {product.category}
          </span>
          
          {/* 🚀 Made Title Responsive */}
          <h1 style={{ margin: '0 0 10px 0', color: '#2d3748', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>{product.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <StarRating rating={Math.round(averageRating)} />
            <span style={{ color: '#718096', fontSize: '0.95rem', fontWeight: 'bold' }}>
              {reviews.length > 0 ? `${averageRating} out of 5 (${reviews.length} reviews)` : 'No reviews yet'}
            </span>
          </div>

          <p style={{ fontSize: '2.5rem', fontWeight: 'bold', color: '#2b6cb0', margin: '0 0 1rem 0' }}>${product.price.toFixed(2)}</p>
          <p style={{ color: '#718096', marginBottom: '2rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
            SKU: {product.sku}
          </p>

          <p style={{ color: product.stockQuantity > 0 ? '#38a169' : '#e53e3e', fontWeight: 'bold', marginBottom: '1.5rem', backgroundColor: product.stockQuantity > 0 ? '#f0fff4' : '#fff5f5', padding: '10px', borderRadius: '6px', display: 'inline-block', alignSelf: 'flex-start' }}>
            {isAdmin ? (
               product.stockQuantity > 0 ? `● In Stock (${product.stockQuantity} available)` : '○ Out of Stock'
            ) : (
               product.stockQuantity > 5 ? '● In Stock' : 
               product.stockQuantity > 0 ? `● Only ${product.stockQuantity} left in stock - order soon!` : 
               '○ Out of Stock'
            )}
          </p>

          {!isAdmin && (
            <button 
              onClick={() => addToCart(product)}
              disabled={product.stockQuantity === 0}
              style={{ width: '100%', padding: '15px', backgroundColor: product.stockQuantity === 0 ? '#cbd5e0' : '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: product.stockQuantity === 0 ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 6px rgba(49, 130, 206, 0.2)' }}
            >
              {product.stockQuantity === 0 ? 'Out of Stock' : 'Add to Cart 🛒'}
            </button>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '12px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <h2 style={{ margin: '0 0 1.5rem 0', color: '#2d3748', borderBottom: '2px solid #edf2f7', paddingBottom: '1rem' }}>
          Customer Reviews
        </h2>

        {canReview && (
          <div style={{ backgroundColor: '#f0fff4', padding: '1.5rem', borderRadius: '8px', border: '1px solid #c6f6d5', marginBottom: '2rem' }}>
            <h3 style={{ margin: '0 0 10px 0', color: '#22543d', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✅ Verified Purchase: Write a Review
            </h3>
            <form onSubmit={submitReview}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#2f855a' }}>Tap to Rate:</label>
                <StarRating rating={newReview.rating} setRating={(val) => setNewReview({...newReview, rating: val})} interactive={true} />
              </div>
              <textarea 
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                placeholder="What did you think about this product?"
                required
                style={{ width: '100%', padding: '12px', borderRadius: '6px', border: '1px solid #9ae6b4', boxSizing: 'border-box', minHeight: '100px', marginBottom: '1rem', fontFamily: 'inherit', resize: 'vertical' }}
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ backgroundColor: '#38a169', color: 'white', padding: '10px 20px', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s' }}
              >
                {isSubmitting ? 'Posting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {reviews.length === 0 ? (
          <div style={{ backgroundColor: '#f7fafc', padding: '2rem', textAlign: 'center', borderRadius: '8px', border: '1px dashed #cbd5e0' }}>
            <p style={{ color: '#718096', margin: 0, fontSize: '1.1rem' }}>No reviews yet.</p>
            <p style={{ color: '#a0aec0', margin: '5px 0 0 0', fontSize: '0.9rem' }}>Be the first to review after purchasing!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {reviews.map((review) => (
              <div key={review.id} style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '1.5rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px', flexWrap: 'wrap' }}>
                  <StarRating rating={review.rating} />
                  <span style={{ fontWeight: 'bold', color: '#2d3748' }}>{review.username}</span>
                  <span style={{ backgroundColor: '#ebf8ff', color: '#2b6cb0', padding: '3px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #bee3f8' }}>
                    ✓ Verified Buyer
                  </span>
                  <span style={{ color: '#a0aec0', fontSize: '0.85rem', marginLeft: 'auto' }}>
                    {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#4a5568', lineHeight: '1.6', fontSize: '1.05rem' }}>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
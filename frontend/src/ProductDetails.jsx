import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast'; 
import { ShoppingCart, CreditCard, ChevronLeft, ChevronRight, Home, MapPin, Headphones, Settings, LogOut, Package, ShieldCheck, Truck, RotateCcw, PackageOpen } from 'lucide-react'; 

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
  
  // 🚀 FIXED: State now ONLY tracks mouse coordinates, not the image URL!
  const [zoomPos, setZoomPos] = useState({ x: 50, y: 50 });

  const [reviews, setReviews] = useState([]);
  const [canReview, setCanReview] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState([]);
  
  const carouselRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const token = sessionStorage.getItem('token');
  const isAdmin = sessionStorage.getItem('role') === 'ROLE_ADMIN';

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
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

        const relRes = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}/related`, { headers });
        if (relRes.ok) {
          const data = await relRes.json();
          const filteredData = data.filter(item => item.id !== parseInt(id));
          setRelatedProducts(filteredData);
        }

        if (token && !isAdmin) { 
          const authRes = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/product/${id}/can-review`, { headers });
          if (authRes.ok) setCanReview(await authRes.json());
        }

      } catch (error) {
        console.error("Failed to load data:", error);
      } finally {
        window.scrollTo(0, 0); 
        setLoading(false);
      }
    };

    fetchProductData();
  }, [id, token, isAdmin]); 

  const submitReview = async (e) => {
    e.preventDefault();
    if (newReview.comment.trim() === '') {
      toast.error("Please write a comment.", { style: { borderRadius: '8px', background: '#333', color: '#fff' }});
      return;
    }
    
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
        setNewReview({ rating: 5, comment: '' });
        
        toast.success("Thank you for your review!", { style: { borderRadius: '8px', background: '#333', color: '#fff' }});
      } else {
        const errText = await response.text();
        toast.error(errText, { style: { borderRadius: '8px', background: '#333', color: '#fff' }});
      }
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const allImages = product?.imageUrl ? [product.imageUrl, ...(product.imageGallery || [])] : [];

  const handlePrevImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  }, [allImages.length]);

  const handleNextImage = useCallback(() => {
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  }, [allImages.length]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.target.classList.contains('related-carousel')) return;
      if (allImages.length <= 1) return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrevImage();
      }
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        handleNextImage();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handlePrevImage, handleNextImage, allImages.length]);

  // 🚀 FIXED: Mouse movement purely tracks X and Y now
  const handleMouseMove = (e) => {
    if (window.innerWidth <= 768) return; 

    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    
    setZoomPos({ x, y });
  };

  const updateScrollButtons = useCallback(() => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  }, []);

  useEffect(() => {
    const timeout = setTimeout(updateScrollButtons, 100);
    window.addEventListener('resize', updateScrollButtons);
    return () => {
      clearTimeout(timeout);
      window.removeEventListener('resize', updateScrollButtons);
    }
  }, [relatedProducts, updateScrollButtons]);

  const scrollCarousel = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleCarouselKeyDown = (e) => {
    if (e.key === 'ArrowLeft') {
      e.preventDefault(); 
      scrollCarousel('left');
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      scrollCarousel('right');
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '4rem', fontSize: '1.2rem', color: '#a0aec0' }}>Loading product details... ⏳</div>;
  if (!product) return <div style={{ textAlign: 'center', padding: '4rem', color: '#e53e3e', fontSize: '1.2rem', fontWeight: 'bold' }}>Product not found.</div>;

  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, rev) => sum + rev.rating, 0) / reviews.length).toFixed(1) 
    : 0;

  return (
    <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '1rem' }}>
      
      <nav className="premium-breadcrumbs">
        <Link to="/" className="crumb-link"><Home size={16} /> Home</Link>
        <ChevronRight size={16} className="crumb-separator" />
        <Link to="/" className="crumb-link">{product.category}</Link>
        <ChevronRight size={16} className="crumb-separator" />
        <span className="crumb-current">{product.name}</span>
      </nav>

      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}
      >
        ← Back to Shop
      </button>

      <div className="product-details-container">
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          
          <div 
            className="product-image-viewer"
            onMouseMove={handleMouseMove}
            // CSS magically handles the onMouseLeave fade out now!
          >
            {allImages.length > 0 ? (
              <>
                <img 
                  src={allImages[currentImageIndex]} 
                  alt={product.name} 
                  className="main-gallery-image"
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                />
                
                {/* 🚀 FIXED: The Zoom overlay now natively reads the current image URL straight from the state array! */}
                <div 
                  className="zoom-lens" 
                  style={{
                    backgroundImage: `url(${allImages[currentImageIndex]})`,
                    backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`
                  }}
                ></div>
              </>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#cbd5e0' }}>
                <PackageOpen size={48} strokeWidth={1.5} />
                <span style={{ fontSize: '0.8rem', marginTop: '8px', fontWeight: 'bold', color: '#a0aec0' }}>No Image</span>
              </div>
            )}

            {allImages.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); handlePrevImage(); }} 
                style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #cbd5e0', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10, color: '#2d3748' }}
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {allImages.length > 1 && (
              <button 
                onClick={(e) => { e.stopPropagation(); handleNextImage(); }} 
                style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #cbd5e0', borderRadius: '50%', width: '45px', height: '45px', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', zIndex: 10, color: '#2d3748' }}
              >
                <ChevronRight size={24} />
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
                    width: '80px', height: '80px', flexShrink: 0, cursor: 'pointer', 
                    border: currentImageIndex === index ? '2px solid #3182ce' : '1px solid #e2e8f0', 
                    borderRadius: '8px', overflow: 'hidden', padding: '5px', backgroundColor: 'white',
                    opacity: currentImageIndex === index ? 1 : 0.6,
                    transition: 'all 0.2s'
                  }}
                >
                  <img src={imgUrl} alt={`Thumbnail ${index + 1}`} draggable="false" style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <span style={{ backgroundColor: '#edf2f7', color: '#4a5568', padding: '6px 12px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', alignSelf: 'flex-start', marginBottom: '1rem', textTransform: 'uppercase' }}>
            {product.category}
          </span>
          
          <h1 style={{ margin: '0 0 10px 0', color: '#2d3748', fontSize: 'clamp(1.8rem, 4vw, 2.5rem)', lineHeight: '1.2' }}>{product.name}</h1>
          
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
            <StarRating rating={Math.round(averageRating)} />
            <span style={{ color: '#718096', fontSize: '0.95rem', fontWeight: 'bold' }}>
              {reviews.length > 0 ? `${averageRating} out of 5 (${reviews.length} reviews)` : 'No reviews yet'}
            </span>
          </div>

          <p style={{ fontSize: '3rem', fontWeight: 'bold', color: '#2b6cb0', margin: '0 0 1rem 0' }}>${product.price.toFixed(2)}</p>
          <p style={{ color: '#a0aec0', marginBottom: '2rem', fontSize: '1rem', fontFamily: 'monospace' }}>
            SKU: {product.sku}
          </p>

          <p style={{ color: product.stockQuantity > 0 ? '#38a169' : '#e53e3e', fontWeight: 'bold', marginBottom: '1.5rem', backgroundColor: product.stockQuantity > 0 ? '#f0fff4' : '#fff5f5', padding: '12px 15px', borderRadius: '8px', display: 'inline-block', alignSelf: 'flex-start', border: `1px solid ${product.stockQuantity > 0 ? '#c6f6d5' : '#fed7d7'}` }}>
            {isAdmin ? (
               product.stockQuantity > 0 ? `● In Stock (${product.stockQuantity} available)` : '○ Out of Stock'
            ) : (
               product.stockQuantity > 5 ? '● In Stock & Ready to Ship' : 
               product.stockQuantity > 0 ? `● Only ${product.stockQuantity} left in stock - order soon!` : 
               '○ Currently Out of Stock'
            )}
          </p>

          {!isAdmin && (
            <div style={{ display: 'flex', gap: '15px', width: '100%', marginTop: 'auto' }}>
              <button 
                onClick={() => addToCart(null, product)}
                disabled={product.stockQuantity === 0}
                style={{ flex: 1, padding: '16px', backgroundColor: product.stockQuantity === 0 ? '#cbd5e0' : '#3182ce', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: product.stockQuantity === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: product.stockQuantity > 0 ? '0 4px 6px rgba(49, 130, 206, 0.2)' : 'none' }}
                onMouseEnter={e => !product.stockQuantity === 0 && (e.currentTarget.style.backgroundColor = '#2c5282')}
                onMouseLeave={e => !product.stockQuantity === 0 && (e.currentTarget.style.backgroundColor = '#3182ce')}
              >
                {product.stockQuantity === 0 ? 'Out of Stock' : <><ShoppingCart size={20} /> Add to Cart</>}
              </button>
              
              <button 
                onClick={() => { addToCart(null, product); navigate('/cart'); }}
                disabled={product.stockQuantity === 0}
                style={{ flex: 1, padding: '16px', backgroundColor: product.stockQuantity === 0 ? '#cbd5e0' : '#38a169', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.1rem', fontWeight: 'bold', cursor: product.stockQuantity === 0 ? 'not-allowed' : 'pointer', transition: 'all 0.2s', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: product.stockQuantity > 0 ? '0 4px 6px rgba(56, 161, 105, 0.2)' : 'none' }}
                onMouseEnter={e => !product.stockQuantity === 0 && (e.currentTarget.style.backgroundColor = '#2f855a')}
                onMouseLeave={e => !product.stockQuantity === 0 && (e.currentTarget.style.backgroundColor = '#38a169')}
              >
                <CreditCard size={20} /> Buy Now
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ backgroundColor: 'white', padding: '2.5rem', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', marginBottom: '3rem', border: '1px solid #edf2f7' }}>
        <h2 style={{ margin: '0 0 2rem 0', color: '#2d3748', borderBottom: '2px solid #edf2f7', paddingBottom: '1rem' }}>
          Customer Reviews
        </h2>

        {canReview && (
          <div style={{ backgroundColor: '#f0fff4', padding: '2rem', borderRadius: '12px', border: '1px solid #c6f6d5', marginBottom: '2.5rem' }}>
            <h3 style={{ margin: '0 0 15px 0', color: '#22543d', display: 'flex', alignItems: 'center', gap: '8px' }}>
              ✅ Verified Purchase: Write a Review
            </h3>
            <form onSubmit={submitReview}>
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#2f855a' }}>Tap to Rate:</label>
                <StarRating rating={newReview.rating} setRating={(val) => setNewReview({...newReview, rating: val})} interactive={true} />
              </div>
              <textarea 
                value={newReview.comment}
                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                placeholder="What did you think about this product?"
                required
                style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '1px solid #9ae6b4', boxSizing: 'border-box', minHeight: '120px', marginBottom: '1.5rem', fontFamily: 'inherit', resize: 'vertical', fontSize: '1rem' }}
              />
              <button 
                type="submit" 
                disabled={isSubmitting}
                style={{ backgroundColor: '#38a169', color: 'white', padding: '12px 25px', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem', cursor: isSubmitting ? 'not-allowed' : 'pointer', transition: 'background-color 0.2s', boxShadow: '0 4px 6px rgba(56, 161, 105, 0.2)' }}
              >
                {isSubmitting ? 'Posting...' : 'Submit Review'}
              </button>
            </form>
          </div>
        )}

        {reviews.length === 0 ? (
          <div style={{ backgroundColor: '#f7fafc', padding: '3rem', textAlign: 'center', borderRadius: '12px', border: '2px dashed #cbd5e0' }}>
            <p style={{ color: '#718096', margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>No reviews yet.</p>
            <p style={{ color: '#a0aec0', margin: '8px 0 0 0', fontSize: '1rem' }}>Be the first to review after purchasing!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {reviews.map((review) => (
              <div key={review.id} style={{ borderBottom: '1px solid #edf2f7', paddingBottom: '2rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
                  <StarRating rating={review.rating} />
                  <span style={{ fontWeight: 'bold', color: '#2d3748', fontSize: '1.1rem' }}>{review.username}</span>
                  <span style={{ backgroundColor: '#ebf8ff', color: '#2b6cb0', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #bee3f8' }}>
                    ✓ Verified Buyer
                  </span>
                  <span style={{ color: '#a0aec0', fontSize: '0.9rem', marginLeft: 'auto' }}>
                    {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                  </span>
                </div>
                <p style={{ margin: 0, color: '#4a5568', lineHeight: '1.7', fontSize: '1.05rem' }}>{review.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {relatedProducts.length > 0 && (
        <div style={{ paddingTop: '1rem', marginBottom: '4rem' }}>
          <h2 style={{ margin: '0 0 2rem 0', color: '#2d3748', fontSize: '2rem' }}>
            You Might Also Like
          </h2>
          
          <div className="related-carousel-container">
            {canScrollLeft && (
              <button className="carousel-btn left" onClick={() => scrollCarousel('left')} tabIndex="-1">
                <ChevronLeft size={24} color="#4a5568" />
              </button>
            )}

            <div 
              className="related-carousel" 
              ref={carouselRef} 
              onScroll={updateScrollButtons} 
              tabIndex="0"
              onKeyDown={handleCarouselKeyDown}
              style={{ outline: 'none' }} 
            >
              {relatedProducts.map((relatedItem) => (
                <div 
                  key={relatedItem.id} 
                  className="product-card carousel-card" 
                  onClick={() => navigate(`/product/${relatedItem.id}`)}
                >
                  <div className="product-card-content">
                    <div style={{ position: 'relative', width: '100%', height: '160px', backgroundColor: 'white', marginBottom: '15px', borderRadius: '8px', overflow: 'hidden', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      {relatedItem.imageUrl ? (
                        <img src={relatedItem.imageUrl} alt={relatedItem.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} draggable="false" />
                      ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', color: '#cbd5e0' }}>
                          <PackageOpen size={32} strokeWidth={1.5} />
                        </div>
                      )}
                    </div>
                    <span className="category-tag">{relatedItem.category}</span>
                    <h3 style={{ fontSize: '1.05rem', margin: '10px 0', minHeight: '2.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {relatedItem.name}
                    </h3>
                    <p className="price-tag" style={{ margin: 'auto 0 0 0', fontSize: '1.3rem' }}>${relatedItem.price.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>

            {canScrollRight && (
              <button className="carousel-btn right" onClick={() => scrollCarousel('right')} tabIndex="-1">
                <ChevronRight size={24} color="#4a5568" />
              </button>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2, Plus, Minus, ArrowRight, ShieldCheck, ShoppingBag, Tag, CreditCard, Lock, X } from 'lucide-react';
import toast from 'react-hot-toast'; // 🚀 Added Toast for beautiful notifications

// 🚀 ENTERPRISE LOGIC: Mock Promo Database
const VALID_PROMOS = {
  'WELCOME10': { type: 'percent', value: 0.10 }, // 10% off
  'TECH20': { type: 'percent', value: 0.20 },    // 20% off
  'FLAT50': { type: 'fixed', value: 50.00 }      // $50 flat discount
};

export default function Cart({ cart, updateQuantity, removeFromCart, handleCheckout }) {
  const navigate = useNavigate();
  
  // Promo State
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState(null);

  // 🚀 ENTERPRISE LOGIC: Financial Calculations
  const rawSubtotal = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);
  
  // Calculate Discount
  let discountAmount = 0;
  if (appliedPromo) {
    if (appliedPromo.type === 'percent') {
      discountAmount = rawSubtotal * appliedPromo.value;
    } else if (appliedPromo.type === 'fixed') {
      discountAmount = appliedPromo.value;
    }
  }
  // Safety check: Discount can never be more than the subtotal
  discountAmount = Math.min(discountAmount, rawSubtotal);

  const subtotalAfterDiscount = rawSubtotal - discountAmount;
  
  const shippingThreshold = 150; // Free shipping over $150
  // Shipping is based on the discounted price!
  const shippingCost = subtotalAfterDiscount >= shippingThreshold || subtotalAfterDiscount === 0 ? 0 : 15.00;
  const estimatedTax = subtotalAfterDiscount * 0.08; // 8% mock tax
  const total = subtotalAfterDiscount + shippingCost + estimatedTax;

  const amountUntilFreeShipping = shippingThreshold - subtotalAfterDiscount;
  const shippingProgress = Math.min((subtotalAfterDiscount / shippingThreshold) * 100, 100);

  // 🚀 The Promo Validation Engine
  const handleApplyPromo = () => {
    const cleanCode = promoCode.trim().toUpperCase();
    
    if (appliedPromo && appliedPromo.code === cleanCode) {
      toast.error("This promo code is already applied.", { style: { borderRadius: '8px', background: '#333', color: '#fff' }});
      return;
    }

    if (VALID_PROMOS[cleanCode]) {
      setAppliedPromo({ code: cleanCode, ...VALID_PROMOS[cleanCode] });
      setPromoCode('');
      toast.success(`Promo code ${cleanCode} applied!`, { style: { borderRadius: '8px', background: '#333', color: '#fff' }});
    } else {
      toast.error("Invalid promo code. Please try again.", { style: { borderRadius: '8px', background: '#333', color: '#fff' }});
    }
  };

  const handleRemovePromo = () => {
    setAppliedPromo(null);
    toast.success("Promo code removed.", { style: { borderRadius: '8px', background: '#333', color: '#fff' }});
  };

  // 🚀 PREMIUM UI: The Empty Cart State
  if (cart.length === 0) {
    return (
      <div className="empty-cart-container">
        <div className="empty-cart-content">
          <div className="empty-cart-icon-wrapper">
            <ShoppingBag size={80} color="#a0aec0" strokeWidth={1} />
          </div>
          <h2>Your cart is completely empty.</h2>
          <p>Looks like you haven't added any premium tech to your setup yet.</p>
          <button className="continue-shopping-btn" onClick={() => navigate('/')}>
            Explore Products <ArrowRight size={18} />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="cart-page-container">
      <div className="cart-header">
        <h1>Secure Checkout</h1>
        <p>{cart.length} {cart.length === 1 ? 'item' : 'items'} in your bag</p>
      </div>

      <div className="cart-grid">
        
        {/* LEFT COLUMN: The Items */}
        <div className="cart-items-section">
          
          {/* Free Shipping Motivator */}
          <div className="shipping-motivator">
            <div className="shipping-text">
              {amountUntilFreeShipping > 0 ? (
                <span>Add <strong>${amountUntilFreeShipping.toFixed(2)}</strong> more to unlock <strong>Free Shipping</strong></span>
              ) : (
                <span className="success-text">🎉 You have unlocked <strong>Free Priority Shipping!</strong></span>
              )}
            </div>
            <div className="progress-bar-container">
              <div className="progress-bar-fill" style={{ width: `${shippingProgress}%`, backgroundColor: amountUntilFreeShipping <= 0 ? '#38a169' : '#3182ce' }}></div>
            </div>
          </div>

          {/* Item List */}
          <div className="cart-items-list">
            {cart.map((item) => (
              <div key={item.id} className="cart-item-row">
                
                <div className="cart-item-image-wrapper" onClick={() => navigate(`/product/${item.id}`)}>
                  {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                  ) : (
                    <div className="no-image-placeholder"><ShoppingBag size={24} color="#cbd5e0" /></div>
                  )}
                </div>

                <div className="cart-item-details">
                  <div className="item-header">
                    <span className="item-category">{item.category}</span>
                    <button className="remove-item-btn" onClick={() => removeFromCart(item.id)}>
                      <Trash2 size={16} /> Remove
                    </button>
                  </div>
                  
                  <h3 onClick={() => navigate(`/product/${item.id}`)}>{item.name}</h3>
                  <p className="item-unit-price">${item.price.toFixed(2)} each</p>

                  <div className="item-actions-row">
                    <div className="qty-controller">
                      <button onClick={() => updateQuantity(item.id, -1)} disabled={item.cartQuantity <= 1} className="qty-btn">
                        <Minus size={14} />
                      </button>
                      <span className="qty-number">{item.cartQuantity}</span>
                      <button onClick={() => updateQuantity(item.id, 1)} disabled={item.cartQuantity >= item.stockQuantity} className="qty-btn">
                        <Plus size={14} />
                      </button>
                    </div>
                    
                    <div className="item-total-price">
                      ${(item.price * item.cartQuantity).toFixed(2)}
                    </div>
                  </div>
                  
                  {item.cartQuantity >= item.stockQuantity && (
                    <span className="max-stock-warning">Maximum stock reached</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT COLUMN: The Sticky Order Summary */}
        <div className="cart-summary-section">
          <div className="sticky-summary-box">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span className="summary-value">${rawSubtotal.toFixed(2)}</span>
            </div>

            {/* 🚀 NEW: Dynamic Discount Row */}
            {appliedPromo && (
              <div className="summary-row" style={{ color: '#059669', backgroundColor: '#d1fae5', padding: '8px 12px', borderRadius: '8px', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '700' }}>
                  Discount ({appliedPromo.code})
                  <button 
                    onClick={handleRemovePromo} 
                    style={{ background: 'white', border: 'none', color: '#ef4444', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '4px', borderRadius: '50%', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}
                    title="Remove Promo Code"
                  >
                    <X size={12} strokeWidth={3} />
                  </button>
                </span>
                <span className="summary-value" style={{ color: '#059669' }}>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            
            <div className="summary-row">
              <span>Estimated Shipping</span>
              <span className="summary-value">
                {shippingCost === 0 ? <span className="free-text">FREE</span> : `$${shippingCost.toFixed(2)}`}
              </span>
            </div>
            
            <div className="summary-row">
              <span>Estimated Tax</span>
              <span className="summary-value">${estimatedTax.toFixed(2)}</span>
            </div>

            {/* Hide input if a promo is already applied */}
            {!appliedPromo && (
              <div className="promo-code-input">
                <Tag size={16} color="#a0aec0" />
                <input 
                  type="text" 
                  placeholder="Gift card or promo code" 
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && promoCode && handleApplyPromo()}
                />
                <button disabled={!promoCode} onClick={handleApplyPromo}>Apply</button>
              </div>
            )}

            <div className="summary-total-row">
              <span>Total</span>
              <span className="total-value">${total.toFixed(2)}</span>
            </div>

            <button className="checkout-btn" onClick={handleCheckout}>
              <Lock size={18} /> Proceed to Checkout
            </button>

            <div className="secure-checkout-badges">
              <div className="trust-item"><ShieldCheck size={16} /> 256-bit SSL Encryption</div>
              <div className="trust-item"><CreditCard size={16} /> Secure Payment Gateways</div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
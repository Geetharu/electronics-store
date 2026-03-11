import { useNavigate } from 'react-router-dom';

export default function Cart({ cart, updateQuantity, removeFromCart, handleCheckout }) {
  const navigate = useNavigate();
  const total = cart.reduce((sum, item) => sum + (item.price * item.cartQuantity), 0);

  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2d3748', margin: 0 }}>Your Shopping Cart</h1>
        <button 
          onClick={() => navigate('/')} 
          style={{ padding: '10px 20px', background: '#edf2f7', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', color: '#4a5568' }}
        >
          ← Continue Shopping
        </button>
      </div>

      {cart.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #edf2f7' }}>
          <h2 style={{ color: '#718096', marginBottom: '20px' }}>Your cart is empty.</h2>
          <button className="add-to-cart-btn" onClick={() => navigate('/')} style={{ maxWidth: '250px' }}>
            Browse Products
          </button>
        </div>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', padding: '30px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', border: '1px solid #edf2f7' }}>
          {cart.map((item, index) => (
            <div key={item.id} className="cart-item-row" style={{ borderBottom: index === cart.length - 1 ? 'none' : '1px solid #edf2f7', padding: '20px 0' }}>
              <div className="cart-item-details">
                <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem', color: '#2d3748' }}>{item.name}</h3>
                <p style={{ margin: 0, color: '#718096', fontWeight: '500' }}>${item.price.toFixed(2)} each</p>
              </div>
              
              <div className="cart-item-actions">
                <button className="qty-btn" onClick={() => updateQuantity(item.id, -1)} disabled={item.cartQuantity <= 1}>-</button>
                <span className="qty-display">{item.cartQuantity}</span>
                <button className="qty-btn" onClick={() => updateQuantity(item.id, 1)} disabled={item.cartQuantity >= item.stockQuantity}>+</button>
                <button className="remove-btn" onClick={() => removeFromCart(item.id)}>Remove</button>
              </div>
              
              <div className="cart-item-price" style={{ fontSize: '1.3rem', color: '#2b6cb0' }}>
                ${(item.price * item.cartQuantity).toFixed(2)}
              </div>
            </div>
          ))}
          
          <div className="cart-total" style={{ marginTop: '30px', borderTop: '2px solid #edf2f7', paddingTop: '20px' }}>
            <h2 style={{ color: '#2d3748', marginBottom: '20px', fontSize: '1.8rem' }}>Total: ${total.toFixed(2)}</h2>
            <button className="checkout-btn" onClick={handleCheckout} style={{ fontSize: '1.2rem', padding: '16px' }}>
              Proceed to Secure Checkout 🔒
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
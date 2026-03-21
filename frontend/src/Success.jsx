import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight, Mail } from 'lucide-react';

export default function Success({ clearCart }) {
  const navigate = useNavigate();

  useEffect(() => {
    if (clearCart) {
      clearCart();
    }
  }, [clearCart]); 

  const handleGoHome = () => {
    navigate('/', { replace: true }); 
  };

  const handleGoToOrders = () => {
    navigate('/orders', { replace: true }); 
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 10px 25px rgba(0,0,0,0.05)', 
        maxWidth: '500px', 
        width: '100%',
        textAlign: 'center',
        borderTop: '6px solid #38a169'
      }}>
        
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <CheckCircle size={80} color="#38a169" strokeWidth={1.5} />
        </div>

        <h1 style={{ margin: '0 0 10px 0', color: '#1a202c', fontSize: '2rem' }}>Payment Successful!</h1>
        <p style={{ color: '#718096', fontSize: '1.1rem', marginBottom: '30px', lineHeight: '1.5' }}>
          Thank you for your purchase. We've received your order and are getting it ready for shipment.
        </p>

        <div style={{ backgroundColor: '#f7fafc', padding: '20px', borderRadius: '8px', marginBottom: '30px', border: '1px solid #edf2f7' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#4a5568', marginBottom: '10px' }}>
            <Mail size={18} /> <span>Confirmation email sent</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#4a5568' }}>
            <Package size={18} /> <span>You can track your order status anytime</span>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <button 
            onClick={handleGoToOrders} 
            style={{ 
              padding: '14px 24px', backgroundColor: '#2b6cb0', color: 'white', 
              cursor: 'pointer', border: 'none', borderRadius: '8px', 
              fontSize: '1.1rem', fontWeight: 'bold', display: 'flex', 
              justifyContent: 'center', alignItems: 'center', gap: '8px',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#2c5282'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = '#2b6cb0'}
          >
            Track My Order <ArrowRight size={18} />
          </button>
          
          <button 
            onClick={handleGoHome} 
            style={{ 
              padding: '14px 24px', backgroundColor: 'transparent', color: '#4a5568', 
              cursor: 'pointer', border: '1px solid #cbd5e0', borderRadius: '8px', 
              fontSize: '1.1rem', fontWeight: 'bold', transition: 'background-color 0.2s'
            }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#f7fafc'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            Continue Shopping
          </button>
        </div>

      </div>
    </div>
  );
}
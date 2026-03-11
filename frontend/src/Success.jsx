import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Success({ clearCart }) {
  const navigate = useNavigate();

  useEffect(() => {
    // 🧹 Wipe the cart ONCE when the page loads
    if (clearCart) {
      clearCart();
    }
  }, []); // 🚀 FIX: The empty array stops the infinite rendering loop!

  const handleGoHome = () => {
    navigate('/', { replace: true }); 
  };

  return (
    <div style={{ textAlign: 'center', padding: '100px 20px' }}>
       <h1>🎉 Payment Successful!</h1>
       <button 
         onClick={handleGoHome} 
         style={{ padding: '12px 24px', backgroundColor: '#2b6cb0', color: 'white', cursor: 'pointer', border: 'none', borderRadius: '6px', fontSize: '1.1rem', marginTop: '20px' }}
       >
         Back to Store
       </button>
    </div>
  );
}
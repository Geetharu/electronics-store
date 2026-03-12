import { useState, useEffect } from 'react';

// 🚀 The Visual Timeline Component
const OrderTimeline = ({ order }) => {
  const isCancelled = order.status === 'CANCELLED';
  
  const expectedDeliveryDate = new Date(order.orderDate);
  expectedDeliveryDate.setDate(expectedDeliveryDate.getDate() + 5);
  
  const steps = [
    { label: 'Paid', date: order.orderDate, isCompleted: true, isExpected: false },
    { label: 'Shipped', date: order.shippedAt, isCompleted: !!order.shippedAt, isExpected: false },
    { 
      label: order.deliveredAt ? 'Delivered' : 'Expected Delivery', 
      date: order.deliveredAt || expectedDeliveryDate, 
      isCompleted: !!order.deliveredAt,
      isExpected: !order.deliveredAt 
    }
  ];

  // We don't show the timeline if it's cancelled, we show the red box instead!
  if (isCancelled) return null;

  return (
    <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #e2e8f0' }}>
      <h4 style={{ margin: '0 0 1.5rem 0', color: '#4a5568', textAlign: 'center' }}>Package Progress</h4>
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative', padding: '0 20px' }}>
        
        <div style={{ position: 'absolute', top: '15px', left: '15%', right: '15%', height: '4px', backgroundColor: '#edf2f7', zIndex: 1 }}></div>
        
        <div style={{ 
          position: 'absolute', top: '15px', left: '15%', height: '4px', zIndex: 2,
          backgroundColor: '#38a169', transition: 'width 0.5s ease',
          width: order.deliveredAt ? '70%' : order.shippedAt ? '35%' : '0%'
        }}></div>

        {steps.map((step, index) => (
          <div key={index} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 3, width: '33%' }}>
            <div style={{ 
              width: '34px', height: '34px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: step.isCompleted ? '#38a169' : '#edf2f7', 
              color: step.isCompleted ? 'white' : '#a0aec0',
              fontWeight: 'bold', border: '4px solid white', boxShadow: '0 0 0 1px #cbd5e0'
            }}>
              {step.isCompleted ? '✓' : index + 1}
            </div>
            
            <p style={{ margin: '8px 0 2px 0', fontWeight: 'bold', color: step.isCompleted ? '#2d3748' : '#a0aec0', fontSize: '0.9rem' }}>
              {step.label}
            </p>
            
            {step.date && (
              <div style={{ fontSize: '0.75rem', textAlign: 'center', marginTop: '4px', color: step.isExpected ? '#2b6cb0' : '#718096' }}>
                <div style={{ fontWeight: step.isExpected ? 'bold' : 'normal' }}>
                  {step.isExpected ? 'Arriving by ' : ''} 
                  {new Date(step.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: step.isExpected ? undefined : 'numeric' })}
                </div>
                {!step.isExpected && (
                  <div style={{ fontWeight: '500' }}>{new Date(step.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      const token = sessionStorage.getItem('token');
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (response.ok) {
          const data = await response.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (isLoading) {
    return <div style={{ textAlign: 'center', padding: '3rem' }}>Loading your order history... ⏳</div>;
  }

  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#2d3748' }}>📦 Your Order History</h2>

      {orders.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '3rem', textAlign: 'center', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#4a5568' }}>No orders yet!</h3>
          <p style={{ color: '#718096', margin: 0 }}>When you buy something, your receipt will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {orders.map((order) => (
            <div key={order.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' }}>
              
              {/* --- CARD HEADER --- */}
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf2f7', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#2d3748', fontSize: '1.1rem' }}>
                    Order #{order.orderTrackingNumber || order.id}
                  </p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#718096' }}>
                    Placed on {new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '1.2rem', color: '#2b6cb0' }}>${order.totalAmount?.toFixed(2)}</p>
                  <span style={{ 
                    backgroundColor: order.status === 'CANCELLED' ? '#fed7d7' : '#ebf8ff', 
                    color: order.status === 'CANCELLED' ? '#822727' : '#2b6cb0', 
                    padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold' 
                  }}>
                    {order.status}
                  </span>
                </div>
              </div>

              {/* --- WRAPPING CARDS (Grid Layout) --- */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
                
                {/* Box 1: Items */}
                <div>
                  <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    🛍️ Items Purchased
                  </h4>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {order.items?.map((item) => (
                      <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', backgroundColor: '#f7fafc', padding: '10px 12px', borderRadius: '6px', border: '1px solid #edf2f7' }}>
                        <span style={{ fontWeight: '500', color: '#2d3748' }}>{item.quantity}x {item.product?.name}</span>
                        <span style={{ color: '#4a5568' }}>${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Box 2: Delivery Details (Only shows if NOT Cancelled) */}
                {order.status !== 'CANCELLED' && (
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#4a5568', display: 'flex', alignItems: 'center', gap: '5px' }}>
                      🚚 Delivery Details
                    </h4>
                    {order.shippingTrackingNumber ? (
                      <div style={{ backgroundColor: '#f0fff4', padding: '12px', borderRadius: '6px', border: '1px solid #c6f6d5' }}>
                        <p style={{ margin: '0 0 3px 0', fontSize: '0.85rem', color: '#38a169', fontWeight: 'bold', textTransform: 'uppercase' }}>
                          {order.shippingCarrier} Tracking
                        </p>
                        <p style={{ margin: 0, fontFamily: 'monospace', fontSize: '1.1rem', color: '#22543d', letterSpacing: '1px' }}>
                          {order.shippingTrackingNumber}
                        </p>
                      </div>
                    ) : (
                      <div style={{ backgroundColor: '#f7fafc', padding: '12px', borderRadius: '6px', border: '1px solid #edf2f7', color: '#718096', fontSize: '0.9rem' }}>
                        Tracking information will appear here once your order ships.
                      </div>
                    )}
                  </div>
                )}

                {/* Box 2 Alternate: Cancellation Details */}
                {order.status === 'CANCELLED' && (
                  <div>
                    <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#c53030' }}>🚫 Cancellation Info</h4>
                    <div style={{ backgroundColor: '#fff5f5', padding: '12px', borderRadius: '6px', border: '1px solid #feb2b2' }}>
                      <p style={{ margin: '0 0 5px 0', color: '#9b2c2c', fontSize: '0.9rem' }}>
                        A refund of <strong>${order.totalAmount?.toFixed(2)}</strong> is being processed.
                      </p>
                      <p style={{ margin: 0, color: '#c53030', fontSize: '0.85rem' }}>
                        Please allow 3-5 business days for the funds to appear on your original payment method.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* --- THE TIMELINE --- */}
              <OrderTimeline order={order} />

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
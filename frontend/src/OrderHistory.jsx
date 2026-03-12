import { useState, useEffect } from 'react';

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
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#2d3748' }}>📦 Your Order History</h2>

      {orders.length === 0 ? (
        <div style={{ backgroundColor: 'white', padding: '3rem', textAlign: 'center', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#4a5568' }}>No orders yet!</h3>
          <p style={{ color: '#718096', margin: 0 }}>When you buy something, your receipt will appear here.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {orders.map((order) => (
            <div key={order.id} style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.08)', borderLeft: '4px solid #3182ce' }}>
              
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #edf2f7', paddingBottom: '1rem', marginBottom: '1rem' }}>
                <div>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', color: '#2d3748' }}>Order #{order.id}</p>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#718096' }}>
                    {new Date(order.orderDate).toLocaleDateString()} at {new Date(order.orderDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '1.1rem', color: '#2b6cb0' }}>${order.totalAmount.toFixed(2)}</p>
                  <span style={{ backgroundColor: '#c6f6d5', color: '#22543d', padding: '3px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                    {order.status} ✅
                  </span>
                </div>
              </div>

              <div>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '0.95rem', color: '#4a5568' }}>Items Purchased:</h4>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {order.items.map((item) => (
                    <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem' }}>
                      <span>{item.quantity}x {item.product.name}</span>
                      <span style={{ color: '#718096' }}>${(item.priceAtPurchase * item.quantity).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
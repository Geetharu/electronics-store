import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Package, Search, RotateCcw, Check, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import html2pdf from 'html2pdf.js';

export default function OrderHistory({ addToCart }) {
  const [orders, setOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrders, setExpandedOrders] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      const token = sessionStorage.getItem('token');
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setOrders(data.sort((a, b) => new Date(b.orderDate) - new Date(a.orderDate)));
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const toggleDetails = (orderId) => {
    setExpandedOrders(prev => ({ ...prev, [orderId]: !prev[orderId] }));
  };

  const goToProduct = (productId) => { if (productId) navigate(`/product/${productId}`); };
  
  const handleWriteReview = (productId) => { if (productId) navigate(`/product/${productId}?review=true`); };

  const handleBuyAgain = (e, item) => {
    e.stopPropagation();
    if (!item.product) { toast.error("Product unavailable."); return; }
    if(addToCart) { addToCart(e, item.product); } 
    else { toast.success(`${item.product.name} added to cart!`); }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order?")) return;
    const token = sessionStorage.getItem('token');
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        toast.success(`Order #${orderId} cancelled successfully.`, { icon: '🚫' });
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: 'CANCELLED' } : o));
      } else {
        toast.error("Failed to cancel order. It may have already shipped.");
      }
    } catch (err) { toast.error("Error connecting to server."); }
  };

  const handleTrackPackage = (tracking, carrier) => {
    if (!tracking) { toast.error("Tracking info not available yet."); return; }
    const url = carrier?.toLowerCase() === 'fedex' 
      ? `https://www.fedex.com/fedextrack/?trknbr=${tracking}`
      : `https://www.google.com/search?q=track+package+${tracking}`;
    window.open(url, '_blank');
  };

  // ==========================================
  // 🚀 THE SMART DISCOUNT SPLITTER
  // ==========================================
  const calculateOrderMath = (order) => {
    const rawSubtotal = order.items?.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0) || 0;
    const originalTax = rawSubtotal * 0.08;
    const shipping = rawSubtotal >= 150 ? 0 : 15.00;

    let promoDiscount = 0;
    let taxDiscount = 0;
    let promoName = order.promoCode || 'Applied';

    // Calculate theoretical max total with absolutely no discounts
    const absoluteMaxTotal = rawSubtotal + originalTax + shipping;
    const missingMoney = Math.max(0, absoluteMaxTotal - order.totalAmount);

    if (missingMoney > 0.01) {
        // SCENARIO 1: Both 10% Welcome Coupon AND Tax Waiver were applied
        if (Math.abs(missingMoney - (rawSubtotal * 0.10 + originalTax)) < 0.1) {
            promoDiscount = rawSubtotal * 0.10;
            taxDiscount = originalTax;
            if(!order.promoCode) promoName = 'WELCOME10';
        }
        // SCENARIO 2: Both 20% Tech Coupon AND Tax Waiver
        else if (Math.abs(missingMoney - (rawSubtotal * 0.20 + originalTax)) < 0.1) {
            promoDiscount = rawSubtotal * 0.20;
            taxDiscount = originalTax;
            if(!order.promoCode) promoName = 'TECH20';
        }
        // SCENARIO 3: Flat $50 Coupon AND Tax Waiver
        else if (Math.abs(missingMoney - (50 + originalTax)) < 0.1) {
            promoDiscount = 50;
            taxDiscount = originalTax;
            if(!order.promoCode) promoName = 'FLAT50';
        }
        // SCENARIO 4: ONLY Tax was waived (No Coupon)
        else if (Math.abs(missingMoney - originalTax) < 0.1) {
            promoDiscount = 0;
            taxDiscount = originalTax;
        }
        // SCENARIO 5: ONLY 10% Welcome Coupon was applied (Tax was recalculated, not waived)
        else if (Math.abs(missingMoney - (rawSubtotal * 0.108)) < 0.1) {
            promoDiscount = rawSubtotal * 0.10;
            taxDiscount = promoDiscount * 0.08; // Just the tax reduction from the cheaper price
            if(!order.promoCode) promoName = 'WELCOME10';
        }
        // FALLBACK: Math doesn't perfectly align, assume standard split
        else {
            if (missingMoney > originalTax) {
                taxDiscount = originalTax;
                promoDiscount = missingMoney - originalTax;
            } else {
                promoDiscount = missingMoney;
                taxDiscount = 0;
            }
        }
    }

    return {
        rawSubtotal,
        originalTax,
        shipping,
        promoDiscount,
        hasPromo: promoDiscount > 0.01,
        promoName,
        taxDiscount,
        hasTaxDiscount: taxDiscount > 0.01
    };
  };

  // ==========================================
  // 🚀 ENTERPRISE INVOICE ENGINE
  // ==========================================
  const handleDownloadInvoice = (order) => {
    toast.success("Preparing PDF...", { duration: 1500 });
    
    const math = calculateOrderMath(order);
    const orderIdString = order.orderTrackingNumber || order.id;
    
    const printElement = document.createElement('div');
    printElement.innerHTML = `
      <div style="font-family: 'Helvetica', Arial, sans-serif; padding: 40px; color: #333;">
        <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px;">
          <div>
            <h1 style="color: #2b6cb0; margin: 0; font-size: 24px;">Elite Electronics ⚡</h1>
            <p style="color: #666; font-size: 13px; margin: 5px 0;">Official Receipt & Tax Invoice</p>
            <p style="font-size: 12px; margin: 0;">Date: ${new Date(order.orderDate).toLocaleDateString()}</p>
          </div>
          <div style="text-align: right;">
            <h2 style="margin: 0; font-size: 20px;">Order #${orderIdString}</h2>
            <p style="text-transform: uppercase; font-weight: bold; color: #2b6cb0; font-size: 12px; margin: 5px 0;">${order.status}</p>
          </div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 30px;">
          <thead>
            <tr style="background: #f8fafc; border-bottom: 2px solid #eee;">
              <th style="text-align: left; padding: 12px; font-size: 13px;">Item Description</th>
              <th style="text-align: center; padding: 12px; font-size: 13px;">Qty</th>
              <th style="text-align: right; padding: 12px; font-size: 13px;">Unit Price</th>
              <th style="text-align: right; padding: 12px; font-size: 13px;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${order.items.map(item => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 12px; font-size: 13px;">${item.product?.name || 'Product'}</td>
                <td style="padding: 12px; text-align: center; font-size: 13px;">${item.quantity}</td>
                <td style="padding: 12px; text-align: right; font-size: 13px;">$${item.priceAtPurchase.toFixed(2)}</td>
                <td style="padding: 12px; text-align: right; font-size: 13px; font-weight: bold;">$${(item.priceAtPurchase * item.quantity).toFixed(2)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div style="width: 280px; float: right; background: #fdfdfd; border: 1px solid #eee; padding: 15px; border-radius: 8px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
            <span>Subtotal:</span><span>$${math.rawSubtotal.toFixed(2)}</span>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
            <span>Shipping:</span><span>${math.shipping === 0 ? 'FREE' : '$' + math.shipping.toFixed(2)}</span>
          </div>

          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px;">
            <span>Estimated Tax (8%):</span><span>$${math.originalTax.toFixed(2)}</span>
          </div>
          
          ${math.hasPromo ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #058552; font-weight: bold;">
            <span>Coupon (${math.promoName}):</span><span>-$${math.promoDiscount.toFixed(2)}</span>
          </div>` : ''}

          ${math.hasTaxDiscount ? `
          <div style="display: flex; justify-content: space-between; margin-bottom: 8px; font-size: 13px; color: #058552; font-weight: bold;">
            <span>Tax Waiver / Discount:</span><span>-$${math.taxDiscount.toFixed(2)}</span>
          </div>` : ''}

          <div style="display: flex; justify-content: space-between; border-top: 2px solid #2b6cb0; padding-top: 10px; margin-top: 10px; font-weight: bold; font-size: 16px; color: #0f1111;">
            <span>Grand Total:</span><span>$${order.totalAmount.toFixed(2)}</span>
          </div>
        </div>
        <div style="clear: both; padding-top: 50px; text-align: center; color: #999; font-size: 11px;">
          Thank you for shopping with Elite Electronics.
        </div>
      </div>
    `;

    html2pdf().set({
      margin: 0.5,
      filename: `Elite_Electronics_Invoice_${orderIdString}.pdf`,
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
    }).from(printElement).save();
  };

  if (isLoading) return <div style={{ textAlign: 'center', padding: '10vh 0', color: '#565959', fontSize: '14px' }}>Loading your orders...</div>;

  return (
    <div className="enterprise-order-page">
      <h1 className="enterprise-page-title">Your Orders</h1>

      {orders.length === 0 ? (
        <div style={{ padding: '40px', border: '1px solid #d5dbdb', background: '#fff', borderRadius: '8px' }}>
          <h3 style={{ margin: 0, fontSize: '16px' }}>No orders found.</h3>
        </div>
      ) : (
        <div className="e-order-list">
          {orders.map((order) => {
            const isExpanded = !!expandedOrders[order.id];
            
            // 🚀 USE THE SMART MATH FOR THE UI AS WELL
            const math = calculateOrderMath(order);

            const isCancelled = order.status === 'CANCELLED';
            const isDelivered = !!order.deliveredAt;
            const isShipped = !!order.shippedAt && !isCancelled;
            const isProcessing = !isShipped && !isDelivered && !isCancelled;
            const expectedDate = new Date(order.orderDate);
            expectedDate.setDate(expectedDate.getDate() + 5);

            return (
              <div key={order.id} className="e-order-card">
                <div className="e-order-header">
                  <div className="e-header-left">
                    <div className="e-meta-block">
                      <span className="e-meta-label">Order Placed</span>
                      <span className="e-meta-value">{new Date(order.orderDate).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
                    </div>
                    <div className="e-meta-block">
                      <span className="e-meta-label">Total</span>
                      <span className="e-meta-value">${order.totalAmount?.toFixed(2)}</span>
                    </div>
                  </div>
                  <div className="e-header-right">
                    <div className="e-meta-block" style={{ alignItems: 'flex-end' }}>
                      <span className="e-meta-label">Order # {order.orderTrackingNumber || order.id}</span>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '2px' }}>
                        <span className="e-link" onClick={() => toggleDetails(order.id)}>{isExpanded ? 'Hide order details' : 'View order details'}</span>
                        <span style={{ color: '#d5dbdb' }}>|</span>
                        <span className="e-link" onClick={() => handleDownloadInvoice(order)}>Invoice</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="e-order-body">
                  <div className="e-body-main">
                    {isCancelled ? (
                      <h3 className="e-status-heading cancelled"><AlertCircle size={20}/> Cancelled</h3>
                    ) : isDelivered ? (
                      <h3 className="e-status-heading success"><Check size={20}/> Delivered {new Date(order.deliveredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h3>
                    ) : (
                      <h3 className="e-status-heading transit">Arriving {expectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</h3>
                    )}

                    <div className="e-item-list">
                      {order.items?.map((item) => (
                        <div key={item.id} className="e-item-row">
                          <img 
                            src={item.product?.imageUrl || 'https://placehold.co/150x150/f8fafc/a0aec0?text=No+Image'} 
                            alt={item.product?.name} 
                            className="e-item-image" 
                            onClick={() => goToProduct(item.product?.id)} 
                            style={{ cursor: 'pointer' }} 
                            onError={(e) => { 
                              e.target.onerror = null; 
                              e.target.src = 'https://placehold.co/150x150/f8fafc/a0aec0?text=No+Image'; 
                            }}
                          />
                          <div className="e-item-details">
                            <h4 className="e-item-title" onClick={() => goToProduct(item.product?.id)}>{item.product?.name || "Premium Tech Item"}</h4>
                            <div className="e-item-meta">{isDelivered ? `Return window eligible` : `Quantity: ${item.quantity}`}</div>
                            <button className="e-btn" style={{ width: 'auto', padding: '4px 12px', marginTop: '8px', fontSize: '12px' }} onClick={(e) => handleBuyAgain(e, item)}>
                              <RotateCcw size={12}/> Buy it again
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="e-action-buttons">
                    {(isShipped || isDelivered) && <button className="e-btn primary" onClick={() => handleTrackPackage(order.shippingTrackingNumber, order.shippingCarrier)}>Track package</button>}
                    {isProcessing && <button className="e-btn" onClick={() => handleCancelOrder(order.id)}>Cancel order</button>}
                    {isDelivered && (
                      <>
                        <button className="e-btn" onClick={() => toast.success("Return label sent to email.")}>Return or replace items</button>
                        <button className="e-btn" onClick={() => handleWriteReview(order.items[0]?.product?.id)}>Write a product review</button>
                      </>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="e-expanded-details">
                    <div className="e-receipt-box">
                      <h4>Payment Summary</h4>
                      <div className="e-receipt-row"><span>Item(s) Subtotal:</span> <span>${math.rawSubtotal.toFixed(2)}</span></div>
                      <div className="e-receipt-row"><span>Shipping & Handling:</span> <span>${math.shipping === 0 ? 'FREE' : `$${math.shipping.toFixed(2)}`}</span></div>
                      <div className="e-receipt-row"><span>Estimated Tax (8%):</span> <span>${math.originalTax.toFixed(2)}</span></div>
                      
                      {/* 🚀 EXPLICIT PROMO DISPLAY */}
                      {math.hasPromo && (
                        <div className="e-receipt-row discount" style={{ color: '#058552', fontWeight: 'bold' }}>
                          <span>Coupon ({math.promoName}):</span> 
                          <span>-${math.promoDiscount.toFixed(2)}</span>
                        </div>
                      )}

                      {/* 🚀 EXPLICIT TAX WAIVER DISPLAY */}
                      {math.hasTaxDiscount && (
                        <div className="e-receipt-row discount" style={{ color: '#058552', fontWeight: 'bold' }}>
                          <span>Tax Waiver / Discount:</span> 
                          <span>-${math.taxDiscount.toFixed(2)}</span>
                        </div>
                      )}

                      <div className="e-receipt-row e-receipt-total"><span>Grand Total:</span> <span>${order.totalAmount?.toFixed(2)}</span></div>
                    </div>

                    {!isCancelled && (
                      <div className="e-timeline-box">
                        <h4>Tracking Progress</h4>
                        <div className="e-timeline-track">
                          <div className="e-timeline-line"></div>
                          <div className="e-timeline-progress" style={{ width: isDelivered ? '100%' : isShipped ? '50%' : '0%' }}></div>
                          <div className="e-timeline-node completed"><div className="e-node-dot">✓</div><div className="e-node-label">Ordered</div></div>
                          <div className={`e-timeline-node ${isShipped || isDelivered ? 'completed' : ''}`}><div className="e-node-dot">{isShipped || isDelivered ? '✓' : ''}</div><div className="e-node-label">Shipped</div></div>
                          <div className={`e-timeline-node ${isDelivered ? 'completed' : ''}`}><div className="e-node-dot">{isDelivered ? '✓' : ''}</div><div className="e-node-label">Delivered</div></div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
import { useState, useEffect } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend 
} from 'recharts';
import toast from 'react-hot-toast';

export default function AdminDashboard({ products, onProductAction }) {
  const [activeTab, setActiveTab] = useState('analytics');
  const [orders, setOrders] = useState([]);
  const [allReviews, setAllReviews] = useState([]); 
  
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [shippingInputs, setShippingInputs] = useState({ carrier: '', trackingNumber: '' });

  const [formData, setFormData] = useState({
    name: '', sku: '', price: '', stockQuantity: '', category: '', isHidden: false, imageUrl: '', imageGallery: []
  });
  
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false); 
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); 
  
  const token = sessionStorage.getItem('token');

  const fetchOrders = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (error) {
      console.error("Failed to fetch orders:", error);
    }
  };

  const fetchReviews = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/all`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        setAllReviews(data);
      }
    } catch (error) {
      console.error("Failed to fetch reviews:", error);
    }
  };

  useEffect(() => {
    if (activeTab === 'analytics' || activeTab === 'orders') fetchOrders();
    if (activeTab === 'reviews') fetchReviews(); 
  }, [activeTab]);

  const openOrderModal = (order) => {
    setSelectedOrder(order);
    setShippingInputs({
      carrier: order.shippingCarrier || '',
      trackingNumber: order.shippingTrackingNumber || ''
    });
  };

  const saveOrderStatus = async (newStatus) => {
    const loadingToast = toast.loading("Updating order status...");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/orders/${selectedOrder.id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus, 
          carrier: shippingInputs.carrier, 
          trackingNumber: shippingInputs.trackingNumber 
        })
      });
      if (response.ok) {
        toast.success(`Order marked as ${newStatus}!`, { id: loadingToast });
        setSelectedOrder(null); 
        fetchOrders();
      } else {
        toast.error("Failed to update order status.", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Network error.", { id: loadingToast });
    }
  };

  // ==========================================
  // 📸 PRO IMAGE SORTING ENGINE
  // ==========================================
  const currentImages = formData.imageUrl ? [formData.imageUrl, ...(formData.imageGallery || [])] : [];

  const updateImagesState = (newArray) => {
    setFormData(prev => ({
      ...prev,
      imageUrl: newArray.length > 0 ? newArray[0] : '', 
      imageGallery: newArray.length > 1 ? newArray.slice(1) : [] 
    }));
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsUploading(true);
    const loadingToast = toast.loading(`Uploading ${files.length} image(s)...`);

    try {
      const uploadPromises = files.map(async (file) => {
        const data = new FormData();
        data.append('file', file);
        data.append('upload_preset', 'Item_info'); 
        data.append('cloud_name', 'ddfk6oj09');       

        const response = await fetch('https://api.cloudinary.com/v1_1/ddfk6oj09/image/upload', {
          method: 'POST',
          body: data,
        });
        const uploadedData = await response.json();
        return uploadedData.secure_url;
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      updateImagesState([...currentImages, ...uploadedUrls]); 
      toast.success("Images uploaded successfully!", { id: loadingToast });
      
    } catch (error) {
      toast.error("Failed to upload images.", { id: loadingToast });
    } finally {
      setIsUploading(false);
      e.target.value = null; 
    }
  };

  const removeImage = (index) => {
    const newArray = currentImages.filter((_, i) => i !== index);
    updateImagesState(newArray);
  };

  const makePrimary = (index) => {
    if (index === 0) return;
    const newArray = [...currentImages];
    const selectedImg = newArray.splice(index, 1)[0];
    newArray.unshift(selectedImg); 
    updateImagesState(newArray);
  };

  const moveLeft = (index) => {
    if (index === 0) return;
    const newArray = [...currentImages];
    [newArray[index - 1], newArray[index]] = [newArray[index], newArray[index - 1]]; 
    updateImagesState(newArray);
  };

  const moveRight = (index) => {
    if (index === currentImages.length - 1) return;
    const newArray = [...currentImages];
    [newArray[index], newArray[index + 1]] = [newArray[index + 1], newArray[index]]; 
    updateImagesState(newArray);
  };

  // ==========================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    const baseUrl = `${import.meta.env.VITE_API_URL}/api/products`;
    const url = editingId ? `${baseUrl}/${editingId}` : baseUrl;
    const method = editingId ? 'PUT' : 'POST';

    const loadingToast = toast.loading(editingId ? "Updating product..." : "Saving new product...");

    try {
      const response = await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast.success(editingId ? "Product updated!" : "Product added to store!", { id: loadingToast });
        setFormData({ name: '', sku: '', price: '', stockQuantity: '', category: '', isHidden: false, imageUrl: '', imageGallery: [] });
        setEditingId(null);
        onProductAction(); 
      } else {
        const errText = await response.text();
        toast.error(`Database Error: ${errText}`, { id: loadingToast });
      }
    } catch (error) {
      toast.error("Failed to connect to backend.", { id: loadingToast });
    }
  };

  const editProduct = (product) => {
    setFormData({ ...product, imageGallery: product.imageGallery || [] });
    setEditingId(product.id);
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
  };

  // 🚀 FIXED: The button logic says Delete, but backend safely archives it.
  const deleteProduct = async (id) => {
    if (!window.confirm("🚨 Are you sure you want to permanently delete this product?")) return;
    
    const loadingToast = toast.loading("Deleting product...");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success("Product deleted successfully!", { id: loadingToast });
        onProductAction();
      } else {
        toast.error("Deletion failed. Check backend logs.", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Network error.", { id: loadingToast });
    }
  };

  const handleDeleteReview = async (id) => {
    if (!window.confirm("🚨 MODERATION ACTION: Are you sure you want to permanently delete this review?")) return;
    
    const loadingToast = toast.loading("Deleting review...");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        toast.success("Review permanently deleted.", { id: loadingToast });
        fetchReviews(); 
      } else {
        toast.error("Failed to delete review.", { id: loadingToast });
      }
    } catch (error) {
      toast.error("Network error.", { id: loadingToast });
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          product.sku.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesFilter = true;
    if (filterStatus === 'in') matchesFilter = product.stockQuantity > 0;
    if (filterStatus === 'out') matchesFilter = product.stockQuantity === 0;

    return matchesSearch && matchesFilter;
  });

  // ==========================================
  // 📊 ANALYTICS CALCULATIONS
  // ==========================================
  const validOrders = orders.filter(o => o.status !== 'CANCELLED');
  const totalRevenue = validOrders.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
  const totalSales = validOrders.length;

  const revenueByDateMap = {};
  validOrders.forEach(order => {
    const date = new Date(order.orderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    revenueByDateMap[date] = (revenueByDateMap[date] || 0) + (order.totalAmount || 0);
  });
  
  const revenueChartData = Object.keys(revenueByDateMap).map(date => ({
    date,
    revenue: parseFloat(revenueByDateMap[date].toFixed(2))
  })).reverse(); 

  const categoryMap = {};
  products.forEach(p => {
    categoryMap[p.category] = (categoryMap[p.category] || 0) + 1;
  });
  
  const categoryChartData = Object.keys(categoryMap).map(cat => ({
    name: cat,
    value: categoryMap[cat]
  }));
  
  const PIE_COLORS = ['#3182ce', '#38a169', '#dd6b20', '#e53e3e', '#805ad5', '#d53f8c'];

  return (
    <div className="admin-dashboard">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h2>⚙️ Admin Dashboard</h2>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={() => setActiveTab('analytics')}
            style={{ padding: '10px 20px', backgroundColor: activeTab === 'analytics' ? '#2b6cb0' : '#e2e8f0', color: activeTab === 'analytics' ? 'white' : '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            📊 Analytics
          </button>
          <button 
            onClick={() => setActiveTab('products')}
            style={{ padding: '10px 20px', backgroundColor: activeTab === 'products' ? '#2b6cb0' : '#e2e8f0', color: activeTab === 'products' ? 'white' : '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            📦 Inventory Management
          </button>
          <button 
            onClick={() => setActiveTab('orders')}
            style={{ padding: '10px 20px', backgroundColor: activeTab === 'orders' ? '#2b6cb0' : '#e2e8f0', color: activeTab === 'orders' ? 'white' : '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            🚚 Order Fulfillments
          </button>
          <button 
            onClick={() => setActiveTab('reviews')}
            style={{ padding: '10px 20px', backgroundColor: activeTab === 'reviews' ? '#2b6cb0' : '#e2e8f0', color: activeTab === 'reviews' ? 'white' : '#4a5568', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', transition: 'all 0.2s' }}
          >
            ⭐ Reviews Moderation
          </button>
        </div>
      </div>

      {activeTab === 'analytics' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', animation: 'slideIn 0.3s ease-out' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #38a169' }}>
              <p style={{ margin: '0 0 5px 0', color: '#718096', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem' }}>Total Revenue</p>
              <h3 style={{ margin: 0, fontSize: '2rem', color: '#2d3748' }}>${totalRevenue.toFixed(2)}</h3>
            </div>
            
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #3182ce' }}>
              <p style={{ margin: '0 0 5px 0', color: '#718096', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem' }}>Total Valid Orders</p>
              <h3 style={{ margin: 0, fontSize: '2rem', color: '#2d3748' }}>{totalSales}</h3>
            </div>
            
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', borderLeft: '4px solid #dd6b20' }}>
              <p style={{ margin: '0 0 5px 0', color: '#718096', fontWeight: 'bold', textTransform: 'uppercase', fontSize: '0.8rem' }}>Active Products</p>
              <h3 style={{ margin: 0, fontSize: '2rem', color: '#2d3748' }}>{products.length}</h3>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem' }}>
            
            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#4a5568' }}>Revenue Over Time</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={revenueChartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#718096' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#718096' }} tickFormatter={(value) => `$${value}`} />
                  <RechartsTooltip cursor={{ fill: '#f7fafc' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="revenue" fill="#3182ce" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div style={{ background: 'white', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 1.5rem 0', color: '#4a5568' }}>Inventory Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                    stroke="none"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }} />
                  <Legend verticalAlign="bottom" height={36} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            </div>

          </div>
        </div>
      )}

      {activeTab === 'products' && (
        <div>
          <form onSubmit={handleSubmit} className="admin-form" style={{ display: 'grid', gap: '10px', maxWidth: '600px', marginBottom: '2rem' }}>
            <input type="text" placeholder="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
            <input type="text" placeholder="SKU" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
            <input type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required step="0.01" />
            <input type="number" placeholder="Stock Quantity" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} required />
            <input type="text" placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
            
            <div style={{ border: '1px dashed #ccc', padding: '15px', borderRadius: '4px', backgroundColor: '#f7fafc' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold' }}>Product Images:</label>
              
              <div style={{ marginBottom: '15px' }}>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} disabled={isUploading} id="image-upload-input" />
                {isUploading && <span style={{ marginLeft: '10px', color: '#3182ce', fontWeight: 'bold' }}>Uploading Batch... ⏳</span>}
                <p style={{ fontSize: '0.8rem', color: '#718096', margin: '5px 0 0 0' }}>Hold Ctrl/Cmd to select multiple. The 1st image is your store thumbnail.</p>
              </div>

              {currentImages.length > 0 && (
                <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap', padding: '10px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  {currentImages.map((img, index) => (
                    <div key={index} style={{ 
                      position: 'relative', width: '130px', height: '150px', 
                      border: index === 0 ? '3px solid #3182ce' : '1px solid #cbd5e0', 
                      borderRadius: '8px', padding: '5px', backgroundColor: 'white',
                      display: 'flex', flexDirection: 'column',
                      boxShadow: index === 0 ? '0 4px 6px rgba(49, 130, 206, 0.2)' : 'none'
                    }}>
                      
                      {index === 0 && (
                        <span style={{ position: 'absolute', top: '-10px', left: '10px', background: '#3182ce', color: 'white', fontSize: '0.7rem', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold' }}>
                          ⭐ Main
                        </span>
                      )}

                      <img src={img} alt={`Preview ${index}`} style={{ width: '100%', height: '90px', objectFit: 'contain', marginBottom: 'auto' }} />

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                        <button type="button" onClick={() => moveLeft(index)} disabled={index === 0} style={{ padding: '2px 8px', cursor: index === 0 ? 'not-allowed' : 'pointer', border: '1px solid #cbd5e0', background: '#edf2f7', borderRadius: '4px' }}>◀</button>
                        
                        {index !== 0 && (
                          <button type="button" onClick={() => makePrimary(index)} title="Make Main" style={{ padding: '2px 8px', cursor: 'pointer', background: '#ecc94b', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}>⭐</button>
                        )}
                        
                        <button type="button" onClick={() => moveRight(index)} disabled={index === currentImages.length - 1} style={{ padding: '2px 8px', cursor: index === currentImages.length - 1 ? 'not-allowed' : 'pointer', border: '1px solid #cbd5e0', background: '#edf2f7', borderRadius: '4px' }}>▶</button>
                      </div>

                      <button type="button" onClick={() => removeImage(index)} style={{ position: 'absolute', top: '-8px', right: '-8px', background: '#e53e3e', color: 'white', border: 'none', borderRadius: '50%', width: '22px', height: '22px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✖</button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <label style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px' }}>
              <input type="checkbox" checked={formData.isHidden} onChange={e => setFormData({...formData, isHidden: e.target.checked})} />
              🙈 Hide from public store
            </label>
            
            <button type="submit" disabled={isUploading} style={{ marginTop: '10px', padding: '10px', backgroundColor: '#3182ce', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '1.1rem' }}>
              {editingId ? 'Update Product' : 'Add Product'}
            </button>
            {editingId && <button type="button" onClick={() => {setFormData({name: '', sku: '', price: '', stockQuantity: '', category: '', isHidden: false, imageUrl: '', imageGallery: []}); setEditingId(null);}} style={{ padding: '10px', backgroundColor: '#e2e8f0', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}>Cancel Edit</button>}
          </form>

          <div style={{ display: 'flex', gap: '10px', marginBottom: '1rem', alignItems: 'center' }}>
            <input 
              type="text" 
              placeholder="Search by name, SKU, or category..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              style={{ padding: '8px', width: '300px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <select 
              value={filterStatus} 
              onChange={e => setFilterStatus(e.target.value)}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="all">All Items</option>
              <option value="in">In Stock Only</option>
              <option value="out">Out of Stock Only</option>
            </select>
          </div>

          <table className="admin-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '10px' }}>Image</th>
                <th>Name</th>
                <th>SKU</th> 
                <th>Category</th>
                <th>Price</th>
                <th>Stock</th>
                <th>Visibility</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '10px' }}>
                    {product.imageUrl ? (
                      <div style={{ position: 'relative', width: '50px', height: '50px' }}>
                        <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                        {product.imageGallery && product.imageGallery.length > 0 && (
                          <span style={{ position: 'absolute', bottom: '-5px', right: '-5px', backgroundColor: '#3182ce', color: 'white', fontSize: '0.6rem', padding: '2px 4px', borderRadius: '4px', fontWeight: 'bold' }}>
                            +{product.imageGallery.length}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span style={{ color: '#aaa' }}>No image</span>
                    )}
                  </td>
                  <td>{product.name}</td>
                  <td>{product.sku}</td> 
                  <td>{product.category}</td>
                  <td>${product.price?.toFixed(2)}</td>
                  <td>{product.stockQuantity}</td>
                  <td>{product.isHidden ? '🙈 Hidden' : '👁️ Visible'}</td>
                  <td>
                    <button onClick={() => editProduct(product)} style={{ marginRight: '5px' }}>Edit</button>
                    {/* 🚀 FIXED: Button says Delete, matches standard UI */}
                    <button 
                      onClick={() => deleteProduct(product.id)} 
                      style={{ background: '#e53e3e', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '1rem', color: '#718096' }}>
                    No products match your search/filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'orders' && (
        <div>
          <table className="admin-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', backgroundColor: 'white' }}>
            <thead>
              <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px' }}>Order ID</th>
                <th>Date</th>
                <th>Customer</th>
                <th>Total</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(order => (
                <tr key={order.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>#{order.orderTrackingNumber || order.id}</td>
                  <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                  <td>{order.user?.username || "Unknown"}</td>
                  <td style={{ fontWeight: 'bold' }}>${order.totalAmount?.toFixed(2)}</td>
                  <td>
                    <span style={{ 
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.8rem', fontWeight: 'bold',
                        backgroundColor: order.status === 'PAID' ? '#ebf8ff' : order.status === 'SHIPPED' ? '#faf089' : order.status === 'DELIVERED' ? '#c6f6d5' : '#fed7d7',
                        color: order.status === 'PAID' ? '#2b6cb0' : order.status === 'SHIPPED' ? '#744210' : order.status === 'DELIVERED' ? '#22543d' : '#822727'
                      }}>
                      {order.status}
                    </span>
                  </td>
                  <td>
                    <button 
                      onClick={() => openOrderModal(order)}
                      style={{ backgroundColor: '#2d3748', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
                    >
                      Manage
                    </button>
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                    No orders have been placed yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'reviews' && (
        <div>
          <table className="admin-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', backgroundColor: 'white' }}>
            <thead>
              <tr style={{ backgroundColor: '#f7fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '12px' }}>Date</th>
                <th>Customer</th>
                <th>Product</th>
                <th>Rating</th>
                <th>Comment</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {allReviews.map(review => (
                <tr key={review.id} style={{ borderBottom: '1px solid #edf2f7' }}>
                  <td style={{ padding: '12px', color: '#718096', fontSize: '0.9rem' }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ fontWeight: 'bold', color: '#2d3748' }}>{review.username}</td>
                  <td style={{ color: '#2b6cb0', fontWeight: 'bold' }}>{review.productName}</td>
                  <td>
                    <span style={{ color: '#ecc94b', fontSize: '1.2rem' }}>
                      {'★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)}
                    </span>
                  </td>
                  <td style={{ maxWidth: '300px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {review.comment}
                  </td>
                  <td>
                    <button 
                      onClick={() => handleDeleteReview(review.id)}
                      style={{ backgroundColor: '#e53e3e', color: 'white', padding: '6px 12px', borderRadius: '4px', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold' }}
                    >
                      🗑️ Delete
                    </button>
                  </td>
                </tr>
              ))}
              {allReviews.length === 0 && (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '2rem', color: '#718096' }}>
                    No reviews found across the store.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {selectedOrder && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000 }}>
          <div style={{ backgroundColor: '#f7fafc', width: '90%', maxWidth: '900px', maxHeight: '90vh', overflowY: 'auto', borderRadius: '8px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', backgroundColor: 'white', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
              <h2 style={{ margin: 0 }}>Order #{selectedOrder.orderTrackingNumber || selectedOrder.id}</h2>
              <button onClick={() => setSelectedOrder(null)} style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#a0aec0' }}>✖</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', padding: '1.5rem' }}>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid #edf2f7', paddingBottom: '0.5rem' }}>Items</h3>
                  <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {selectedOrder.items?.map(item => (
                      <li key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                          <span style={{ fontWeight: 'bold' }}>{item.quantity}x</span> {item.product?.name}
                        </div>
                        <div style={{ color: '#4a5568' }}>${(item.priceAtPurchase * item.quantity).toFixed(2)}</div>
                      </li>
                    ))}
                  </ul>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #edf2f7', fontWeight: 'bold', fontSize: '1.2rem' }}>
                    <span>Total Paid:</span>
                    <span style={{ color: '#2b6cb0' }}>${selectedOrder.totalAmount?.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid #edf2f7', paddingBottom: '0.5rem' }}>Customer</h3>
                  <p style={{ margin: '0 0 5px 0', fontWeight: 'bold' }}>{selectedOrder.user?.username || "Unknown User"}</p>
                  <p style={{ margin: 0, color: '#718096', fontSize: '0.9rem' }}>User ID: {selectedOrder.user?.id}</p>
                </div>

                <div style={{ backgroundColor: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)', borderTop: '4px solid #3182ce' }}>
                  <h3 style={{ margin: '0 0 1rem 0', borderBottom: '1px solid #edf2f7', paddingBottom: '0.5rem' }}>Fulfillment</h3>
                  
                  <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.9rem', fontWeight: 'bold', color: '#4a5568' }}>Update Status</label>
                  <select 
                    value={selectedOrder.status} 
                    onChange={(e) => {
                      const updatedOrder = { ...selectedOrder, status: e.target.value };
                      setSelectedOrder(updatedOrder);
                    }}
                    style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid #cbd5e0', marginBottom: '1rem', fontWeight: 'bold' }}
                  >
                    <option value="PAID">PAID (Processing)</option>
                    <option value="SHIPPED">SHIPPED</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>

                  {(selectedOrder.status === 'SHIPPED' || selectedOrder.status === 'DELIVERED') && (
                    <div style={{ backgroundColor: '#f7fafc', padding: '10px', borderRadius: '4px', border: '1px solid #e2e8f0', marginBottom: '1rem' }}>
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 'bold' }}>Courier (FedEx, UPS)</label>
                      <input 
                        type="text" 
                        value={shippingInputs.carrier}
                        onChange={(e) => setShippingInputs({...shippingInputs, carrier: e.target.value})}
                        placeholder="e.g. FedEx"
                        style={{ width: '100%', padding: '8px', marginBottom: '10px', border: '1px solid #cbd5e0', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                      
                      <label style={{ display: 'block', marginBottom: '5px', fontSize: '0.85rem', fontWeight: 'bold' }}>Tracking Number</label>
                      <input 
                        type="text" 
                        value={shippingInputs.trackingNumber}
                        onChange={(e) => setShippingInputs({...shippingInputs, trackingNumber: e.target.value})}
                        placeholder="1Z999999999..."
                        style={{ width: '100%', padding: '8px', border: '1px solid #cbd5e0', borderRadius: '4px', boxSizing: 'border-box' }}
                      />
                    </div>
                  )}

                  <button 
                    onClick={() => saveOrderStatus(selectedOrder.status)} 
                    style={{ width: '100%', backgroundColor: '#3182ce', color: 'white', padding: '10px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                  >
                    Confirm & Save Changes
                  </button>
                </div>

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
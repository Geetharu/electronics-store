import { useState } from 'react';

function AdminDashboard({ products, onProductAction }) {
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(null); 
  const [formData, setFormData] = useState({ name: '', price: '', category: '', stockQuantity: '', sku: '', isHidden: false });
  
  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState('ALL'); // 🎛️ Filter State

  const resetForm = () => {
    setFormData({ name: '', price: '', category: '', stockQuantity: '', sku: '', isHidden: false });
    setShowForm(false);
    setIsEditing(null);
  };

  const handleEditClick = (product) => {
    setIsEditing(product.id);
    setFormData({ ...product });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    const method = isEditing ? 'PUT' : 'POST';
    const url = isEditing 
      ? `http://localhost:8080/api/products/${isEditing}` 
      : 'http://localhost:8080/api/products';

    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity),
      sku: formData.sku || `SKU-${Date.now()}`
    };

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        resetForm();
        onProductAction(); 
      } else {
        alert("❌ Action failed.");
      }
    } catch (err) {
      console.error("Error saving product:", err);
    }
  };

  const handleClearStock = async (product) => {
    if (!window.confirm(`⚠️ Mark ${product.name} as Out of Stock?`)) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...product, stockQuantity: 0 })
      });
      if (response.ok) onProductAction();
    } catch (err) { console.error(err); }
  };

  // 🙈 NEW: Toggle Hide from Customer
  const handleToggleHide = async (product) => {
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/api/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ ...product, isHidden: !product.isHidden })
      });
      if (response.ok) onProductAction();
    } catch (err) { console.error(err); }
  };

  const handleDelete = async (productId) => {
    if (!window.confirm("⚠️ Are you sure? This deletes the item entirely.")) return;
    const token = localStorage.getItem('token');
    try {
      const response = await fetch(`http://localhost:8080/api/products/${productId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) onProductAction();
    } catch (err) { console.error(err); }
  };

  // 🔍 Filter Logic (Search + Stock Status)
  const filteredAdminProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      p.sku.toLowerCase().includes(adminSearchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(adminSearchTerm.toLowerCase());

    const matchesStock = 
      stockFilter === 'ALL' || 
      (stockFilter === 'IN_STOCK' && p.stockQuantity > 0) || 
      (stockFilter === 'OUT_OF_STOCK' && p.stockQuantity === 0);

    return matchesSearch && matchesStock;
  });

  return (
    <div className="admin-dashboard" style={{ padding: '2rem', backgroundColor: '#f7fafc', minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ margin: 0 }}>Inventory Management ⚙️</h2>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <input 
            type="text" 
            placeholder="🔍 Search Name, SKU, Category..." 
            value={adminSearchTerm}
            onChange={(e) => setAdminSearchTerm(e.target.value)}
            style={{ padding: '10px', width: '250px', borderRadius: '8px', border: '1px solid #cbd5e0' }}
          />
          <select 
            value={stockFilter} 
            onChange={(e) => setStockFilter(e.target.value)}
            style={{ padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e0', cursor: 'pointer' }}
          >
            <option value="ALL">All Stock</option>
            <option value="IN_STOCK">In Stock (>0)</option>
            <option value="OUT_OF_STOCK">Out of Stock (0)</option>
          </select>
        </div>

        <button className="login-btn" onClick={() => { if(showForm) resetForm(); else setShowForm(true); }}>
          {showForm ? "Cancel" : "＋ Add New Product"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="login-form" style={{ maxWidth: '500px', margin: '0 auto 2rem', background: 'white', padding: '20px', borderRadius: '12px' }}>
          <h3>{isEditing ? "Edit Product" : "New Product Details"}</h3>
          <input type="text" placeholder="Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input type="text" placeholder="SKU" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
          <input type="number" step="0.01" placeholder="Price" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          <input type="text" placeholder="Category" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
          <input type="number" placeholder="Stock" required value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} />
          <button type="submit" className="login-btn" style={{ width: '100%', marginTop: '10px' }}>
            {isEditing ? "Update Product" : "Save to Database"}
          </button>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '10px' }}>
        <thead style={{ backgroundColor: '#4a5568', color: 'white' }}>
          <tr>
            <th style={{ padding: '15px' }}>Status</th>
            <th>SKU</th>
            <th>Name</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredAdminProducts.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #edf2f7', textAlign: 'center', opacity: p.isHidden ? 0.6 : 1 }}>
              <td style={{ fontSize: '1.2rem' }}>{p.isHidden ? '🙈' : '👁️'}</td>
              <td style={{ padding: '12px', color: '#718096' }}>{p.sku}</td>
              <td style={{ fontWeight: '500' }}>{p.name} {p.isHidden && <span style={{fontSize: '0.7rem', color: 'red', display: 'block'}}>Hidden</span>}</td>
              <td>${p.price.toFixed(2)}</td>
              <td style={{ color: p.stockQuantity < 1 ? 'red' : 'green', fontWeight: 'bold' }}>{p.stockQuantity}</td>
              <td>
                <button onClick={() => handleToggleHide(p)} title={p.isHidden ? "Show to Customers" : "Hide from Customers"} style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px', fontSize: '1.2rem' }}>
                  {p.isHidden ? '👁️' : '🙈'}
                </button>
                <button onClick={() => handleEditClick(p)} title="Edit Product" style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px', fontSize: '1.2rem' }}>✏️</button>
                <button onClick={() => handleClearStock(p)} title="Set Stock to 0" style={{ background: 'none', border: 'none', cursor: 'pointer', marginRight: '10px', fontSize: '1.2rem' }}>📦↘️0</button>
                <button onClick={() => handleDelete(p.id)} title="Delete Entirely" style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}>🗑️</button>
              </td>
            </tr>
          ))}
          {filteredAdminProducts.length === 0 && (
            <tr><td colSpan="6" style={{ padding: '2rem', color: '#a0aec0' }}>No products found.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
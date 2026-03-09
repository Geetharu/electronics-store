import { useState } from 'react';

function AdminDashboard({ products, onProductAction }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ 
    name: '', 
    price: '', 
    category: '', 
    stockQuantity: '',
    sku: '' // ⬅️ Added this
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');
    
    // Ensure numbers are sent as numbers, not strings
    const payload = {
      ...formData,
      price: parseFloat(formData.price),
      stockQuantity: parseInt(formData.stockQuantity),
      // Auto-generate SKU if empty (Product-RandomNumber)
      sku: formData.sku || `SKU-${Date.now()}` 
    };

    try {
      const response = await fetch('http://localhost:8080/api/products', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert("✅ Product added successfully!");
        setFormData({ name: '', price: '', category: '', stockQuantity: '', sku: '' });
        setShowForm(false);
        onProductAction(); 
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.message || "Check console"}`);
      }
    } catch (err) {
      console.error("Error adding product:", err);
    }
  };

  return (
    <div className="admin-dashboard" style={{ padding: '2rem', backgroundColor: '#f7fafc' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2>Inventory Management ⚙️</h2>
        <button className="login-btn" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "＋ Add New Product"}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleSubmit} className="login-form" style={{ maxWidth: '500px', margin: '0 auto 2rem', padding: '1.5rem', background: 'white', borderRadius: '10px' }}>
          <h3>New Product Details</h3>
          <input type="text" placeholder="Product Name" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          <input type="text" placeholder="SKU (e.g. LAP-001)" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
          <input type="number" step="0.01" placeholder="Price" required value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
          <input type="text" placeholder="Category" required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
          <input type="number" placeholder="Stock Quantity" required value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} />
          <button type="submit" className="login-btn">Save Product</button>
        </form>
      )}

      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
        <thead style={{ backgroundColor: '#2d3748', color: 'white' }}>
          <tr>
            <th style={{ padding: '1rem' }}>SKU</th>
            <th>Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map(p => (
            <tr key={p.id} style={{ borderBottom: '1px solid #edf2f7', textAlign: 'center' }}>
              <td style={{ padding: '0.8rem', fontSize: '0.8rem', color: '#718096' }}>{p.sku}</td>
              <td>{p.name}</td>
              <td>{p.category}</td>
              <td>${p.price}</td>
              <td>{p.stockQuantity}</td>
              <td>
                <button style={{ background: 'none', border: 'none', cursor: 'pointer' }}>✏️</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AdminDashboard;
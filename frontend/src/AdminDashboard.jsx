import { useState } from 'react';

export default function AdminDashboard({ products, onProductAction }) {
  const [formData, setFormData] = useState({
    name: '', sku: '', price: '', stockQuantity: '', category: '', isHidden: false, imageUrl: ''
  });
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false); 
  
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); 
  
  const token = localStorage.getItem('token');

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setIsUploading(true);
    const data = new FormData();
    data.append('file', file);
    data.append('upload_preset', 'Item_info'); 
    data.append('cloud_name', 'ddfk6oj09');       

    try {
      const response = await fetch('https://api.cloudinary.com/v1_1/ddfk6oj09/image/upload', {
        method: 'POST',
        body: data,
      });
      const uploadedData = await response.json();
      
      setFormData(prev => ({ ...prev, imageUrl: uploadedData.secure_url }));
    } catch (error) {
      console.error("Image upload failed:", error);
      alert("Failed to upload image.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const url = editingId 
      ? `http://localhost:8080/api/products/${editingId}` 
      : 'http://localhost:8080/api/products';
    const method = editingId ? 'PUT' : 'POST';

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
        setFormData({ name: '', sku: '', price: '', stockQuantity: '', category: '', isHidden: false, imageUrl: '' });
        setEditingId(null);
        onProductAction(); 
      }
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  const editProduct = (product) => {
    setFormData(product);
    setEditingId(product.id);
  };

  const deleteProduct = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await fetch(`http://localhost:8080/api/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      onProductAction();
    } catch (error) {
      console.error("Failed to delete product:", error);
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

  return (
    <div className="admin-dashboard">
      <h2>⚙️ Inventory Management</h2>
      
      <form onSubmit={handleSubmit} className="admin-form" style={{ display: 'grid', gap: '10px', maxWidth: '500px', marginBottom: '2rem' }}>
        <input type="text" placeholder="Product Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
        <input type="text" placeholder="SKU" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} required />
        <input type="number" placeholder="Price" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} required step="0.01" />
        <input type="number" placeholder="Stock Quantity" value={formData.stockQuantity} onChange={e => setFormData({...formData, stockQuantity: e.target.value})} required />
        <input type="text" placeholder="Category" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} required />
        
        <div style={{ border: '1px dashed #ccc', padding: '10px', borderRadius: '4px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Product Image:</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} disabled={isUploading} />
          {isUploading && <span style={{ marginLeft: '10px', color: '#3182ce' }}>Uploading to cloud... ⏳</span>}
          {formData.imageUrl && (
            <div style={{ marginTop: '10px' }}>
              <img src={formData.imageUrl} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '4px' }} />
              <button type="button" onClick={() => setFormData({...formData, imageUrl: ''})} style={{ display: 'block', marginTop: '5px', color: 'red', cursor: 'pointer', background: 'none', border: 'none' }}>Remove Image</button>
            </div>
          )}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <input type="checkbox" checked={formData.isHidden} onChange={e => setFormData({...formData, isHidden: e.target.checked})} />
          🙈 Hide from public store
        </label>
        
        <button type="submit" disabled={isUploading}>
          {editingId ? 'Update Product' : 'Add Product'}
        </button>
        {editingId && <button type="button" onClick={() => {setFormData({name: '', sku: '', price: '', stockQuantity: '', category: '', isHidden: false, imageUrl: ''}); setEditingId(null);}}>Cancel Edit</button>}
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
          <tr>
            <th>Image</th>
            <th>Name</th>
            <th>SKU</th> {/* Restored SKU Header */}
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Visibility</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredProducts.map(product => (
            <tr key={product.id} style={{ borderBottom: '1px solid #eee' }}>
              <td>
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '4px' }} />
                ) : (
                  <span style={{ color: '#aaa' }}>No image</span>
                )}
              </td>
              <td>{product.name}</td>
              <td>{product.sku}</td> {/* Restored SKU Cell */}
              <td>{product.category}</td>
              <td>${product.price?.toFixed(2)}</td>
              <td>{product.stockQuantity}</td>
              <td>{product.isHidden ? '🙈 Hidden' : '👁️ Visible'}</td>
              <td>
                <button onClick={() => editProduct(product)} style={{ marginRight: '5px' }}>Edit</button>
                <button onClick={() => deleteProduct(product.id)} style={{ background: '#e53e3e', color: 'white' }}>Delete</button>
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
  );
}
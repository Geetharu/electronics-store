import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // 🚀 NEW: Import navigation

export default function UserProfile() {
  const navigate = useNavigate(); // 🚀 NEW: Setup navigation
  const [profile, setProfile] = useState({
    username: '', phone: '', address: '', city: '', postalCode: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const token = sessionStorage.getItem('token');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setProfile({
            username: data.username || '',
            phone: data.phone || '',
            address: data.address || '',
            city: data.city || '',
            postalCode: data.postalCode || ''
          });
        }
      } catch (error) {
        console.error("Failed to fetch profile:", error);
      }
    };
    fetchProfile();
  }, [token]);

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(profile)
      });
      
      if (response.ok) {
        setIsEditing(false);
        alert("✅ Profile updated securely!");
      } else {
        alert("Failed to update profile.");
      }
    } catch (error) {
      console.error("Save error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '2rem auto', padding: '0 1rem' }}>
      
      {/* 🚀 NEW: Clean Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        style={{ background: 'none', border: 'none', color: '#4a5568', cursor: 'pointer', fontWeight: 'bold', fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '5px', padding: 0 }}
      >
        ← Back
      </button>

      <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #edf2f7', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
          <h2 style={{ margin: 0, color: '#2d3748' }}>👤 My Profile</h2>
          
          {/* 🚀 UX FIX: Made the Edit button pop! */}
          {!isEditing && (
            <button 
              onClick={() => setIsEditing(true)} 
              style={{ backgroundColor: '#3182ce', color: 'white', padding: '8px 16px', borderRadius: '6px', border: 'none', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(49,130,206,0.3)', transition: 'background-color 0.2s' }}
            >
              ✏️ Edit Info
            </button>
          )}
        </div>

        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a5568' }}>Email / Username</label>
            <input 
              type="text" 
              value={profile.username} 
              disabled 
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: '#edf2f7', color: '#a0aec0', boxSizing: 'border-box' }} 
            />
            <small style={{ color: '#a0aec0', display: 'block', marginTop: '4px' }}>Your login email cannot be changed.</small>
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a5568' }}>Phone Number</label>
            <input 
              type="tel" 
              value={profile.phone} 
              onChange={(e) => setProfile({...profile, phone: e.target.value})}
              disabled={!isEditing}
              placeholder={isEditing ? "e.g. +1 555-0192" : ""}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box', backgroundColor: isEditing ? 'white' : '#f7fafc', color: isEditing ? '#2d3748' : '#718096' }} 
            />
          </div>

          <div>
            <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a5568' }}>Street Address</label>
            <input 
              type="text" 
              value={profile.address} 
              onChange={(e) => setProfile({...profile, address: e.target.value})}
              disabled={!isEditing}
              placeholder={isEditing ? "123 Tech Lane, Apt 4" : ""}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box', backgroundColor: isEditing ? 'white' : '#f7fafc', color: isEditing ? '#2d3748' : '#718096' }} 
            />
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a5568' }}>City</label>
              <input 
                type="text" 
                value={profile.city} 
                onChange={(e) => setProfile({...profile, city: e.target.value})}
                disabled={!isEditing}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box', backgroundColor: isEditing ? 'white' : '#f7fafc', color: isEditing ? '#2d3748' : '#718096' }} 
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#4a5568' }}>Postal Code</label>
              <input 
                type="text" 
                value={profile.postalCode} 
                onChange={(e) => setProfile({...profile, postalCode: e.target.value})}
                disabled={!isEditing}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e0', boxSizing: 'border-box', backgroundColor: isEditing ? 'white' : '#f7fafc', color: isEditing ? '#2d3748' : '#718096' }} 
              />
            </div>
          </div>

          {isEditing && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '1rem', paddingTop: '1rem', borderTop: '1px solid #edf2f7' }}>
              <button 
                type="button" 
                onClick={() => setIsEditing(false)}
                style={{ flex: 1, padding: '12px', borderRadius: '6px', border: '1px solid #cbd5e0', backgroundColor: 'white', color: '#4a5568', fontWeight: 'bold', cursor: 'pointer', transition: 'background-color 0.2s' }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                disabled={isSaving}
                style={{ flex: 2, padding: '12px', borderRadius: '6px', border: 'none', backgroundColor: '#38a169', color: 'white', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 2px 4px rgba(56,161,105,0.3)' }}
              >
                {isSaving ? 'Saving...' : '💾 Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
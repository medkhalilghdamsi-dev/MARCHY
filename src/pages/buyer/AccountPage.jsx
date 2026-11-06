import { useState } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../../data/products'
import { sellers } from '../../data/sellers'
import { money, readJson, writeJson } from '../../utils/marketplace'
import { translateTree } from '../../i18n/translate'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { useToast } from '../../providers/ToastProvider'
import { useDemoOrders } from '../../hooks/useDemoOrders'
import {
  Bell, Check, Edit3, Heart, MapPin, Package, Plus, RotateCcw,
  ShieldCheck, ShoppingCart, Trash2, User, UserCheck
} from 'lucide-react'

export function AccountPage() {
  const { cart, wishlist, addToCart, language } = useMarketplace()
  const { orders } = useDemoOrders()
  const toast = useToast()

  const cartItems = cart.reduce((sum, item) => sum + item.qty, 0)
  const savedProducts = products.filter(p => wishlist.includes(p.id)).slice(0, 4)

  const [authUser, setAuthUser] = useState(() => readJson('marchy-auth-user', {
    name: 'Amira Ben Salem',
    email: 'amira.bensalem@marchy.tn',
    phone: '+216 98 123 456',
    governorate: 'Tunis',
    isLoggedIn: true
  }))

  const [editingProfile, setEditingProfile] = useState(false)
  const [profileForm, setProfileForm] = useState({
    name: authUser?.name || 'Amira Ben Salem',
    email: authUser?.email || 'amira.bensalem@marchy.tn',
    phone: authUser?.phone || '+216 98 123 456',
    governorate: authUser?.governorate || 'Tunis'
  })

  // Address book logic
  const [addresses, setAddresses] = useState(() => readJson('marchy-saved-addresses', [
    {
      id: 'addr-1',
      title: 'Home (Tunis Center)',
      name: 'Amira Ben Salem',
      phone: '+216 98 123 456',
      governorate: 'Tunis',
      street: '14 Rue de Marseille, Apt 4B',
      isDefault: true
    },
    {
      id: 'addr-2',
      title: 'Office / Atelier',
      name: 'Amira Ben Salem',
      phone: '+216 22 999 888',
      governorate: 'Ariana',
      street: 'Centre Urbain Nord, Immeuble Horizon',
      isDefault: false
    }
  ]))

  const [newAddrOpen, setNewAddrOpen] = useState(false)
  const [newAddr, setNewAddr] = useState({
    title: '',
    name: authUser?.name || '',
    phone: authUser?.phone || '+216 ',
    governorate: 'Tunis',
    street: '',
    isDefault: false
  })

  const [recentIds, setRecentIds] = useState(() => readJson('marchy-recently-viewed', []))
  const recentProducts = recentIds.map(id => products.find(p => p.id === id)).filter(Boolean).slice(0, 4)
  const clearRecentlyViewed = () => {
    writeJson('marchy-recently-viewed', [])
    setRecentIds([])
    toast('Browsing history cleared', { type: 'info' })
  }

  const resetProfileForm = () => setProfileForm({
    name: authUser?.name || '',
    email: authUser?.email || '',
    phone: authUser?.phone || '',
    governorate: authUser?.governorate || 'Tunis'
  })

  const handleSaveProfile = (e) => {
    e.preventDefault()
    const cleaned = Object.fromEntries(
      Object.entries(profileForm).map(([key, value]) => [key, value.trim()])
    )
    if (!cleaned.name || !cleaned.email || !cleaned.phone) {
      toast('Complete your name, email and phone number.', { type: 'error' })
      return
    }
    const updated = {
      ...(authUser || {}),
      ...cleaned,
      isLoggedIn: Boolean(authUser?.isLoggedIn)
    }
    setAuthUser(updated)
    writeJson('marchy-auth-user', updated)
    setEditingProfile(false)
    toast('Profile updated successfully!', { type: 'success' })
  }

  const handleLogout = () => {
    writeJson('marchy-auth-user', null)
    setAuthUser(null)
    setEditingProfile(false)
    resetProfileForm()
    toast('Local demo profile signed out.', { type: 'info' })
  }

  const handleAddAddress = (e) => {
    e.preventDefault()
    if (!newAddr.street.trim()) return
    const id = `addr-${Date.now()}`
    const created = {
      ...newAddr,
      id,
      title: newAddr.title || `${newAddr.governorate} Address`
    }
    const updated = newAddr.isDefault
      ? [...addresses.map(a => ({ ...a, isDefault: false })), created]
      : [...addresses, created]
    setAddresses(updated)
    writeJson('marchy-saved-addresses', updated)
    setNewAddrOpen(false)
    setNewAddr({ title: '', name: authUser?.name || '', phone: '+216 ', governorate: 'Tunis', street: '', isDefault: false })
    toast('Delivery address saved!', { type: 'success' })
  }

  const handleDeleteAddress = (addrId) => {
    const remaining = addresses.filter(a => a.id !== addrId)
    const hadDefault = addresses.some(a => a.id === addrId && a.isDefault)
    const updated = hadDefault && remaining.length > 0
      ? remaining.map((address, index) => ({ ...address, isDefault: index === 0 }))
      : remaining
    setAddresses(updated)
    writeJson('marchy-saved-addresses', updated)
    toast('Address removed', { type: 'info' })
  }

  const handleSetDefaultAddress = (addrId) => {
    const updated = addresses.map(a => ({ ...a, isDefault: a.id === addrId }))
    setAddresses(updated)
    writeJson('marchy-saved-addresses', updated)
    toast('Default delivery address updated', { type: 'success' })
  }

  const handleMoveAllWishlistToCart = () => {
    if (savedProducts.length === 0) return
    savedProducts.forEach(prod => {
      addToCart(prod, 1, 'Standard Edition')
    })
    toast(`Moved ${savedProducts.length} wishlist items to your cart!`, { type: 'success' })
  }

  return translateTree(
    <main id="main-content" className="shell page account-page">
      <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb">
        <Link to="/">Home</Link> / <span>Account</span>
      </div>

      {/* Account Header */}
      <section className="account-welcome">
        <div>
          <span className="eyebrow">BUYER ACCOUNT · TUNISIA</span>
          <h1>Welcome, {authUser?.name || 'Customer'}.</h1>
          <p>
            Manage your profile details, delivery addresses, orders and saved products in one place.
          </p>
        </div>
        <div className="account-guest-status">
          <span className="account-guest-avatar">
            {(authUser?.name || 'A').slice(0, 1).toUpperCase()}
          </span>
          <div>
            <b>{authUser?.name || 'Guest User'}</b>
            <small>{authUser?.email || 'guest@marchy.tn'}</small>
            <span className="demo-label">LOCAL DEMO PROFILE</span>
          </div>
        </div>
      </section>

      {/* Profile Overview Card with Inline Edit Mode */}
      <section className="account-profile-card">
        <div className="profile-card-header">
          <div>
            <span className="eyebrow">YOUR PROFILE DATA</span>
            <h2>Account Information</h2>
          </div>
          <button
            type="button"
            className="outline-btn"
            onClick={() => { if (editingProfile) resetProfileForm(); setEditingProfile(v => !v) }}
          >
            {editingProfile ? 'Cancel' : <><Edit3 size={14} /> Edit Profile</>}
          </button>
        </div>

        {editingProfile ? (
          <form className="profile-edit-form" onSubmit={handleSaveProfile}>
            <div className="form-fields-grid">
              <label>
                Full Name
                <input
                  type="text"
                  required
                  value={profileForm.name}
                  onChange={e => setProfileForm({ ...profileForm, name: e.target.value })}
                />
              </label>
              <label>
                Email Address
                <input
                  type="email"
                  required
                  value={profileForm.email}
                  onChange={e => setProfileForm({ ...profileForm, email: e.target.value })}
                />
              </label>
              <label>
                Phone Number
                <input
                  type="tel"
                  required
                  value={profileForm.phone}
                  onChange={e => setProfileForm({ ...profileForm, phone: e.target.value })}
                />
              </label>
              <label>
                Default Governorate
                <select
                  value={profileForm.governorate}
                  onChange={e => setProfileForm({ ...profileForm, governorate: e.target.value })}
                >
                  <option value="Tunis">Tunis (Grand Tunis)</option>
                  <option value="Ariana">Ariana</option>
                  <option value="Ben Arous">Ben Arous</option>
                  <option value="Manouba">Manouba</option>
                  <option value="Sousse">Sousse</option>
                  <option value="Sfax">Sfax</option>
                  <option value="Nabeul">Nabeul</option>
                  <option value="Bizerte">Bizerte</option>
                  <option value="Monastir">Monastir</option>
                  <option value="Gabès">Gabès</option>
                </select>
              </label>
            </div>
            <div className="form-actions-row">
              <button type="submit" className="primary-btn">Save Changes</button>
              <button type="button" className="outline-btn" onClick={() => { resetProfileForm(); setEditingProfile(false) }}>Cancel</button>
            </div>
          </form>
        ) : (
          <div className="profile-view-grid">
            <div>
              <small>FULL NAME</small>
              <b>{authUser?.name}</b>
            </div>
            <div>
              <small>EMAIL</small>
              <b>{authUser?.email}</b>
            </div>
            <div>
              <small>CONTACT PHONE</small>
              <b>{authUser?.phone}</b>
            </div>
            <div>
              <small>GOVERNORATE</small>
              <b>{authUser?.governorate || 'Tunis'}</b>
            </div>
          </div>
        )}
      </section>

      {/* Overview Stat Cards */}
      <div className="account-overview-grid">
        <Link to="/orders" className="account-overview-card">
          <span className="account-overview-icon">📦</span>
          <span>
            <small>MY ORDERS</small>
            <b>{orders.length}</b>
            <em>Track packages</em>
          </span>
          <i>→</i>
        </Link>
        <Link to="/cart" className="account-overview-card">
          <span className="account-overview-icon">🛒</span>
          <span>
            <small>ACTIVE BASKET</small>
            <b>{cartItems}</b>
            <em>Items in cart</em>
          </span>
          <i>→</i>
        </Link>
        <Link to="/wishlist" className="account-overview-card">
          <span className="account-overview-icon">♡</span>
          <span>
            <small>SAVED WISHLIST</small>
            <b>{wishlist.length}</b>
            <em>Items saved</em>
          </span>
          <i>→</i>
        </Link>
        <Link to="/sellers" className="account-overview-card">
          <span className="account-overview-icon">🏪</span>
          <span>
            <small>LOCAL MAKERS</small>
            <b>{sellers.length}</b>
            <em>Verified shops</em>
          </span>
          <i>→</i>
        </Link>
      </div>

      {/* Main Content Grid: Saved Addresses & Recent Orders */}
      <div className="account-content-grid">
        {/* Saved Addresses Book */}
        <section className="account-panel">
          <div className="account-panel-heading">
            <div>
              <span className="eyebrow">DELIVERY BOOK</span>
              <h2>Saved Addresses</h2>
              <p>Pre-populates into your checkout for fast dispatch.</p>
            </div>
            <button
              type="button"
              className="outline-btn"
              onClick={() => setNewAddrOpen(v => !v)}
            >
              {newAddrOpen ? 'Close' : <><Plus size={14} /> Add Address</>}
            </button>
          </div>

          {newAddrOpen && (
            <form className="add-address-form" onSubmit={handleAddAddress}>
              <h4>Add New Delivery Location</h4>
              <div className="address-inputs-grid">
                <label>
                  Label (e.g. Home, Office, Beach House)
                  <input
                    type="text"
                    required
                    placeholder="Home / Work"
                    value={newAddr.title}
                    onChange={e => setNewAddr({ ...newAddr, title: e.target.value })}
                  />
                </label>
                <label>
                  Recipient Full Name
                  <input
                    type="text"
                    required
                    value={newAddr.name}
                    onChange={e => setNewAddr({ ...newAddr, name: e.target.value })}
                  />
                </label>
                <label>
                  Phone Number
                  <input
                    type="tel"
                    required
                    value={newAddr.phone}
                    onChange={e => setNewAddr({ ...newAddr, phone: e.target.value })}
                  />
                </label>
                <label>
                  Governorate
                  <select
                    value={newAddr.governorate}
                    onChange={e => setNewAddr({ ...newAddr, governorate: e.target.value })}
                  >
                    <option value="Tunis">Tunis (Grand Tunis)</option>
                    <option value="Ariana">Ariana</option>
                    <option value="Ben Arous">Ben Arous</option>
                    <option value="Manouba">Manouba</option>
                    <option value="Sousse">Sousse</option>
                    <option value="Sfax">Sfax</option>
                    <option value="Nabeul">Nabeul</option>
                    <option value="Bizerte">Bizerte</option>
                    <option value="Monastir">Monastir</option>
                    <option value="Gabès">Gabès</option>
                  </select>
                </label>
                <label className="field-full">
                  Street Address & Apartment
                  <input
                    type="text"
                    required
                    placeholder="Street, building number, landmark..."
                    value={newAddr.street}
                    onChange={e => setNewAddr({ ...newAddr, street: e.target.value })}
                  />
                </label>
                <label className="field-checkbox">
                  <input
                    type="checkbox"
                    checked={newAddr.isDefault}
                    onChange={e => setNewAddr({ ...newAddr, isDefault: e.target.checked })}
                  />
                  Set as default shipping address
                </label>
              </div>
              <button type="submit" className="primary-btn">Save Address</button>
            </form>
          )}

          <div className="saved-addresses-list">
            {addresses.length === 0 ? (
              <div className="account-address-empty"><MapPin size={22} /><b>No saved delivery addresses</b><p>Add an address to make future demo checkouts quicker.</p><button type="button" className="text-link" onClick={() => setNewAddrOpen(true)}>Add your first address</button></div>
            ) : addresses.map(addr => (
              <div key={addr.id} className={`address-card ${addr.isDefault ? 'is-default' : ''}`}>
                <div className="address-card-top">
                  <b>{addr.title}</b>
                  {addr.isDefault && <span className="default-pill">Default</span>}
                </div>
                <p><strong>{addr.name}</strong> · {addr.phone}</p>
                <p>{addr.street}, {addr.governorate}, Tunisia</p>
                <div className="address-actions-row">
                  {!addr.isDefault && (
                    <button
                      type="button"
                      className="text-link"
                      onClick={() => handleSetDefaultAddress(addr.id)}
                    >
                      Make default
                    </button>
                  )}
                  <button
                    type="button"
                    className="text-link danger-link"
                    onClick={() => handleDeleteAddress(addr.id)}
                  >
                    <Trash2 size={13} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Orders Overview */}
        <aside className="account-panel account-activity-panel">
          <div className="account-panel-heading">
            <div>
              <span className="eyebrow">ORDER LOGISTICS</span>
              <h2>Recent Orders</h2>
            </div>
            <Link to="/orders" className="text-link">View all ({orders.length}) →</Link>
          </div>
          <div className="account-demo-orders">
            {orders.length === 0 ? (
              <div className="account-address-empty"><Package size={22} /><b>No orders yet</b><p>Your purchases will appear here after checkout.</p><Link to="/search" className="text-link">Explore products →</Link></div>
            ) : orders.slice(0, 4).map(order => (
              <Link className="account-demo-order" to={`/orders/${order.id}`} key={order.id}>
                <span>
                  <b>{order.id}</b>
                  <small>{order.seller} · {order.city}</small>
                </span>
                <span className={`account-demo-order-status status-${order.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {order.status}
                </span>
                <strong>{money(order.total)}</strong>
              </Link>
            ))}
          </div>
          <div className="account-orders-links">
            <Link to="/orders" className="primary-btn full-btn">Manage & Track All Orders →</Link>
          </div>
        </aside>
      </div>

      {/* Wishlist Section */}
      <section className="account-panel" style={{ marginTop: '24px' }}>
        <div className="account-panel-heading">
          <div>
            <span className="eyebrow">YOUR SHORTLIST</span>
            <h2>Saved Favorites ({wishlist.length})</h2>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            {savedProducts.length > 0 && (
              <button
                type="button"
                className="outline-btn"
                onClick={handleMoveAllWishlistToCart}
              >
                <ShoppingCart size={14} /> Move all to cart
              </button>
            )}
            <Link to="/wishlist" className="text-link">Open wishlist →</Link>
          </div>
        </div>
        {savedProducts.length ? (
          <div className="account-saved-list">
            {savedProducts.map(p => (
              <Link to={`/product/${p.id}`} className="account-saved-item" key={p.id}>
                <img
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }}
                  src={p.image}
                  alt={p.name}
                />
                <span>
                  <b>{p.name}</b>
                  <small>{p.category}</small>
                </span>
                <strong>{money(p.price)}</strong>
              </Link>
            ))}
          </div>
        ) : (
          <div className="account-inline-empty">
            <span>♡</span>
            <b>Your shortlist is empty</b>
            <p>Save items with the heart button while browsing to keep them here.</p>
            <Link to="/search" className="primary-btn">Explore catalogue →</Link>
          </div>
        )}
      </section>

      {/* Recently Viewed History */}
      {recentProducts.length > 0 && (
        <section className="account-recently-viewed" style={{ marginTop: '24px' }}>
          <div className="account-panel-heading">
            <div>
              <span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span>
              <h2>Recently Viewed Items</h2>
              <p>Products you opened in this browser.</p>
            </div>
            <button type="button" className="account-clear-recent" onClick={clearRecentlyViewed}>
              Clear history
            </button>
          </div>
          <div className="account-recent-grid">
            {recentProducts.map(p => (
              <Link to={`/product/${p.id}`} className="account-recent-card" key={p.id}>
                <img
                  src={p.image}
                  alt={p.name}
                  onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }}
                />
                <span>
                  <b>{p.name}</b>
                  <small>{p.category}</small>
                  <strong>{money(p.price)}</strong>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      <p className="account-demo-disclaimer">This account is a frontend prototype. Profile and address changes are saved locally in this browser; authentication, account security and server synchronization are not connected.</p>

      {/* Account Logout / Session Reset */}
      <section className="account-session-footer" style={{ marginTop: '32px', textAlign: 'center' }}>
        <button type="button" className="outline-btn" onClick={handleLogout}>
          Sign out of this session
        </button>
      </section>
    </main>,
    language
  )
}

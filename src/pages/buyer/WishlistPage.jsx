import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { products } from '../../data/products'
import { translateTree } from '../../i18n/translate'
import { ProductCard } from '../../components/marketplace/ProductCard'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { useToast } from '../../providers/ToastProvider'
import { ArrowRight, Heart, ShoppingCart, Trash2 } from 'lucide-react'

export function WishlistPage() {
  const { wishlist, toggleWish, addToCart, language } = useMarketplace()
  const toast = useToast()
  const navigate = useNavigate()
  const [selectedCat, setSelectedCat] = useState('All')

  const allProducts = products
  const saved = allProducts.filter(product => wishlist.includes(product.id))
  const savedCategories = ['All', ...new Set(saved.map(product => product.category))]

  const filtered = selectedCat === 'All'
    ? saved
    : saved.filter(p => p.category === selectedCat)

  const handleMoveAllToCart = () => {
    if (saved.length === 0) return
    saved.forEach(prod => {
      addToCart(prod, 1, 'Standard Edition')
    })
    toast(`Moved ${saved.length} item(s) to your cart!`, { type: 'success' })
    navigate('/cart')
  }

  const handleClearAll = () => {
    if (window.confirm('Clear all items from your saved collection?')) {
      saved.forEach(prod => toggleWish(prod.id))
      toast('Wishlist cleared.', { type: 'info' })
    }
  }

  return translateTree(
    <main id="main-content" className="shell page wishlist-page">
      <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb">
        <Link to="/">Home</Link><span>/</span><span aria-current="page">Saved items</span>
      </div>

      <div className="wishlist-heading">
        <div>
          <span className="eyebrow">YOUR PERSONAL COLLECTION</span>
          <h1>Saved items</h1>
          <p>Organize products you want to buy later with Cash on Delivery protection.</p>
        </div>
        <div className="wishlist-count">
          <strong>{saved.length}</strong>
          <span>saved products</span>
        </div>
      </div>

      {saved.length ? (
        <>
          <div className="wishlist-toolbar">
            <div className="wishlist-category-tabs">
              {savedCategories.map(cat => (
                <button
                  key={cat}
                  type="button"
                  className={`variant-pill ${selectedCat === cat ? 'is-active' : ''}`}
                  onClick={() => setSelectedCat(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="wishlist-action-btns">
              <button
                type="button"
                className="primary-btn"
                onClick={handleMoveAllToCart}
              >
                <ShoppingCart size={15} /> Move All to Cart
              </button>
              <button
                type="button"
                className="outline-btn danger-link"
                onClick={handleClearAll}
              >
                <Trash2 size={15} /> Clear List
              </button>
            </div>
          </div>

          <div className="product-grid wishlist-product-grid">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                addToCart={addToCart}
                wished={true}
                toggleWish={toggleWish}
                language={language}
              />
            ))}
          </div>

          <div className="wishlist-footnote">
            <span><Heart size={18} /></span>
            <p>Your saved list is stored directly on this device. Items remain saved across browsing sessions.</p>
          </div>
        </>
      ) : (
        <div className="wishlist-empty">
          <div className="wishlist-empty-icon">
            <Heart size={30} strokeWidth={1.6} />
          </div>
          <span className="eyebrow">YOUR NEXT FIND IS OUT THERE</span>
          <h2>No saved products yet</h2>
          <p>Tap the heart on any product while exploring to save items to your personal collection.</p>
          <Link to="/search" className="primary-btn">
            Explore the marketplace <ArrowRight size={15} />
          </Link>
        </div>
      )}
    </main>,
    language
  )
}

import { Link } from 'react-router-dom'
import { products } from '../../data/products'
import { translateTree } from '../../i18n/translate'
import { ProductCard } from '../../components/marketplace/ProductCard'
import { useMarketplace } from '../../providers/MarketplaceContext'

export function WishlistPage() {
  const { wishlist, toggleWish, addToCart, language } = useMarketplace()
  const allProducts = products
  const saved = allProducts.filter(product => wishlist.includes(product.id))
  const savedCategories = [...new Set(saved.map(product => product.category))]
  return translateTree(<main id="main-content" className="shell page wishlist-page">
    <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span aria-current="page">Saved items</span></div>
    <div className="wishlist-heading">
      <div><span className="eyebrow">YOUR PERSONAL COLLECTION</span><h1>Saved items</h1><p>Keep the products you're considering in one place.</p></div>
      <div className="wishlist-count"><strong>{saved.length}</strong><span>saved products</span></div>
    </div>
    {saved.length ? <>
      <div className="wishlist-toolbar"><div><b>Your shortlist</b><span>{savedCategories.length} categories</span></div><Link to="/search">Discover more products →</Link></div>
      <div className="product-grid wishlist-product-grid">{saved.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} wished={true} toggleWish={toggleWish} language={language}/>)}</div>
      <div className="wishlist-footnote"><span>♡</span><p>Your saved list stays on this device in this demo. It is not synced between devices or accounts.</p></div>
    </> : <div className="wishlist-empty">
      <div className="wishlist-empty-icon">♡</div><span className="eyebrow">YOUR NEXT FIND IS OUT THERE</span><h2>No saved products yet</h2><p>Tap the heart on any product to save it here while you compare your options.</p><Link to="/search" className="primary-btn">Explore the marketplace →</Link>
    </div>}
  </main>,language)
}


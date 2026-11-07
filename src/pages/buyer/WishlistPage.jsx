import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { products } from '../../data/products'
import { money } from '../../utils/marketplace'
import { translateTree } from '../../i18n/translate'
import { PageFrame } from '../../components/ui/PageFrame'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { useToast } from '../../providers/ToastProvider'
import { MarketplaceService } from '../../services/marketplaceService'
import { ArrowRight, Heart, MapPin, Search, ShoppingCart, Trash2, PackageCheck, AlertCircle, SlidersHorizontal, Store } from 'lucide-react'

export function WishlistPage() {
  const { wishlist, toggleWish, addToCart, language } = useMarketplace()
  const toast = useToast()
  const navigate = useNavigate()
  const [selectedCat, setSelectedCat] = useState('All')
  const [search, setSearch] = useState('')
  const [availability, setAvailability] = useState('all')
  const [sort, setSort] = useState('saved')

  const saved = useMemo(() => products.filter(p => wishlist.includes(p.id)).map(product => {
    const offers = MarketplaceService.getProductOffers(product.id)
    const availableOffers = offers.filter(o => Number(o.stock) > 0).sort((a, b) => Number(a.price) - Number(b.price))
    return { ...product, availableOffers, bestOffer: availableOffers[0] || null }
  }), [wishlist])
  const categories = ['All', ...new Set(saved.map(p => p.category).filter(Boolean))]
  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase()
    let items = saved.filter(p =>
      (selectedCat === 'All' || p.category === selectedCat) &&
      (!term || [p.name, p.category, p.seller, p.description].filter(Boolean).some(v => String(v).toLowerCase().includes(term))) &&
      (availability === 'all' || (availability === 'available' ? !!p.bestOffer : !p.bestOffer))
    )
    if (sort === 'price-low') items = [...items].sort((a,b) => (a.bestOffer?.price ?? Infinity) - (b.bestOffer?.price ?? Infinity))
    if (sort === 'price-high') items = [...items].sort((a,b) => (b.bestOffer?.price ?? -Infinity) - (a.bestOffer?.price ?? -Infinity))
    if (sort === 'name') items = [...items].sort((a,b) => a.name.localeCompare(b.name))
    return items
  }, [saved, search, selectedCat, availability, sort])

  const addOffer = (product, offer) => {
    if (!offer || Number(offer.stock) < 1) return
    addToCart({ ...product, price: offer.price, oldPrice: offer.oldPrice || null, seller: offer.sellerName, sellerSlug: offer.sellerSlug, stock: offer.stock }, 1, null)
    toast(`${product.name} from ${offer.sellerName} added to cart.`, { type: 'success' })
  }
  const moveAvailable = () => {
    const ready = saved.filter(p => p.bestOffer)
    if (!ready.length) { toast('No saved products currently have an in-stock seller offer.', { type: 'info' }); return }
    ready.forEach(p => addOffer(p, p.bestOffer))
    toast(`${ready.length} available item(s) added. ${saved.length - ready.length} unavailable item(s) skipped.`, { type: 'success' })
    navigate('/cart')
  }
  const clearAll = () => {
    if (window.confirm('Remove all products from your saved collection?')) {
      saved.forEach(p => toggleWish(p.id))
      toast('Saved collection cleared.', { type: 'info' })
    }
  }

  return translateTree(
    <PageFrame className="wishlist-page wishlist-workspace">
      <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span aria-current="page">Saved items</span></div>
      <header className="wishlist-heading wishlist-workspace-heading">
        <div><span className="eyebrow">YOUR PERSONAL COLLECTION</span><h1>Saved items</h1><p>Keep products close, compare seller offers and return when you’re ready to buy.</p></div>
        <div className="wishlist-count"><strong>{saved.length}</strong><span>{saved.length === 1 ? 'saved product' : 'saved products'}</span></div>
      </header>
      {saved.length ? <>
        <section className="wishlist-controls" aria-label="Filter saved products">
          <label className="wishlist-search"><Search size={17}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search saved products" aria-label="Search saved products"/></label>
          <label className="wishlist-select"><SlidersHorizontal size={15}/><span className="sr-only">Sort products</span><select value={sort} onChange={e => setSort(e.target.value)}><option value="saved">Recently saved</option><option value="price-low">Lowest price</option><option value="price-high">Highest price</option><option value="name">Product name</option></select></label>
          <label className="wishlist-select"><span className="sr-only">Availability</span><select value={availability} onChange={e => setAvailability(e.target.value)}><option value="all">All availability</option><option value="available">In stock</option><option value="unavailable">Out of stock</option></select></label>
        </section>
        <div className="wishlist-toolbar wishlist-workspace-toolbar">
          <div className="wishlist-category-tabs" role="group" aria-label="Product categories">{categories.map(cat => <button key={cat} type="button" className={`variant-pill ${selectedCat === cat ? 'is-active' : ''}`} onClick={() => setSelectedCat(cat)} aria-pressed={selectedCat === cat}>{cat}</button>)}</div>
          <div className="wishlist-action-btns"><button type="button" className="primary-btn" onClick={moveAvailable} disabled={!saved.some(p => p.bestOffer)}><ShoppingCart size={15}/> Add available to cart</button><button type="button" className="outline-btn danger-link" onClick={clearAll}><Trash2 size={15}/> Clear list</button></div>
        </div>
        <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">{`Showing ${filtered.length} of ${saved.length} saved products.`}</p>
        {filtered.length ? <div className="wishlist-saved-list">{filtered.map(product => {
          const offer = product.bestOffer
          return <article className="wishlist-saved-card" key={product.id}>
            <Link to={`/product/${product.id}`} className="wishlist-saved-image" aria-label={`View ${product.name}`}><img src={product.image} alt={product.name} loading="lazy" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }}/></Link>
            <div className="wishlist-saved-main">
              <div className="wishlist-saved-meta"><span>{product.category}</span>{product.rating && <span className="wishlist-rating">★ {product.rating} <small>({product.reviewCount || 0})</small></span>}</div>
              <Link to={`/product/${product.id}`} className="wishlist-saved-title">{product.name}</Link>
              <p className="wishlist-saved-description">{product.description || 'View the product page for full details and specifications.'}</p>
              {offer ? <div className="wishlist-offer-line"><span className="wishlist-stock-state"><PackageCheck size={15}/> {offer.stock} in stock</span><span className="wishlist-seller"><Store size={14}/> {offer.sellerName}</span><span className="wishlist-location"><MapPin size={13}/> {offer.sellerCity}</span></div> : <div className="wishlist-unavailable"><AlertCircle size={15}/> No seller offers currently in stock</div>}
            </div>
            <div className="wishlist-saved-side">{offer ? <><div className="wishlist-saved-price"><strong>{money(offer.price)}</strong>{offer.oldPrice && Number(offer.oldPrice) > Number(offer.price) && <del>{money(offer.oldPrice)}</del>}</div><button type="button" className="primary-btn wishlist-add-button" onClick={() => addOffer(product, offer)}><ShoppingCart size={15}/> Add to cart</button></> : <Link to={`/product/${product.id}`} className="outline-btn wishlist-view-button">View product</Link>}<button type="button" className="wishlist-remove-button" onClick={() => { toggleWish(product.id); toast('Product removed from saved items.', { type: 'info' }) }}><Heart size={15} fill="currentColor"/> Remove</button></div>
          </article>
        })}</div> : <div className="wishlist-filter-empty"><Search size={22}/><b>No saved products match these filters</b><p>Try another search or clear a filter.</p><button type="button" className="text-link" onClick={() => { setSearch(''); setSelectedCat('All'); setAvailability('all'); setSort('saved') }}>Clear filters</button></div>}
        <div className="wishlist-footnote"><span><Heart size={18}/></span><p>Your saved list is stored on this device. Prices and stock are demo marketplace data; confirm the current offer on the product page before ordering.</p></div>
      </> : <div className="wishlist-empty wishlist-workspace-empty"><div className="wishlist-empty-icon"><Heart size={30} strokeWidth={1.6}/></div><span className="eyebrow">YOUR NEXT FIND IS OUT THERE</span><h2>No saved products yet</h2><p>Tap the heart on any product to keep it here. Your collection will be ready whenever you are.</p><Link to="/search" className="primary-btn">Explore the marketplace <ArrowRight size={15}/></Link></div>}
    </PageFrame>, language
  )
}

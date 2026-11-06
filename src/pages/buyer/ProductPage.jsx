import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import { products } from '../../data/products'
import { sellers, sellerForProduct } from '../../data/sellers'
import { money, readJson, writeJson } from '../../utils/marketplace'
import { translateTree } from '../../i18n/translate'
import { ProductCard } from '../../components/marketplace/ProductCard'
import { ProductReviews } from '../../components/marketplace/ProductReviews'
import { ProductSpecs } from '../../components/marketplace/ProductSpecs'
import { MultiSellerOffers } from '../../components/marketplace/MultiSellerOffers'
import { FrequentlyBoughtTogether } from '../../components/marketplace/FrequentlyBoughtTogether'
import { ProductQA } from '../../components/marketplace/ProductQA'
import { MarketplaceService } from '../../services/marketplaceService'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { ArrowRight, Check, Heart, Plus, Share2, Search, ShoppingCart } from 'lucide-react'
import { useToast } from '../../providers/ToastProvider'

export function ProductPage() {
  const { addToCart, wishlist, toggleWish, language } = useMarketplace()
  const toast = useToast()
  const navigate = useNavigate()
  const { id } = useParams()
  const location = useLocation()
  const returnTo = typeof location.state?.from === 'string' && location.state.from.startsWith('/') ? location.state.from : '/search'
  const product = MarketplaceService.getProductById(id) || products.find(p => p.id === Number(id))
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [imageZoomOpen, setImageZoomOpen] = useState(false)
  const [activeImage, setActiveImage] = useState('')
  const [shareFeedback, setShareFeedback] = useState('')
  const [isCompared, setIsCompared] = useState(() => MarketplaceService.getCompareIds().includes(Number(id)))
  const [compareFeedback, setCompareFeedback] = useState('')

  // Multi-seller offers for this product
  const sellerOffers = product ? MarketplaceService.getProductOffers(product.id) : []
  const [selectedOffer, setSelectedOffer] = useState(() => sellerOffers.find(offer => offer.isFeatured) || sellerOffers[0] || null)

  const defaultSeller = product ? sellerForProduct(product) : sellers[0]
  const currentSellerName = selectedOffer?.sellerName || defaultSeller.name
  const currentPrice = selectedOffer?.price || product?.price || 0
  const currentSellerSlug = selectedOffer?.sellerSlug || defaultSeller.slug
  const availableStock = Number(selectedOffer?.stock ?? 0)
  const isOutOfStock = selectedOffer ? availableStock <= 0 : false

  const productVariants = Array.isArray(product?.variants) ? product.variants : []
  const [selectedVariant, setSelectedVariant] = useState(productVariants[0] || null)

  useEffect(() => {
    setSelectedVariant(productVariants[0] || null)
    setQty(1)
    setSelectedOffer(sellerOffers.find(offer => offer.isFeatured) || sellerOffers[0] || null)
    setActiveImage('')
  }, [id])

  useEffect(() => {
    setIsCompared(MarketplaceService.getCompareIds().includes(Number(id)))
    setCompareFeedback('')
  }, [id])

  const toggleProductCompare = () => {
    const next = MarketplaceService.toggleCompare(id)
    setIsCompared(next.includes(Number(id)))
    window.dispatchEvent(new Event('marchy-compare-changed'))
    toast(next.includes(Number(id)) ? 'Added to comparison tray' : 'Removed from comparison', { type: 'info' })
  }

  const handleShare = async () => {
    const shareData = { title: product?.name || 'MARCHY listing', text: 'View this listing on MARCHY', url: window.location.href }
    try {
      if (navigator.share) { await navigator.share(shareData); setShareFeedback('Share options opened'); return }
      if (navigator.clipboard?.writeText) { await navigator.clipboard.writeText(shareData.url); setShareFeedback('Listing link copied') }
      else {
        const field = document.createElement('textarea'); field.value = shareData.url; field.setAttribute('readonly', ''); field.style.position = 'absolute'; field.style.left = '-9999px'; document.body.appendChild(field); field.select(); const copied = document.execCommand('copy'); field.remove(); setShareFeedback(copied ? 'Listing link copied' : 'Copy is unavailable in this browser')
      }
    } catch (error) { if (error?.name !== 'AbortError') setShareFeedback('Could not share this listing') }
  }

  const effectiveProduct = {
    ...product,
    price: currentPrice,
    seller: currentSellerName,
    sellerSlug: currentSellerSlug
  }

  const handleAdd = () => {
    if (isOutOfStock || (availableStock > 0 && qty > availableStock)) {
      toast(isOutOfStock ? 'This seller offer is currently out of stock.' : `Only ${availableStock} units are available.`, { type: 'error' })
      return
    }
    const variant = selectedVariant || null
    addToCart(effectiveProduct, qty, variant)
    setAdded(true)
    toast(`Added ${qty}x ${product.name}${variant ? ` (${variant})` : ''} from ${currentSellerName} to cart`, { type: 'success' })
    setTimeout(() => setAdded(false), 2500)
  }

  const handleBuyNow = () => {
    if (isOutOfStock || (availableStock > 0 && qty > availableStock)) {
      toast(isOutOfStock ? 'This seller offer is currently out of stock.' : `Only ${availableStock} units are available.`, { type: 'error' })
      return
    }
    const variant = selectedVariant || null
    addToCart(effectiveProduct, qty, variant)
    navigate('/checkout')
  }

  const handleAddBundle = (bundleItems) => {
    bundleItems.forEach(item => {
      addToCart(item, 1, 'Standard Edition')
    })
  }
  useEffect(()=>{
    if(!imageZoomOpen)return
    const trigger=document.activeElement
    const previousOverflow=document.body.style.overflow
    document.body.style.overflow='hidden'
    const dialog=document.querySelector('.product-image-lightbox-dialog')
    const focusable=dialog?Array.from(dialog.querySelectorAll('button:not([disabled]),a[href],[tabindex]:not([tabindex="-1"])')):[]
    focusable[0]?.focus()
    const handleKeys=e=>{
      if(e.key==='Escape'){setImageZoomOpen(false);return}
      if(e.key==='Tab'&&focusable.length){
        const first=focusable[0],last=focusable[focusable.length-1]
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      }
    }
    window.addEventListener('keydown',handleKeys)
    return ()=>{window.removeEventListener('keydown',handleKeys);document.body.style.overflow=previousOverflow;trigger?.focus?.()}
  },[imageZoomOpen])
  useEffect(() => {
    if (!product) return
    const previous = readJson('marchy-recently-viewed', [])
    writeJson('marchy-recently-viewed', [product.id, ...previous.filter(item => item !== product.id)].slice(0, 8))
  }, [product?.id])
  if (!product) return translateTree(<main id="main-content" className="shell page empty-state"><span><Search size={22}/></span><h2>Product not found</h2><p>This listing may have moved or is no longer available in the sample catalogue.</p><Link to="/search" className="primary-btn">Back to marketplace <ArrowRight size={15}/></Link></main>, language)
  const seller = sellerForProduct(product)
  const currentSeller = sellers.find(entry => entry.slug === currentSellerSlug) || seller
  const galleryImages = [...new Set([...(Array.isArray(product.images) ? product.images : []), product.image].filter(Boolean))]
  const displayedImage = galleryImages.includes(activeImage) ? activeImage : galleryImages[0]
  const related = [
    ...products.filter(p => p.category === product.category && p.id !== product.id),
    ...products.filter(p => p.category !== product.category && p.id !== product.id)
  ].slice(0, 4)
  const sellerQuestions = ({
    Electronics:['Exact model, technical specifications and compatibility','Condition, included accessories and original packaging','Warranty coverage and proof of purchase','Current availability and final price'],
    Fashion:['Size measurements, fit and available variants','Material composition and care instructions','Condition and any visible defects','Exchange and return conditions'],
    Beauty:['Full ingredient list and product size','Expiry date, batch details and sealed condition','Usage instructions and suitability information','Return conditions for opened or unopened items'],
    Groceries:['Exact contents, quantity and product origin','Freshness, packaging and storage conditions','Substitution policy if an item is unavailable','Delivery handling and timing'],
    Home:['Exact dimensions, materials and colour','Assembly requirements and included components','Care instructions and packaging','Delivery handling for fragile or bulky items'],
    Sports:['Dimensions, materials and intended use','Available sizes or variants','Included accessories and care instructions','Warranty or return conditions'],
    Accessories:['Exact dimensions, material and capacity','Available colours or variants','Included components and care instructions','Return conditions'],
    Automotive:['Exact compatibility and supported models','Full kit contents and usage instructions','Product condition and packaging','Return conditions if compatibility is incorrect'],
    Books:['Edition, language and publication details','Format, dimensions and page count','New or used condition','Exact set quantity and included items'],
    'Toys & Games':['Recommended age range and safety information','Exact piece count and included components','Materials and packaging condition','Warranty or return conditions'],
    'Baby & Kids':['Age suitability and product safety information','Dimensions and compatibility details','Materials, cleaning and care instructions','Return conditions and included components'],
    Pets:['Intended animal type, size and dimensions','Materials and cleaning instructions','Included accessories and usage guidance','Return conditions'],
    'Garden & DIY':['Exact kit contents, dimensions and materials','Compatibility with the intended project','Care, storage or installation requirements','Delivery handling and return conditions']
  })[product.category] || ['Exact product specifications and included items','Product condition and any limitations','Current availability and final price','Delivery, returns and warranty conditions']
  const saved = wishlist.includes(product.id)
  const currentOldPrice = selectedOffer?.oldPrice || product.oldPrice || null
  const discount = currentOldPrice && currentPrice > 0 ? Math.max(0, Math.round((1 - currentPrice / currentOldPrice) * 100)) : 0
  const handleToggleWish = () => { toggleWish(product.id); toast(!saved ? "Saved " + product.name + " to wishlist" : "Removed from wishlist", { type: "info" }) }
  return translateTree(<main id="main-content" className="shell page product-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to={returnTo}>Marketplace</Link><span>/</span><Link to={`/category/${encodeURIComponent(product.category.toLowerCase())}`}>{product.category}</Link><span>/</span><span aria-current="page">{product.name}</span></nav>
    <div className="product-detail-layout">
      <section className="product-visual-column" aria-label="Product images">
        <div className="product-image-stage">
          <img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={displayedImage} alt={product.name} fetchPriority="high" />
          <button type="button" className="product-image-zoom-button" onClick={()=>setImageZoomOpen(true)} aria-label="Enlarge product image">⤢</button>
          <span className="product-image-label">MARCHY SAMPLE</span>
          {discount > 0 && <span className="product-image-discount">-{discount}%</span>}
          <span className="product-gallery-count">{galleryImages.indexOf(displayedImage)+1} / {galleryImages.length}</span>
        </div>
        <div className="product-gallery-thumbnails" role="group" aria-label="Choose product image">
          {galleryImages.map((image,index)=><button type="button" key={image} className={displayedImage===image?'is-active':''} aria-pressed={displayedImage===image} aria-label={`Show product image ${index+1}`} onClick={()=>setActiveImage(image)}><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src="/product-placeholder.svg"}} src={image} alt="" loading="lazy"/></button>)}
        </div>
        <div className="product-image-caption"><span>{String(galleryImages.indexOf(displayedImage)+1).padStart(2,'0')} / {String(galleryImages.length).padStart(2,'0')}</span><span>{galleryImages.length>1?'Select a thumbnail to view another image':'Only one catalogue image has been supplied'}</span></div>
        <div className="product-visual-note"><span>ⓘ</span><p>Images and listing information are provided as demonstration content. Confirm the exact item with the seller before ordering.</p></div>
      </section>
      <section className="product-buy-panel">
        <div className="product-buy-topline"><Link to={`/category/${encodeURIComponent(product.category.toLowerCase())}`} className="product-category-pill">{product.category}</Link><div className="product-topline-actions"><span className="sample-status">Sample listing</span><button type="button" className={`product-compare-button ${isCompared?'is-compared':''}`} aria-pressed={isCompared} onClick={toggleProductCompare} >{isCompared?<><Check size={14}/> Compared</>:<><Plus size={14}/> Compare</>}</button><button type="button" className="product-share-button" onClick={handleShare}><Share2 size={15}/> Share</button></div></div>{shareFeedback&&<p className="product-share-feedback" role="status">{shareFeedback}</p>}{compareFeedback&&<p className="product-compare-feedback" role="status">{compareFeedback} · <Link to="/search">Open comparison</Link></p>}
        <h1>{product.name}</h1>
        <div className="product-price-block">
          <strong>{money(currentPrice)}</strong>
          {selectedOffer?.oldPrice ? <del>{money(selectedOffer.oldPrice)}</del> : product.oldPrice ? <del>{money(product.oldPrice)}</del> : null}
          {discount > 0 && <span>{discount}% illustrative difference</span>}
        </div>
        <p className="product-price-caption">Displayed in Tunisian dinars (TND). This is an illustrative offer from <b>{currentSellerName}</b>; confirm the final price and terms with the seller.</p>
        <div className="product-listing-status">
          <span className="status-dot"></span>
          <div>
            <b>{isOutOfStock ? 'Sample stock: unavailable' : 'Sample offer'}</b>
            <small>Illustrative catalogue status. Confirm current availability, dispatch location and fulfilment directly with the seller.</small>
          </div>
        </div>

        {productVariants.length > 0 && (
          <div className="product-variant-picker" role="group" aria-label="Select product option">
            <div className="product-variant-header">
              <span className="product-variant-label">{product.variantLabel || 'Selected option:'}</span>
              <b className="product-variant-value">{selectedVariant}</b>
            </div>
            <div className="product-variant-options">
              {productVariants.map(variant => (
                <button
                  key={variant}
                  type="button"
                  className={`variant-pill ${selectedVariant === variant ? 'is-active' : ''}`}
                  aria-pressed={selectedVariant === variant}
                  onClick={() => setSelectedVariant(variant)}
                >
                  {variant}
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="product-purchase-controls">
          <span className="product-quantity-label">Quantity</span>
          <div className="product-purchase-row">
            <div className="quantity product-quantity" role="group" aria-label="Quantity">
              <button type="button" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty(v => Math.max(1, v - 1))}>−</button>
              <output id="product-quantity" aria-label="Selected quantity" aria-live="polite">{qty}</output>
              <button type="button" aria-label="Increase quantity" disabled={qty >= 99 || (availableStock > 0 && qty >= availableStock)} onClick={() => setQty(v => Math.min(99, availableStock > 0 ? availableStock : 99, v + 1))}>＋</button>
            </div>
            <button type="button" className="primary-btn product-add-button" onClick={handleAdd} disabled={isOutOfStock}>{added ? <><Check size={16}/> Added to cart</> : <><ShoppingCart size={16}/> Add to cart</>}</button>
            <button type="button" className="product-buy-now-btn" onClick={handleBuyNow} disabled={isOutOfStock} title="Instant 1-click checkout">
              ⚡ Buy Now
            </button>
            <button type="button" className={`product-save-button ${saved ? 'is-saved' : ''}`} aria-label={saved ? 'Remove from saved items' : 'Save for later'} aria-pressed={saved} onClick={handleToggleWish}>{saved ? <Heart size={19} fill="currentColor"/> : <Heart size={19}/>}</button>
          </div>
          <div className="product-quantity-summary" aria-live="polite">
            <span>{qty} {qty === 1 ? 'item' : 'items'} selected{selectedVariant ? ` (${selectedVariant})` : ''}</span>
            <strong>{money(currentPrice * qty)}</strong>
          </div>
          {added && <p className="product-added-feedback" role="status">Added to your basket: {qty}x {product.name}{selectedVariant ? ` (${selectedVariant})` : ''}.</p>}
        </div>

        <section className="product-delivery-card" aria-label="Delivery information">
          <div className="delivery-estimator-header">
            <span className="delivery-symbol">ⓘ</span>
            <div>
              <b>Delivery details to confirm</b>
              <small>Coverage, delivery cost and estimated timing are not connected to live courier data.</small>
            </div>
          </div>
          <p>Contact the seller before ordering to confirm availability, delivery to your governorate, the final delivery fee and the expected arrival date.</p>
        </section>

        {/* Other Sellers on MARCHY (Multi-Seller Offers) */}
        <MultiSellerOffers
          offers={sellerOffers}
          onSelectOffer={setSelectedOffer}
          activeOfferId={selectedOffer?.id}
        />

        <section className="product-seller-card" aria-label="Seller information">
          <span className="seller-avatar">{currentSellerName.slice(0, 1)}</span>
          <div className="product-seller-copy">
            <small>Selected merchant · {currentSellerName}</small>
            <b>{currentSellerName}</b>
            <span>Sample storefront · Tunisia</span>
            <span className="seller-profile-status">Store details are illustrative</span>
          </div>
          <Link to={`/seller/${currentSellerSlug}`}>Visit shop <span><ArrowRight size={15}/></span></Link>
        </section>
      </section>
    </div>
    <section className="product-buyer-highlights" aria-label="Important product information"><div><span>01</span><b>Know what you're buying</b><small>Review the description and confirm exact specifications.</small></div><div><span>02</span><b>Check with the shop</b><small>Ask about variants, condition and current availability.</small></div><div><span>03</span><b>Confirm delivery first</b><small>Agree on coverage, cost and timing before ordering.</small></div></section>
    
    <section className="product-information-grid"><ProductSpecs product={product} seller={currentSeller} />
      <article className="product-information-card">
        <span className="eyebrow">PRODUCT DETAILS</span><h2>About this listing</h2>
        <p>{product.description || 'No product information has been supplied for this sample listing. Contact the seller to confirm the exact product, condition, specifications and what is included.'}</p>
        <dl className="product-attribute-list"><div><dt>Category</dt><dd>{product.category}</dd></div><div><dt>Seller location</dt><dd>{currentSeller.city}, Tunisia</dd></div><div><dt>Price display</dt><dd>Tunisian dinar (TND)</dd></div><div><dt>Listing type</dt><dd>Sample catalogue</dd></div></dl>
      </article>
      <article className="product-information-card product-order-checklist">
        <span className="eyebrow">BEFORE YOU ORDER</span><h2>Confirm these details with the seller</h2>
        <ul>{sellerQuestions.map(question=><li key={question}>{question}</li>)}</ul>
        <Link to={`/seller/${currentSellerSlug}`} className="text-link">Visit {currentSellerName}'s storefront <ArrowRight size={15}/></Link>
      </article>
    </section>

    {/* Smart Bundle: Frequently Bought Together */}
    <FrequentlyBoughtTogether
      currentProduct={product}
      bundleProducts={related}
      onAddBundle={handleAddBundle}
    />

    {/* Customer Reviews & Feedback */}
    <ProductReviews product={product} />

    {/* Local preview Q&A; no seller messaging is connected. */}
    <ProductQA productId={product.id} productName={product.name} />

    {related.length > 0 && <section className="section related-products"><div className="section-heading"><div><span className="eyebrow">KEEP EXPLORING</span><h2>Discover more products</h2><p className="muted">More from this category and other corners of the marketplace.</p></div><Link to="/search" className="text-link">Explore marketplace <ArrowRight size={15}/></Link></div><div className="product-grid">{related.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language} returnTo={location.pathname}/>)}</div></section>}
    {imageZoomOpen&&<div className="product-image-lightbox" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setImageZoomOpen(false)}}><section role="dialog" aria-modal="true" aria-label={`Image preview: ${product.name}`} className="product-image-lightbox-dialog"><button type="button" autoFocus className="product-image-lightbox-close" onClick={()=>setImageZoomOpen(false)} aria-label="Close image preview">×</button><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={displayedImage} alt={product.name}/><p>{product.name} · Sample catalogue image</p></section></div>}
    <div className="product-mobile-buybar"><div className="mobile-buybar-total"><small>Subtotal · {qty} {qty === 1 ? 'item' : 'items'}</small><b>{money(currentPrice * qty)}</b></div><div className="mobile-buybar-actions"><div className="quantity mobile-buybar-quantity" role="group" aria-label="Mobile quantity"><button type="button" aria-label="Decrease quantity" disabled={qty<=1} onClick={()=>setQty(value=>Math.max(1,value-1))}>−</button><output aria-label="Mobile selected quantity">{qty}</output><button type="button" aria-label="Increase quantity" disabled={qty>=99 || (availableStock > 0 && qty >= availableStock)} onClick={()=>setQty(value=>Math.min(99, availableStock > 0 ? availableStock : 99, value + 1))}>＋</button></div><button type="button" className="primary-btn" onClick={handleAdd}>{added ? <><Check size={15}/> Added</> : <><ShoppingCart size={15}/> Add to cart</>}</button></div></div>
  </main>, language)
}


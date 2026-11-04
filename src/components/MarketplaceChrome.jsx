import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { categories, products } from '../data/products'
import { sellerForProduct } from '../data/sellers'
import { money, searchTextMatches } from '../utils/marketplace'
import { translateTree } from '../i18n/translate'

function Header({ cartCount, query, setQuery, language, setLanguage }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => { try { return JSON.parse(localStorage.getItem('marchy-recent-searches') || '[]').filter(value => typeof value === 'string').slice(0, 5) } catch { return [] } })
  const headerRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  useEffect(() => {
    setMenuOpen(false)
    setSearchOpen(false)
  }, [location.pathname, location.search])
  useEffect(() => {
    if (!menuOpen && !searchOpen) return
    const handlePointerDown = event => {
      if (!headerRef.current?.contains(event.target)) {
        setMenuOpen(false)
        setSearchOpen(false)
      }
    }
    const handleKeyDown = event => {
      if (event.key === 'Escape') {
        setMenuOpen(false)
        setSearchOpen(false)
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    window.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [menuOpen, searchOpen])
  const searchTerm=query.trim()
  const searchMatches=useMemo(()=>searchTerm?products.filter(p=>searchTextMatches([p.name,p.category,p.seller,sellerForProduct(p).name,sellerForProduct(p).city].join(' '),searchTerm)).slice(0,4):[],[searchTerm])
  const categoryMatches=useMemo(()=>searchTerm?categories.filter(c=>c!=='All'&&searchTextMatches(c,searchTerm)).slice(0,3):[],[searchTerm])
  function rememberSearch(value) {
    const clean = value.trim()
    if (!clean) return
    setRecentSearches(current => {
      const updated = [clean, ...current.filter(item => item.toLowerCase() !== clean.toLowerCase())].slice(0, 5)
      try { localStorage.setItem('marchy-recent-searches', JSON.stringify(updated)) } catch {}
      return updated
    })
  }
  function submit(e) { e.preventDefault(); rememberSearch(query); setSearchOpen(false); navigate(query.trim() ? `/search?q=${encodeURIComponent(query)}` : '/search') }
  return translateTree(<>
    <div className="topline"><div className="shell topline-inner"><span>MARCHY preview · sample catalogue and illustrative prices</span><div><span>🇹🇳 Tunisia-first</span><span className="top-sep">·</span><span>Prices in TND</span></div></div></div>
    <header ref={headerRef} className="header"><div className="shell header-main">
      <button type="button" className="mobile-menu icon-btn" onClick={() => setMenuOpen(v => !v)} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"} aria-expanded={menuOpen} aria-controls="primary-navigation">{menuOpen ? "×" : "☰"}</button>
      <Link to="/" className="logo" aria-label="MARCHY."><img className="logo-mark" src="/favicon.svg" alt="" width="34" height="34"/><span className="logo-word">MARCHY</span><span className="logo-period">.</span></Link>
      <form className="searchbar" onSubmit={submit} role="search"><span className="search-symbol">⌕</span><input value={query} onFocus={()=>setSearchOpen(true)} onKeyDown={e=>{if(e.key==='Escape')setSearchOpen(false)}} onChange={e => {setQuery(e.target.value);setSearchOpen(true)}} placeholder="Search products, brands and local finds…" aria-label="Search products" /><button type="submit">Search</button>
        {searchOpen&&<div className="global-search-suggestions" id="global-search-suggestions">
          {searchTerm?<><div className="search-suggestion-heading">Matching products</div>{searchMatches.length?searchMatches.map(p=><Link key={p.id} to={`/product/${p.id}`} onMouseDown={()=>setSearchOpen(false)}><span className="suggestion-thumb"><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={p.image} alt=""/></span><span className="suggestion-copy"><b>{p.name}</b><small>{p.category} · {money(p.price)}</small></span><span className="suggestion-arrow">↗</span></Link>):<p className="suggestion-empty">No matching sample products. Press Search to view results.</p>}{categoryMatches.length>0&&<><div className="search-suggestion-heading">Categories</div>{categoryMatches.map(name=><Link className="category-suggestion" key={name} to={`/category/${encodeURIComponent(name.toLowerCase())}`} onMouseDown={()=>setSearchOpen(false)}><span>▦</span>{name}<span className="suggestion-arrow">→</span></Link>)}</>}</>:<div className="search-suggestion-empty">{recentSearches.length>0&&<div className="recent-searches"><div className="search-suggestion-heading">Recent searches <button type="button" onClick={()=>{setRecentSearches([]);try{localStorage.removeItem('marchy-recent-searches')}catch{}}}>Clear</button></div>{recentSearches.map(item=><Link key={item} to={`/search?q=${encodeURIComponent(item)}`} onMouseDown={()=>setSearchOpen(false)}><span aria-hidden="true">↺</span>{item}<span className="suggestion-arrow">↗</span></Link>)}</div>}<b>Start with a category</b><div>{categories.slice(1,5).map(name=><Link key={name} to={`/category/${encodeURIComponent(name.toLowerCase())}`} onMouseDown={()=>setSearchOpen(false)}>{name}</Link>)}</div></div>}
          <button type="button" className="search-suggestion-close" onClick={()=>setSearchOpen(false)}>Close suggestions</button>
        </div>}
      </form>
      <div className="header-actions"><label className="language-picker"><span className="sr-only">Language</span><select aria-label="Language" value={language} onChange={e=>setLanguage(e.target.value)}><option value="en">EN</option><option value="fr">FR</option><option value="ar">عربي</option></select></label><Link to="/wishlist" className="action-link wishlist-link"><span className="action-icon">♡</span><span><small>Saved</small><b>Wishlist</b></span></Link><Link to="/login" className="action-link header-signin"><span className="action-icon">♙</span><span><small>Welcome to MARCHY</small><b>Sign in</b></span></Link><Link to="/signup" className="header-join-link">Join free <span>→</span></Link><Link to="/cart" className="action-link cart-link"><span className="cart-icon">🛒<i aria-live="polite" aria-atomic="true">{cartCount}</i></span><span><small>Your</small><b>Cart</b></span></Link></div>
    </div>
    <nav id="primary-navigation" aria-label="Primary navigation" className={`nav ${menuOpen ? 'nav-open' : ''}`}><div className="shell nav-inner" onClick={()=>setMenuOpen(false)}><Link to="/categories">☷ <b>Shop by category</b></Link>{categories.slice(1,5).map(c => <Link key={c} to={`/category/${c.toLowerCase()}`}>{c}</Link>)}<Link to="/sellers">Sellers</Link><Link className="nav-deal" to="/search?deal=true">Deals of the day <span>→</span></Link></div></nav>
    </header>
  </>,language)
}


function ProductCard({ product, addToCart, wished, toggleWish, language, compareIds = [], toggleCompare }) {
  const [added,setAdded]=useState(false)
  const [quickViewOpen,setQuickViewOpen]=useState(false)
  const seller=sellerForProduct(product)
  const discount=product.oldPrice?Math.round((1-product.price/product.oldPrice)*100):0
  function quickAdd(){addToCart(product);setAdded(true)}
  useEffect(()=>{
    if(!quickViewOpen)return
    const trigger=document.activeElement
    const previousOverflow=document.body.style.overflow
    document.body.style.overflow='hidden'
    const dialog=document.querySelector(`[aria-labelledby="quick-view-title-${product.id}"]`)
    const focusable=dialog?Array.from(dialog.querySelectorAll('button:not([disabled]),a[href],input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])')):[]
    focusable[0]?.focus()
    const handleKeys=e=>{
      if(e.key==='Escape'){setQuickViewOpen(false);return}
      if(e.key==='Tab'&&focusable.length){
        const first=focusable[0],last=focusable[focusable.length-1]
        if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}
        else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
      }
    }
    window.addEventListener('keydown',handleKeys)
    return ()=>{window.removeEventListener('keydown',handleKeys);document.body.style.overflow=previousOverflow;trigger?.focus?.()}
  },[quickViewOpen,product.id])
  return translateTree(<>
    <article className="product-card">
      <div className="product-photo">
        <Link to={`/product/${product.id}`} aria-label={`View ${product.name}`}><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={product.image} alt={product.name} loading="lazy" /></Link>
        <span className="product-tag">SAMPLE</span>
        {discount>0&&<span className="discount-tag">-{discount}%</span>}
        <button type="button" className={`wish-btn ${wished?'wished':''}`} onClick={()=>toggleWish(product.id)} aria-label={wished?'Remove from wishlist':'Add to wishlist'} aria-pressed={wished}>{wished?'♥':'♡'}</button>
        <button type="button" className="product-quick-view" onClick={()=>setQuickViewOpen(true)} aria-label={`Quick view ${product.name}`}>Quick view <span>↗</span></button>
      </div>
      <div className="product-info">
        <div className="product-category">{product.category}</div>
        <Link to={`/product/${product.id}`} className="product-name">{product.name}</Link>
        <Link to={`/seller/${seller.slug}`} className="seller-name seller-link">⌖ {seller.name} · {seller.city}</Link>
        <div className="price-row"><strong>{money(product.price)}</strong>{product.oldPrice&&<del>{money(product.oldPrice)}</del>}</div>
        {toggleCompare && <button type="button" className={`compare-product-button ${compareIds.includes(product.id) ? 'is-selected' : ''}`} onClick={() => toggleCompare(product.id)} aria-pressed={compareIds.includes(product.id)} disabled={compareIds.length >= 3 && !compareIds.includes(product.id)}>{compareIds.includes(product.id) ? '✓ Added to compare' : compareIds.length >= 3 ? 'Compare limit reached' : '＋ Compare'}</button>}
        <button type="button" className={`add-btn ${added?'added':''}`} onClick={quickAdd} aria-live="polite">{added?'Added to cart ✓':'Add to cart'} <span>{added?'✓':'＋'}</span></button>
      </div>
    </article>
    {quickViewOpen&&<div className="quick-view-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setQuickViewOpen(false)}}>
      <section className="quick-view-dialog" role="dialog" aria-modal="true" aria-labelledby={`quick-view-title-${product.id}`}>
        <button type="button" className="quick-view-close" onClick={()=>setQuickViewOpen(false)} aria-label="Close quick view">×</button>
        <div className="quick-view-image"><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={product.image} alt={product.name}/></div>
        <div className="quick-view-content">
          <span className="eyebrow">QUICK PRODUCT VIEW · SAMPLE LISTING</span>
          <span className="product-category">{product.category}</span>
          <h2 id={`quick-view-title-${product.id}`}>{product.name}</h2>
          <div className="quick-view-price">{money(product.price)}</div>
          <p>{product.description||'Product specifications and included items should be confirmed directly with the seller.'}</p>
          <div className="quick-view-seller">Sold by <b>{seller.name}</b> · {seller.city}</div>
          <div className="quick-view-actions"><button type="button" className="primary-btn" onClick={quickAdd}>{added?'Added to cart ✓':'Add to demo cart'}</button><Link to={`/product/${product.id}`} className="outline-btn" onClick={()=>setQuickViewOpen(false)}>View full details →</Link></div>
          <small>Illustrative catalogue information. Availability and final terms are not verified.</small>
        </div>
      </section>
    </div>}
  </>,language)
}


function Footer({language}){return translateTree(<footer className="footer"><div className="shell footer-main"><div className="footer-brand"><Link to="/" className="logo" aria-label="MARCHY."><span className="logo-mark" aria-hidden="true">M</span><span className="logo-word">MARCHY</span><span className="logo-period">.</span></Link><p>Tunisia’s marketplace for everyday discoveries.<br/>Discover local sellers and products in one place.</p></div><div><b>Discover</b><Link to="/search">All products</Link><Link to="/categories">Categories</Link><Link to="/wishlist">Wishlist</Link><Link to="/sellers">Find sellers</Link><Link to="/search?deal=true">Today’s deals</Link></div><div><b>Your account</b><Link to="/login">Sign in</Link><Link to="/signup">Create an account</Link><Link to="/account">Account overview</Link><Link to="/wishlist">Saved products</Link></div><div><b>Help & support</b><Link to="/help">Contact us</Link><Link to="/delivery">Delivery information</Link><Link to="/returns">Returns & refunds</Link></div></div><div className="shell footer-bottom"><span>© 2026 MARCHY. All rights reserved.</span><span>Built for Tunisia.</span></div></footer>,language)}

function MobileTabBar({cartCount,wishlistCount,language}) {
 const {pathname}=useLocation()
 const active=path=>path==='/'?pathname==='/':pathname===path||pathname.startsWith(path+'/')
 return translateTree(<nav className="mobile-tabbar" aria-label="Quick navigation"><Link to="/" className={active('/')?'is-active':''} aria-current={active('/')?'page':undefined}><span>⌂</span><small>Home</small></Link><Link to="/search" className={active('/search')||active('/category')?'is-active':''} aria-current={active('/search')||active('/category')?'page':undefined}><span>⌕</span><small>Search</small></Link><Link to="/sellers" className={active('/sellers')||active('/seller')?'is-active':''} aria-current={active('/sellers')||active('/seller')?'page':undefined}><span>▤</span><small>Sellers</small></Link><Link to="/account" className={active('/login')||active('/signup')||active('/account')?'is-active':''} aria-current={active('/login')||active('/signup')||active('/account')?'page':undefined}><span>♙</span><small>Account</small></Link><Link to="/wishlist" className={active('/wishlist')?'is-active':''} aria-current={active('/wishlist')?'page':undefined}><span>♡<i>{wishlistCount}</i></span><small>Saved</small></Link><Link to="/cart" className={active('/cart')?'is-active':''} aria-current={active('/cart')?'page':undefined}><span>🛒<i>{cartCount}</i></span><small>Cart</small></Link></nav>,language)
}


export { Header, ProductCard, Footer, MobileTabBar }

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { categories, products } from '../data/products'
import { sellerForProduct } from '../data/sellers'
import { money, searchTextMatches } from '../utils/marketplace'
import { translateTree } from '../i18n/translate'

function Header({ cartCount, query, setQuery, language, setLanguage, theme = 'light', setTheme }) {
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
      <Link to="/" className="logo" aria-label="MARCHY home"><img className="logo-mark" src="/favicon.svg" alt="" width="34" height="34"/><span className="logo-word">MARCHY</span><span className="logo-period">.</span></Link>
      <form className="searchbar" onSubmit={submit} role="search"><span className="search-symbol">⌕</span><input value={query} onFocus={()=>setSearchOpen(true)} onKeyDown={e=>{if(e.key==='Escape')setSearchOpen(false)}} onChange={e => {setQuery(e.target.value);setSearchOpen(true)}} placeholder="Search products, brands and local finds…" aria-label="Search products" /><button type="submit">Search</button>
        {searchOpen&&<div className="global-search-suggestions" id="global-search-suggestions">
          {searchTerm?<><div className="search-suggestion-heading">Matching products</div>{searchMatches.length?searchMatches.map(p=><Link key={p.id} to={`/product/${p.id}`} onMouseDown={()=>setSearchOpen(false)}><span className="suggestion-thumb"><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={p.image} alt=""/></span><span className="suggestion-copy"><b>{p.name}</b><small>{p.category} · {money(p.price)}</small></span><span className="suggestion-arrow">↗</span></Link>):<p className="suggestion-empty">No matching sample products. Press Search to view results.</p>}{categoryMatches.length>0&&<><div className="search-suggestion-heading">Categories</div>{categoryMatches.map(name=><Link className="category-suggestion" key={name} to={`/category/${encodeURIComponent(name.toLowerCase())}`} onMouseDown={()=>setSearchOpen(false)}><span>▦</span>{name}<span className="suggestion-arrow">→</span></Link>)}</>}</>:<div className="search-suggestion-empty">{recentSearches.length>0&&<div className="recent-searches"><div className="search-suggestion-heading">Recent searches <button type="button" onClick={()=>{setRecentSearches([]);try{localStorage.removeItem('marchy-recent-searches')}catch{}}}>Clear</button></div>{recentSearches.map(item=><Link key={item} to={`/search?q=${encodeURIComponent(item)}`} onMouseDown={()=>setSearchOpen(false)}><span aria-hidden="true">↺</span>{item}<span className="suggestion-arrow">↗</span></Link>)}</div>}<b>Start with a category</b><div>{categories.slice(1,5).map(name=><Link key={name} to={`/category/${encodeURIComponent(name.toLowerCase())}`} onMouseDown={()=>setSearchOpen(false)}>{name}</Link>)}</div></div>}
          <button type="button" className="search-suggestion-close" onClick={()=>setSearchOpen(false)}>Close suggestions</button>
        </div>}
      </form>
      <div className="header-actions">{setTheme&&<button type="button" className="theme-toggle" onClick={()=>setTheme(theme==='dark'?'light':'dark')} aria-label={theme==='dark'?'Switch to light mode':'Switch to dark mode'} aria-pressed={theme==='dark'} title={theme==='dark'?'Switch to light mode':'Switch to dark mode'}><span aria-hidden="true">{theme==='dark'?'☀':'☾'}</span><small>{theme==='dark'?'Light':'Dark'}</small></button>}<label className="language-picker"><span className="sr-only">Language</span><select aria-label="Language" value={language} onChange={e=>setLanguage(e.target.value)}><option value="en">EN</option><option value="fr">FR</option><option value="ar">عربي</option></select></label><Link to="/wishlist" className="action-link wishlist-link"><span className="action-icon">♡</span><span><small>Saved</small><b>Wishlist</b></span></Link><Link to="/login" className="action-link header-signin"><span className="action-icon">♙</span><span><small>Welcome to MARCHY</small><b>Sign in</b></span></Link><Link to="/signup" className="header-join-link">Join free <span>→</span></Link><Link to="/cart" className="action-link cart-link"><span className="cart-icon">🛒<i aria-live="polite" aria-atomic="true">{cartCount}</i></span><span><small>Your</small><b>Cart</b></span></Link></div>
    </div>
    <nav id="primary-navigation" aria-label="Primary navigation" className={`nav ${menuOpen ? 'nav-open' : ''}`}><div className="shell nav-inner" onClick={()=>setMenuOpen(false)}><Link to="/categories">☷ <b>Shop by category</b></Link>{categories.slice(1,5).map(c => <Link key={c} to={`/category/${c.toLowerCase()}`}>{c}</Link>)}<Link to="/sellers">Sellers</Link><Link className="nav-deal" to="/search?deal=true">Deals of the day <span>→</span></Link></div></nav>
    </header>
  </>,language)
}

export { Header }

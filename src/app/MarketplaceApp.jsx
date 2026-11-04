import { useEffect, useMemo, useState } from 'react'
import { Link, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { categories, products } from '../data/products'
import { sellers, sellerByCategory, sellerForProduct } from '../data/sellers'
import { money, searchSynonyms, normalizeSearchText, searchTextMatches, readText, readJson, writeJson } from '../utils/marketplace'
import { translateTree } from '../i18n/translate'
import { Header, ProductCard, Footer, MobileTabBar } from '../components/MarketplaceChrome'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

function Home({ addToCart, wishlist, toggleWish, language }) {
  const [active,setActive]=useState('All')
  const [heroSearch,setHeroSearch]=useState('')
  const navigate=useNavigate()
  const submitHeroSearch=event=>{event.preventDefault();const query=heroSearch.trim();navigate(query?'/search?q='+encodeURIComponent(query):'/search')}
  const shown=(active==='All'?products:products.filter(p=>p.category===active)).slice(0,8)
  const populatedCategories=categories.slice(1).filter(name=>products.some(p=>p.category===name))
  const popular=populatedCategories.map((name,i)=>({name,count:products.filter(p=>p.category===name).length,icon:['⌘','◉','✳','⌂','✿','↗','◇','▤','▣','✦','♧','♢','⌁'][i%13],tone:['cat-blue','cat-sand','cat-pink','cat-lilac','cat-green','cat-yellow'][i%6]}))
  const deals=products.filter(p=>p.oldPrice).slice(0,4)
  const recentlyViewed=readJson('marchy-recently-viewed', []).map(id=>products.find(product=>product.id===id)).filter(Boolean).slice(0,4)
  return translateTree(<main id="main-content" className="shell page home-page">
    <section className="market-hero market-hero-premium" aria-labelledby="market-hero-title">
      <div className="market-hero-copy">
        <span className="eyebrow">MADE FOR TUNISIA · READY TO EXPLORE</span>
        <h1 id="market-hero-title">Good finds.<br/><em>Right around here.</em></h1>
        <p>Explore a growing world of everyday finds, discover local storefronts and compare catalogue prices in Tunisian dinars.</p>
        <form className="hero-search-form" role="search" onSubmit={submitHeroSearch}>
          <label className="sr-only" htmlFor="home-market-search">Search products and categories</label>
          <span aria-hidden="true">⌕</span>
          <input id="home-market-search" type="search" value={heroSearch} onChange={event=>setHeroSearch(event.target.value)} placeholder="What are you looking for?" />
          <button type="submit">Search <span aria-hidden="true">→</span></button>
        </form>
        <div className="hero-trending"><span>Popular:</span>{['Headphones','Home','Fashion','Beauty'].map(term=><button type="button" key={term} onClick={()=>navigate('/search?q='+encodeURIComponent(term))}>{term}</button>)}</div>
        <div className="market-hero-proof"><span>✓ Prices shown in TND</span><span>✓ Explore local storefronts</span><span>✓ One place to discover</span></div>
      </div>
      <div className="market-hero-art">
        <img src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1400&q=90" alt="A curated still life of everyday objects and home accessories" loading="eager"/>
        <div className="hero-image-shade" aria-hidden="true"></div>
        <div className="hero-floating-card"><span className="hero-floating-icon">✦</span><div><b>A little more to discover</b><small>Explore the MARCHY sample catalogue</small></div></div>
        <div className="hero-art-caption">LOCAL FINDS <b>·</b> EVERYDAY DISCOVERY</div>
        <div className="hero-art-index"><span>01</span><i></i><span>DISCOVER</span></div>
      </div>
    </section>
    <section className="market-benefits"><div><span>01</span><b>Browse with ease</b><small>Explore products across everyday categories</small></div><div><span>02</span><b>Find local storefronts</b><small>See sample seller profiles and locations</small></div><div><span>03</span><b>Compare in dinars</b><small>All catalogue prices shown in TND</small></div></section>
    <section className="home-quick-discovery" aria-label="Quick category discovery"><div><span className="eyebrow">QUICK DISCOVERY</span><b>What are you shopping for?</b></div><div className="home-quick-links">{populatedCategories.slice(0,7).map(name=><Link key={name} to={`/category/${encodeURIComponent(name.toLowerCase())}`}>{name}<span>↗</span></Link>)}<Link className="quick-all-link" to="/categories">All departments <span>→</span></Link></div></section>
    <section className="section home-category-section">
      <div className="section-heading"><div><span className="eyebrow">START WITH WHAT YOU NEED</span><h2>Explore all categories</h2><p className="muted">A quick route to the things you shop for most.</p></div><Link to="/categories" className="text-link">All categories →</Link></div>
      <div className="home-category-grid">{popular.map(item=><Link key={item.name} to={`/category/${encodeURIComponent(item.name.toLowerCase())}`} className={`home-category-card home-category-image-card ${item.tone}`}><img src={products.find(product=>product.category===item.name)?.image} alt="" loading="lazy"/><span className="home-category-icon" aria-hidden="true">{item.icon}</span><b>{item.name}</b><small>{item.count} sample {item.count===1?'listing':'listings'} <span>→</span></small></Link>)}</div>
    </section>
    <section className="section home-featured-section">
      <div className="section-heading"><div><span className="eyebrow">PICK YOUR NEXT DISCOVERY</span><h2>Popular in the catalogue</h2><p className="muted">A curated look at the current sample listings.</p></div><Link to="/search" className="text-link">Browse all products →</Link></div>
      <div className="home-category-tabs" role="group" aria-label="Filter featured products">{['All','Electronics','Home','Fashion','Beauty','Sports'].map(name=><button key={name} type="button" className={active===name?'active':''} aria-pressed={active===name} onClick={()=>setActive(name)}>{name}</button>)}</div>
      <div className="product-grid">{shown.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language}/>)}</div>
    </section>
    {recentlyViewed.length>0&&<section className="section home-recently-viewed"><div className="section-heading"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Recently viewed</h2><p className="muted">Your latest product discoveries on this device.</p></div></div><div className="product-grid">{recentlyViewed.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language}/>)}</div></section>}
    <section className="section home-deals-section"><div className="section-heading"><div><span className="eyebrow">PRICE COMPARISON</span><h2>Listings with sample discounts</h2><p className="muted">Previous prices are illustrative and must be confirmed with the seller.</p></div><Link to="/search?deal=true" className="text-link">See all deals →</Link></div><div className="product-grid">{deals.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language}/>)}</div></section>
    <section className="home-seller-banner"><div><span className="eyebrow">DISCOVER THE PEOPLE BEHIND THE PRODUCTS</span><h2>Find a storefront.<br/><em>Explore what they offer.</em></h2><p>Explore illustrative shop profiles and the products listed in each storefront.</p><Link to="/sellers" className="light-btn">Explore seller directory →</Link></div><div className="seller-banner-stats"><b>{sellers.length}</b><span>sample storefronts</span><b>{populatedCategories.length}</b><span>categories with listings</span></div></section>
    <section className="home-seller-cta"><div><span className="eyebrow">FOR TUNISIAN BUSINESSES</span><h2>Want to sell on MARCHY?</h2><p>Explore the seller information page and follow the product as onboarding tools take shape.</p></div><Link to="/sell" className="outline-btn">Learn about selling →</Link></section>
    <p className="catalogue-note">MARCHY is a frontend prototype. Product listings, storefronts, prices, discounts and availability shown here are illustrative — not verified live offers.</p>
  </main>,language)
}

function SearchPage({ addToCart, wishlist, toggleWish, language }) {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const initial = params.get('q') || ''
  const { category: routeCategory } = useParams()
  const initialCategory = categories.find(c => c.toLowerCase() === (routeCategory || '').toLowerCase()) || 'All'
  const isInvalidCategory = Boolean(routeCategory) && initialCategory === 'All'
  const [term, setTerm] = useState(initial)
  const [category, setCategory] = useState(initialCategory)
  const dealsOnly = params.get('deal') === 'true'
  useEffect(() => setTerm(initial), [initial])
  useEffect(() => setCategory(initialCategory), [initialCategory])
  const [sort, setSort] = useState('featured')
  const [view,setView] = useState(()=>readText('marchy-product-view','grid')==='list'?'list':'grid')
  useEffect(()=>{try{localStorage.setItem('marchy-product-view',view)}catch{}},[view])
  const catalogueMaxPrice = Math.max(100, Math.ceil(Math.max(...products.map(p => p.price)) / 50) * 50)
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(catalogueMaxPrice)
  const [city, setCity] = useState('All')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [page, setPage] = useState(1)
  const [compareIds, setCompareIds] = useState(() => readJson('marchy-compare', []))
  const [compareOpen, setCompareOpen] = useState(false)
  const pageSize = 12
  const cities = ['All', ...new Set(products.map(p => sellerForProduct(p).city))].sort((a,b) => a === 'All' ? -1 : b === 'All' ? 1 : a.localeCompare(b))
  const categoryCounts = useMemo(() => products.reduce((counts, p) => ({...counts, [p.category]: (counts[p.category] || 0) + 1}), {}), [])
  const results = useMemo(() => products.filter(p => {
    const seller = sellerForProduct(p)
    const haystack = [p.name, p.category, p.seller, seller.name, seller.city, p.description || ''].join(' ')
    return (category === 'All' || p.category === category) && p.price >= minPrice && p.price <= maxPrice && (city === 'All' || seller.city === city) && (!dealsOnly || Boolean(p.oldPrice)) && searchTextMatches(haystack, term)
  }).sort((a, b) => {
    if (sort === 'price-low') return a.price - b.price
    if (sort === 'price-high') return b.price - a.price
    if (sort === 'name') return a.name.localeCompare(b.name)
    if (sort === 'newest') return b.id - a.id
    if (sort === 'savings') return ((b.oldPrice || b.price) - b.price) - ((a.oldPrice || a.price) - a.price)
    if (term.trim()) {
      const score = product => {
        const q = normalizeSearchText(term)
        const name = normalizeSearchText(product.name)
        const categoryName = normalizeSearchText(product.category)
        const sellerName = normalizeSearchText(sellerForProduct(product).name)
        return (name === q ? 100 : name.startsWith(q) ? 60 : name.includes(q) ? 40 : 0) + (categoryName.includes(q) ? 18 : 0) + (sellerName.includes(q) ? 8 : 0)
      }
      return score(b) - score(a)
    }
    return b.id - a.id
  }), [term, category, sort, minPrice, maxPrice, dealsOnly, city])
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize))
  const visibleResults = results.slice((page - 1) * pageSize, page * pageSize)
  const activeFilterCount = Number(Boolean(term)) + Number(category !== 'All' && !routeCategory) + Number(city !== 'All') + Number(minPrice > 0) + Number(maxPrice < catalogueMaxPrice) + Number(dealsOnly)
  useEffect(() => setPage(1), [term, category, sort, minPrice, maxPrice, dealsOnly, city])
  const updateTerm = value => {
    setTerm(value)
    const next = new URLSearchParams(params)
    if (value.trim()) next.set('q', value)
    else next.delete('q')
    setParams(next, { replace: true })
  }
  const clearFilters = () => {
    setCategory(routeCategory ? initialCategory : 'All')
    setMinPrice(0)
    setMaxPrice(catalogueMaxPrice)
    setTerm('')
    setCity('All')
    setPage(1)
    setParams({}, { replace: true })
  }
  const removeDealFilter = () => {
    const next = new URLSearchParams(params)
    next.delete('deal')
    setParams(next, { replace: true })
  }
  const toggleCompare = id => setCompareIds(current => current.includes(id) ? current.filter(item => item !== id) : current.length < 3 ? [...current, id] : current)
  useEffect(() => writeJson('marchy-compare', compareIds), [compareIds])
  const comparedProducts = compareIds.map(id => products.find(product => product.id === id)).filter(Boolean)
  const removeCategoryFilter = () => {
    if (routeCategory) navigate('/search')
    else setCategory('All')
  }
  if (isInvalidCategory) return translateTree(<main id="main-content" className='shell page'><div className='breadcrumbs' role='navigation' aria-label='Breadcrumb'><Link to='/'>Home</Link> / <Link to='/categories'>Categories</Link></div><div className='empty-state'><span>⌕</span><h2>Category not found</h2><p>This category does not exist in the MARCHY catalogue.</p><Link to='/categories' className='primary-btn'>Browse all categories →</Link></div></main>, language)
  return translateTree(<main id="main-content" className="shell page">
    <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / Marketplace</div>
    <div className="listing-head">
      <div><span className="eyebrow">{routeCategory ? "EXPLORE THIS CATEGORY" : "SHOP THE MARCHY MARKETPLACE"}</span><h1>{routeCategory ? category : "Find what you’re looking for."}</h1><p className="muted">{routeCategory ? "Browse products in this category." : results.length + " products to explore"}</p></div>
      <div className="listing-search"><input aria-label="Search marketplace" value={term} onChange={e => updateTerm(e.target.value)} placeholder="What are you looking for?"/><span>⌕</span></div>
    </div>
    <div className="mobile-filter-toggle"><button type="button" className="outline-btn" onClick={() => setFiltersOpen(v => !v)} aria-expanded={filtersOpen} aria-controls="marketplace-filters">☷ Filters {activeFilterCount > 0 ? '· ' + activeFilterCount + ' active' : ''}</button><span>{results.length} results</span></div>
    {activeFilterCount > 0 && <div className="active-filter-chips" aria-label="Active filters">
      {term && <button type="button" onClick={() => updateTerm('')}>Search: {term} <span>×</span></button>}
      {category !== 'All' && !routeCategory && <button type="button" onClick={removeCategoryFilter}>{category} <span>×</span></button>}
      {city !== 'All' && <button type="button" onClick={() => setCity('All')}>{city} <span>×</span></button>}
      {minPrice > 0 && <button type="button" onClick={() => setMinPrice(0)}>From {minPrice} TND <span>×</span></button>}
      {maxPrice < catalogueMaxPrice && <button type="button" onClick={() => setMaxPrice(catalogueMaxPrice)}>Up to {maxPrice} TND <span>×</span></button>}
      {dealsOnly && <button type="button" onClick={removeDealFilter}>Deals only <span>×</span></button>}
      <button type="button" className="clear-filter-chips" onClick={clearFilters}>Clear all</button>
    </div>}
    {routeCategory && <div className="category-context-strip"><span className="category-context-icon">✦</span><div><b>{category}</b><small>Browse sample listings, compare displayed prices and visit demo storefronts.</small></div><Link to="/categories">All categories →</Link></div>}
    <div className="listing-layout">
      <aside id="marketplace-filters" className={'filters ' + (filtersOpen ? 'filters-open' : '')} aria-label="Marketplace filters">
        <h3>Filters <button type="button" onClick={clearFilters}>Clear all</button></h3>
        <div className="filter-group"><b>Category</b>{categories.map(c => <label key={c}><input type="radio" name="marketplace-category" checked={category === c} onChange={() => routeCategory ? navigate(c === "All" ? "/search" : "/category/" + encodeURIComponent(c.toLowerCase())) : setCategory(c)}/><span>{c === 'All' ? 'All categories' : c}</span><small>{c === 'All' ? products.length : (categoryCounts[c] || 0)}</small></label>)}</div>
        <div className="filter-group"><b>Seller location</b><select aria-label="Seller location" value={city} onChange={e => setCity(e.target.value)}>{cities.map(c => <option key={c} value={c}>{c === 'All' ? 'All locations' : c}</option>)}</select></div>
        <div className="filter-group price-filter-group"><b>Price range</b><div className="price-inputs"><label>Min <input aria-label="Minimum price in TND" type="number" min="0" max={maxPrice} value={minPrice} onChange={e => setMinPrice(Math.min(maxPrice, Math.max(0, Number(e.target.value) || 0)))}/></label><label>Max <input aria-label="Maximum price in TND" type="number" min="0" max={catalogueMaxPrice} value={maxPrice} onChange={e => setMaxPrice(Math.max(minPrice, Math.min(catalogueMaxPrice, Number(e.target.value) || 0)))}/></label></div><input aria-label="Maximum price" type="range" min="0" max={catalogueMaxPrice} step="5" value={maxPrice} onChange={e => setMaxPrice(Math.max(minPrice, Number(e.target.value)))}/><div className="price-range-labels"><span>0 TND</span><span>{catalogueMaxPrice} TND</span></div></div>
        {dealsOnly && <div className="filter-note">Showing sample listings with illustrative previous prices. Discount claims are not verified offers.</div>}
        <button className="filter-apply" type="button" onClick={() => setFiltersOpen(false)}>Show {results.length} products</button>
      </aside>
      <section className="listing-results" aria-live="polite">
        <div className="results-toolbar"><span aria-live="polite">Showing <b>{results.length ? ((page - 1) * pageSize) + 1 : 0}–{Math.min(page * pageSize, results.length)}</b> of <b>{results.length}</b></span><div className="results-toolbar-actions"><div className="listing-view-toggle" role="group" aria-label="Product layout"><button type="button" aria-label="Grid view" aria-pressed={view==='grid'} className={view==='grid'?'is-active':''} onClick={()=>setView('grid')}>▦ <span>Grid</span></button><button type="button" aria-label="List view" aria-pressed={view==='list'} className={view==='list'?'is-active':''} onClick={()=>setView('list')}>☷ <span>List</span></button></div><label>Sort by <select aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Best match</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A to Z</option><option value="newest">Recently added</option><option value="savings">Biggest displayed difference</option></select></label></div></div>
        {compareIds.length > 0 && <section className="compare-tray" aria-label="Product comparison">
          <div className="compare-tray-heading"><div><b>Compare sample listings</b><span>{compareIds.length} of 3 selected · prices and seller details are illustrative</span></div><div><button type="button" className="compare-clear" onClick={() => {setCompareIds([]);setCompareOpen(false)}}>Clear</button><button type="button" className="compare-show" disabled={compareIds.length < 2} onClick={() => setCompareOpen(v => !v)}>{compareOpen ? 'Hide comparison' : 'Compare now'}</button></div></div>
          {compareIds.length < 2 && <p className="compare-hint">Select at least one more product to compare.</p>}
          {compareOpen && <div className="compare-table-wrap"><table className="compare-table"><thead><tr><th scope="col">Listing</th>{comparedProducts.map(product => <th scope="col" key={product.id}><Link to={'/product/' + product.id}>{product.name}</Link><button type="button" onClick={() => toggleCompare(product.id)} aria-label={'Remove ' + product.name + ' from comparison'}>×</button></th>)}</tr></thead><tbody>
            <tr><th scope="row">Displayed price</th>{comparedProducts.map(product => <td key={product.id}>{money(product.price)}</td>)}</tr>
            <tr><th scope="row">Illustrative reference price</th>{comparedProducts.map(product => <td key={product.id}>{product.oldPrice ? money(product.oldPrice) : 'Not supplied'}</td>)}</tr>
            <tr><th scope="row">Displayed price difference</th>{comparedProducts.map(product => <td key={product.id}>{product.oldPrice ? money(product.oldPrice - product.price) : 'Not supplied'}</td>)}</tr>
            <tr><th scope="row">Description</th>{comparedProducts.map(product => <td key={product.id}>{product.description || 'No description supplied'}</td>)}</tr>
            <tr><th scope="row">Category</th>{comparedProducts.map(product => <td key={product.id}>{product.category}</td>)}</tr>
            <tr><th scope="row">Seller</th>{comparedProducts.map(product => <td key={product.id}>{sellerForProduct(product).name}</td>)}</tr>
            <tr><th scope="row">Seller location</th>{comparedProducts.map(product => <td key={product.id}>{sellerForProduct(product).city}</td>)}</tr>
            <tr><th scope="row">Listing status</th>{comparedProducts.map(product => <td key={product.id}>Sample listing · availability unconfirmed</td>)}</tr>
          </tbody></table><p className="compare-disclaimer">This comparison uses only information in MARCHY’s illustrative catalogue. It does not compare technical specifications, product condition, verified stock or delivery terms.</p></div>}
        </section>}
        {results.length ? <><div className={`product-grid ${view==='list'?'product-list-view':''}`}>{visibleResults.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language} compareIds={compareIds} toggleCompare={toggleCompare}/>)}</div>{pageCount > 1 && <nav className="pagination" aria-label="Product pages"><button type="button" disabled={page === 1} onClick={() => setPage(v => Math.max(1, v - 1))}>← Previous</button><span>Page {page} of {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage(v => Math.min(pageCount, v + 1))}>Next →</button></nav>}</> : <div className="empty-state"><span>⌕</span><h3>No products found</h3><p>Try a broader search, choose another category or reset your price and location filters.</p><button type="button" className="outline-btn" onClick={clearFilters}>Reset all filters</button></div>}
      </section>
    </div>
  </main>, language)
}

function ProductPage({ addToCart, wishlist, toggleWish, language }) {
  const { id } = useParams()
  const product = products.find(p => p.id === Number(id))
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)
  const [imageZoomOpen,setImageZoomOpen]=useState(false)
  const [shareFeedback,setShareFeedback]=useState('')
  const [isCompared,setIsCompared]=useState(()=>readJson('marchy-compare',[]).includes(Number(id)))
  const [compareFeedback,setCompareFeedback]=useState('')
  useEffect(()=>{setIsCompared(readJson('marchy-compare',[]).includes(Number(id)));setCompareFeedback('')},[id])
  const toggleProductCompare=()=>{
    const selected=readJson('marchy-compare',[]).filter(item=>products.some(entry=>entry.id===item))
    if(selected.includes(Number(id))){writeJson('marchy-compare',selected.filter(item=>item!==Number(id)));setIsCompared(false);setCompareFeedback('Removed from comparison')}
    else if(selected.length>=3){setCompareFeedback('You can compare up to 3 listings')}
    else{writeJson('marchy-compare',[...selected,Number(id)]);setIsCompared(true);setCompareFeedback('Added to comparison')}
  }
  const handleShare=async()=>{
    const shareData={title:product?.name||'MARCHY listing',text:'View this sample listing on MARCHY',url:window.location.href}
    try{
      if(navigator.share){await navigator.share(shareData);setShareFeedback('Share options opened');return}
      if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(shareData.url);setShareFeedback('Listing link copied')}
      else{
        const field=document.createElement('textarea');field.value=shareData.url;field.setAttribute('readonly','');field.style.position='absolute';field.style.left='-9999px';document.body.appendChild(field);field.select();const copied=document.execCommand('copy');field.remove();setShareFeedback(copied?'Listing link copied':'Copy is unavailable in this browser')
      }
    }catch(error){if(error?.name!=='AbortError')setShareFeedback('Could not share this listing')}
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
  if (!product) return translateTree(<main id="main-content" className="shell page empty-state"><span>⌕</span><h2>Product not found</h2><p>This listing may have moved or is no longer available in the sample catalogue.</p><Link to="/search" className="primary-btn">Back to marketplace →</Link></main>, language)
  const seller = sellerForProduct(product)
  const related = products.filter(p => p.category === product.category && p.id !== product.id).slice(0, 4)
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
  const discount = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : 0
  const handleAdd = () => { addToCart(product, qty); setAdded(true) }
  return translateTree(<main id="main-content" className="shell page product-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/search">Marketplace</Link><span>/</span><Link to={`/category/${encodeURIComponent(product.category.toLowerCase())}`}>{product.category}</Link><span>/</span><span aria-current="page">{product.name}</span></nav>
    <div className="product-detail-layout">
      <section className="product-visual-column" aria-label="Product images">
        <div className="product-image-stage">
          <img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={product.image} alt={product.name} fetchPriority="high" />
          <button type="button" className="product-image-zoom-button" onClick={()=>setImageZoomOpen(true)} aria-label="Enlarge product image">⤢</button>
          <span className="product-image-label">MARCHY SAMPLE</span>
          {discount > 0 && <span className="product-image-discount">-{discount}%</span>}
        </div>
        <div className="product-image-caption"><span>01 / 01</span><span>Product image for this illustrative listing</span></div>
        <div className="product-visual-note"><span>ⓘ</span><p>Images and listing information are provided as demonstration content. Confirm the exact item with the seller before ordering.</p></div>
      </section>
      <section className="product-buy-panel">
        <div className="product-buy-topline"><Link to={`/category/${encodeURIComponent(product.category.toLowerCase())}`} className="product-category-pill">{product.category}</Link><div className="product-topline-actions"><span className="sample-status">Sample listing</span><button type="button" className={`product-compare-button ${isCompared?'is-compared':''}`} aria-pressed={isCompared} onClick={toggleProductCompare}>{isCompared?'✓ Compared':'＋ Compare'}</button><button type="button" className="product-share-button" onClick={handleShare}>↗ Share</button></div></div>{shareFeedback&&<p className="product-share-feedback" role="status">{shareFeedback}</p>}{compareFeedback&&<p className="product-compare-feedback" role="status">{compareFeedback} · <Link to="/search">Open comparison</Link></p>}
        <h1>{product.name}</h1>
        <div className="product-price-block"><strong>{money(product.price)}</strong>{product.oldPrice && <del>{money(product.oldPrice)}</del>}{discount > 0 && <span>{discount}% illustrative difference</span>}</div>
        <p className="product-price-caption">Displayed in Tunisian dinars (TND). Final price and availability must be confirmed with the seller.</p>
        <div className="product-listing-status"><span className="status-dot"></span><div><b>Availability to be confirmed</b><small>This is not live stock information.</small></div></div>
        <div className="product-purchase-controls">
          <span className="product-quantity-label">Quantity</span>
          <div className="product-purchase-row">
            <div className="quantity product-quantity" role="group" aria-label="Quantity">
              <button type="button" aria-label="Decrease quantity" disabled={qty <= 1} onClick={() => setQty(v => Math.max(1, v - 1))}>−</button>
              <output id="product-quantity" aria-label="Selected quantity" aria-live="polite">{qty}</output>
              <button type="button" aria-label="Increase quantity" disabled={qty >= 99} onClick={() => setQty(v => Math.min(99, v + 1))}>＋</button>
            </div>
            <button type="button" className="primary-btn product-add-button" onClick={handleAdd}>{added ? 'Added to cart ✓' : 'Add to cart'}</button>
            <button type="button" className={`product-save-button ${saved ? 'is-saved' : ''}`} aria-label={saved ? 'Remove from saved items' : 'Save for later'} aria-pressed={saved} onClick={() => toggleWish(product.id)}>{saved ? '♥' : '♡'}</button>
          </div>
          {added && <p className="product-added-feedback" role="status">Added to your demo cart. You can review it whenever you're ready.</p>}
        </div>
        <div className="product-seller-card">
          <span className="seller-avatar">{seller.name.slice(0, 1)}</span>
          <div className="product-seller-copy"><small>Seller storefront</small><b>{seller.name}</b><span>{seller.city}, Tunisia · Demo profile</span></div>
          <Link to={`/seller/${seller.slug}`}>View seller <span>→</span></Link>
        </div>
        <div className="product-delivery-card"><span className="delivery-symbol">⌖</span><div><b>Delivery details confirmed by seller</b><p>Ask the seller about delivery coverage, cost and estimated timing before placing an order.</p></div></div>
        <p className="product-demo-disclaimer">Frontend demonstration only. No order, payment or delivery booking is submitted.</p>
      </section>
    </div>
    <section className="product-information-grid">
      <article className="product-information-card">
        <span className="eyebrow">PRODUCT DETAILS</span><h2>About this listing</h2>
        <p>{product.description || 'No product information has been supplied for this sample listing. Contact the seller to confirm the exact product, condition, specifications and what is included.'}</p>
        <dl className="product-attribute-list"><div><dt>Category</dt><dd>{product.category}</dd></div><div><dt>Seller location</dt><dd>{seller.city}, Tunisia</dd></div><div><dt>Price display</dt><dd>Tunisian dinar (TND)</dd></div><div><dt>Listing type</dt><dd>Sample catalogue</dd></div></dl>
      </article>
      <article className="product-information-card product-order-checklist">
        <span className="eyebrow">BEFORE YOU ORDER</span><h2>Confirm these details with the seller</h2>
        <ul>{sellerQuestions.map(question=><li key={question}>{question}</li>)}</ul>
        <Link to={`/seller/${seller.slug}`} className="text-link">Visit {seller.name}'s storefront →</Link>
      </article>
    </section>
    {related.length > 0 && <section className="section related-products"><div className="section-heading"><div><span className="eyebrow">KEEP EXPLORING</span><h2>More from {product.category}</h2></div><Link to={`/category/${encodeURIComponent(product.category.toLowerCase())}`} className="text-link">Browse category →</Link></div><div className="product-grid">{related.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language}/>)}</div></section>}
    {imageZoomOpen&&<div className="product-image-lightbox" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setImageZoomOpen(false)}}><section role="dialog" aria-modal="true" aria-label={`Image preview: ${product.name}`} className="product-image-lightbox-dialog"><button type="button" autoFocus className="product-image-lightbox-close" onClick={()=>setImageZoomOpen(false)} aria-label="Close image preview">×</button><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={product.image} alt={product.name}/><p>{product.name} · Sample catalogue image</p></section></div>}
    <div className="product-mobile-buybar"><div><small>Price</small><b>{money(product.price)}</b></div><button type="button" className="primary-btn" onClick={handleAdd}>{added ? 'Added ✓' : 'Add to cart'}</button></div>
  </main>, language)
}

function CartPage({ cart, updateQty, removeItem, language }) {
  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0)
  const itemCount = cart.reduce((sum, item) => sum + item.qty, 0)
  const sellerCount = new Set(cart.map(item => sellerForProduct(item).slug)).size
  const sellerGroups = [...new Set(cart.map(item => sellerForProduct(item).slug))].map(slug => {
    const seller = sellers.find(entry => entry.slug === slug)
    const items = cart.filter(item => sellerForProduct(item).slug === slug)
    return { seller, items, subtotal: items.reduce((sum, item) => sum + item.price * item.qty, 0) }
  })
  return translateTree(<main id="main-content" className="shell page cart-page">
    <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><span aria-current="page">Your cart</span></div>
    <div className="cart-page-heading">
      <div><span className="eyebrow">YOUR MARCHY BASKET</span><h1>Your shopping cart</h1><p>{itemCount} items · {cart.length} products · {sellerCount} sellers</p></div>
      <Link to="/search" className="cart-continue-link">← Continue shopping</Link>
    </div>
    {cart.length ? <div className="cart-layout">
      <section className="cart-items-panel" aria-label="Cart items">
        <div className="cart-panel-heading"><b>Items in your cart</b><span>{cart.length} product{cart.length === 1 ? '' : 's'}</span></div>
        {sellerGroups.map(group => <section className="cart-seller-group" key={group.seller.slug} aria-label={`Items from ${group.seller.name}`}>
          <div className="cart-seller-group-heading"><div><span className="seller-avatar">{group.seller.name.slice(0,1)}</span><div><b>{group.seller.name}</b><small>{group.seller.city}, Tunisia · sample storefront</small></div></div><strong>{money(group.subtotal)}</strong></div>
          {group.items.map(item => <article className="cart-item" key={item.id}>
            <Link to={`/product/${item.id}`} className="cart-item-photo"><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={item.image} alt={item.name} loading="lazy"/></Link>
            <div className="cart-item-info">
              <Link to={`/product/${item.id}`} className="cart-item-name">{item.name}</Link>
              <small>{group.seller.name} · {group.seller.city}, Tunisia</small>
              <b className="cart-item-unit-price">{money(item.price)} <span>each</span></b>
              <button type="button" className="remove-link" onClick={() => removeItem(item.id)}>Remove item</button>
            </div>
            <div className="cart-item-quantity"><span>Quantity</span><div className="quantity">
              <button type="button" aria-label={`Decrease ${item.name} quantity`} disabled={item.qty <= 1} onClick={() => updateQty(item.id, item.qty - 1)}>−</button>
              <output aria-live="polite">{item.qty}</output>
              <button type="button" aria-label={`Increase ${item.name} quantity`} disabled={item.qty >= 99} onClick={() => updateQty(item.id, Math.min(99, item.qty + 1))}>＋</button>
            </div></div>
            <strong className="cart-line-total">{money(item.price * item.qty)}</strong>
          </article>)}
          <div className="cart-seller-group-footer"><span>Seller subtotal</span><b>{money(group.subtotal)}</b></div>
        </section>)}
        <div className="cart-panel-footer"><span>Need something else?</span><Link to="/categories">Explore all categories →</Link></div>
      </section>
      <aside className="summary-card cart-summary">
        <div className="cart-summary-title"><div><span className="eyebrow">YOUR ORDER</span><h2>Order summary</h2></div><span className="cart-summary-count">{itemCount} items</span></div>
        <div className="cart-summary-row"><span>Products subtotal</span><b>{money(subtotal)}</b></div>
        <div className="cart-summary-row"><span>Delivery</span><b className="summary-pending">To be confirmed</b></div>
        <div className="cart-summary-row"><span>Discounts</span><b>—</b></div>
        <div className="summary-total"><span>Estimated product total</span><strong>{money(subtotal)}</strong></div>
        <p className="cart-summary-note">Delivery charges, availability and final prices are not yet connected to live seller systems. They are not included in this estimate.</p>
        <Link to="/checkout" className="primary-btn full-btn cart-checkout-button">Continue to checkout <span>→</span></Link>
        <div className="cart-trust-note"><span>ⓘ</span><p>You're reviewing a sample basket. No payment is taken and no order is placed.</p></div>
      </aside>
    </div> : <div className="cart-empty-state"><div className="cart-empty-icon">🛒</div><span className="eyebrow">A FRESH START</span><h2>Your cart is empty</h2><p>Explore the marketplace and add products you'd like to come back to.</p><div><Link to="/search" className="primary-btn">Explore products →</Link><Link to="/categories" className="cart-empty-secondary">Browse categories</Link></div></div>}
  </main>, language)
}

function CheckoutPage({cart,language}) {
  const [step,setStep]=useState(1)
  const [details,setDetails]=useState({name:'',phone:'',city:'',address:'',notes:''})
  const [reviewed,setReviewed]=useState(false)
  const navigate=useNavigate()
  const subtotal=cart.reduce((sum,item)=>sum+item.price*item.qty,0)
  const itemCount=cart.reduce((sum,item)=>sum+item.qty,0)
  const groups=[...new Set(cart.map(item=>sellerForProduct(item).slug))].map(slug=>{
    const seller=sellers.find(entry=>entry.slug===slug)
    const items=cart.filter(item=>sellerForProduct(item).slug===slug)
    return {seller,items,subtotal:items.reduce((sum,item)=>sum+item.price*item.qty,0)}
  })
  const update=(key,value)=>setDetails(current=>({...current,[key]:value}))
  if(!cart.length)return translateTree(<main id="main-content" className="shell page checkout-page"><div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/cart">Cart</Link><span>/</span><span>Checkout</span></div><div className="cart-empty-state"><div className="cart-empty-icon">🛒</div><span className="eyebrow">NOTHING TO CHECK OUT</span><h1>Your cart is empty</h1><p>Add products before starting checkout.</p><Link to="/search" className="primary-btn">Explore products →</Link></div></main>,language)
  return translateTree(<main id="main-content" className="shell page checkout-page">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/cart">Cart</Link><span>/</span><span aria-current="page">Checkout preview</span></div>
    <div className="checkout-heading"><div><span className="eyebrow">A CLEARER WAY TO CHECK OUT</span><h1>Review your order</h1><p>Confirm the details a real marketplace would need before any order is placed.</p></div><Link to="/cart" className="cart-continue-link">← Back to cart</Link></div>
    <ol className="checkout-steps" aria-label="Checkout progress">
      <li className={step>=1?'is-current':''} aria-current={step===1?'step':undefined}><span>1</span><div><b>Delivery details</b><small>Your contact and address</small></div></li>
      <li className={step>=2?'is-current':''} aria-current={step===2?'step':undefined}><span>2</span><div><b>Order review</b><small>Products and sellers</small></div></li>
      <li className={step>=3?'is-current':''} aria-current={step===3?'step':undefined}><span>3</span><div><b>Preview complete</b><small>No order submitted</small></div></li>
    </ol>
    <div className="checkout-layout">
      <section className="checkout-main-panel" aria-live="polite">
        {step===1&&<form className="checkout-form" onSubmit={event=>{event.preventDefault();setStep(2);window.scrollTo({top:0,behavior:'smooth'})}}>
          <div className="checkout-panel-title"><span className="eyebrow">STEP 01</span><h2>Where should the seller contact you?</h2><p>This information stays in this page session and is not sent or saved.</p></div>
          <div className="checkout-fields">
            <label>Full name<input autoComplete="name" required value={details.name} onChange={e=>update('name',e.target.value)} placeholder="Your full name"/></label>
            <label>Phone number<input autoComplete="tel" type="tel" required inputMode="tel" pattern="[+0-9() .-]{7,20}" value={details.phone} onChange={e=>update('phone',e.target.value)} placeholder="+216 XX XXX XXX"/></label>
            <label>City<input autoComplete="address-level2" required value={details.city} onChange={e=>update('city',e.target.value)} placeholder="e.g. Tunis"/></label>
            <label className="checkout-field-wide">Delivery address<input autoComplete="street-address" required value={details.address} onChange={e=>update('address',e.target.value)} placeholder="Street, building and neighbourhood"/></label>
            <label className="checkout-field-wide">Delivery notes <span className="checkout-optional">Optional</span><textarea value={details.notes} onChange={e=>update('notes',e.target.value)} rows="3" placeholder="Landmark or useful delivery instructions"/></label>
          </div>
          <div className="checkout-form-actions"><span>Required fields are marked by the browser.</span><button type="submit" className="primary-btn">Review order <span>→</span></button></div>
        </form>}
        {step===2&&<section className="checkout-review">
          <div className="checkout-panel-title"><span className="eyebrow">STEP 02</span><h2>Review before proceeding</h2><p>Each seller handles their own availability and delivery confirmation.</p></div>
          <div className="checkout-contact-review"><div><b>Delivery contact</b><button type="button" className="text-link" onClick={()=>setStep(1)}>Edit details</button></div><p>{details.name} · {details.phone}</p><p>{details.address}, {details.city}</p>{details.notes&&<small>{details.notes}</small>}</div>
          {groups.map(group=><article className="checkout-seller-review" key={group.seller.slug}><div className="checkout-seller-heading"><div><span className="seller-avatar">{group.seller.name.slice(0,1)}</span><div><b>{group.seller.name}</b><small>{group.seller.city} · sample storefront</small></div></div><strong>{money(group.subtotal)}</strong></div>{group.items.map(item=><div className="checkout-review-item" key={item.id}><img src={item.image} alt="" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}}/><span>{item.name}<small>Qty {item.qty} × {money(item.price)}</small></span><b>{money(item.price*item.qty)}</b></div>)}<div className="checkout-delivery-status"><span>Delivery and stock</span><b>To be confirmed by seller</b></div></article>)}
          <div className="checkout-review-actions"><button type="button" className="outline-btn" onClick={()=>setStep(1)}>← Edit delivery details</button><button type="button" className="primary-btn" onClick={()=>setStep(3)}>Continue to final preview <span>→</span></button></div>
        </section>}
        {step===3&&<section className="checkout-complete-preview">
          <div className="checkout-preview-icon">✓</div><span className="eyebrow">FRONTEND PREVIEW COMPLETE</span><h2>Your checkout flow is ready for a live integration</h2><p>Your details and basket have been reviewed on this device. No order has been created, no seller has been contacted, and no payment has been taken.</p>
          <div className="checkout-next-list"><b>What a live marketplace would do next</b><ul><li>Verify each seller's stock and final price</li><li>Confirm delivery coverage, fees and timing per seller</li><li>Present a final payable total before payment</li><li>Create an order only after explicit confirmation</li></ul></div>
          <div className="checkout-review-actions"><button type="button" className="outline-btn" onClick={()=>setStep(2)}>← Back to review</button><button type="button" className="primary-btn" onClick={()=>navigate('/search')}>Continue shopping</button></div>
        </section>}
      </section>
      <aside className="summary-card checkout-summary"><span className="eyebrow">YOUR BASKET</span><h2>Order summary</h2><div className="cart-summary-row"><span>{itemCount} items · {cart.length} products</span><b>{money(subtotal)}</b></div><div className="cart-summary-row"><span>Delivery</span><b className="summary-pending">To be confirmed</b></div><div className="summary-total"><span>Estimated product total</span><strong>{money(subtotal)}</strong></div><p className="cart-summary-note">Delivery is not included. Each seller must confirm their own delivery fees and availability.</p><div className="checkout-seller-count"><b>{groups.length}</b><span>sample seller{groups.length===1?'':'s'} in this basket</span></div><div className="cart-trust-note"><span>ⓘ</span><p>Demo only. This checkout does not submit personal data or process payments.</p></div></aside>
    </div>
  </main>,language)
}

function WishlistPage({ products: allProducts, wishlist, toggleWish, addToCart, language }) {
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

function SellersPage({language}) {
 const [term,setTerm]=useState('')
 const [city,setCity]=useState('All')
 const [category,setCategory]=useState('All')
 const cities=['All',...new Set(sellers.map(s=>s.city))].sort((a,b)=>a==='All'?-1:b==='All'?1:a.localeCompare(b))
 const sellerCategories=['All',...new Set(sellers.flatMap(s=>s.categories))].sort((a,b)=>a==='All'?-1:b==='All'?1:a.localeCompare(b))
 const visible=sellers.filter(s=>(city==='All'||s.city===city)&&(category==='All'||s.categories.includes(category))&&searchTextMatches([s.name,s.city,s.tagline,...s.categories].join(' '),term))
 return translateTree(<main id="main-content" className="shell page seller-directory-page"><div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / Sellers</div><section className="seller-directory-hero"><span className="eyebrow">DISCOVER LOCAL BUSINESSES</span><h1>Meet the sellers behind the finds.</h1><p>Explore sample storefronts from across Tunisia. Profiles and listings are demonstration content, not verified businesses.</p><div className="seller-directory-stats"><span><b>{sellers.length}</b><small>Sample storefronts</small></span><span><b>{new Set(sellers.map(s=>s.city)).size}</b><small>Locations represented</small></span><span><b>{products.length}</b><small>Sample listings</small></span></div></section>
 <section className="seller-directory-tools" aria-label="Find a seller"><label className="seller-directory-search"><span>⌕</span><input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Search shops, products or locations" aria-label="Search sellers"/></label><label>City<select value={city} onChange={e=>setCity(e.target.value)}>{cities.map(x=><option key={x}>{x}</option>)}</select></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{sellerCategories.map(x=><option key={x}>{x}</option>)}</select></label><button type="button" className="seller-directory-reset" onClick={()=>{setTerm('');setCity('All');setCategory('All')}}>Reset</button></section>
 <div className="seller-directory-results"><b>{visible.length} storefront{visible.length===1?'':'s'}</b><span>Sample profiles · not independently verified</span></div>
 {visible.length?<div className="seller-directory-grid">{visible.map(s=><article className="seller-directory-card" key={s.slug}><div className="seller-card-top"><span className="seller-avatar large">{s.name.slice(0,1)}</span><span className="demo-label">DEMO STOREFRONT</span></div><h2>{s.name}</h2><p className="seller-location">⌖ {s.city}, Tunisia</p><p>{s.tagline}</p><div className="seller-category-tags">{s.categories.map(c=><span key={c}>{c}</span>)}</div><Link to={`/seller/${s.slug}`} className="seller-visit-link">View storefront <span>→</span></Link></article>)}</div>:<div className="empty-state seller-directory-empty"><span>⌕</span><h2>No matching storefronts</h2><p>Try another shop name, city or category.</p><button type="button" className="outline-btn" onClick={()=>{setTerm('');setCity('All');setCategory('All')}}>Clear seller filters</button></div>}
 </main>,language)
}

function SellerPage({language,addToCart,wishlist,toggleWish}) {
 const {slug}=useParams(); const seller=sellers.find(s=>s.slug===slug)
 const [search,setSearch]=useState(''); const [category,setCategory]=useState('All'); const [sort,setSort]=useState('featured')
 const [view,setView]=useState(()=>readText('marchy-store-view','grid')==='list'?'list':'grid')
 const [shareFeedback,setShareFeedback]=useState('')
 const filtersActive=Boolean(search.trim())||category!=='All'
 const clearStoreFilters=()=>{setSearch('');setCategory('All')}
 const shareStorefront=async()=>{
  const shareData={title:`${seller?.name||'MARCHY'} storefront`,text:'Explore this sample storefront on MARCHY',url:window.location.href}
  try{
   if(navigator.share){await navigator.share(shareData);setShareFeedback('Share options opened');return}
   if(navigator.clipboard?.writeText){await navigator.clipboard.writeText(shareData.url);setShareFeedback('Storefront link copied')}
   else{const field=document.createElement('textarea');field.value=shareData.url;field.setAttribute('readonly','');field.style.position='absolute';field.style.left='-9999px';document.body.appendChild(field);field.select();const copied=document.execCommand('copy');field.remove();setShareFeedback(copied?'Storefront link copied':'Copy is unavailable in this browser')}
  }catch(error){if(error?.name!=='AbortError')setShareFeedback('Could not share this storefront')}
 }
 useEffect(()=>{try{localStorage.setItem('marchy-store-view',view)}catch{}},[view])
 if(!seller)return <main id="main-content" className="shell page empty-state"><h2>Storefront not found</h2><Link to="/sellers" className="text-link">Browse sellers →</Link></main>
 const items=products.filter(p=>sellerForProduct(p).slug===seller.slug)
 const storeCategories=['All',...new Set(items.map(p=>p.category))]
 const visibleItems=items.filter(p=>(category==='All'||p.category===category)&&searchTextMatches([p.name,p.category,p.description||''].join(' '),search)).sort((a,b)=>sort==='low'?a.price-b.price:sort==='high'?b.price-a.price:sort==='name'?a.name.localeCompare(b.name):0)
 return translateTree(<main id="main-content" className="shell page seller-store-page"><div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / <Link to="/sellers">Sellers</Link> / {seller.name}</div><section className="seller-store-hero"><div className="seller-store-cover"><span className="seller-cover-wordmark">{seller.name.split(' ').map(x=>x[0]).join('')}</span><span className="seller-cover-caption">LOCAL FINDS · MARCHY STOREFRONT</span></div><div className="seller-store-identity"><span className="seller-avatar store-avatar">{seller.name.slice(0,1)}</span><div><span className="demo-label">DEMO STOREFRONT · NOT VERIFIED</span><h1>{seller.name}</h1><p>⌖ {seller.city}, Tunisia</p></div></div><p className="seller-store-tagline">{seller.tagline}</p><p className="muted">{seller.description}</p><div className="seller-store-hero-actions"><button type="button" className="outline-btn" onClick={shareStorefront}>↗ Share storefront</button><Link to="/sellers" className="text-link">Discover other sellers →</Link></div>{shareFeedback&&<p className="seller-share-feedback" role="status">{shareFeedback}</p>}<div className="seller-category-tags">{seller.categories.map(c=><Link key={c} to={`/category/${encodeURIComponent(c.toLowerCase())}`}>{c}</Link>)}</div><div className="seller-store-meta"><span><b>{items.length}</b> sample listings</span><span>Seller information requires confirmation</span></div></section><div className="section-heading seller-products-heading"><div><span className="eyebrow">SHOP THIS STOREFRONT</span><h2>Products from {seller.name}</h2><p className="muted" aria-live="polite">{visibleItems.length} of {items.length} illustrative listings{filtersActive?' · filters applied':''}</p></div><Link to="/sellers" className="text-link">All sellers →</Link></div><div className="store-product-tools"><div className="store-category-filters" role="group" aria-label="Filter storefront products">{storeCategories.map(c=><button type="button" key={c} className={category===c?'active':''} aria-pressed={category===c} onClick={()=>setCategory(c)}>{c}</button>)}</div><div className="store-search-sort"><label className="store-search"><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search this storefront…" aria-label="Search this storefront"/></label><label className="store-sort-label"><span>Sort</span><select value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort storefront products"><option value="featured">Featured</option><option value="low">Price: low to high</option><option value="high">Price: high to low</option><option value="name">Name: A to Z</option></select></label><div className="listing-view-toggle store-view-toggle" role="group" aria-label="Store product layout"><button type="button" aria-label="Grid view" aria-pressed={view==='grid'} className={view==='grid'?'is-active':''} onClick={()=>setView('grid')}>▦ <span>Grid</span></button><button type="button" aria-label="List view" aria-pressed={view==='list'} className={view==='list'?'is-active':''} onClick={()=>setView('list')}>☷ <span>List</span></button></div></div></div>{filtersActive&&<div className="store-active-filters"><span>Showing filtered results</span>{search.trim()&&<button type="button" onClick={()=>setSearch('')}>Search: “{search.trim()}” <b>×</b></button>}{category!=='All'&&<button type="button" onClick={()=>setCategory('All')}>{category} <b>×</b></button>}<button type="button" className="store-clear-all" onClick={clearStoreFilters}>Clear all</button></div>}{visibleItems.length?<div className={`product-grid ${view==='list'?'product-list-view':''}`}>{visibleItems.map(p=><ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language}/>)}</div>:<div className="empty-state store-no-results"><h3>No matching products</h3><p>Try another search or select a different category.</p><button type="button" className="outline-btn" onClick={()=>{setSearch('');setCategory('All')}}>Clear storefront filters</button></div>}<p className="storefront-demo-note">This is a demonstration storefront. Seller identity, product details, availability, prices and delivery terms have not been independently verified.</p></main>,language)
}

function CategoriesPage({language}) {
 const [search,setSearch]=useState('')
 const icons=['⌘','◉','✳','⌂','✿','↗','◇','▤','▣','✦','♧','♢','⌁']
 const tones=['cat-blue','cat-sand','cat-pink','cat-lilac','cat-green','cat-yellow']
 const allCategories=categories.slice(1)
 const visible=allCategories.filter(name=>searchTextMatches(name,search))
 return translateTree(<main id="main-content" className="shell page categories-page"><div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / Categories</div><section className="categories-intro"><span className="eyebrow">EXPLORE MARCHY</span><h1>Find your category.</h1><p>Browse the catalogue by what you need. Every category opens a dedicated product results view.</p><div className="category-total"><b>{allCategories.length}</b><span>everyday categories</span></div></section>
 <div className="category-directory-tools"><label><span>⌕</span><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search categories" aria-label="Search categories"/></label><small>{visible.length} of {allCategories.length} categories</small></div>
 {visible.length?<div className="category-directory-grid">{visible.map(name=>{const i=allCategories.indexOf(name);const count=products.filter(p=>p.category===name).length;return <Link to={`/category/${encodeURIComponent(name.toLowerCase())}`} className="category-directory-card" key={name}><span className={`category-directory-icon ${tones[i%tones.length]}`}>{icons[i%icons.length]}</span><span className="category-directory-copy"><b>{name}</b><small>{count} sample {count===1?'listing':'listings'}</small></span><span className="category-directory-arrow">→</span></Link>})}</div>:<div className="empty-state category-directory-empty"><span>⌕</span><h2>No categories found</h2><p>Try a different category name.</p><button type="button" className="outline-btn" onClick={()=>setSearch('')}>Clear search</button></div>}
 <div className="categories-bottom-cta"><div><b>Not sure where to start?</b><span>Browse the full sample catalogue and use filters to narrow your search.</span></div><Link to="/search" className="primary-btn">Explore all products →</Link></div></main>,language)
}

function SellerLaunchPage({language}) {
  const [storeName,setStoreName]=useState('')
  const [city,setCity]=useState('Tunis')
  const [category,setCategory]=useState('Electronics')
  const [description,setDescription]=useState('')
  const [contact,setContact]=useState('')
  const [productName,setProductName]=useState('')
  const [productPrice,setProductPrice]=useState('')
  const [productCategory,setProductCategory]=useState('Electronics')
  const [productDescription,setProductDescription]=useState('')
  const [productCondition,setProductCondition]=useState('New')
  const [productStock,setProductStock]=useState('1')
  const [productReferencePrice,setProductReferencePrice]=useState('')
  const [productVariants,setProductVariants]=useState('')
  const [productImage,setProductImage]=useState('')
  const [productImageName,setProductImageName]=useState('')
  const [previewOpen,setPreviewOpen]=useState(false)
  const steps=[{number:'01',title:'Prepare your business details',copy:'Choose a storefront name, location and main category.'},{number:'02',title:'Plan your first listings',copy:'Prepare clear product names, accurate prices and original photos.'},{number:'03',title:'Review before launch',copy:'Confirm fulfilment, returns and customer contact arrangements.'}]
  return translateTree(<main id="main-content" className="shell page seller-launch-page">
    <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / <span>Sell on MARCHY</span></div>
    <section className="seller-launch-hero">
      <div className="seller-launch-copy"><span className="eyebrow">MARCHY FOR BUSINESSES · TUNISIA</span><h1>Make your storefront the next local discovery.</h1><p>Prepare a clear shop profile and product listing plan. This preview helps you organise the information you will need before seller onboarding opens.</p><div className="seller-launch-actions"><a href="#seller-workspace" className="primary-btn">Build your storefront preview <span>→</span></a><Link to="/seller-help" className="seller-launch-secondary">Seller preparation guide</Link><Link to="/seller-dashboard" className="seller-launch-secondary">Seller dashboard preview ↗</Link></div><div className="seller-launch-trust"><span>✓ Free to prepare</span><span>✓ No account required</span><span>✓ Nothing is submitted</span></div></div>
      <div className="seller-launch-art"><div className="seller-art-window"><div className="seller-art-top"><i></i><i></i><i></i><span>YOUR STOREFRONT</span></div><div className="seller-art-brand">YOUR SHOP<span>.</span></div><div className="seller-art-lines"><b></b><b></b><b></b></div><div className="seller-art-products"><span>✳</span><span>◇</span><span>⌂</span></div><small>AN IDEA, READY TO TAKE SHAPE</small></div></div>
    </section>
    <section className="seller-launch-steps"><div className="seller-section-heading"><span className="eyebrow">A SIMPLE START</span><h2>What you should prepare</h2><p>Three practical steps to get your business ready for a marketplace storefront.</p></div><div className="seller-step-grid">{steps.map(step=><article className="seller-step-card" key={step.number}><span>{step.number}</span><h3>{step.title}</h3><p>{step.copy}</p></article>)}</div></section>
    <section className="seller-workspace" id="seller-workspace"><div className="seller-workspace-heading"><div><span className="eyebrow">STOREFRONT PLANNER</span><h2>Build your shop preview</h2><p>Enter sample details to see how your storefront could be presented.</p></div><span className="seller-draft-label">LOCAL PREVIEW ONLY</span></div>
      <div className="seller-planner-grid"><form className="seller-planner-form" onSubmit={e=>{e.preventDefault();setPreviewOpen(true)}}><h3>01 · Business profile</h3><label>Storefront name<input value={storeName} onChange={e=>setStoreName(e.target.value)} placeholder="e.g. Medina Home Studio" maxLength={60}/></label><div className="seller-form-row"><label>City<select value={city} onChange={e=>setCity(e.target.value)}>{['Tunis','Ariana','Ben Arous','Manouba','Sfax','Sousse','Monastir','Nabeul','Bizerte','Gabès','Other'].map(x=><option key={x}>{x}</option>)}</select></label><label>Main category<select value={category} onChange={e=>setCategory(e.target.value)}>{categories.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select></label></div><label>Short business description<textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="What do you sell, and what should customers know about your shop?" rows={3} maxLength={240}/><small>{description.length}/240 characters</small></label><label>Business contact email <span className="seller-optional">optional · preview only</span><input type="email" value={contact} onChange={e=>setContact(e.target.value)} placeholder="hello@example.tn"/></label><div className="seller-form-divider"></div><h3>02 · First product listing</h3><label>Product name<input value={productName} onChange={e=>setProductName(e.target.value)} placeholder="e.g. Handmade ceramic serving bowl" maxLength={90}/></label><div className="seller-form-row"><label>Displayed price (TND)<input type="number" min="0" step="0.01" value={productPrice} onChange={e=>setProductPrice(e.target.value)} placeholder="0.00" required/></label><label>Product category<select value={productCategory} onChange={e=>setProductCategory(e.target.value)}>{categories.filter(x=>x!=='All').map(x=><option key={x}>{x}</option>)}</select></label></div>
      <div className="seller-form-row"><label>Reference price (TND) <span className="seller-optional">optional</span><input type="number" min="0" step="0.01" value={productReferencePrice} onChange={e=>setProductReferencePrice(e.target.value)} placeholder="Only if genuine"/></label><label>Condition<select value={productCondition} onChange={e=>setProductCondition(e.target.value)}><option>New</option><option>Used</option><option>Refurbished</option><option>Handmade</option></select></label></div>
      <label>Product description<textarea value={productDescription} onChange={e=>setProductDescription(e.target.value)} placeholder="Describe materials, dimensions, features and what is included." rows={4} maxLength={700}/><small>{productDescription.length}/700 characters</small></label>
      <div className="seller-form-row"><label>Stock quantity<input type="number" min="0" step="1" value={productStock} onChange={e=>setProductStock(e.target.value)}/></label><label>Variants <span className="seller-optional">optional · comma separated</span><input value={productVariants} onChange={e=>setProductVariants(e.target.value)} placeholder="e.g. Black, White, 128 GB"/></label></div>
      <label className="seller-image-upload">Product image <span className="seller-optional">optional · preview only</span><input type="file" accept="image/png,image/jpeg,image/webp" onChange={e=>{const file=e.target.files&&e.target.files[0];if(!file)return;if(file.size>5*1024*1024){setProductImage('');setProductImageName('Image must be 5 MB or smaller');return;}const reader=new FileReader();reader.onload=()=>{setProductImage(typeof reader.result==='string'?reader.result:'');setProductImageName(file.name)};reader.readAsDataURL(file)}}/><small>{productImageName||'JPG, PNG or WebP · maximum 5 MB. Image stays in this browser preview.'}</small></label>
      <button className="seller-preview-button" type="submit">Update product and storefront preview <span>→</span></button><p className="seller-form-note">Your entries stay in this page's temporary state. They are not saved, sent or submitted to MARCHY.</p></form>
      <aside className="seller-live-preview" aria-live="polite"><div className="seller-preview-top"><span>STOREFRONT PREVIEW</span><span className="seller-preview-dot">● DEMO</span></div><div className="seller-preview-cover"><span>✳</span></div><div className="seller-preview-body"><div className="seller-preview-avatar">{storeName.trim()?storeName.trim().slice(0,1).toUpperCase():'S'}</div><h3>{storeName.trim()||'Your Storefront Name'}</h3><p className="seller-preview-location">⌖ {city}, Tunisia · {category}</p><p>{description.trim()||'Your short business description will appear here, helping customers understand what your shop offers.'}</p><div className="seller-preview-meta"><span>NEW STOREFRONT</span><span>DETAILS NOT VERIFIED</span></div><div className="seller-preview-product"><div className="seller-preview-product-image">{productImage?<img src={productImage} alt="Your uploaded product preview"/>:'◇'}</div><div><b>{productName.trim()||'Your first product listing'}</b><small>{productCategory} · {productCondition}</small><strong>{productPrice && Number(productPrice)>0 ? Number(productPrice).toLocaleString('en-TN',{maximumFractionDigits:2})+' TND' : 'Price to be added'}</strong>{productReferencePrice&&Number(productReferencePrice)>Number(productPrice)&&<del>{Number(productReferencePrice).toLocaleString('en-TN')} TND</del>}</div></div><div className="seller-preview-contact">{contact.trim()||'Business contact details not added'}</div><div className="seller-product-preview-details">{productDescription.trim()||'Product description will appear here.'}<span>Quantity entered: {productStock} · {productVariants.trim()?'Options: '+productVariants:'No variants entered'}</span></div></div></aside></div>
      {previewOpen&&<div className="seller-preview-confirmation" role="status"><b>Your storefront preview is updated.</b><span>This is a planning draft only. No seller application or product listing has been submitted.</span></div>}
    </section>
    <section className="seller-launch-bottom"><div><span className="eyebrow">BEFORE YOU START SELLING</span><h2>Good listings begin with clear information.</h2><p>Prepare accurate descriptions, original product images, clear pricing, stock information and realistic delivery and return terms. Do not advertise claims you cannot support.</p></div><Link to="/seller-help" className="outline-btn">Read seller preparation guide →</Link></section>
    <p className="catalogue-note">Seller onboarding is not open through this prototype. This planner does not create an account, verify a business, publish products or accept applications.</p>
  </main>,language)
}

function SellerDashboardPage({language}) {
 const [sellerSlug,setSellerSlug]=useState(sellers[0].slug)
 const [tab,setTab]=useState('overview')
 const [query,setQuery]=useState('')
 const [category,setCategory]=useState('All')
 const [showDraftForm,setShowDraftForm]=useState(false)
 const [draftTitle,setDraftTitle]=useState('')
 const [draftCategory,setDraftCategory]=useState('General')
 const [draftPrice,setDraftPrice]=useState('')
 const [draftDescription,setDraftDescription]=useState('')
 const [draftFeedback,setDraftFeedback]=useState('')
 const [editingDraftId,setEditingDraftId]=useState(null)
 const [drafts,setDrafts]=useState(()=>readJson('marchy-seller-drafts',[]))
 const seller=sellers.find(s=>s.slug===sellerSlug)||sellers[0]
 const sellerDrafts=drafts.filter(d=>d.sellerSlug===sellerSlug)
 const resetDraftForm=()=>{setDraftTitle('');setDraftCategory('General');setDraftPrice('');setDraftDescription('');setEditingDraftId(null);setShowDraftForm(false)}
 const editDraft=d=>{setDraftTitle(d.title||'');setDraftCategory(d.category||'General');setDraftPrice(String(d.price??''));setDraftDescription(d.description||'');setEditingDraftId(d.id);setShowDraftForm(true);setDraftFeedback('')}
 const saveDraft=e=>{
  e.preventDefault()
  const existing=drafts.find(d=>d.id===editingDraftId&&d.sellerSlug===sellerSlug)
  const draft={id:existing?.id||`draft-${Date.now()}`,sellerSlug,title:draftTitle.trim(),category:draftCategory.trim()||'General',price:Number(draftPrice),description:draftDescription.trim(),status:'Draft',createdAt:existing?.createdAt||new Date().toISOString(),updatedAt:new Date().toISOString()}
  const next=existing?drafts.map(d=>d.id===existing.id?draft:d):[draft,...drafts]
  setDrafts(next);writeJson('marchy-seller-drafts',next)
  resetDraftForm();setDraftFeedback(existing?'Draft updated on this device':'Draft saved on this device')
 }
 const sellerProducts=products.filter(p=>sellerForProduct(p).slug===seller.slug)
 const categoriesForSeller=['All',...new Set(sellerProducts.map(p=>p.category))]
 const visible=sellerProducts.filter(p=>(category==='All'||p.category===category)&&searchTextMatches([p.name,p.category,p.description||''].join(' '),query))
 const tabs=[['overview','Overview','⌂'],['products','Products','▦'],['storefront','Storefront','▤'],['insights','Insights','↗'],['settings','Settings','⚙']]
 return translateTree(<main id="main-content" className="shell page seller-dashboard-page">
  <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / <Link to="/sell">Sell on MARCHY</Link> / <span>Seller workspace</span></div>
  <section className="seller-dashboard-heading"><div><span className="eyebrow">MARCHY SELLER CENTRE</span><h1>Your seller workspace.</h1><p>Explore how a seller dashboard could organise products, storefront details and insights.</p></div><span className="seller-dashboard-demo">DEMO WORKSPACE · SAMPLE DATA</span></section>
  <div className="seller-dashboard-shell">
   <aside className="seller-dashboard-sidebar"><div className="seller-dashboard-shop"><span className="seller-avatar">{seller.name.slice(0,1)}</span><div><b>{seller.name}</b><small>{seller.city}, Tunisia</small></div></div><label className="seller-dashboard-select">Preview storefront<select value={sellerSlug} onChange={e=>setSellerSlug(e.target.value)}>{sellers.map(s=><option key={s.slug} value={s.slug}>{s.name}</option>)}</select></label><nav aria-label="Seller dashboard sections">{tabs.map(([id,label,icon])=><button type="button" key={id} className={tab===id?'active':''} onClick={()=>setTab(id)} aria-current={tab===id?'page':undefined}><span>{icon}</span>{label}{tab===id&&<i>›</i>}</button>)}</nav><div className="seller-dashboard-sidebar-note"><b>Prototype workspace</b><span>Changes here do not update a real seller account or catalogue.</span></div></aside>
   <section className="seller-dashboard-main">
    <div className="seller-dashboard-main-heading"><div><span className="eyebrow">{tab.toUpperCase()} · SELLER WORKSPACE</span><h2>{tab==='overview'?'Store overview':tab==='products'?'Product listings':tab==='storefront'?'Storefront profile':tab==='insights'?'Store insights':'Workspace settings'}</h2></div><Link to="/sell#seller-workspace" className="primary-btn">＋ Prepare a listing</Link></div>
    {tab==='overview'&&<><div className="seller-dashboard-stats"><article><span>CATALOGUE LISTINGS</span><b>{sellerProducts.length}</b><small>Sample products mapped to this shop</small></article><article><span>CATEGORIES</span><b>{new Set(sellerProducts.map(p=>p.category)).size}</b><small>Categories represented in demo data</small></article><article><span>STOREFRONT LOCATION</span><b>{seller.city}</b><small>Illustrative seller profile</small></article></div><div className="seller-dashboard-panels"><article className="seller-dashboard-panel"><div className="seller-dashboard-panel-heading"><div><span className="eyebrow">PRODUCT CATALOGUE</span><h3>Recently listed sample products</h3></div><button type="button" className="seller-dashboard-text-button" onClick={()=>setTab('products')}>View all →</button></div>{sellerProducts.slice(0,4).map(p=><div className="seller-dashboard-mini-row" key={p.id}><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={p.image} alt=""/><span><b>{p.name}</b><small>{p.category}</small></span><strong>{money(p.price)}</strong><span className="seller-dashboard-status">SAMPLE</span></div>)}</article><article className="seller-dashboard-panel seller-dashboard-checklist"><span className="eyebrow">STORE READINESS</span><h3>Prepare your storefront</h3><p>Use this checklist to organise the information a real seller workspace would need.</p><ul><li><span>01</span>Business information</li><li><span>02</span>Accurate product details</li><li><span>03</span>Delivery and return terms</li><li><span>04</span>Customer contact process</li></ul><Link to="/seller-help" className="text-link">Open seller guide →</Link></article></div></>}
    {tab==='products'&&<><div className="seller-dashboard-products-heading"><div><b>Manage your listing drafts</b><small>Prepare product information before a future publishing workflow.</small></div><button type="button" className="primary-btn" onClick={()=>{setShowDraftForm(v=>!v);setDraftFeedback('')}}>{showDraftForm?'Close draft form':'＋ Create draft'}</button></div>{draftFeedback&&<p className="seller-draft-feedback" role="status">{draftFeedback}</p>}{showDraftForm&&<form className="seller-draft-form" onSubmit={saveDraft}><div className="seller-draft-form-heading"><span className="eyebrow">{editingDraftId?'EDIT LOCAL DRAFT':'NEW LOCAL DRAFT'}</span><h3>{editingDraftId?'Update product information':'Product information'}</h3><p>Saved only in this browser. This does not publish a product or change the sample catalogue.</p></div><div className="seller-draft-fields"><label>Product name<input required maxLength="100" value={draftTitle} onChange={e=>setDraftTitle(e.target.value)} placeholder="e.g. Handmade ceramic vase"/></label><label>Category<input required maxLength="50" value={draftCategory} onChange={e=>setDraftCategory(e.target.value)} placeholder="e.g. Home & Living"/></label><label>Indicative price (TND)<input required type="number" min="0.01" step="0.01" value={draftPrice} onChange={e=>setDraftPrice(e.target.value)} placeholder="0.00"/></label><label className="seller-draft-description">Description<textarea required maxLength="1000" rows="3" value={draftDescription} onChange={e=>setDraftDescription(e.target.value)} placeholder="Describe the product, materials and important details"/></label></div><div className="seller-draft-form-actions"><button type="button" className="outline-btn" onClick={resetDraftForm}>Cancel</button><button type="submit" className="primary-btn">{editingDraftId?'Update local draft':'Save draft on this device'}</button></div></form>}{sellerDrafts.length>0&&<section className="seller-local-drafts"><div><b>Your local drafts</b><span>{sellerDrafts.length} saved on this device</span></div>{sellerDrafts.map(d=><article key={d.id}><span><b>{d.title}</b><small>{d.category} · {money(d.price)} · {d.description}</small></span><em>LOCAL DRAFT</em><div className="seller-local-draft-actions"><button type="button" aria-label={`Edit draft ${d.title}`} onClick={()=>editDraft(d)}>Edit</button><button type="button" aria-label={`Delete draft ${d.title}`} onClick={()=>{const next=drafts.filter(x=>x.id!==d.id);setDrafts(next);writeJson('marchy-seller-drafts',next);if(editingDraftId===d.id)resetDraftForm()}}>Delete</button></div></article>)}</section>}<div className="seller-dashboard-filters"><label><span>Search sample listings</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search product names or details"/></label><label><span>Category</span><select value={category} onChange={e=>setCategory(e.target.value)}>{categoriesForSeller.map(c=><option key={c}>{c}</option>)}</select></label><button type="button" onClick={()=>{setQuery('');setCategory('All')}}>Reset</button></div><div className="seller-dashboard-listings"><div className="seller-dashboard-listing-head"><span>PRODUCT</span><span>PRICE</span><span>STATUS</span><span>ACTION</span></div>{visible.map(p=><div className="seller-dashboard-listing-row" key={p.id}><div className="seller-dashboard-product-cell"><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={p.image} alt=""/><span><b>{p.name}</b><small>{p.category}</small></span></div><strong>{money(p.price)}</strong><span className="seller-dashboard-status">Sample listing</span><Link to={`/product/${p.id}`} className="seller-dashboard-row-link">Preview →</Link></div>)}{!visible.length&&<div className="seller-dashboard-empty"><b>No matching sample listings</b><p>Try another search or category.</p><button type="button" onClick={()=>{setQuery('');setCategory('All')}}>Clear filters</button></div>}</div><p className="seller-dashboard-note">These products are sample catalogue entries, not products owned or managed by this seller. Inventory editing and publishing are not connected.</p></>}
    {tab==='storefront'&&<div className="seller-dashboard-profile"><div className="seller-dashboard-cover"><span>{seller.name.split(' ').map(x=>x[0]).join('')}</span><small>STOREFRONT COVER PREVIEW</small></div><div className="seller-dashboard-profile-body"><span className="demo-label">DEMO STOREFRONT · NOT VERIFIED</span><h3>{seller.name}</h3><p>⌖ {seller.city}, Tunisia</p><p>{seller.description}</p><div className="seller-category-tags">{seller.categories.map(c=><span key={c}>{c}</span>)}</div><Link to={`/seller/${seller.slug}`} className="primary-btn">View public storefront →</Link></div></div>}
    {tab==='insights'&&<div className="seller-dashboard-empty large"><span>↗</span><h3>Insights will appear here.</h3><p>Views, clicks, conversion and sales metrics require real marketplace traffic and connected seller data. This preview does not invent performance figures.</p></div>}
    {tab==='settings'&&<div className="seller-dashboard-empty large"><span>⚙</span><h3>Workspace settings are not connected.</h3><p>Business verification, account security, notifications and payout settings would be managed here in a live seller portal.</p><Link to="/seller-help" className="text-link">Read seller preparation guide →</Link></div>}
   </section>
  </div>
  <p className="catalogue-note">Frontend demonstration only. No seller login, private data, live inventory, analytics, product publishing or account settings are connected.</p>
 </main>,language)
}

function SellerPreparationPage({language}) {
 return translateTree(<main id="main-content" className="shell page seller-preparation-page"><div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / <Link to="/sell">Sell on MARCHY</Link> / <span>Seller preparation</span></div><section className="seller-guide-hero"><span className="eyebrow">SELLER RESOURCE CENTRE</span><h1>Get your business ready to sell online.</h1><p>A practical preparation guide for Tunisian businesses considering a MARCHY storefront. These are planning recommendations, not active platform requirements.</p></section><div className="seller-guide-layout"><div className="seller-guide-content"><section><span>01</span><div><h2>Business information</h2><p>Prepare your trading name, business location, a short description of what you sell and a reliable customer contact channel. Keep business details consistent across your online presence.</p><ul><li>Storefront name and logo or visual identity</li><li>City and service area</li><li>Business contact details</li><li>Categories that accurately describe your products</li></ul></div></section><section><span>02</span><div><h2>Product information</h2><p>Customers need enough detail to understand exactly what they are considering.</p><ul><li>Clear product title and original photos</li><li>Accurate description, materials, dimensions and variants where relevant</li><li>Price in TND and clear notes about any additional charges</li><li>Realistic stock and availability information</li></ul></div></section><section><span>03</span><div><h2>Fulfilment and customer care</h2><p>Decide how orders would be handled before accepting them.</p><ul><li>Delivery areas, fees and expected handling times</li><li>How customers can ask questions</li><li>Return, exchange and refund terms</li><li>A process for keeping customers informed if something changes</li></ul></div></section><section><span>04</span><div><h2>Trust and accuracy</h2><p>Only publish claims you can substantiate. Do not label products as certified, original, locally made or in stock unless you can support those statements.</p><ul><li>Use real photos and current product details</li><li>Do not copy another seller's images or descriptions</li><li>Keep prices and availability up to date</li><li>Make limitations and conditions clear</li></ul></div></section></div><aside className="seller-guide-aside"><span className="eyebrow">YOUR NEXT STEP</span><h3>Prepare a storefront preview.</h3><p>Use the free planner to organise your business details and a first sample listing.</p><Link to="/sell#seller-workspace" className="primary-btn">Open storefront planner →</Link><div className="seller-guide-status"><b>Platform status</b><span>Seller applications are not currently accepted through this prototype.</span></div></aside></div></main>,language)
}

function AccountPage({cart,wishlist,language}) {
 const cartItems=cart.reduce((sum,item)=>sum+item.qty,0)
 const savedProducts=products.filter(p=>wishlist.includes(p.id)).slice(0,3)
 const [recentIds,setRecentIds]=useState(()=>readJson('marchy-recently-viewed',[]))
 const recentProducts=recentIds.map(id=>products.find(p=>p.id===id)).filter(Boolean).slice(0,4)
 const clearRecentlyViewed=()=>{writeJson('marchy-recently-viewed',[]);setRecentIds([])}
 return translateTree(<main id="main-content" className="shell page account-page">
  <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / <span>Account</span></div>
  <section className="account-welcome"><div><span className="eyebrow">YOUR MARCHY</span><h1>Your shopping space.</h1><p>Keep track of the products you're considering and pick up where you left off.</p></div><div className="account-guest-status"><span className="account-guest-avatar">G</span><div><b>Guest browsing</b><small>You're exploring without signing in</small><span className="demo-label">PREVIEW MODE</span></div></div></section>
  <div className="account-overview-grid">
   <Link to="/cart" className="account-overview-card"><span className="account-overview-icon">🛒</span><span><small>YOUR BASKET</small><b>{cartItems}</b><em>Items in cart</em></span><i>→</i></Link>
   <Link to="/wishlist" className="account-overview-card"><span className="account-overview-icon">♡</span><span><small>SAVED COLLECTION</small><b>{wishlist.length}</b><em>Saved products</em></span><i>→</i></Link>
   <Link to="/sellers" className="account-overview-card"><span className="account-overview-icon">▤</span><span><small>DISCOVER LOCAL</small><b>{sellers.length}</b><em>Sample storefronts</em></span><i>→</i></Link>
  </div>
  <div className="account-content-grid">
   <section className="account-panel"><div className="account-panel-heading"><div><span className="eyebrow">YOUR SHORTLIST</span><h2>Recently saved</h2></div><Link to="/wishlist" className="text-link">View all →</Link></div>
    {savedProducts.length?<div className="account-saved-list">{savedProducts.map(p=><Link to={`/product/${p.id}`} className="account-saved-item" key={p.id}><img onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}} src={p.image} alt=""/><span><b>{p.name}</b><small>{p.category}</small></span><strong>{money(p.price)}</strong></Link>)}</div>:<div className="account-inline-empty"><span>♡</span><b>Your shortlist is empty</b><p>Save products with the heart button and they'll appear here.</p><Link to="/search" className="text-link">Explore products →</Link></div>}
   </section>
   <aside className="account-panel account-activity-panel"><span className="eyebrow">ACCOUNT ACTIVITY</span><h2>Orders & returns</h2><div className="account-activity-empty"><span>↗</span><b>No order history yet</b><p>Order tracking and returns aren't active in this frontend prototype. Your demo cart does not create an order.</p></div><Link to="/help" className="text-link">Visit help centre →</Link></aside>
  </div>
  {recentProducts.length>0&&<section className="account-recently-viewed"><div className="account-panel-heading"><div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Recently viewed</h2><p>Products you opened on this device.</p></div><button type="button" className="account-clear-recent" onClick={clearRecentlyViewed}>Clear history</button></div><div className="account-recent-grid">{recentProducts.map(p=><Link to={`/product/${p.id}`} className="account-recent-card" key={p.id}><img src={p.image} alt="" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}}/><span><b>{p.name}</b><small>{p.category}</small><strong>{money(p.price)}</strong></span></Link>)}</div></section>}
  <section className="account-shortcuts"><div><span className="eyebrow">QUICK LINKS</span><h2>Explore MARCHY</h2></div><div><Link to="/categories">Browse categories <span>→</span></Link><Link to="/delivery">Delivery information <span>→</span></Link><Link to="/returns">Returns information <span>→</span></Link><Link to="/help">Help & support <span>→</span></Link></div></section>
  <p className="catalogue-note">This is a guest-mode frontend preview. No account, personal profile, order history or authentication is created or stored.</p>
 </main>,language)
}

function MarketplaceGuidePage({type,language}) {
 const delivery=type==='delivery'
 const title=delivery?'Delivery, clearly agreed.':'Know the return terms first.'
 const intro=delivery?'Delivery coverage, fees and timing can vary by seller. Confirm the details directly before placing any order.':'Return, exchange and refund terms may vary by seller. Agree the exact conditions before purchasing.'
 const items=delivery?[
  {title:'Delivery coverage',copy:'Confirm whether the seller delivers to your city, neighbourhood or preferred address.'},
  {title:'Total delivery cost',copy:'Ask whether the delivery fee is separate from the displayed product price and whether extra charges may apply.'},
  {title:'Estimated timing',copy:'Confirm preparation time, delivery window and how delays or failed delivery attempts are handled.'},
  {title:'Handover and inspection',copy:'Ask how the item will be handed over and whether you can inspect it before accepting it.'}
 ]:[
  {title:'Eligible return reasons',copy:'Ask which situations qualify for a return, exchange or refund, including damaged, incorrect or unsuitable items.'},
  {title:'Time limits',copy:'Confirm the number of days allowed and when that period starts.'},
  {title:'Item condition',copy:'Ask whether packaging, tags, accessories and proof of purchase must be retained.'},
  {title:'Costs and refund method',copy:'Confirm who pays return delivery and how and when an approved refund would be issued.'}
 ]
 return translateTree(<main id="main-content" className="shell page marketplace-guide-page">
  <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / <Link to="/help">Help & support</Link> / <span>{delivery?'Delivery':'Returns & refunds'}</span></div>
  <section className="marketplace-guide-hero"><span className="eyebrow">{delivery?'DELIVERY INFORMATION':'RETURNS & REFUNDS'}</span><h1>{title}</h1><p>{intro}</p><span className="guide-status-pill">PRE-LAUNCH INFORMATION · NO ACTIVE TRANSACTIONS</span></section>
  <div className="marketplace-guide-layout"><section className="guide-checklist"><div className="guide-section-heading"><span className="eyebrow">BUYER CHECKLIST</span><h2>{delivery?'What to confirm before delivery':'What to agree before you buy'}</h2><p>Use these points as a practical checklist when discussing a purchase with a seller.</p></div>{items.map((item,index)=><article className="guide-checklist-item" key={item.title}><span>{String(index+1).padStart(2,'0')}</span><div><h3>{item.title}</h3><p>{item.copy}</p></div></article>)}</section>
  <aside className="guide-note-panel"><span className="eyebrow">MARCHY STATUS</span><h2>This feature isn't active yet.</h2><p>MARCHY currently displays sample products and storefronts. It does not calculate delivery fees, arrange shipments, process returns or issue refunds.</p><div><b>Before any real purchase</b><span>Get the seller's terms in writing and keep a copy of your agreement.</span></div><Link to="/help" className="text-link">More help & FAQs →</Link></aside></div>
  <section className="guide-bottom-cta"><div><span className="eyebrow">NEED MORE CONTEXT?</span><h2>Check the product and seller details.</h2><p>Review the sample listing and storefront, then confirm all current information directly with the seller.</p></div><div><Link to="/search" className="primary-btn">Browse products →</Link><Link to="/sellers" className="outline-btn">Find storefronts</Link></div></section>
 </main>,language)
}

function HelpCenterPage({language}) {
 const topics=[
  {q:'Are the product prices and discounts live?',a:'No. The catalogue is illustrative. Displayed prices and previous prices are sample data and must not be treated as current seller offers.'},
  {q:'Can I place an order or pay on MARCHY?',a:'Not yet. The cart is a frontend preview only. Checkout, payments, order confirmation and seller stock checks are not connected.'},
  {q:'How can I confirm a product before buying?',a:'Open the product page and visit its sample storefront. In a live marketplace, buyers should confirm specifications, availability, final price and terms directly with the seller.'},
  {q:'Are the storefronts verified?',a:'No. The seller profiles currently shown are sample storefronts created for the frontend prototype. They have not been independently verified.'},
  {q:'How do delivery and returns work?',a:'Delivery and return services are not active in this prototype. The information pages explain what buyers should confirm before any future transaction.'},
  {q:'Can I register as a seller?',a:'Seller onboarding is not open yet. You can use the storefront planner and seller preparation guide to organise sample business and product information.'}
 ]
 return translateTree(<main id="main-content" className="shell page help-center-page">
  <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / <span>Help & support</span></div>
  <section className="help-center-hero"><span className="eyebrow">MARCHY SUPPORT</span><h1>Answers before you shop.</h1><p>Find out how the marketplace preview works and what to check before making a purchase decision.</p><Link to="/search" className="primary-btn">Explore the marketplace →</Link></section>
  <div className="help-center-layout"><section className="help-faq-section"><div className="help-section-heading"><span className="eyebrow">FREQUENTLY ASKED QUESTIONS</span><h2>Good to know</h2><p>Clear answers about the current MARCHY frontend prototype.</p></div><div className="help-faq-list">{topics.map((item,index)=><details className="help-faq-item" key={item.q} open={index===0}><summary><span>{item.q}</span><i>＋</i></summary><p>{item.a}</p></details>)}</div></section>
  <aside className="help-topic-panel"><span className="eyebrow">HELP TOPICS</span><h2>Find the right information.</h2><Link to="/delivery"><span>⌖</span><div><b>Delivery information</b><small>What to confirm about coverage, fees and timing</small></div><i>→</i></Link><Link to="/returns"><span>↩</span><div><b>Returns & refunds</b><small>Understand the current prototype limitations</small></div><i>→</i></Link><Link to="/seller-help"><span>▤</span><div><b>Seller preparation</b><small>Prepare a business and product listing</small></div><i>→</i></Link><div className="help-status-note"><b>Platform status</b><p>MARCHY is a frontend prototype. No support tickets, purchases or seller applications are currently processed.</p></div></aside></div>
 </main>,language)
}

function NotFoundPage({language}) {
 return translateTree(<main id="main-content" className="shell page not-found-page"><div className="not-found-visual"><span>4</span><b>MARCHY<span>.</span></b><span>4</span></div><span className="eyebrow">PAGE NOT FOUND</span><h1>This page isn't here.</h1><p>The link may be incorrect or the page may have moved. Let's get you back to something useful.</p><div className="not-found-actions"><Link to="/" className="primary-btn">Back to home →</Link><Link to="/search" className="outline-btn">Explore products</Link><Link to="/categories" className="text-link">Browse categories</Link></div></main>,language)
}

function SimplePage({ title, eyebrow, text, language }) { return translateTree(<main id="main-content" className="shell page simple-page"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p className="muted">{text}</p><Link to="/search" className="primary-btn">Explore the marketplace →</Link></main>,language) }

function App(){
  const location=useLocation()
  const [language,setLanguage]=useState(()=>{const saved=readText('marchy-language','en');return ['en','fr','ar'].includes(saved)?saved:'en'}); const [query,setQuery]=useState(''); const [cart,setCart]=useState(()=>readJson('marchy-cart',[])); const [wishlist,setWishlist]=useState(()=>readJson('marchy-wishlist',[]))
  useEffect(()=>{const params=new URLSearchParams(location.search);setQuery(params.get('q')||'')},[location.pathname,location.search])
  useEffect(()=>{
    const path=location.pathname
    const params=new URLSearchParams(location.search)
    const queryTerm=params.get('q')
    let title='Discover local products and stores'
    if(path==='/') title='Discover more, closer to home'
    else if(path==='/search') title=queryTerm?'Search results for '+queryTerm:'Shop the marketplace'
    else if(path.startsWith('/category/')){
      const slug=decodeURIComponent(path.split('/').pop()||'')
      const category=categories.find(item=>item.toLowerCase()===slug.toLowerCase())
      title=category?category+' products':'Category not found'
    }else if(path.startsWith('/product/')){
      const product=products.find(item=>item.id===Number(path.split('/').pop()))
      title=product?product.name:'Product not found'
    }else if(path.startsWith('/seller/')){
      const slug=path.split('/').pop()
      const seller=sellers.find(item=>item.slug===slug)
      title=seller?seller.name:'Seller storefront'
    }else{
      const titles={'/cart':'Shopping cart','/checkout':'Checkout preview','/wishlist':'Saved products','/categories':'Browse categories','/sellers':'Discover sellers','/account':'Your account','/help':'Help centre','/delivery':'Delivery guide','/returns':'Returns guide','/seller-help':'Seller preparation guide','/sell':'Sell on MARCHY','/seller-dashboard':'Seller workspace'}
      title=titles[path]||'Page not found'
    }
    document.title=title+' | MARCHY'
  },[location.pathname,location.search])
  useEffect(()=>{try{localStorage.setItem('marchy-language',language)}catch{} document.documentElement.lang=language;document.documentElement.dir=language==='ar'?'rtl':'ltr'},[language])
  useEffect(()=>{writeJson('marchy-cart',cart)},[cart])
  useEffect(()=>{writeJson('marchy-wishlist',wishlist)},[wishlist])
  function addToCart(product,qty=1){setCart(prev=>{const found=prev.find(x=>x.id===product.id);return found?prev.map(x=>x.id===product.id?{...x,qty:x.qty+qty}:x):[...prev,{...product,qty}]})}
  function updateQty(id,qty){if(qty<1)return;setCart(prev=>prev.map(x=>x.id===id?{...x,qty}:x))}
  function removeItem(id){setCart(prev=>prev.filter(x=>x.id!==id))}
  function toggleWish(id){setWishlist(prev=>prev.includes(id)?prev.filter(x=>x!==id):[...prev,id])}
  return <div className={language==='ar'?'app-root is-rtl':'app-root'} dir={language==='ar'?'rtl':'ltr'}><ScrollToTop/><a className="skip-to-content" href="#main-content">Skip to main content</a><Header cartCount={cart.reduce((s,x)=>s+x.qty,0)} query={query} setQuery={setQuery} language={language} setLanguage={setLanguage}/><Routes><Route path="/" element={<Home addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/search" element={<SearchPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/category/:category" element={<SearchPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/product/:id" element={<ProductPage addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish} language={language}/>}/><Route path="/cart" element={<CartPage cart={cart} updateQty={updateQty} removeItem={removeItem} language={language}/>}/><Route path="/checkout" element={<CheckoutPage cart={cart} language={language}/>}/><Route path="/wishlist" element={<WishlistPage products={products} wishlist={wishlist} toggleWish={toggleWish} addToCart={addToCart} language={language}/>}/><Route path="/categories" element={<CategoriesPage language={language}/>}/><Route path="/sellers" element={<SellersPage language={language}/>}/><Route path="/seller/:slug" element={<SellerPage language={language} addToCart={addToCart} wishlist={wishlist} toggleWish={toggleWish}/>}/><Route path="/account" element={<AccountPage cart={cart} wishlist={wishlist} language={language}/>}/><Route path="/help" element={<HelpCenterPage language={language}/>}/><Route path="/delivery" element={<MarketplaceGuidePage type="delivery" language={language}/>}/><Route path="/returns" element={<MarketplaceGuidePage type="returns" language={language}/>}/><Route path="/seller-help" element={<SellerPreparationPage language={language}/>}/><Route path="/sell" element={<SellerLaunchPage language={language}/>}/><Route path="/seller-dashboard" element={<SellerDashboardPage language={language}/>}/><Route path="*" element={<NotFoundPage language={language}/>}/></Routes><Footer language={language}/><MobileTabBar cartCount={cart.reduce((s,x)=>s+x.qty,0)} wishlistCount={wishlist.length} language={language}/></div>
}

export default App
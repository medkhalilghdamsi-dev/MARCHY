import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { categories, products } from '../data/products'
import { sellers, sellerByCategory, sellerForProduct } from '../data/sellers'
import { money, searchSynonyms, normalizeSearchText, searchTextMatches, readText, readJson, writeJson } from '../utils/marketplace'
import { translateTree } from '../i18n/translate'
import { ProductCard } from '../components/MarketplaceChrome'

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
  return translateTree(<main id="main-content" className="shell page home-page marchy-home">
    <section className="market-hero market-hero-premium" aria-labelledby="market-hero-title">
      <div className="market-hero-copy">
        <span className="hero-kicker"><i aria-hidden="true"></i> YOUR EVERYDAY MARKETPLACE · MADE FOR TUNISIA</span>
        <h1 id="market-hero-title">More to discover.<br/><em>All in one place.</em></h1>
        <p>Browse everyday categories, discover local storefronts and find your next favourite in Tunisian dinars.</p>
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
        <div className="hero-brand-stamp" aria-hidden="true"><span>M</span><small>MADE FOR<br/>EVERYDAY</small></div>
        <div className="hero-art-orbit" aria-hidden="true"></div>
        <img src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1400&q=90" alt="A curated still life of everyday objects and home accessories" loading="eager"/>
        <div className="hero-image-shade" aria-hidden="true"></div>
        <div className="hero-floating-card"><span className="hero-floating-icon">✦</span><div><b>Discover something new</b><small>Browse products across Tunisia</small></div></div>
        <div className="hero-art-caption">LOCAL FINDS <b>·</b> EVERYDAY DISCOVERY</div>
        <div className="hero-art-index"><span>01</span><i></i><span>DISCOVER</span></div>
      </div>
    </section>
    <section className="home-budget-discovery" aria-label="Shop by budget"><div><span className="eyebrow">A GOOD PLACE TO START</span><h2>Shop by budget</h2><p>Explore sample listings within a comfortable price range.</p></div><div className="home-budget-links">{[{label:"Under 50 TND",max:50},{label:"Under 100 TND",max:100},{label:"Under 200 TND",max:200},{label:"Explore everything",max:0}].map(item=><Link key={item.label} to={item.max?'/search?max='+item.max:'/search'}>{item.label}<span>→</span></Link>)}</div></section>
    <section className="market-benefits"><div><span>01</span><b>Find what you need</b><small>Explore products across everyday categories</small></div><div><span>02</span><b>Discover local sellers</b><small>Explore independent storefronts</small></div><div><span>03</span><b>Shop in Tunisian dinars</b><small>Prices displayed in TND</small></div></section>
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
  const budgetParam = Number(params.get('max') || 0)
  useEffect(() => setTerm(initial), [initial])
  useEffect(() => setCategory(initialCategory), [initialCategory])
  const [sort, setSort] = useState('featured')
  const [view,setView] = useState(()=>readText('marchy-product-view','grid')==='list'?'list':'grid')
  useEffect(()=>{try{localStorage.setItem('marchy-product-view',view)}catch{}},[view])
  const catalogueMaxPrice = Math.max(100, Math.ceil(Math.max(...products.map(p => p.price)) / 50) * 50)
  const [minPrice, setMinPrice] = useState(0)
  const [maxPrice, setMaxPrice] = useState(budgetParam > 0 ? Math.min(catalogueMaxPrice, budgetParam) : catalogueMaxPrice)
  const lastBudgetParam = useRef(budgetParam)
  useEffect(() => {
    if (budgetParam !== lastBudgetParam.current) {
      setMaxPrice(budgetParam > 0 ? Math.min(catalogueMaxPrice, budgetParam) : catalogueMaxPrice)
      lastBudgetParam.current = budgetParam
    }
  }, [budgetParam, catalogueMaxPrice])
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
  return translateTree(<main id="main-content" className="shell page marchy-listing-page">
    <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / Marketplace</div>
    <div className="listing-head marchy-listing-head">
      <div><span className="eyebrow">{routeCategory ? "EXPLORE THIS CATEGORY" : "SHOP THE MARCHY MARKETPLACE"}</span><h1>{routeCategory ? category : "Find what you’re looking for."}</h1><p className="muted">{routeCategory ? "Browse products in this category." : results.length + " products to explore"}</p></div>
      <div className="listing-search marchy-listing-search"><input aria-label="Search marketplace" value={term} onChange={e => updateTerm(e.target.value)} placeholder="What are you looking for?"/><span>⌕</span></div>
    </div>
    <div className="mobile-filter-toggle marchy-mobile-filter-toggle"><button type="button" className="outline-btn" onClick={() => setFiltersOpen(v => !v)} aria-expanded={filtersOpen} aria-controls="marketplace-filters">☷ Filters {activeFilterCount > 0 ? '· ' + activeFilterCount + ' active' : ''}</button><span>{results.length} results</span></div>
    {activeFilterCount > 0 && <div className="active-filter-chips marchy-active-filter-chips" aria-label="Active filters">
      {term && <button type="button" onClick={() => updateTerm('')}>Search: {term} <span>×</span></button>}
      {category !== 'All' && !routeCategory && <button type="button" onClick={removeCategoryFilter}>{category} <span>×</span></button>}
      {city !== 'All' && <button type="button" onClick={() => setCity('All')}>{city} <span>×</span></button>}
      {minPrice > 0 && <button type="button" onClick={() => setMinPrice(0)}>From {minPrice} TND <span>×</span></button>}
      {maxPrice < catalogueMaxPrice && <button type="button" onClick={() => setMaxPrice(catalogueMaxPrice)}>Up to {maxPrice} TND <span>×</span></button>}
      {dealsOnly && <button type="button" onClick={removeDealFilter}>Deals only <span>×</span></button>}
      <button type="button" className="clear-filter-chips" onClick={clearFilters}>Clear all</button>
    </div>}
    {routeCategory && <div className="category-context-strip marchy-category-context-strip"><span className="category-context-icon">✦</span><div><b>{category}</b><small>Browse sample listings, compare displayed prices and visit demo storefronts.</small></div><Link to="/categories">All categories →</Link></div>}
    <div className="listing-layout marchy-listing-layout">
      <aside id="marketplace-filters" className={'filters marchy-listing-filters ' + (filtersOpen ? 'filters-open' : '')} aria-label="Marketplace filters">
        <h3>Filters <button type="button" onClick={clearFilters}>Clear all</button></h3>
        <div className="filter-group"><b>Category</b>{categories.map(c => <label key={c}><input type="radio" name="marketplace-category" checked={category === c} onChange={() => routeCategory ? navigate(c === "All" ? "/search" : "/category/" + encodeURIComponent(c.toLowerCase())) : setCategory(c)}/><span>{c === 'All' ? 'All categories' : c}</span><small>{c === 'All' ? products.length : (categoryCounts[c] || 0)}</small></label>)}</div>
        <div className="filter-group"><b>Seller location</b><select aria-label="Seller location" value={city} onChange={e => setCity(e.target.value)}>{cities.map(c => <option key={c} value={c}>{c === 'All' ? 'All locations' : c}</option>)}</select></div>
        <div className="filter-group price-filter-group"><b>Price range</b><div className="price-inputs"><label>Min <input aria-label="Minimum price in TND" type="number" min="0" max={maxPrice} value={minPrice} onChange={e => setMinPrice(Math.min(maxPrice, Math.max(0, Number(e.target.value) || 0)))}/></label><label>Max <input aria-label="Maximum price in TND" type="number" min="0" max={catalogueMaxPrice} value={maxPrice} onChange={e => setMaxPrice(Math.max(minPrice, Math.min(catalogueMaxPrice, Number(e.target.value) || 0)))}/></label></div><input aria-label="Maximum price" type="range" min="0" max={catalogueMaxPrice} step="5" value={maxPrice} onChange={e => setMaxPrice(Math.max(minPrice, Number(e.target.value)))}/><div className="price-range-labels"><span>0 TND</span><span>{catalogueMaxPrice} TND</span></div></div>
        <div className="filter-budget-presets"><b>Popular budgets</b><div>{[50,100,200,500].map(value=><button type="button" key={value} className={maxPrice===Math.min(value,catalogueMaxPrice)?'is-active':''} onClick={()=>setMaxPrice(Math.min(value,catalogueMaxPrice))}>Under {value} TND</button>)}</div></div>
        {dealsOnly && <div className="filter-note">Showing sample listings with illustrative previous prices. Discount claims are not verified offers.</div>}
        <button className="filter-apply" type="button" onClick={() => setFiltersOpen(false)}>Show {results.length} products</button>
      </aside>
      <section className="listing-results marchy-listing-results" aria-live="polite">
        <div className="results-toolbar marchy-results-toolbar"><span aria-live="polite">Showing <b>{results.length ? ((page - 1) * pageSize) + 1 : 0}–{Math.min(page * pageSize, results.length)}</b> of <b>{results.length}</b></span><div className="results-toolbar-actions"><div className="listing-view-toggle" role="group" aria-label="Product layout"><button type="button" aria-label="Grid view" aria-pressed={view==='grid'} className={view==='grid'?'is-active':''} onClick={()=>setView('grid')}>▦ <span>Grid</span></button><button type="button" aria-label="List view" aria-pressed={view==='list'} className={view==='list'?'is-active':''} onClick={()=>setView('list')}>☷ <span>List</span></button></div><label>Sort by <select aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Best match</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A to Z</option><option value="newest">Recently added</option><option value="savings">Biggest displayed difference</option></select></label></div></div>
        {compareIds.length > 0 && <section className="compare-tray" aria-label="Product comparison">
          <div className="compare-tray-heading"><div><b>Compare sample listings</b><span>{compareIds.length} of 3 selected · prices and seller details are illustrative</span></div><div><button type="button" className="compare-clear" onClick={() => {setCompareIds([]);setCompareOpen(false)}}>Clear</button><button type="button" className="compare-show" disabled={compareIds.length < 2} onClick={() => setCompareOpen(v => !v)}>{compareOpen ? 'Hide comparison' : 'Compare now'}</button></div></div>
          <div className="compare-selected-items">{comparedProducts.map(product => <div className="compare-selected-item" key={product.id}><Link to={'/product/' + product.id}>{product.name}</Link><span>{money(product.price)}</span><button type="button" aria-label={'Remove ' + product.name + ' from comparison'} onClick={() => toggleCompare(product.id)}>×</button></div>)}</div>
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
        {results.length ? <><div className={`product-grid ${view==='list'?'product-list-view':''}`}>{visibleResults.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language} compareIds={compareIds} toggleCompare={toggleCompare}/>)}</div>{pageCount > 1 && <nav className="pagination" aria-label="Product pages"><button type="button" disabled={page === 1} onClick={() => setPage(v => Math.max(1, v - 1))}>← Previous</button><span>Page {page} of {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage(v => Math.min(pageCount, v + 1))}>Next →</button></nav>}</> : <div className="empty-state marketplace-no-results"><span>⌕</span><h3>No products found</h3><p>Try a broader search, choose another category or reset your price and location filters.</p><button type="button" className="outline-btn" onClick={clearFilters}>Reset all filters</button><div className="empty-search-suggestions"><b>Explore popular categories</b><div>{categories.filter(c=>c!=='All').slice(0,5).map(c=><Link key={c} to={`/category/${encodeURIComponent(c.toLowerCase())}`}>{c} <span>→</span></Link>)}</div></div></div>}
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
          <div className="product-quantity-summary" aria-live="polite">
            <span>{qty} {qty === 1 ? 'item' : 'items'} selected</span>
            <strong>{money(product.price * qty)}</strong>
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
    <section className="product-buyer-highlights" aria-label="Important product information"><div><span>01</span><b>Know what you're buying</b><small>Review the description and confirm exact specifications.</small></div><div><span>02</span><b>Check with the shop</b><small>Ask about variants, condition and current availability.</small></div><div><span>03</span><b>Confirm delivery first</b><small>Agree on coverage, cost and timing before ordering.</small></div></section>
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
    <div className="product-mobile-buybar"><div><small>Subtotal · {qty} {qty === 1 ? 'item' : 'items'}</small><b>{money(product.price * qty)}</b></div><button type="button" className="primary-btn" onClick={handleAdd}>{added ? 'Added ✓' : 'Add to cart'}</button></div>
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
          <div className="cart-seller-group-heading"><div><span className="seller-avatar">{group.seller.name.slice(0,1)}</span><div><b>{group.seller.name}</b><small>{group.seller.city}, Tunisia · sample storefront</small></div></div><strong>{group.items.length} product{group.items.length===1?'':'s'}</strong></div>
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
        {sellerGroups.map(group=><div className="cart-summary-row seller-summary-row" key={group.seller.slug}><span>{group.seller.name}</span><b>{money(group.subtotal)}</b></div>)}
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


function CheckoutPage({cart,language,onPlaceDemoOrder}) {
  const [step,setStep]=useState(1)
  const [details,setDetails]=useState({name:'',phone:'',city:'',address:'',notes:''})
  const [orderIds,setOrderIds]=useState([])
  const [deliveryChoices,setDeliveryChoices]=useState({})
  const navigate=useNavigate()
  const subtotal=cart.reduce((sum,item)=>sum+item.price*item.qty,0)
  const itemCount=cart.reduce((sum,item)=>sum+item.qty,0)
  const deliveryOptions=[{id:'standard',label:'Standard delivery · 3–5 days',fee:8},{id:'express',label:'Express delivery · 1–2 days',fee:12},{id:'pickup',label:'Seller collection · timing to confirm',fee:0}]
  const deliveryTotal=groups.reduce((sum,group)=>sum+(deliveryOptions.find(option=>option.id===(deliveryChoices[group.seller.slug]||'standard'))?.fee||0),0)
  const orderTotal=subtotal+deliveryTotal
  const chooseDelivery=(slug,value)=>setDeliveryChoices(current=>({...current,[slug]:value}))
  const groups=[...new Set(cart.map(item=>sellerForProduct(item).slug))].map(slug=>{
    const seller=sellers.find(entry=>entry.slug===slug)
    const items=cart.filter(item=>sellerForProduct(item).slug===slug)
    return {seller,items,subtotal:items.reduce((sum,item)=>sum+item.price*item.qty,0)}
  })
  const update=(key,value)=>setDetails(current=>({...current,[key]:value}))
  if(!cart.length&&step!==4)return translateTree(<main id="main-content" className="shell page checkout-page"><div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/cart">Cart</Link><span>/</span><span>Checkout</span></div><div className="cart-empty-state"><div className="cart-empty-icon">🛒</div><span className="eyebrow">NOTHING TO CHECK OUT</span><h1>Your cart is empty</h1><p>Add products before starting checkout.</p><Link to="/search" className="primary-btn">Explore products →</Link></div></main>,language)
  return translateTree(<main id="main-content" className="shell page checkout-page">
    <div className="breadcrumbs"><Link to="/">Home</Link><span>/</span><Link to="/cart">Cart</Link><span>/</span><span aria-current="page">Checkout preview</span></div>
    <div className="checkout-heading"><div><span className="eyebrow">A CLEARER WAY TO CHECK OUT</span><h1>Review your order</h1><p>Confirm the details a real marketplace would need before any order is placed.</p></div><Link to="/cart" className="cart-continue-link">← Back to cart</Link></div>
    <ol className="checkout-steps" aria-label="Checkout progress">
      <li className={step>1?'is-complete':step===1?'is-current':''} aria-current={step===1?'step':undefined}><span>{step>1?'✓':'1'}</span><div><b>Delivery details</b><small>Your contact and address</small></div></li>
      <li className={step>2?'is-complete':step===2?'is-current':''} aria-current={step===2?'step':undefined}><span>{step>2?'✓':'2'}</span><div><b>Order review</b><small>Products and sellers</small></div></li>
      <li className={step>=3?'is-current':''} aria-current={step===3?'step':undefined}><span>3</span><div><b>Confirm demo order</b><small>Local sample only</small></div></li>
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
          {groups.map(group=>{const selected=deliveryOptions.find(option=>option.id===(deliveryChoices[group.seller.slug]||'standard'))||deliveryOptions[0];return <article className="checkout-seller-review" key={group.seller.slug}><div className="checkout-seller-heading"><div><span className="seller-avatar">{group.seller.name.slice(0,1)}</span><div><b>{group.seller.name}</b><small>{group.seller.city} · sample storefront</small></div></div><strong>{money(group.subtotal)}</strong></div>{group.items.map(item=><div className="checkout-review-item" key={item.id}><img src={item.image} alt="" onError={e=>{e.currentTarget.onerror=null;e.currentTarget.src='/product-placeholder.svg'}}/><span>{item.name}<small>Qty {item.qty} × {money(item.price)}</small></span><b>{money(item.price*item.qty)}</b></div>)}<div className="checkout-delivery-choice"><label>Delivery method for {group.seller.name}<select value={deliveryChoices[group.seller.slug]||'standard'} onChange={event=>chooseDelivery(group.seller.slug,event.target.value)}>{deliveryOptions.map(option=><option value={option.id} key={option.id}>{option.label} — {money(option.fee)}</option>)}</select></label><div><span>Illustrative delivery fee</span><b>{money(selected.fee)}</b></div></div><div className="checkout-delivery-status"><span>Stock and final delivery details</span><b>Seller confirmation required</b></div></article>})}<p className="checkout-demo-rate-note">Demo estimates only. These rates, delivery windows and collection options are illustrative and are not seller quotes or service commitments.</p>
          <div className="checkout-review-actions"><button type="button" className="outline-btn" onClick={()=>setStep(1)}>← Edit delivery details</button><button type="button" className="primary-btn" onClick={()=>setStep(3)}>Continue to final preview <span>→</span></button></div>
        </section>}
        {step===3&&<section className="checkout-complete-preview">
          <div className="checkout-preview-icon">✓</div><span className="eyebrow">DEMO ORDER CONFIRMATION</span><h2>Ready to create your sample order?</h2><p>Confirming creates a fictional order record in this browser, clears this demo basket and makes the order visible in Buyer Tracking and the relevant seller workspace. No seller is contacted and no payment or delivery is arranged.</p>
          <div className="checkout-next-list"><b>Before confirming</b><ul><li>Delivery fees are illustrative estimates, not confirmed seller quotes</li><li>Stock and availability have not been verified</li><li>Payment is not collected</li><li>Each seller receives a separate sample order</li></ul></div>
          <div className="checkout-review-actions"><button type="button" className="outline-btn" onClick={()=>setStep(2)}>← Back to review</button><button type="button" className="primary-btn" onClick={()=>{setOrderIds(onPlaceDemoOrder(details,cart,Object.fromEntries(groups.map(group=>{const option=deliveryOptions.find(entry=>entry.id===(deliveryChoices[group.seller.slug]||'standard'))||deliveryOptions[0];return [group.seller.slug,{label:option.label,fee:option.fee}]}))));setStep(4)}}>Create demo order <span>→</span></button></div>
        </section>}
        {step===4&&<section className="checkout-complete-preview marchy-order-created">
          <div className="checkout-preview-icon">✓</div><span className="eyebrow">SAMPLE ORDER CREATED</span><h2>Your demo order is ready to follow.</h2><p>{orderIds.length} seller-specific sample {orderIds.length===1?'order has':'orders have'} been saved on this device. You can view the new order records in your tracking page.</p>
          <div className="checkout-next-list"><b>Your sample order reference{orderIds.length===1?'':'s'}</b><ul>{orderIds.map(id=><li key={id}>{id}</li>)}</ul></div>
          <p className="catalogue-note">This is not a real purchase. No payment was taken, inventory reserved, seller notified or parcel booked.</p>
          <div className="checkout-review-actions"><Link to="/orders" className="primary-btn">Track demo order{orderIds.length===1?'':'s'} →</Link><button type="button" className="outline-btn" onClick={()=>navigate('/search')}>Continue shopping</button></div>
        </section>}
      </section>
      {step!==4&&<aside className="summary-card checkout-summary"><span className="eyebrow">YOUR BASKET</span><h2>Order summary</h2><div className="cart-summary-row"><span>{itemCount} items · {cart.length} products</span><b>{money(subtotal)}</b></div>
      {groups.map(group=><div className="cart-summary-row seller-summary-row" key={group.seller.slug}><span>{group.seller.name}</span><b>{money(group.subtotal)}</b></div>)}<div className="cart-summary-row"><span>Sample delivery fees</span><b>{step>=2?money(deliveryTotal):'Calculated at review'}</b></div><div className="summary-total"><span>Estimated demo total</span><strong>{money(step>=2?orderTotal:subtotal)}</strong></div><p className="cart-summary-note">Illustrative rates only. Actual delivery fees, coverage and timing require seller confirmation.</p><div className="checkout-seller-count"><b>{groups.length}</b><span>sample seller{groups.length===1?'':'s'} in this basket</span></div><div className="cart-trust-note"><span>ⓘ</span><p>Demo only. This checkout does not submit personal data or process payments.</p></div></aside>}
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


export { Home, SearchPage, ProductPage, CartPage, CheckoutPage, WishlistPage }

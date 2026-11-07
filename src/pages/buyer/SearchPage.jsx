import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import { categories } from '../../data/products'
import { MarketplaceService } from '../../services/marketplaceService'
import { sellerForProduct } from '../../data/sellers'
import { money, normalizeSearchText, searchTextMatches, readText, readJson, writeJson } from '../../utils/marketplace'
import { translateTree } from '../../i18n/translate'
import { ProductCard } from '../../components/marketplace/ProductCard'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { PageFrame } from '../../components/ui/PageFrame'
import { ArrowRight, ArrowUpRight, Search, SlidersHorizontal, Sparkles, X } from 'lucide-react'

export function SearchPage() {
  const { addToCart, wishlist, toggleWish, language } = useMarketplace()
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const products = useMemo(() => MarketplaceService.getProducts(), [])
  const initial = params.get('q') || ''
  const { category: routeCategory } = useParams()
  const initialCategory = categories.find(c => c.toLowerCase() === (routeCategory || params.get('category') || '').toLowerCase()) || 'All'
  const isInvalidCategory = Boolean(routeCategory) && initialCategory === 'All'
  const [term, setTerm] = useState(initial)
  const [category, setCategory] = useState(initialCategory)
  const dealsOnly = params.get('deal') === 'true'
  const budgetParam = Number(params.get('max') || 0)
  useEffect(() => setTerm(initial), [initial])
  useEffect(() => setCategory(initialCategory), [initialCategory])
  const validSorts = ['featured', 'price-low', 'price-high', 'name', 'newest', 'savings']
  const [sort, setSort] = useState(() => validSorts.includes(params.get('sort')) ? params.get('sort') : 'featured')
  const [view,setView] = useState(()=>readText('marchy-product-view','grid')==='list'?'list':'grid')
  useEffect(()=>{try{localStorage.setItem('marchy-product-view',view)}catch{}},[view])
  const catalogueMaxPrice = Math.max(100, Math.ceil(Math.max(...products.map(p => p.price)) / 50) * 50)
  const initialMinPrice = Math.max(0, Number(params.get('min')) || 0)
  const [minPrice, setMinPrice] = useState(Math.min(initialMinPrice, catalogueMaxPrice))
  const [maxPrice, setMaxPrice] = useState(() => {
    const requestedMax = Number(params.get('max')) || 0
    return Math.max(Math.min(initialMinPrice, catalogueMaxPrice), requestedMax > 0 ? Math.min(catalogueMaxPrice, requestedMax) : catalogueMaxPrice)
  })
  const lastBudgetParam = useRef(budgetParam)
  useEffect(() => {
    if (budgetParam !== lastBudgetParam.current) {
      setMaxPrice(budgetParam > 0 ? Math.min(catalogueMaxPrice, budgetParam) : catalogueMaxPrice)
      lastBudgetParam.current = budgetParam
    }
  }, [budgetParam, catalogueMaxPrice])
  const [city, setCity] = useState(() => params.get('city') || 'All')
  const [filtersOpen, setFiltersOpen] = useState(false)
  const filterTriggerRef = useRef(null)
  const filterCloseRef = useRef(null)
  useEffect(() => {
    if (!filtersOpen) return undefined
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    // Wait until the sheet has entered the visible state before moving focus.
    const focusTimer = window.setTimeout(() => filterCloseRef.current?.focus(), 280)
    const closeOnEscape = event => {
      if (event.key === 'Escape') setFiltersOpen(false)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      window.clearTimeout(focusTimer)
      document.body.style.overflow = previousOverflow
      filterTriggerRef.current?.focus()
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [filtersOpen])
  const [searchFocused, setSearchFocused] = useState(false)
  const [page, setPage] = useState(() => Math.max(1, Number(params.get('page')) || 1))
  const [compareIds, setCompareIds] = useState(() => readJson('marchy-compare', []))

  // URL is the source of truth for shareable/searchable result state. This also
  // makes browser Back/Forward restore every visible control instead of only
  // restoring the pathname and query text.
  useEffect(() => {
    const nextSort = params.get('sort')
    setSort(validSorts.includes(nextSort) ? nextSort : 'featured')
    setCity(params.get('city') || 'All')

    const nextMin = Math.max(0, Number(params.get('min')) || 0)
    const requestedMax = Number(params.get('max')) || 0
    setMinPrice(Math.min(nextMin, catalogueMaxPrice))
    setMaxPrice(Math.max(
      Math.min(nextMin, catalogueMaxPrice),
      requestedMax > 0 ? Math.min(catalogueMaxPrice, requestedMax) : catalogueMaxPrice,
    ))

    setPage(Math.max(1, Number(params.get('page')) || 1))
  }, [params, catalogueMaxPrice])
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
        const description = normalizeSearchText(product.description || '')
        const nameMatch = searchTextMatches(product.name, term)
        const categoryMatch = searchTextMatches(product.category, term)
        const sellerMatch = searchTextMatches(sellerForProduct(product).name, term)
        const descriptionMatch = searchTextMatches(product.description || '', term)
        return (name === q ? 140 : name.startsWith(q) ? 110 : name.includes(q) ? 90 : nameMatch ? 72 : 0)
          + (categoryName === q ? 55 : categoryMatch ? 38 : 0)
          + (sellerName === q ? 28 : sellerMatch ? 20 : 0)
          + (descriptionMatch ? 12 : description.includes(q) ? 8 : 0)
      }
      return score(b) - score(a)
    }
    return b.id - a.id
  }), [term, category, sort, minPrice, maxPrice, dealsOnly, city])
  const searchSuggestions = useMemo(() => {
    const query = term.trim()
    if (!query) return { products: [], categories: [] }
    const matchingProducts = [...products].filter(product => searchTextMatches([product.name, product.category, product.description || ''].join(' '), query))
      .sort((a, b) => {
        const score = product => {
          const name = normalizeSearchText(product.name)
          const q = normalizeSearchText(query)
          return name === q ? 3 : name.startsWith(q) ? 2 : name.includes(q) ? 1 : 0
        }
        return score(b) - score(a)
      }).slice(0, 5)
    const matchingCategories = categories.filter(name => name !== 'All' && searchTextMatches(name, query)).slice(0, 3)
    return { products: matchingProducts, categories: matchingCategories }
  }, [term])
  const pageCount = Math.max(1, Math.ceil(results.length / pageSize))
  const visibleResults = results.slice((page - 1) * pageSize, page * pageSize)
  const activeFilterCount = Number(Boolean(term)) + Number(category !== 'All' && !routeCategory) + Number(city !== 'All') + Number(minPrice > 0) + Number(maxPrice < catalogueMaxPrice) + Number(dealsOnly)
  useEffect(() => setPage(1), [term, category, sort, minPrice, maxPrice, dealsOnly, city])
  // Keep result controls in the URL so a buyer can bookmark or share this exact view.
  useEffect(() => {
    const next = new URLSearchParams(params)
    if (term.trim()) next.set('q', term.trim())
    else next.delete('q')
    if (sort === 'featured') next.delete('sort')
    else next.set('sort', sort)
    if (routeCategory || category === 'All') next.delete('category')
    else next.set('category', category)
    if (city === 'All') next.delete('city')
    else next.set('city', city)
    if (minPrice > 0) next.set('min', String(minPrice))
    else next.delete('min')
    if (maxPrice < catalogueMaxPrice) next.set('max', String(maxPrice))
    else next.delete('max')
    if (page > 1) next.set('page', String(page))
    else next.delete('page')
    if (next.toString() !== params.toString()) setParams(next, { replace: true })
  }, [term, sort, category, routeCategory, city, minPrice, maxPrice, catalogueMaxPrice, page, params, setParams])
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
    setSort('featured')
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
  if (isInvalidCategory) return translateTree(<PageFrame id="main-content"><div className='breadcrumbs' role='navigation' aria-label='Breadcrumb'><Link to='/'>Home</Link> / <Link to='/categories'>Categories</Link></div><div className='empty-state'><span>⌕</span><h2>Category not found</h2><p>This category does not exist in the MARCHY catalogue.</p><Link to='/categories' className='primary-btn'>Browse all categories →</Link></div></PageFrame>, language)
  return translateTree(<PageFrame id="main-content" className="marketplace-search-page">
    <div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / Marketplace</div>
    <div className="listing-head">
      <div><span className="eyebrow">{routeCategory ? "EXPLORE THIS CATEGORY" : "SHOP THE MARCHY MARKETPLACE"}</span><h1>{routeCategory ? category : "Find what you’re looking for."}</h1><p className="muted">{routeCategory ? "Browse products in this category." : results.length + " products to explore"}</p></div>
      <div className="listing-search listing-search-autocomplete" onFocus={() => setSearchFocused(true)} onBlur={event => { if (!event.currentTarget.contains(event.relatedTarget)) setSearchFocused(false) }}>
        <input type="search" role="searchbox" aria-label="Search marketplace" value={term} onFocus={() => setSearchFocused(true)} onChange={e => updateTerm(e.target.value)} onKeyDown={event => {
           if (event.key === 'Escape') setSearchFocused(false)
           if (event.key === 'ArrowDown' && searchFocused && term.trim()) {
             const firstSuggestion = document.querySelector('#marketplace-search-suggestions a, #marketplace-search-suggestions button')
             if (firstSuggestion) { event.preventDefault(); firstSuggestion.focus() }
           }
         }} placeholder="What are you looking for?" aria-expanded={searchFocused && Boolean(term.trim())} aria-controls="marketplace-search-suggestions"/>
        {term && <button type="button" className="listing-search-clear" aria-label="Clear search" onClick={() => updateTerm('')}>×</button>}
        <span aria-hidden="true"><Search size={17}/></span>
        {searchFocused && term.trim() && <div className="search-suggestions" id="marketplace-search-suggestions" aria-label="Search suggestions">
          {searchSuggestions.products.length > 0 && <div className="search-suggestion-group"><small>Products</small>{searchSuggestions.products.map(product => <Link key={product.id} to={'/product/' + product.id} className="search-suggestion-product" onClick={() => setSearchFocused(false)}><img src={product.image} alt="" loading="lazy"/><span><b>{product.name}</b><small>{product.category} · {money(product.price)}</small></span><span aria-hidden="true"><ArrowUpRight size={14}/></span></Link>)}</div>}
          {searchSuggestions.categories.length > 0 && <div className="search-suggestion-group"><small>Categories</small>{searchSuggestions.categories.map(name => <button type="button" key={name} onClick={() => { setSearchFocused(false); navigate('/category/' + encodeURIComponent(name.toLowerCase())) }}>{name}<span aria-hidden="true"><ArrowRight size={14}/></span></button>)}</div>}
          <button type="button" className="search-suggestions-all" onClick={() => setSearchFocused(false)}>View all {results.length} matching results <span aria-hidden="true">→</span></button>
          {searchSuggestions.products.length === 0 && searchSuggestions.categories.length === 0 && <p className="search-suggestions-empty">No quick matches. Press Enter or keep typing to search the full catalogue.</p>}
        </div>}
      </div>
    </div>
    <div className="mobile-filter-toggle"><button type="button" className="outline-btn mobile-filter-trigger" ref={filterTriggerRef} onClick={() => setFiltersOpen(true)} aria-expanded={filtersOpen} aria-controls="marketplace-filters"><span aria-hidden="true"><SlidersHorizontal size={16}/></span> Filters {activeFilterCount > 0 && <span className="mobile-filter-count">{activeFilterCount}</span>}</button><span><b>{results.length}</b> results</span></div>
    {activeFilterCount > 0 && <div className="active-filter-chips" aria-label="Active filters">
      {term && <button type="button" onClick={() => updateTerm('')}>Search: {term} <span>×</span></button>}
      {category !== 'All' && !routeCategory && <button type="button" onClick={removeCategoryFilter}>{category} <span>×</span></button>}
      {city !== 'All' && <button type="button" onClick={() => setCity('All')}>{city} <span>×</span></button>}
      {minPrice > 0 && <button type="button" onClick={() => setMinPrice(0)}>From {minPrice} TND <span>×</span></button>}
      {maxPrice < catalogueMaxPrice && <button type="button" onClick={() => setMaxPrice(catalogueMaxPrice)}>Up to {maxPrice} TND <span>×</span></button>}
      {dealsOnly && <button type="button" onClick={removeDealFilter}>Deals only <span>×</span></button>}
      <button type="button" className="clear-filter-chips" onClick={clearFilters}>Clear all</button>
    </div>}
    {routeCategory && <div className="category-context-strip"><span className="category-context-icon"><Sparkles size={17}/></span><div><b>{category}</b><small>Browse sample listings, compare displayed prices and visit demo storefronts.</small></div><Link to="/categories">All categories <ArrowRight size={14}/></Link></div>}
    {filtersOpen && <div className="mobile-filter-backdrop" aria-hidden="true" onClick={() => setFiltersOpen(false)} />}
    <div className="listing-layout">
      <aside id="marketplace-filters" className={'filters ' + (filtersOpen ? 'filters-open' : '')} aria-label="Marketplace filters" role={filtersOpen ? 'dialog' : undefined} aria-modal={filtersOpen ? 'true' : undefined} aria-labelledby="marketplace-filter-title" onKeyDown={event => {
        if (event.key !== 'Tab') return
        const focusable = [...event.currentTarget.querySelectorAll('button:not([disabled]), input:not([disabled]), select:not([disabled]), a[href]')]
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last?.focus() }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first?.focus() }
      }}>
        <div className="mobile-filter-sheet-heading"><div><span className="eyebrow">REFINE YOUR SEARCH</span><h2 id="marketplace-filter-title">Filters</h2><p>{results.length} matching products</p></div><button type="button" aria-label="Close filters" ref={filterCloseRef} onClick={() => setFiltersOpen(false)}><X size={17}/></button></div>
        <h3 className="desktop-filter-heading">Filters <button type="button" onClick={clearFilters}>Clear all</button></h3>
        <div className="filter-group"><b>Category</b>{categories.map(c => <label key={c}><input type="radio" name="marketplace-category" checked={category === c} onChange={() => routeCategory ? navigate(c === "All" ? "/search" : "/category/" + encodeURIComponent(c.toLowerCase())) : setCategory(c)}/><span>{c === 'All' ? 'All categories' : c}</span><small>{c === 'All' ? products.length : (categoryCounts[c] || 0)}</small></label>)}</div>
        <div className="filter-group"><b>Seller location</b><select aria-label="Seller location" value={city} onChange={e => setCity(e.target.value)}>{cities.map(c => <option key={c} value={c}>{c === 'All' ? 'All locations' : c}</option>)}</select></div>
        <div className="filter-group price-filter-group"><b>Price range</b><div className="price-inputs"><label>Min <input aria-label="Minimum price in TND" type="number" min="0" max={maxPrice} value={minPrice} onChange={e => setMinPrice(Math.min(maxPrice, Math.max(0, Number(e.target.value) || 0)))}/></label><label>Max <input aria-label="Maximum price in TND" type="number" min="0" max={catalogueMaxPrice} value={maxPrice} onChange={e => setMaxPrice(Math.max(minPrice, Math.min(catalogueMaxPrice, Number(e.target.value) || 0)))}/></label></div><input aria-label="Maximum price" type="range" min="0" max={catalogueMaxPrice} step="5" value={maxPrice} onChange={e => setMaxPrice(Math.max(minPrice, Number(e.target.value)))}/><div className="price-range-labels"><span>0 TND</span><span>{catalogueMaxPrice} TND</span></div></div>
        <div className="filter-budget-presets"><b>Popular budgets</b><div>{[50,100,200,500].map(value=><button type="button" key={value} className={maxPrice===Math.min(value,catalogueMaxPrice)?'is-active':''} onClick={()=>setMaxPrice(Math.min(value,catalogueMaxPrice))}>Under {value} TND</button>)}</div></div>
        {dealsOnly && <div className="filter-note">Showing sample listings with illustrative previous prices. Discount claims are not verified offers.</div>}
        <button className="filter-apply" type="button" onClick={() => setFiltersOpen(false)}>Show {results.length} products</button>
      </aside>
      <section className="listing-results" aria-live="polite">
        <div className="results-toolbar"><span aria-live="polite">Showing <b>{results.length ? ((page - 1) * pageSize) + 1 : 0}–{Math.min(page * pageSize, results.length)}</b> of <b>{results.length}</b></span><div className="results-toolbar-actions"><div className="listing-view-toggle" role="group" aria-label="Product layout"><button type="button" aria-label="Grid view" aria-pressed={view==='grid'} className={view==='grid'?'is-active':''} onClick={()=>setView('grid')}>▦ <span>Grid</span></button><button type="button" aria-label="List view" aria-pressed={view==='list'} className={view==='list'?'is-active':''} onClick={()=>setView('list')}>☷ <span>List</span></button></div><label>Sort by <select aria-label="Sort products" value={sort} onChange={e => setSort(e.target.value)}><option value="featured">Best match</option><option value="price-low">Price: low to high</option><option value="price-high">Price: high to low</option><option value="name">Name: A to Z</option><option value="newest">Recently added</option><option value="savings">Biggest displayed difference</option></select></label></div></div>
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
        {results.length ? <><div className={`product-grid ${view==='list'?'product-list-view':''}`}>{visibleResults.map(p => <ProductCard key={p.id} product={p} addToCart={addToCart} wished={wishlist.includes(p.id)} toggleWish={toggleWish} language={language} compareIds={compareIds} toggleCompare={toggleCompare} returnTo={window.location.pathname + window.location.search}/>)}</div>{pageCount > 1 && <nav className="pagination" aria-label="Product pages"><button type="button" disabled={page === 1} onClick={() => setPage(v => Math.max(1, v - 1))}>← Previous</button><span>Page {page} of {pageCount}</span><button type="button" disabled={page === pageCount} onClick={() => setPage(v => Math.min(pageCount, v + 1))}>Next →</button></nav>}</> : <div className="empty-state marketplace-no-results"><span><Search size={22}/></span><h3>No products found</h3><p>Try a broader search, choose another category or reset your price and location filters.</p><button type="button" className="outline-btn" onClick={clearFilters}>Reset all filters</button><div className="empty-search-suggestions"><b>Explore popular categories</b><div>{categories.filter(c=>c!=='All').slice(0,5).map(c=><Link key={c} to={`/category/${encodeURIComponent(c.toLowerCase())}`}>{c} <span>→</span></Link>)}</div></div></div>}
      </section>
    </div>
  </PageFrame>, language)
}


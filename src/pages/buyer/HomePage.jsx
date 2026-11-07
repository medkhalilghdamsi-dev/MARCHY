import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categories, products } from '../../data/products'
import { sellers } from '../../data/sellers'
import { readJson } from '../../utils/marketplace'
import { translateTree } from '../../i18n/translate'
import { ProductCard } from '../../components/marketplace/ProductCard'
import { ShopByMission } from '../../components/marketplace/ShopByMission'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { PageFrame } from '../../components/ui/PageFrame'
import {
  ArrowRight, Check, Search, Smartphone, ShoppingBasket, House, Shirt,
  Sparkles, Dumbbell, CarFront, BookOpen, Gamepad2, Baby, PawPrint,
  Sprout, Package, Compass, ArrowUpRight, SlidersHorizontal,
  ShieldCheck, Coins, Store, Truck, MapPin
} from 'lucide-react'

const categoryIcons = {
  Electronics: Smartphone,
  Groceries: ShoppingBasket,
  Home: House,
  Fashion: Shirt,
  Beauty: Sparkles,
  Sports: Dumbbell,
  Accessories: Package,
  Automotive: CarFront,
  Books: BookOpen,
  'Toys & Games': Gamepad2,
  'Baby & Kids': Baby,
  Pets: PawPrint,
  'Garden & DIY': Sprout,
}

export function Home() {
  const { addToCart, wishlist, toggleWish, language } = useMarketplace()
  const [active, setActive] = useState('All')
  const [heroSearch, setHeroSearch] = useState('')
  const [heroSegment, setHeroSegment] = useState('products')
  const [searchOpen, setSearchOpen] = useState(false)
  const [recentSearches, setRecentSearches] = useState(() => readJson('marchy-search-history', []).slice(0, 5))
  const navigate = useNavigate()

  const submitHeroSearch = event => {
    event.preventDefault()
    const query = heroSearch.trim()
    if (query) {
      const next = [query, ...recentSearches.filter(item => item.toLowerCase() !== query.toLowerCase())].slice(0, 5)
      setRecentSearches(next)
      try { localStorage.setItem('marchy-search-history', JSON.stringify(next)) } catch {}
    }
    setSearchOpen(false)
    if (heroSegment === 'sellers') {
      navigate(query ? '/sellers?q=' + encodeURIComponent(query) : '/sellers')
    } else if (heroSegment === 'handmade') {
      navigate(query ? '/search?q=' + encodeURIComponent('handmade ' + query) : '/search?q=handmade')
    } else {
      navigate(query ? '/search?q=' + encodeURIComponent(query) : '/search')
    }
  }

  const chooseSearch = value => {
    setHeroSearch(value)
    const next = [value, ...recentSearches.filter(item => item.toLowerCase() !== value.toLowerCase())].slice(0, 5)
    setRecentSearches(next)
    try { localStorage.setItem('marchy-search-history', JSON.stringify(next)) } catch {}
    setSearchOpen(false)
    navigate('/search?q=' + encodeURIComponent(value))
  }

  const populatedCategories = useMemo(
    () => categories.slice(1).filter(name => products.some(product => product.category === name)),
    []
  )
  const searchMatches = useMemo(() => {
    const query = heroSearch.trim().toLowerCase()
    if (!query) return { products: [], categories: [] }
    return {
      products: products.filter(product => [product.name, product.category, product.description || ''].join(' ').toLowerCase().includes(query)).slice(0, 4),
      categories: populatedCategories.filter(name => name.toLowerCase().includes(query)).slice(0, 3),
    }
  }, [heroSearch, populatedCategories])
  const popular = populatedCategories.map((name, index) => ({
    name,
    count: products.filter(product => product.category === name).length,
    Icon: categoryIcons[name] || Package,
    tone: ['cat-blue', 'cat-sand', 'cat-pink', 'cat-lilac', 'cat-green', 'cat-yellow'][index % 6],
    image: products.find(product => product.category === name)?.image,
    picks: products.filter(product => product.category === name).slice(0, 2),
  }))
  const filterOptions = ['All', ...populatedCategories.slice(0, 5)]
  // Keep the homepage collections distinct so buyers do not see the same cards repeated.
  const newArrivals = products.filter(product => !product.oldPrice).slice(-4).reverse()
  const newArrivalIds = new Set(newArrivals.map(product => product.id))
  const featuredProducts = products.filter(product => !product.oldPrice && !newArrivalIds.has(product.id)).slice(0, 8)
  const shown = (active === 'All' ? featuredProducts : featuredProducts.filter(product => product.category === active)).slice(0, 8)
  const deals = products.filter(product => product.oldPrice).slice(0, 4)
  const recentlyViewed = readJson('marchy-recently-viewed', [])
    .map(id => products.find(product => product.id === id))
    .filter(Boolean)
    .slice(0, 4)

  return translateTree(
    <PageFrame className="home-page home-landing-v2">
      <section className="market-hero market-hero-premium" aria-labelledby="market-hero-title">
        <div className="market-hero-copy">
          <span className="hero-kicker"><i aria-hidden="true"></i> EVERYDAY COMMERCE, MADE EASIER. · TUNISIA-FIRST</span>
          <h1 id="market-hero-title">Discover better.<br /><em>Shop local.</em></h1>
          <p>Find products, makers and storefronts in one clear marketplace experience — with prices in TND and delivery preferences clearly marked for seller confirmation.</p>

          <div className="hero-segmented-tabs" role="tablist" aria-label="Search scope">
            <button
              type="button"
              role="tab"
              aria-selected={heroSegment === 'products'}
              className={`hero-seg-tab ${heroSegment === 'products' ? 'is-active' : ''}`}
              onClick={() => setHeroSegment('products')}
            >
              🛍️ Products
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={heroSegment === 'sellers'}
              className={`hero-seg-tab ${heroSegment === 'sellers' ? 'is-active' : ''}`}
              onClick={() => setHeroSegment('sellers')}
            >
              🏪 Stores & Artisans
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={heroSegment === 'handmade'}
              className={`hero-seg-tab ${heroSegment === 'handmade' ? 'is-active' : ''}`}
              onClick={() => setHeroSegment('handmade')}
            >
              🇹🇳 Made in Tunisia
            </button>
          </div>

          <div className="home-search-wrap">
            <form id="home-search-submit" className="hero-search-form" role="search" onSubmit={submitHeroSearch}>
              <label className="sr-only" htmlFor="home-market-search">Search products and categories</label>
              <span aria-hidden="true"><Search size={19} /></span>
              <input
                id="home-market-search"
                type="search"
                role="combobox"
                aria-label="Search products and categories"
                aria-expanded={searchOpen}
                aria-controls="home-search-suggestions"
                aria-autocomplete="list"
                value={heroSearch}
                onFocus={() => setSearchOpen(true)}
                onBlur={() => window.setTimeout(() => setSearchOpen(false), 140)}
                onChange={event => setHeroSearch(event.target.value)}
                onKeyDown={event => { if (event.key === 'Escape') setSearchOpen(false) }}
                placeholder={heroSegment === 'sellers' ? "Search Tunisian storefronts, artisans, workshops..." : heroSegment === 'handmade' ? "Search pottery, olive wood, rugs, leather..." : "Search products, brands or categories"}
                autoComplete="off"
              />
              {heroSearch && <button className="home-search-clear" type="button" aria-label="Clear search" onClick={() => setHeroSearch('')}>×</button>}
              <button type="submit">Search <ArrowRight size={16} /></button>
            </form>
            {searchOpen && (heroSearch.trim() || recentSearches.length > 0) && (
              <div className="home-search-suggestions" id="home-search-suggestions">
                {heroSearch.trim() ? <>
                  {searchMatches.products.length > 0 && <div className="home-search-group"><small>Matching products</small>{searchMatches.products.map(product => <button type="button" key={product.id} onMouseDown={event => event.preventDefault()} onClick={() => chooseSearch(product.name)}><img src={product.image} alt="" /><span><b>{product.name}</b><small>{product.category} · {product.price} TND</small></span><ArrowRight size={14} /></button>)}</div>}
                  {searchMatches.categories.length > 0 && <div className="home-search-group"><small>Categories</small>{searchMatches.categories.map(name => <button type="button" key={name} onMouseDown={event => event.preventDefault()} onClick={() => { setSearchOpen(false); navigate('/category/' + encodeURIComponent(name.toLowerCase())) }}><span><b>{name}</b><small>Browse category</small></span><ArrowRight size={14} /></button>)}</div>}
                  <button className="home-search-all" type="submit" form="home-search-submit">View all results for “{heroSearch.trim()}”</button>
                </> : <div className="home-search-group"><small>Recent searches</small>{recentSearches.map(term => <button type="button" key={term} onMouseDown={event => event.preventDefault()} onClick={() => chooseSearch(term)}><span><b>{term}</b></span><ArrowRight size={14} /></button>)}</div>}
                {heroSearch.trim() && searchMatches.products.length === 0 && searchMatches.categories.length === 0 && <p className="home-search-empty">No quick matches. Search the full catalogue instead.</p>}
              </div>
            )}
          </div>

          <div className="hero-trending" aria-label="Popular searches">
            <span>Try:</span>
            {['Olive Wood', 'Leathercraft', 'Ceramics', 'Honey', 'Fashion'].map(term => (
              <button type="button" key={term} onClick={() => navigate('/search?q=' + encodeURIComponent(term))}>{term}</button>
            ))}
          </div>

          <div className="upwork-hero-stats">
            <div className="upwork-stat-item">
              <b>TND</b>
              <span>Clear local pricing</span>
            </div>
            <div className="upwork-stat-item">
              <b>Local sellers</b>
              <span>Browse sample storefronts</span>
            </div>
            <div className="upwork-stat-item">
              <b>Delivery preferences</b>
              <span>Seller confirmation required</span>
            </div>
          </div>
        </div>

        <div className="market-hero-art">
          <div className="hero-brand-stamp" aria-hidden="true"><span>M</span><small>MADE FOR<br />EVERYDAY</small></div>
          <div className="hero-art-orbit" aria-hidden="true"></div>
          <img
            src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1400&q=85"
            alt="A curated still life of home and everyday essentials"
            fetchPriority="high"
            decoding="async"
          />
          <div className="hero-image-shade" aria-hidden="true"></div>
          <div className="hero-floating-card">
            <span className="hero-floating-icon"><Compass size={19} /></span>
            <div><b>Your next discovery starts here</b><small>Explore the MARCHY catalogue</small></div>
          </div>
          <div className="hero-art-caption">LOCAL FINDS <b>·</b> EVERYDAY DISCOVERY</div>
          <div className="hero-art-index"><span>01</span><i></i><span>DISCOVER</span></div>
        </div>
      </section>

      {/* Compact trust rail — keep the homepage focused on discovery rather than explaining the whole product. */}
      <section className="home-trust-rail" aria-label="Why shop with MARCHY">
        <div className="home-trust-item">
          <span><ShieldCheck size={18} /></span>
          <div><b>Shop with clarity</b><small>Prices, sellers and product details stay visible.</small></div>
        </div>
        <div className="home-trust-item">
          <span><Coins size={18} /></span>
          <div><b>Prices in TND</b><small>Compare listings without currency guesswork.</small></div>
        </div>
        <div className="home-trust-item">
          <span><Truck size={18} /></span>
          <div><b>Delivery information</b><small>Illustrative delivery details; coverage and timing need seller confirmation.</small></div>
        </div>
        <div className="home-trust-item">
          <span><Store size={18} /></span>
          <div><b>Discover local sellers</b><small>Browse sample storefronts and makers in one place.</small></div>
        </div>
      </section>

      {/* Shop by Mission & Curated Routines */}
      <ShopByMission />

      {/* Category Discovery */}
      <section className="landing-section home-category-section">
        <div className="landing-section-header">
          <div>
            <span className="eyebrow">EXPLORE BY SPECIALTY</span>
            <h2>Browse categories</h2>
            <p className="muted">Explore sample categories across Tunisian workshops, electronics and lifestyle goods.</p>
          </div>
          <Link to="/categories" className="text-link">All categories <ArrowRight size={15} /></Link>
        </div>

        <div className="upwork-category-grid">
          {popular.slice(0, 8).map(item => (
            <Link
              key={item.name}
              to={`/category/${encodeURIComponent(item.name.toLowerCase())}`}
              className="upwork-cat-card"
            >
              <span className="upwork-cat-icon">
                <item.Icon size={22} strokeWidth={1.8} />
              </span>
              <div className="upwork-cat-text">
                <b>{item.name}</b>
                <small>{item.count} sample listing{item.count === 1 ? '' : 's'}</small>
              </div>
              <span className="upwork-cat-arrow">
                <ArrowRight size={16} />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="upwork-value-section" aria-label="Why Choose MARCHY">
        <div className="upwork-value-header">
          <span className="eyebrow">WHY MARCHY</span>
          <h2>Everything you need to choose with confidence.</h2>
          <p>Less hunting. Less uncertainty. A clearer path from discovering a product to placing an order.</p>
        </div>
        <div className="upwork-value-grid">
          <div className="upwork-value-card">
            <span className="value-icon-circle"><ShieldCheck size={22} /></span>
            <h3>Know what you are buying</h3>
            <p>Keep product details, seller context and pricing visible while you compare your options.</p>
          </div>
          <div className="upwork-value-card">
            <span className="value-icon-circle"><Coins size={22} /></span>
            <h3>Compare in TND</h3>
            <p>See catalogue prices in Tunisian Dinars and compare listings without converting currencies in your head.</p>
          </div>
          <div className="upwork-value-card">
            <span className="value-icon-circle"><Store size={22} /></span>
            <h3>Discover local sellers</h3>
            <p>Explore storefronts, workshops and specialist retailers through one consistent shopping experience.</p>
          </div>
          <div className="upwork-value-card">
            <span className="value-icon-circle"><Truck size={22} /></span>
            <h3>Delivery visibility</h3>
            <p>Review illustrative delivery details; coverage, fees and timing still need seller confirmation.</p>
          </div>
        </div>
      </section>

      <section className="landing-section home-featured-section">
        <div className="landing-section-header">
          <div><span className="eyebrow">PICK YOUR NEXT DISCOVERY</span><h2>Popular in the catalogue</h2><p className="muted">Explore a selection of illustrative catalogue listings.</p></div>
          <Link to="/search" className="text-link">Browse all products <ArrowRight size={15} /></Link>
        </div>
        <div className="home-category-tabs home-filter-tabs" role="group" aria-label="Filter featured products">
          <SlidersHorizontal size={15} aria-hidden="true" />
          {filterOptions.map(name => (
            <button key={name} type="button" className={active === name ? 'active' : ''} aria-pressed={active === name} onClick={() => setActive(name)}>{name}</button>
          ))}
        </div>
        <div className="product-grid">
          {shown.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} wished={wishlist.includes(product.id)} toggleWish={toggleWish} language={language} />)}
        </div>
      </section>

      <section className="landing-section upwork-seller-showcase" aria-label="Featured Tunisian Storefronts">
        <div className="landing-section-header">
          <div>
            <span className="eyebrow">SAMPLE LOCAL STOREFRONTS</span>
            <h2>Storefronts to explore</h2>
            <p className="muted">Discover sample Tunisian shops, ateliers and artisan workshops.</p>
          </div>
          <Link to="/sellers" className="text-link">Explore all storefronts <ArrowRight size={15} /></Link>
        </div>
        <div className="upwork-seller-grid">
          {sellers.slice(0, 3).map(seller => (
            <article key={seller.slug} className="upwork-seller-card">
              <div className="upwork-seller-header">
                <span className="upwork-seller-badge">{seller.name.slice(0, 1)}</span>
                <div className="upwork-seller-meta">
                  <h3>{seller.name}</h3>
                  <p><MapPin size={12} /> {seller.city}, Tunisia</p>
                </div>
              </div>
              <p className="upwork-seller-tagline">{seller.tagline}</p>
              <div className="upwork-seller-footer">
                <span className="upwork-seller-rating"><Store size={13} /> Sample storefront</span>
                <Link to={`/seller/${seller.slug}`} className="upwork-seller-link">Visit shop <ArrowRight size={13} /></Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="home-budget-discovery home-budget-premium" aria-label="Shop by budget">
        <div><span className="eyebrow">DISCOVER BY PRICE</span><h2>Good finds, your budget.</h2><p>Start with a price range that feels right.</p></div>
        <div className="home-budget-links">
          {[{ label: 'Under 50 TND', max: 50 }, { label: 'Under 100 TND', max: 100 }, { label: 'Under 200 TND', max: 200 }, { label: 'Explore all', max: 0 }].map(item => (
            <Link key={item.label} to={item.max ? '/search?max=' + item.max : '/search'}>{item.label}<ArrowRight size={14} /></Link>
          ))}
        </div>
      </section>

      <section className="home-editorial-discovery" aria-label="More ways to discover">
        <Link to="/category/home" className="home-editorial-card home-editorial-home">
          <span>MAKE ROOM FOR BETTER</span><b>Thoughtful picks<br />for your space.</b><small>Explore home <ArrowUpRight size={14} /></small>
        </Link>
        <Link to="/category/fashion" className="home-editorial-card home-editorial-style">
          <span>EVERYDAY, REIMAGINED</span><b>Find your<br />everyday style.</b><small>Explore fashion <ArrowUpRight size={14} /></small>
        </Link>
        <Link to="/category/electronics" className="home-editorial-card home-editorial-tech">
          <span>SMARTER EVERYDAY</span><b>Little upgrades.<br />Big difference.</b><small>Explore electronics <ArrowUpRight size={14} /></small>
        </Link>
      </section>

      {recentlyViewed.length > 0 && (
        <section className="section home-recently-viewed">
          <div className="section-heading">
            <div><span className="eyebrow">PICK UP WHERE YOU LEFT OFF</span><h2>Recently viewed</h2><p className="muted">Your latest product discoveries on this device.</p></div>
          </div>
          <div className="product-grid">
            {recentlyViewed.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} wished={wishlist.includes(product.id)} toggleWish={toggleWish} language={language} />)}
          </div>
        </section>
      )}

      <section className="landing-section home-new-arrivals">
        <div className="landing-section-header">
          <div><span className="eyebrow">FRESH FROM THE CATALOGUE</span><h2>Recently added</h2><p className="muted">A look at the latest sample listings in this prototype.</p></div>
          <Link to="/search?sort=newest" className="text-link">Explore catalogue <ArrowRight size={15} /></Link>
        </div>
        <div className="product-grid">
          {newArrivals.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} wished={wishlist.includes(product.id)} toggleWish={toggleWish} language={language} />)}
        </div>
      </section>

      <section className="landing-section home-deals-section">
        <div className="landing-section-header">
          <div><span className="eyebrow">PRICE COMPARISON</span><h2>Listings with sample discounts</h2><p className="muted">Previous prices are illustrative and must be confirmed with the seller.</p></div>
          <Link to="/search?deal=true" className="text-link">See all deals <ArrowRight size={15} /></Link>
        </div>
        <div className="product-grid">
          {deals.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} wished={wishlist.includes(product.id)} toggleWish={toggleWish} language={language} />)}
        </div>
      </section>

      <section className="upwork-dual-cta" aria-label="Get Started with MARCHY">
        <div className="upwork-cta-card upwork-cta-buyers">
          <div>
            <span className="eyebrow">FOR DISCERNING SHOPPERS</span>
            <h3>Explore local craft<br />and everyday goods.</h3>
            <p>Explore sample product listings and discover the kinds of local shops MARCHY is designed to bring together.</p>
          </div>
          <Link to="/search">Browse Marketplace <ArrowRight size={14} /></Link>
        </div>
        <div className="upwork-cta-card upwork-cta-sellers">
          <div>
            <span className="eyebrow" style={{ color: '#86efac' }}>FOR ARTISANS & MERCHANTS</span>
            <h3>Are you a maker<br />or store owner?</h3>
            <p>Preview the seller journey, prepare a storefront and explore the tools planned for local merchants.</p>
          </div>
          <Link to="/sell">Open a Storefront <ArrowRight size={14} /></Link>
        </div>
      </section>

      <p className="catalogue-note">MARCHY is a frontend prototype. Product listings, storefronts, prices, discounts and availability shown here are illustrative — not verified live offers.</p>
    </PageFrame>,
    language
  )
}

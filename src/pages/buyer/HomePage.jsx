import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { categories, products } from '../../data/products'
import { sellers } from '../../data/sellers'
import { readJson } from '../../utils/marketplace'
import { translateTree } from '../../i18n/translate'
import { ProductCard } from '../../components/marketplace/ProductCard'
import { useMarketplace } from '../../providers/MarketplaceContext'
import {
  ArrowRight, Check, Search, Smartphone, ShoppingBasket, House, Shirt,
  Sparkles, Dumbbell, CarFront, BookOpen, Gamepad2, Baby, PawPrint,
  Sprout, Package, Compass, ArrowUpRight, SlidersHorizontal
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
  const navigate = useNavigate()

  const submitHeroSearch = event => {
    event.preventDefault()
    const query = heroSearch.trim()
    navigate(query ? '/search?q=' + encodeURIComponent(query) : '/search')
  }

  const populatedCategories = useMemo(
    () => categories.slice(1).filter(name => products.some(product => product.category === name)),
    []
  )
  const popular = populatedCategories.map((name, index) => ({
    name,
    count: products.filter(product => product.category === name).length,
    Icon: categoryIcons[name] || Package,
    tone: ['cat-blue', 'cat-sand', 'cat-pink', 'cat-lilac', 'cat-green', 'cat-yellow'][index % 6],
    image: products.find(product => product.category === name)?.image,
  }))
  const filterOptions = ['All', ...populatedCategories.slice(0, 5)]
  const shown = (active === 'All' ? products : products.filter(product => product.category === active)).slice(0, 8)
  const deals = products.filter(product => product.oldPrice).slice(0, 4)
  const newArrivals = [...products].slice(-4).reverse()
  const recentlyViewed = readJson('marchy-recently-viewed', [])
    .map(id => products.find(product => product.id === id))
    .filter(Boolean)
    .slice(0, 4)

  return translateTree(
    <main id="main-content" className="shell page home-page home-landing-v2">
      <section className="market-hero market-hero-premium" aria-labelledby="market-hero-title">
        <div className="market-hero-copy">
          <span className="hero-kicker"><i aria-hidden="true"></i> MADE FOR TUNISIA · READY TO EXPLORE</span>
          <h1 id="market-hero-title">Find what you need.<br /><em>Love what you find.</em></h1>
          <p>Discover everyday products, compare catalogue prices in Tunisian dinars, and explore storefronts — all in one place.</p>

          <form className="hero-search-form" role="search" onSubmit={submitHeroSearch}>
            <label className="sr-only" htmlFor="home-market-search">Search products and categories</label>
            <span aria-hidden="true"><Search size={19} /></span>
            <input
              id="home-market-search"
              type="search"
              value={heroSearch}
              onChange={event => setHeroSearch(event.target.value)}
              placeholder="Search products, brands or categories"
            />
            <button type="submit">Search <ArrowRight size={16} /></button>
          </form>

          <div className="hero-trending" aria-label="Popular searches">
            <span>Try:</span>
            {['Headphones', 'Home', 'Fashion', 'Beauty'].map(term => (
              <button type="button" key={term} onClick={() => navigate('/search?q=' + encodeURIComponent(term))}>{term}</button>
            ))}
          </div>
          <div className="market-hero-proof">
            <span><Check size={14} /> Prices shown in TND</span>
            <span><Check size={14} /> Explore multiple categories</span>
            <span><Check size={14} /> Save your favourites</span>
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

      <section className="market-benefits home-benefits-strip" aria-label="MARCHY shopping highlights">
        <div><span><Check size={16} /></span><b>One place to explore</b><small>Everyday categories in one catalogue</small></div>
        <div><span><Check size={16} /></span><b>Prices in dinars</b><small>Browse prices in Tunisian dinars</small></div>
        <div><span><Check size={16} /></span><b>Keep your favourites</b><small>Save products for another time</small></div>
      </section>

      <section className="section home-category-section">
        <div className="section-heading">
          <div><span className="eyebrow">A GOOD PLACE TO START</span><h2>Explore categories</h2><p className="muted">Find your way to the things you’re looking for.</p></div>
          <Link to="/categories" className="text-link">All categories <ArrowRight size={15} /></Link>
        </div>
        <div className="home-category-grid home-category-grid-premium">
          {popular.slice(0, 8).map(item => (
            <Link key={item.name} to={`/category/${encodeURIComponent(item.name.toLowerCase())}`} className={`home-category-card home-category-image-card ${item.tone}`}>
              {item.image && <img src={item.image} alt="" loading="lazy" decoding="async" />}
              <span className="home-category-icon" aria-hidden="true"><item.Icon size={23} strokeWidth={1.7} /></span>
              <b>{item.name}</b>
              <small>Explore category <ArrowUpRight size={13} /></small>
            </Link>
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

      <section className="section home-featured-section">
        <div className="section-heading">
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

      <section className="section home-new-arrivals">
        <div className="section-heading">
          <div><span className="eyebrow">FRESH FROM THE CATALOGUE</span><h2>Recently added</h2><p className="muted">A look at the latest sample listings in this prototype.</p></div>
          <Link to="/search?sort=newest" className="text-link">Explore catalogue <ArrowRight size={15} /></Link>
        </div>
        <div className="product-grid">
          {newArrivals.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} wished={wishlist.includes(product.id)} toggleWish={toggleWish} language={language} />)}
        </div>
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

      <section className="section home-deals-section">
        <div className="section-heading">
          <div><span className="eyebrow">PRICE COMPARISON</span><h2>Listings with sample discounts</h2><p className="muted">Previous prices are illustrative and must be confirmed with the seller.</p></div>
          <Link to="/search?deal=true" className="text-link">See all deals <ArrowRight size={15} /></Link>
        </div>
        <div className="product-grid">
          {deals.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} wished={wishlist.includes(product.id)} toggleWish={toggleWish} language={language} />)}
        </div>
      </section>

      <section className="home-seller-banner">
        <div>
          <span className="eyebrow">FOR THE STORES BEHIND THE FINDS</span>
          <h2>Have a store?<br /><em>Meet your next customers.</em></h2>
          <p>Explore the merchant experience and see how a storefront can appear on MARCHY.</p>
          <Link to="/sell" className="light-btn">Discover selling on MARCHY <ArrowRight size={15} /></Link>
        </div>
        <div className="seller-banner-stats">
          <b>{sellers.length}</b><span>sample storefronts</span>
          <b>{populatedCategories.length}</b><span>categories with listings</span>
        </div>
      </section>

      <p className="catalogue-note">MARCHY is a frontend prototype. Product listings, storefronts, prices, discounts and availability shown here are illustrative — not verified live offers.</p>
    </main>,
    language
  )
}

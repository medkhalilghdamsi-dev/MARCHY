import { useState } from 'react'
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
  Sprout, Package, Compass
} from 'lucide-react'

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

  const shown = (active === 'All' ? products : products.filter(product => product.category === active)).slice(0, 8)
  const populatedCategories = categories.slice(1).filter(name => products.some(product => product.category === name))
  const categoryIcons = [Smartphone, ShoppingBasket, House, Shirt, Sparkles, Dumbbell, CarFront, BookOpen, Gamepad2, Baby, PawPrint, Sprout, Package]
  const popular = populatedCategories.map((name, index) => ({
    name,
    count: products.filter(product => product.category === name).length,
    Icon: categoryIcons[index % categoryIcons.length],
    tone: ['cat-blue', 'cat-sand', 'cat-pink', 'cat-lilac', 'cat-green', 'cat-yellow'][index % 6],
  }))
  const deals = products.filter(product => product.oldPrice).slice(0, 4)
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
            <span aria-hidden="true"><Search size={18} /></span>
            <input
              id="home-market-search"
              type="search"
              value={heroSearch}
              onChange={event => setHeroSearch(event.target.value)}
              placeholder="What are you looking for?"
            />
            <button type="submit">Search <ArrowRight size={16} /></button>
          </form>

          <div className="hero-trending" aria-label="Popular searches">
            <span>Popular:</span>
            {['Headphones', 'Home', 'Fashion', 'Beauty'].map(term => (
              <button type="button" key={term} onClick={() => navigate('/search?q=' + encodeURIComponent(term))}>{term}</button>
            ))}
          </div>
          <div className="market-hero-proof">
            <span><Check size={14} /> Prices shown in TND</span>
            <span><Check size={14} /> Browse multiple categories</span>
            <span><Check size={14} /> Save your favourites</span>
          </div>
        </div>

        <div className="market-hero-art">
          <div className="hero-brand-stamp" aria-hidden="true"><span>M</span><small>MADE FOR<br />EVERYDAY</small></div>
          <div className="hero-art-orbit" aria-hidden="true"></div>
          <img
            src="https://images.unsplash.com/photo-1490312278390-ab64016e0aa9?auto=format&fit=crop&w=1400&q=90"
            alt="A considered still life of everyday objects and home accessories"
            fetchPriority="high"
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
        <div><span>01</span><b>One place to explore</b><small>Browse products across everyday categories</small></div>
        <div><span>02</span><b>Prices in dinars</b><small>Compare catalogue prices in TND</small></div>
        <div><span>03</span><b>Keep your favourites</b><small>Save products and revisit them anytime</small></div>
      </section>

      <section className="section home-category-section">
        <div className="section-heading">
          <div><span className="eyebrow">START WITH WHAT YOU NEED</span><h2>Explore categories</h2><p className="muted">Go straight to the things you’re looking for.</p></div>
          <Link to="/categories" className="text-link">All categories <ArrowRight size={15} /></Link>
        </div>
        <div className="home-category-grid">
          {popular.map(item => (
            <Link key={item.name} to={`/category/${encodeURIComponent(item.name.toLowerCase())}`} className={`home-category-card home-category-image-card ${item.tone}`}>
              <img src={products.find(product => product.category === item.name)?.image} alt="" loading="lazy" />
              <span className="home-category-icon" aria-hidden="true"><item.Icon size={23} strokeWidth={1.7} /></span>
              <b>{item.name}</b>
              <small>{item.count} sample {item.count === 1 ? 'listing' : 'listings'} <ArrowRight size={13} /></small>
            </Link>
          ))}
        </div>
      </section>

      <section className="home-budget-discovery" aria-label="Shop by budget">
        <div><span className="eyebrow">FIND YOUR PRICE RANGE</span><h2>Good finds, your budget.</h2><p>Explore sample listings within a comfortable price range.</p></div>
        <div className="home-budget-links">
          {[{ label: 'Under 50 TND', max: 50 }, { label: 'Under 100 TND', max: 100 }, { label: 'Under 200 TND', max: 200 }, { label: 'Explore everything', max: 0 }].map(item => (
            <Link key={item.label} to={item.max ? '/search?max=' + item.max : '/search'}>{item.label}<ArrowRight size={14} /></Link>
          ))}
        </div>
      </section>

      <section className="section home-featured-section">
        <div className="section-heading">
          <div><span className="eyebrow">PICK YOUR NEXT DISCOVERY</span><h2>Popular in the catalogue</h2><p className="muted">A curated look at the current sample listings.</p></div>
          <Link to="/search" className="text-link">Browse all products <ArrowRight size={15} /></Link>
        </div>
        <div className="home-category-tabs" role="group" aria-label="Filter featured products">
          {['All', 'Electronics', 'Home', 'Fashion', 'Beauty', 'Sports'].map(name => (
            <button key={name} type="button" className={active === name ? 'active' : ''} aria-pressed={active === name} onClick={() => setActive(name)}>{name}</button>
          ))}
        </div>
        <div className="product-grid">
          {shown.map(product => <ProductCard key={product.id} product={product} addToCart={addToCart} wished={wishlist.includes(product.id)} toggleWish={toggleWish} language={language} />)}
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

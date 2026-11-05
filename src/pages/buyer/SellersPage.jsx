import { useState } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../../data/products'
import { sellers } from '../../data/sellers'
import { searchTextMatches } from '../../utils/marketplace'
import { translateTree } from '../../i18n/translate'
import { useMarketplace } from '../../providers/MarketplaceContext'
import { ArrowRight, MapPin, Search, SlidersHorizontal, Store } from 'lucide-react'

export function SellersPage() {
 const { language } = useMarketplace()
 const [term,setTerm]=useState('')
 const [city,setCity]=useState('All')
 const [category,setCategory]=useState('All')
 const cities=['All',...new Set(sellers.map(s=>s.city))].sort((a,b)=>a==='All'?-1:b==='All'?1:a.localeCompare(b))
 const sellerCategories=['All',...new Set(sellers.flatMap(s=>s.categories))].sort((a,b)=>a==='All'?-1:b==='All'?1:a.localeCompare(b))
 const visible=sellers.filter(s=>(city==='All'||s.city===city)&&(category==='All'||s.categories.includes(category))&&searchTextMatches([s.name,s.city,s.tagline,...s.categories].join(' '),term))
 return translateTree(<main id="main-content" className="shell page seller-directory-page"><div className="breadcrumbs" role="navigation" aria-label="Breadcrumb"><Link to="/">Home</Link> / Sellers</div><section className="seller-directory-hero"><span className="eyebrow">DISCOVER LOCAL BUSINESSES</span><h1>Meet the sellers behind the finds.</h1><p>Explore sample storefronts from across Tunisia. Profiles and listings are demonstration content, not verified businesses.</p><div className="seller-directory-stats"><span><b>{sellers.length}</b><small>Sample storefronts</small></span><span><b>{new Set(sellers.map(s=>s.city)).size}</b><small>Locations represented</small></span><span><b>{products.length}</b><small>Sample listings</small></span></div></section>
 <section className="seller-directory-tools" aria-label="Find a seller"><label className="seller-directory-search"><span><Search size={16}/></span><input value={term} onChange={e=>setTerm(e.target.value)} placeholder="Search shops, products or locations" aria-label="Search sellers"/></label><label>City<select value={city} onChange={e=>setCity(e.target.value)}>{cities.map(x=><option key={x}>{x}</option>)}</select></label><label>Category<select value={category} onChange={e=>setCategory(e.target.value)}>{sellerCategories.map(x=><option key={x}>{x}</option>)}</select></label><button type="button" className="seller-directory-reset" onClick={()=>{setTerm('');setCity('All');setCategory('All')}}><SlidersHorizontal size={14}/> Reset</button></section>
 <div className="seller-directory-results"><b>{visible.length} storefront{visible.length===1?'':'s'}</b><span>Sample profiles · not independently verified</span></div>
 {visible.length?<div className="seller-directory-grid">{visible.map(s=><article className="seller-directory-card" key={s.slug}><div className="seller-card-top"><span className="seller-avatar large">{s.name.slice(0,1)}</span><span className="demo-label">DEMO STOREFRONT</span></div><h2>{s.name}</h2><p className="seller-location"><MapPin size={13} aria-hidden="true"/> {s.city}, Tunisia</p><p>{s.tagline}</p><div className="seller-category-tags">{s.categories.map(c=><span key={c}>{c}</span>)}</div><Link to={`/seller/${s.slug}`} className="seller-visit-link">View storefront <span><ArrowRight size={15}/></span></Link></article>)}</div>:<div className="empty-state seller-directory-empty"><span><Store size={22}/></span><h2>No matching storefronts</h2><p>Try another shop name, city or category.</p><button type="button" className="outline-btn" onClick={()=>{setTerm('');setCity('All');setCategory('All')}}>Clear seller filters</button></div>}
 </main>,language)
}


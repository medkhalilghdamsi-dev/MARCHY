import { useState } from 'react'
import { Link } from 'react-router-dom'
import { categories, products } from '../../data/products'
import { searchTextMatches } from '../../utils/marketplace'
import { translateTree } from '../../i18n/translate'
import { useMarketplace } from '../../providers/MarketplaceContext'

export function CategoriesPage() {
 const { language } = useMarketplace()
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

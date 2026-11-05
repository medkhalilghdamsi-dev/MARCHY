import { Link } from 'react-router-dom'
import { translateTree } from '../../i18n/translate'
import { useMarketplace } from '../../providers/MarketplaceContext'

export function NotFoundPage() {
 const { language } = useMarketplace()
 return translateTree(<main id="main-content" className="shell page not-found-page"><div className="not-found-visual"><span>4</span><b>MARCHY<span>.</span></b><span>4</span></div><span className="eyebrow">PAGE NOT FOUND</span><h1>This page isn't here.</h1><p>The link may be incorrect or the page may have moved. Let's get you back to something useful.</p><div className="not-found-actions"><Link to="/" className="primary-btn">Back to home →</Link><Link to="/search" className="outline-btn">Explore products</Link><Link to="/categories" className="text-link">Browse categories</Link></div></main>,language)
}

export function SimplePage({ title, eyebrow, text, language }) {
 return translateTree(<main id="main-content" className="shell page simple-page"><span className="eyebrow">{eyebrow}</span><h1>{title}</h1><p className="muted">{text}</p><Link to="/search" className="primary-btn">Explore the marketplace →</Link></main>,language)
}


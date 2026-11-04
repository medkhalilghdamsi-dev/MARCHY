import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { products } from '../data/products'
import { sellerForProduct } from '../data/sellers'
import { money, readJson, writeJson } from '../utils/marketplace'
import { translateTree } from '../i18n/translate'

function ComparePage({ addToCart, language }) {
  const [ids, setIds] = useState(() => {
    const saved = readJson('marchy-compare', [])
    return (Array.isArray(saved) ? saved : []).filter((id, index, all) => products.some(product => product.id === id) && all.indexOf(id) === index).slice(0, 3)
  })
  const [feedback, setFeedback] = useState('')
  useEffect(() => { writeJson('marchy-compare', ids) }, [ids])

  const selected = useMemo(() => ids.map(id => products.find(product => product.id === id)).filter(Boolean), [ids])
  const mixedCategories = new Set(selected.map(product => product.category)).size > 1
  const remove = id => {
    setIds(current => current.filter(item => item !== id))
    setFeedback('Listing removed from comparison')
  }
  const rows = [
    { label: 'Displayed price', value: product => <strong className="compare-page-price">{money(product.price)}</strong> },
    { label: 'Illustrative reference price', value: product => product.oldPrice ? money(product.oldPrice) : 'Not supplied' },
    { label: 'Difference from reference', value: product => product.oldPrice ? money(product.oldPrice - product.price) : 'Not supplied' },
    { label: 'Category', value: product => product.category },
    { label: 'Seller', value: product => { const seller = sellerForProduct(product); return <Link to={`/seller/${seller.slug}`}>{seller.name}</Link> } },
    { label: 'Seller location', value: product => sellerForProduct(product).city + ', Tunisia' },
    { label: 'Description', value: product => product.description || 'No description supplied' },
    { label: 'Availability', value: () => 'To be confirmed with seller' },
    { label: 'Delivery', value: () => 'Coverage, cost and timing to be confirmed' },
  ]

  return translateTree(<main id="main-content" className="shell page compare-page">
    <nav className="breadcrumbs" aria-label="Breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/search">Marketplace</Link><span>/</span><span aria-current="page">Compare listings</span></nav>
    <header className="compare-page-heading">
      <div><span className="eyebrow">MAKE A MORE INFORMED CHOICE</span><h1>Compare products</h1><p>Review the information available side by side before choosing what to explore next.</p></div>
      <Link to="/search" className="outline-btn">＋ Add products</Link>
    </header>
    {feedback && <p className="compare-page-feedback" role="status">{feedback}</p>}
    {!selected.length ? <section className="compare-page-empty">
      <span className="compare-page-empty-icon" aria-hidden="true">⇄</span><span className="eyebrow">YOUR SHORTLIST STARTS HERE</span><h2>No products selected</h2><p>Add up to three sample listings from the marketplace to compare their displayed prices, descriptions and seller details.</p><Link to="/search" className="primary-btn">Explore products →</Link>
    </section> : <>
      <div className="compare-page-summary"><div><b>{selected.length} of 3 listings selected</b><span>{mixedCategories ? 'These listings are from different categories. Compare the information available, not like-for-like specifications.' : 'These listings share a category. Check product details with each seller before deciding.'}</span></div><button type="button" className="compare-page-clear" onClick={() => { setIds([]); setFeedback('Comparison cleared') }}>Clear comparison</button></div>
      <section className="compare-page-products" aria-label="Selected products">
        {selected.map(product => <article className="compare-page-product" key={product.id}>
          <Link to={`/product/${product.id}`} className="compare-page-product-image"><img src={product.image} alt={product.name} onError={event => { event.currentTarget.onerror = null; event.currentTarget.src = '/product-placeholder.svg' }}/></Link>
          <div className="compare-page-product-copy"><span>{product.category}</span><Link to={`/product/${product.id}`}><b>{product.name}</b></Link><strong>{money(product.price)}</strong><small><Link to={`/seller/${sellerForProduct(product).slug}`}>{sellerForProduct(product).name}</Link> · {sellerForProduct(product).city}</small></div>
          <div className="compare-page-product-actions"><button type="button" className="primary-btn" onClick={() => { addToCart(product, 1); setFeedback(product.name + ' added to your demo cart') }}>Add to cart</button><button type="button" className="compare-page-remove" onClick={() => remove(product.id)} aria-label={`Remove ${product.name} from comparison`}>Remove</button></div>
        </article>)}
        {selected.length < 3 && <Link to="/search" className="compare-page-add-card"><span>＋</span><b>Add another product</b><small>{3 - selected.length} comparison slot{selected.length === 2 ? '' : 's'} remaining</small></Link>}
      </section>
      <section className="compare-page-table-section">
        <div className="compare-page-table-heading"><div><span className="eyebrow">SIDE-BY-SIDE REVIEW</span><h2>Listing details</h2></div><span>Scroll horizontally to view every product</span></div>
        <div className="compare-page-table-scroll" role="region" aria-label="Product comparison table" tabIndex="0">
          <table className="compare-page-table">
            <thead><tr><th scope="col">What to compare</th>{selected.map(product => <th scope="col" key={product.id}><Link to={`/product/${product.id}`}>{product.name}</Link></th>)}</tr></thead>
            <tbody>{rows.map(row => <tr key={row.label}><th scope="row">{row.label}</th>{selected.map(product => <td key={product.id}>{row.value(product)}</td>)}</tr>)}</tbody>
          </table>
        </div>
      </section>
      <div className="compare-page-disclaimer"><span aria-hidden="true">ⓘ</span><p>MARCHY is a frontend prototype. Prices, reference prices, descriptions and storefront information are illustrative. This comparison cannot verify product quality, technical specifications, stock, seller reliability, delivery terms or final prices.</p></div>
    </>}
    <div className="compare-page-footer"><Link to="/cart">View cart →</Link><Link to="/search">Continue exploring →</Link></div>
  </main>, language)
}

export { ComparePage }

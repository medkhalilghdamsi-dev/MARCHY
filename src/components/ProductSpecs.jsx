export function ProductSpecs({ product, seller }) {
  const specs = product.specs || {}
  const specEntries = Object.entries(specs)

  return (
    <article className="product-information-card product-specs-card">
      <span className="eyebrow">TECHNICAL ATTRIBUTES</span>
      <h2>Product Specifications</h2>
      {specEntries.length > 0 ? (
        <dl className="product-attribute-list">
          {specEntries.map(([key, val]) => (
            <div key={key}>
              <dt>{key}</dt>
              <dd>{val}</dd>
            </div>
          ))}
          <div>
            <dt>Category</dt>
            <dd>{product.category}</dd>
          </div>
          <div>
            <dt>Fulfilment</dt>
            <dd>{seller.name} ({seller.city}, Tunisia)</dd>
          </div>
          <div>
            <dt>Stock Status</dt>
            <dd>{product.stock || 'In stock'}</dd>
          </div>
        </dl>
      ) : (
        <p className="muted">
          Specifications for this sample item are provided as representative demonstration data. Contact {seller.name} to confirm exact technical parameters.
        </p>
      )}
    </article>
  )
}

export function PageLoadingFallback() {
  return (
    <main id="main-content" className="shell page page-loading-state" aria-busy="true" aria-label="Loading page">
      <div className="page-skeleton">
        <div className="skeleton-block skeleton-title" />
        <div className="skeleton-block skeleton-text" />
        <div className="skeleton-block skeleton-text skeleton-text-short" />
        <div className="skeleton-grid">
          {[1, 2, 3, 4].map(index => <div key={index} className="skeleton-card" />)}
        </div>
      </div>
    </main>
  )
}

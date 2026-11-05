import { useState } from 'react'
import { mockReviews } from '../../data/products'
import { readJson, writeJson } from '../../utils/marketplace'
import { useToast } from '../../providers/ToastProvider'

export function ProductReviews({ product }) {
  const toast = useToast()
  const storageKey = `marchy-product-reviews-${product.id}`

  // Seeded reviews are illustrative catalogue content, never verified purchases.
  const defaultReviews = (mockReviews[product.id] || [
    { id: `mock-${product.id}-1`, author: 'Sample reviewer', date: '2026-10-18', rating: 5, comment: 'Illustrative review content for the frontend preview.' },
    { id: `mock-${product.id}-2`, author: 'Sample reviewer', date: '2026-10-09', rating: 4, comment: 'Illustrative review content for the frontend preview.' }
  ]).map(review => ({ ...review, sample: true }))

  const [reviews, setReviews] = useState(() => readJson(storageKey, defaultReviews))
  const [formOpen, setFormOpen] = useState(false)
  const [rating, setRating] = useState(5)
  const [hoverRating, setHoverRating] = useState(0)
  const [name, setName] = useState('')
  const [comment, setComment] = useState('')

  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : product.rating || '4.5'

  // Star counts
  const starCounts = [5, 4, 3, 2, 1].map(stars => ({
    stars,
    count: reviews.filter(r => Math.round(r.rating) === stars).length,
    percent: reviews.length ? Math.round((reviews.filter(r => Math.round(r.rating) === stars).length / reviews.length) * 100) : 0
  }))

  function submitReview(e) {
    e.preventDefault()
    if (!name.trim() || !comment.trim()) return

    const newReview = {
      id: `rev-${Date.now()}`,
      author: name.trim(),
      date: new Date().toISOString().split('T')[0],
      rating: Number(rating),
      comment: comment.trim(),
      localPreview: true
    }

    const updated = [newReview, ...reviews]
    setReviews(updated)
    writeJson(storageKey, updated)
    setFormOpen(false)
    setName('')
    setComment('')
    toast('Review saved in this browser preview. It has not been submitted to MARCHY.', { type: 'info' })
  }

  return (
    <section className="product-reviews-section card" aria-labelledby="product-reviews-heading">
      <p className="product-demo-disclaimer">Sample ratings and reviews are illustrative, not verified customer feedback. Reviews you add are saved only in this browser preview.</p>
      <div className="reviews-section-header">
        <div>
          <span className="eyebrow">CUSTOMER FEEDBACK</span>
          <h2 id="product-reviews-heading">Ratings & Reviews</h2>
        </div>
        <button
          type="button"
          className="outline-btn write-review-toggle"
          onClick={() => setFormOpen(v => !v)}
          aria-expanded={formOpen}
        >
          {formOpen ? 'Cancel Review' : '★ Write a Review'}
        </button>
      </div>

      {/* Review Form Modal/Drawer */}
      {formOpen && (
        <form className="write-review-form" onSubmit={submitReview}>
          <h4>Share your experience with this item</h4>
          <div className="rating-select-group">
            <span className="rating-select-label">Your Rating:</span>
            <div className="star-picker" role="radiogroup" aria-label="Select rating">
              {[1, 2, 3, 4, 5].map(star => (
                <button
                  type="button"
                  key={star}
                  className={`star-btn ${(hoverRating || rating) >= star ? 'is-lit' : ''}`}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                  onClick={() => setRating(star)}
                  aria-label={`${star} star`}
                >
                  ★
                </button>
              ))}
            </div>
            <span className="rating-indicator">{rating} out of 5 stars</span>
          </div>

          <div className="review-inputs-grid">
            <label>
              Your Name or Nickname
              <input
                type="text"
                required
                maxLength="40"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Youssef T."
              />
            </label>
          </div>

          <label>
            Your Review
            <textarea
              required
              rows="3"
              maxLength="500"
              value={comment}
              onChange={e => setComment(e.target.value)}
              placeholder="What did you like or dislike? How was the fit, material or finish?"
            />
          </label>

          <div className="review-form-actions">
            <button type="button" className="outline-btn" onClick={() => setFormOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              Save Preview <span>→</span>
            </button>
          </div>
        </form>
      )}

      {/* Rating summary & breakdown */}
      <div className="reviews-summary-layout">
        <div className="reviews-score-block">
          <div className="score-big">{avgRating}</div>
          <div className="score-stars" aria-label={`Average rating ${avgRating} out of 5`}>
            {'★'.repeat(Math.round(Number(avgRating)))}{'☆'.repeat(5 - Math.round(Number(avgRating)))}
          </div>
          <small className="muted">{reviews.length} customer review{reviews.length === 1 ? '' : 's'}</small>
        </div>

        <div className="reviews-breakdown-bars">
          {starCounts.map(item => (
            <div className="breakdown-row" key={item.stars}>
              <span className="star-count-label">{item.stars} ★</span>
              <div className="bar-track">
                <div className="bar-fill" style={{ width: `${item.percent}%` }} />
              </div>
              <span className="bar-count-label">{item.count}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reviews list */}
      <div className="reviews-list">
        {reviews.map(r => (
          <article className="review-card" key={r.id}>
            <div className="review-card-head">
              <div className="reviewer-info">
                <span className="reviewer-avatar">{r.author.slice(0, 1)}</span>
                <div>
                  <b>{r.author}</b>
                  <small className="review-date">{r.date} · <span className="sample-status">{r.localPreview ? 'Local preview · unverified' : 'Sample review'}</span></small>
                </div>
              </div>
              <div className="review-stars" aria-label={`${r.rating} stars`}>
                {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
              </div>
            </div>
            <p className="review-comment">{r.comment}</p>
          </article>
        ))}
      </div>
    </section>
  )
}


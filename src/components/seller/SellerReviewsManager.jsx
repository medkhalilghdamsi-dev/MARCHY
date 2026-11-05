import { useState } from 'react'
import { readJson, writeJson } from '../../utils/marketplace'
import { MessageSquare, Reply, ShieldCheck, Star } from 'lucide-react'
import { useToast } from '../../providers/ToastProvider'

export function SellerReviewsManager({ sellerName }) {
  const toast = useToast()
  const storageKey = `marchy-seller-replies-${sellerName.toLowerCase().replace(/\s+/g, '-')}`
  const [replies, setReplies] = useState(() => readJson(storageKey, {}))
  const [replyingId, setReplyingId] = useState(null)
  const [replyText, setReplyText] = useState('')

  // Seeded reviews for this merchant's catalogue
  const reviewsList = [
    {
      id: 'rev-m1',
      productName: 'Wireless noise-cancelling headphones',
      buyer: 'Amira Ben Salem',
      date: '2026-10-14',
      rating: 5,
      comment: 'Super fast delivery in Tunis! The sound quality is top-notch and COD verification went smoothly.'
    },
    {
      id: 'rev-m2',
      productName: 'Minimal ceramic table lamp',
      buyer: 'Youssef Trabelsi',
      date: '2026-10-18',
      rating: 4,
      comment: 'Beautiful lamp. Arrived carefully packed with plenty of bubble wrap. Would recommend.'
    },
    {
      id: 'rev-m3',
      productName: 'Hydrating daily skincare set',
      buyer: 'Sarra Ghedira',
      date: '2026-10-22',
      rating: 5,
      comment: 'Authentic products and prompt answers to questions. Great merchant service!'
    }
  ]

  const handleSendReply = (reviewId) => {
    if (!replyText.trim()) return
    const updated = {
      ...replies,
      [reviewId]: {
        text: replyText.trim(),
        date: new Date().toISOString().split('T')[0]
      }
    }
    setReplies(updated)
    writeJson(storageKey, updated)
    setReplyingId(null)
    setReplyText('')
    toast('Official merchant reply published!', { type: 'success' })
  }

  return (
    <section className="seller-reviews-section" aria-label="Customer review management">
      <div className="seller-dashboard-products-heading">
        <div>
          <b>Customer Ratings & Merchant Responses</b>
          <small>Build trust by acknowledging feedback and addressing buyer inquiries publicly.</small>
        </div>
        <span className="seller-dashboard-status">4.8 AVERAGE RATING</span>
      </div>

      <div className="seller-reviews-list">
        {reviewsList.map(rev => {
          const hasReply = replies[rev.id]
          const isReplying = replyingId === rev.id

          return (
            <article key={rev.id} className="seller-review-card">
              <div className="seller-rev-top">
                <div>
                  <span className="seller-rev-product">{rev.productName}</span>
                  <div className="seller-rev-rating">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#F59E0B" color="#F59E0B" />
                    ))}
                    <b>{rev.rating}.0</b>
                  </div>
                </div>
                <span className="seller-rev-date">{rev.date}</span>
              </div>

              <p className="seller-rev-comment">"{rev.comment}"</p>
              <div className="seller-rev-buyer">Reviewed by <b>{rev.buyer}</b> · Verified Purchase</div>

              {hasReply && (
                <div className="seller-merchant-reply-box">
                  <div className="reply-header">
                    <ShieldCheck size={14} className="merchant-reply-icon" />
                    <strong>Official Response from {sellerName}</strong>
                    <small>{hasReply.date}</small>
                  </div>
                  <p>{hasReply.text}</p>
                </div>
              )}

              {!hasReply && !isReplying && (
                <button
                  type="button"
                  className="outline-btn reply-trigger-btn"
                  onClick={() => { setReplyingId(rev.id); setReplyText('') }}
                >
                  <Reply size={13} /> Reply as Merchant
                </button>
              )}

              {isReplying && (
                <div className="seller-reply-form">
                  <textarea
                    rows={2}
                    placeholder={`Write your public reply as ${sellerName}...`}
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                  />
                  <div className="reply-form-actions">
                    <button type="button" className="outline-btn" onClick={() => setReplyingId(null)}>
                      Cancel
                    </button>
                    <button type="button" className="primary-btn" onClick={() => handleSendReply(rev.id)}>
                      Publish Reply
                    </button>
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </div>
    </section>
  )
}

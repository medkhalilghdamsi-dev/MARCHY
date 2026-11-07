import { useState } from 'react'
import { MarketplaceService } from '../../services/marketplaceService'
import { useToast } from '../../providers/ToastProvider'
import { HelpCircle, MessageSquare, Send } from 'lucide-react'

export function ProductQA({ productId, productName }) {
  const toast = useToast()
  const [qaList, setQaList] = useState(() => MarketplaceService.getProductQA(productId))
  const [questionText, setQuestionText] = useState('')
  const [authorName, setAuthorName] = useState('')
  const [isAsking, setIsAsking] = useState(false)
  const [submissionFeedback, setSubmissionFeedback] = useState('')

  const handleAskSubmit = (e) => {
    e.preventDefault()
    if (!questionText.trim()) return

    const newQ = MarketplaceService.askQuestion(productId, questionText, authorName)
    setQaList([newQ, ...qaList])
    setQuestionText('')
    setIsAsking(false)
    setSubmissionFeedback('Question saved in this browser preview. It has not been sent to a seller.')
    toast('Question saved in this browser preview. It has not been sent to a seller.', { type: 'info' })
  }

  return (
    <section className="product-qa-section card" aria-labelledby="product-qa-heading">
      <div className="qa-section-header">
        <div>
          <span className="eyebrow">LISTING Q&A PREVIEW</span>
          <h2 id="product-qa-heading">Customer Questions & Answers</h2>
          <p className="qa-subhead">
            Ask a question about this sample listing. Questions stay in this browser preview and are not sent to a seller.
          </p>
        </div>
        <button
          type="button"
          className="outline-btn qa-ask-btn"
          onClick={() => setIsAsking(v => !v)}
          aria-expanded={isAsking}
        >
          {isAsking ? 'Cancel' : <><HelpCircle size={15} /> Ask a Question</>}
        </button>
      </div>

      {isAsking && (
        <form className="qa-ask-form" onSubmit={handleAskSubmit}>
          <h4>Ask about {productName}</h4>
          <div className="qa-form-fields">
            <label>
              Your Name / Nickname
              <input
                type="text"
                placeholder="e.g. Kais or Guest"
                value={authorName}
                onChange={e => setAuthorName(e.target.value)}
              />
            </label>
            <label className="qa-form-wide">
              Your Question
              <textarea
                required
                rows={3}
                placeholder="Ask details regarding materials, sizing, courier delivery, or technical compatibility..."
                value={questionText}
                onChange={e => setQuestionText(e.target.value)}
              />
            </label>
          </div>
          <div className="qa-form-actions">
            <button type="button" className="outline-btn" onClick={() => setIsAsking(false)}>
              Cancel
            </button>
            <button type="submit" className="primary-btn">
              <Send size={14} /> Submit Question
            </button>
          </div>
        </form>
      )}

      {submissionFeedback && <p className="qa-submission-feedback" role="status">{submissionFeedback}</p>}

      <div className="qa-list">
        {qaList.length === 0 ? (
          <div className="qa-empty-state">
            <MessageSquare size={24} className="qa-empty-icon" />
            <b>No questions asked yet for this listing</b>
            <p>Be the first to ask the merchant about specifications or packaging.</p>
          </div>
        ) : (
          qaList.map(item => (
            <article key={item.id} className="qa-item">
              <div className="qa-question-row">
                <span className="qa-q-badge">Q</span>
                <div className="qa-q-content">
                  <p className="qa-question-text">{item.question}</p>
                  <span className="qa-author-meta">Asked by {item.author} on {item.date}</span>
                </div>
              </div>

              {item.answers && item.answers.length > 0 ? (
                <div className="qa-answers-list">
                  {item.answers.map(ans => (
                    <div key={ans.id} className="qa-answer-row">
                      <span className="qa-a-badge">A</span>
                      <div className="qa-a-content">
                        <p className="qa-answer-text">{ans.answer}</p>
                        <div className="qa-answer-meta">
                          {ans.isSeller && (
                            <span className="qa-sample-answer-tag">Sample seller response</span>
                          )}
                          <span>By {ans.author} · {ans.date}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="qa-pending-answer">
                  <small>No seller response is connected in this preview.</small>
                </div>
              )}
            </article>
          ))
        )}
      </div>
    </section>
  )
}

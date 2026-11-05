import { useEffect } from 'react'
import { Link } from 'react-router-dom'

export function Badge({ children, variant = 'neutral', className = '' }) {
  return <span className={`ui-badge is-${variant} ${className}`.trim()}>{children}</span>
}

export function EmptyState({ eyebrow = 'MARCHY', title, description, actionLabel, actionTo, onAction }) {
  return (
    <div className="empty-state">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p className="muted">{description}</p>}
      {actionLabel && actionTo && (
        <Link className="primary-btn" to={actionTo}>
          {actionLabel}
        </Link>
      )}
      {actionLabel && onAction && !actionTo && (
        <button type="button" className="primary-btn" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  )
}

export function Breadcrumbs({ items = [] }) {
  return (
    <nav className="breadcrumbs" aria-label="Breadcrumb">
      {items.map((item, idx) => (
        <span key={item.label || idx}>
          {item.to ? <Link to={item.to}>{item.label}</Link> : <span>{item.label}</span>}
          {idx < items.length - 1 && <span aria-hidden="true"> / </span>}
        </span>
      ))}
    </nav>
  )
}

export function Modal({ open, title, onClose, children }) {
  useEffect(() => {
    if (!open) return undefined
    function handleKey(e) {
      if (e.key === 'Escape') onClose?.()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="ui-modal-backdrop" role="dialog" aria-modal="true" aria-label={title}>
      <div className="ui-modal-card card">
        <div className="ui-modal-header">
          {title && <h3>{title}</h3>}
          <button type="button" className="text-btn" onClick={onClose} aria-label="Close dialog">
            ✕
          </button>
        </div>
        <div className="ui-modal-body">{children}</div>
      </div>
    </div>
  )
}

export function ConfirmDialog({ open, title, message, confirmLabel = 'Confirm', cancelLabel = 'Cancel', onConfirm, onCancel }) {
  return (
    <Modal open={open} title={title} onClose={onCancel}>
      <p className="muted">{message}</p>
      <div className="hero-actions" style={{ marginTop: '1rem' }}>
        <button type="button" className="outline-btn" onClick={onCancel}>
          {cancelLabel}
        </button>
        <button type="button" className="primary-btn" onClick={onConfirm}>
          {confirmLabel}
        </button>
      </div>
    </Modal>
  )
}

export function Tabs({ items = [], activeId, onChange, ariaLabel = 'Section tabs' }) {
  return (
    <div className="seller-workspace-tabs" role="tablist" aria-label={ariaLabel}>
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={activeId === item.id}
          className={activeId === item.id ? 'is-active' : ''}
          onClick={() => onChange(item.id)}
        >
          {item.label}
        </button>
      ))}
    </div>
  )
}

export function Skeleton({ height = '1.25rem', width = '100%', className = '' }) {
  return <div className={`ui-skeleton ${className}`.trim()} style={{ height, width }} aria-hidden="true" />
}

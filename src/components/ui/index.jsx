import { cloneElement, isValidElement, useEffect, useId, useRef } from 'react'
import { Link } from 'react-router-dom'

export function FormField({ label, hint, error, required = false, className = '', children }) {
  const generatedId = useId()
  const hintId = `${generatedId}-hint`
  const errorId = `${generatedId}-error`

  if (!isValidElement(children)) return null

  const controlId = children.props.id || generatedId
  const describedBy = [
    children.props['aria-describedby'],
    hint ? hintId : null,
    error ? errorId : null,
  ].filter(Boolean).join(' ') || undefined

  const control = cloneElement(children, {
    id: controlId,
    required: required || children.props.required,
    'aria-describedby': describedBy,
    'aria-invalid': error ? true : children.props['aria-invalid'],
  })

  return (
    <div className={`ui-form-field ${className}`.trim()}>
      {label && (
        <label htmlFor={controlId}>
          {label}
          {required && <span className="ui-form-required" aria-hidden="true"> *</span>}
        </label>
      )}
      {control}
      {hint && <small id={hintId} className="ui-form-hint">{hint}</small>}
      {error && <small id={errorId} className="ui-form-error" role="alert">{error}</small>}
    </div>
  )
}

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
  const titleId = useId()
  const dialogRef = useRef(null)
  const onCloseRef = useRef(onClose)
  onCloseRef.current = onClose

  useEffect(() => {
    if (!open) return undefined

    const trigger = document.activeElement
    const previousOverflow = document.body.style.overflow
    const dialog = dialogRef.current
    const getFocusable = () => dialog
      ? Array.from(dialog.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])'))
        .filter(element => !element.hasAttribute('hidden') && element.getAttribute('aria-hidden') !== 'true')
      : []

    document.body.style.overflow = 'hidden'
    const focusable = getFocusable()
    ;(focusable[0] || dialog)?.focus()

    function handleKey(event) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCloseRef.current?.()
        return
      }
      if (event.key !== 'Tab' || !dialog) return

      const currentFocusable = getFocusable()
      if (!currentFocusable.length) {
        event.preventDefault()
        dialog.focus()
        return
      }

      const first = currentFocusable[0]
      const last = currentFocusable[currentFocusable.length - 1]
      if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
        event.preventDefault()
        first.focus()
      }
    }

    window.addEventListener('keydown', handleKey)
    return () => {
      window.removeEventListener('keydown', handleKey)
      document.body.style.overflow = previousOverflow
      if (trigger?.isConnected) trigger.focus?.()
    }
  }, [open])

  if (!open) return null

  return (
    <div
      className="ui-modal-backdrop"
      role="presentation"
      onMouseDown={event => {
        if (event.target === event.currentTarget) onClose?.()
      }}
    >
      <div
        ref={dialogRef}
        className="ui-modal-card card"
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? 'Dialog' : undefined}
        tabIndex={-1}
      >
        <div className="ui-modal-header">
          {title && <h3 id={titleId}>{title}</h3>}
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
  const selectedIndex = Math.max(0, items.findIndex(item => item.id === activeId))

  function handleKeyDown(event) {
    const keys = ['ArrowLeft', 'ArrowRight', 'Home', 'End']
    if (!keys.includes(event.key) || items.length === 0) return

    const tabs = Array.from(event.currentTarget.querySelectorAll('[role="tab"]'))
    const currentIndex = tabs.indexOf(event.target.closest('[role="tab"]'))
    if (currentIndex < 0) return

    event.preventDefault()
    const isRtl = Boolean(event.currentTarget.closest('.is-rtl'))
    let nextIndex = currentIndex
    if (event.key === 'Home') nextIndex = 0
    else if (event.key === 'End') nextIndex = items.length - 1
    else if (event.key === 'ArrowRight') nextIndex = (currentIndex + (isRtl ? -1 : 1) + items.length) % items.length
    else if (event.key === 'ArrowLeft') nextIndex = (currentIndex + (isRtl ? 1 : -1) + items.length) % items.length

    tabs[nextIndex]?.focus()
    onChange?.(items[nextIndex].id)
  }

  return (
    <div className="seller-workspace-tabs" role="tablist" aria-label={ariaLabel} aria-orientation="horizontal" onKeyDown={handleKeyDown}>
      {items.map((item, index) => (
        <button
          key={item.id}
          type="button"
          role="tab"
          aria-selected={activeId === item.id}
          tabIndex={selectedIndex === index ? 0 : -1}
          className={activeId === item.id ? 'is-active' : ''}
          onClick={() => onChange?.(item.id)}
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


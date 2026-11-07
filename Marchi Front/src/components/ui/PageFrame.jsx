import { Link } from 'react-router-dom'

export function PageFrame({ children, className = '', id = 'main-content', as: Element = 'main' }) {
  const classes = ['shell', 'page', className].filter(Boolean).join(' ')
  return <Element id={id} className={classes}>{children}</Element>
}

export function SectionHeader({ eyebrow, title, description, action }) {
  return (
    <div className="section-header">
      <div>
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        {title && <h2>{title}</h2>}
        {description && <p className="muted">{description}</p>}
      </div>
      {action && (
        <div className="section-header-action">
          {action.to ? <Link to={action.to} className={action.className || 'text-link'}>{action.label}</Link> : action}
        </div>
      )}
    </div>
  )
}

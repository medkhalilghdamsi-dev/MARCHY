import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MarketplaceService } from '../../services/marketplaceService'
import { Bell, Check, CheckCheck, Info, Package, Sparkles, Tag, X } from 'lucide-react'

const FILTERS = [{ id: 'all', label: 'All' }, { id: 'unread', label: 'Unread' }, { id: 'order', label: 'Orders' }, { id: 'promo', label: 'Offers' }, { id: 'updates', label: 'Updates' }]
const getGroup = type => type === 'order' ? 'order' : type === 'promo' ? 'promo' : 'updates'
const getIcon = type => type === 'order' ? <Package size={17} /> : type === 'promo' ? <Tag size={17} /> : type === 'inventory' ? <Sparkles size={17} /> : <Info size={17} />

export function NotificationsPopover() {
  const [open, setOpen] = useState(false)
  const [filter, setFilter] = useState('all')
  const [notifications, setNotifications] = useState(() => MarketplaceService.getNotifications())
  const popoverRef = useRef(null)
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const refresh = () => setNotifications(MarketplaceService.getNotifications())
    window.addEventListener('storage', refresh)
    window.addEventListener('marchy:notifications-updated', refresh)
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('marchy:notifications-updated', refresh) }
  }, [])

  useEffect(() => {
    if (!open) return undefined
    const outside = event => { if (popoverRef.current && !popoverRef.current.contains(event.target)) setOpen(false) }
    const keyboard = event => { if (event.key === 'Escape') setOpen(false) }
    document.addEventListener('pointerdown', outside)
    document.addEventListener('keydown', keyboard)
    return () => { document.removeEventListener('pointerdown', outside); document.removeEventListener('keydown', keyboard) }
  }, [open])

  const visible = useMemo(() => notifications.filter(n => filter === 'all' ? true : filter === 'unread' ? !n.read : getGroup(n.type) === filter), [notifications, filter])
  const markAll = () => { setNotifications(MarketplaceService.markAllAsRead()); window.dispatchEvent(new Event('marchy:notifications-updated')) }
  const markOne = id => { setNotifications(MarketplaceService.markAsRead(id)); window.dispatchEvent(new Event('marchy:notifications-updated')) }

  const itemContent = n => <>
    <span className={`notif-icon-col notif-icon-${getGroup(n.type)}`}>{getIcon(n.type)}</span>
    <span className="notif-body-col">
      <span className="notif-topline"><strong>{n.title}</strong><span className="notif-time">{n.time || 'Recently'}</span></span>
      <span className="notif-message">{n.message}</span>
    </span>
    {!n.read && <span className="notif-unread-dot" aria-label="Unread" />}
  </>

  return <div className="notif-container" ref={popoverRef}>
    <button type="button" className="icon-btn notif-trigger" onClick={() => setOpen(v => !v)} aria-label={`Notifications, ${unreadCount} unread`} aria-expanded={open} aria-haspopup="dialog">
      <Bell size={20} />{unreadCount > 0 && <span className="notif-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}
    </button>
    {open && <section className="notif-dropdown" role="dialog" aria-label="Notifications">
      <header className="notif-header">
        <div><b>Notifications</b><small>{unreadCount ? `${unreadCount} unread` : 'You’re all caught up'}</small></div>
        <div className="notif-header-actions">
          {unreadCount > 0 && <button type="button" className="notif-mark-read" onClick={markAll}><CheckCheck size={14} /> Mark all read</button>}
          <button type="button" className="notif-close" aria-label="Close notifications" onClick={() => setOpen(false)}><X size={16} /></button>
        </div>
      </header>
      <div className="notif-filter-tabs" role="tablist" aria-label="Filter notifications">
        {FILTERS.map(tab => {
          const count = tab.id === 'unread' ? unreadCount : tab.id === 'all' ? notifications.length : notifications.filter(n => getGroup(n.type) === tab.id).length
          return <button key={tab.id} type="button" role="tab" aria-selected={filter === tab.id} className={filter === tab.id ? 'is-active' : ''} onClick={() => setFilter(tab.id)}>{tab.label}<span>{count}</span></button>
        })}
      </div>
      <div className="notif-scroll-list" aria-live="polite">
        {visible.length ? visible.map(n => n.link && n.link !== '#' ?
          <Link key={n.id} to={n.link} className={`notif-card-item ${n.read ? '' : 'is-unread'}`} onClick={() => { markOne(n.id); setOpen(false) }}>{itemContent(n)}</Link> :
          <div key={n.id} className={`notif-card-item ${n.read ? '' : 'is-unread'}`}>{itemContent(n)}{!n.read && <button type="button" className="notif-item-mark" aria-label={`Mark ${n.title} as read`} onClick={() => markOne(n.id)}><Check size={14} /></button>}</div>
        ) : <div className="notif-empty"><span className="notif-empty-icon"><Bell size={20} /></span><strong>{filter === 'unread' ? 'No unread notifications' : 'Nothing here yet'}</strong><p>{filter === 'unread' ? 'New activity will appear here when there’s something to review.' : 'Notifications in this category will appear here.'}</p></div>}
      </div>
      <footer className="notif-footer"><span>Showing the latest {notifications.length} notifications</span><span><CheckCheck size={13} /> Read status is saved on this device</span></footer>
    </section>}
  </div>
}

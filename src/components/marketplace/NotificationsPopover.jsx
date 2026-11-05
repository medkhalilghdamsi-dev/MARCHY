import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { MarketplaceService } from '../../services/marketplaceService'
import { Bell, CheckCheck, Info, Package, Sparkles, Tag, X } from 'lucide-react'

export function NotificationsPopover() {
  const [open, setOpen] = useState(false)
  const [notifications, setNotifications] = useState(() => MarketplaceService.getNotifications())
  const popoverRef = useRef(null)

  useEffect(() => {
    const handleStorage = () => {
      setNotifications(MarketplaceService.getNotifications())
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', handleClickOutside)
    return () => document.removeEventListener('pointerdown', handleClickOutside)
  }, [open])

  const unreadCount = notifications.filter(n => !n.read).length

  const handleMarkAll = () => {
    const updated = MarketplaceService.markAllAsRead()
    setNotifications(updated)
  }

  const handleItemClick = (id) => {
    const updated = MarketplaceService.markAsRead(id)
    setNotifications(updated)
    setOpen(false)
  }

  const getIcon = (type) => {
    switch (type) {
      case 'order': return <Package size={16} className="notif-type-icon is-order" />
      case 'promo': return <Tag size={16} className="notif-type-icon is-promo" />
      case 'inventory': return <Sparkles size={16} className="notif-type-icon is-inventory" />
      default: return <Info size={16} className="notif-type-icon is-system" />
    }
  }

  return (
    <div className="notif-container" ref={popoverRef}>
      <button
        type="button"
        className="icon-btn notif-trigger"
        onClick={() => setOpen(v => !v)}
        aria-label={`Notifications, ${unreadCount} unread`}
        aria-expanded={open}
      >
        <Bell size={20} />
        {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
      </button>

      {open && (
        <div className="notif-dropdown" role="dialog" aria-label="Notifications list">
          <div className="notif-header">
            <div>
              <b>Notifications</b>
              <small>{unreadCount} new</small>
            </div>
            {unreadCount > 0 && (
              <button type="button" className="notif-mark-read" onClick={handleMarkAll}>
                <CheckCheck size={14} /> Mark all read
              </button>
            )}
          </div>

          <div className="notif-scroll-list">
            {notifications.length === 0 ? (
              <div className="notif-empty">
                <p>No notifications right now.</p>
              </div>
            ) : (
              notifications.map(n => (
                <Link
                  key={n.id}
                  to={n.link || '#'}
                  className={`notif-card-item ${!n.read ? 'is-unread' : ''}`}
                  onClick={() => handleItemClick(n.id)}
                >
                  <div className="notif-icon-col">
                    {getIcon(n.type)}
                  </div>
                  <div className="notif-body-col">
                    <div className="notif-topline">
                      <strong>{n.title}</strong>
                      <span className="notif-time">{n.time}</span>
                    </div>
                    <p>{n.message}</p>
                  </div>
                  {!n.read && <span className="notif-unread-dot" />}
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}

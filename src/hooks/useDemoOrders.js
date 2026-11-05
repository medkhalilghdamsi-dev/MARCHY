import { useEffect, useState } from 'react'
import { readJson, writeJson } from '../utils/marketplace'

export const DEMO_OPERATIONS_STORAGE_KEY = 'marchy-demo-operations-v1'

export const seedDemoOrders = [
  {
    id: 'MC-1048',
    buyer: 'Amira Ben Salem',
    phone: '+216 98 123 456',
    city: 'Tunis',
    address: '14 Rue de Marseille, Tunis 1000',
    seller: 'Atlas Tech',
    items: 2,
    products: [
      { id: 1, name: 'Active Noise Cancelling Headphones', price: 289.900, qty: 1, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', selectedVariant: 'Standard Edition' },
      { id: 2, name: 'Wireless Bluetooth Earbuds', price: 200.000, qty: 1, image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=600&q=80', selectedVariant: 'Black Finish' },
    ],
    total: 489.900,
    subtotal: 489.900,
    payment: 'Cash on delivery · Pay upon inspection',
    deliveryMethod: 'Standard courier (seller confirmed)',
    status: 'Ready for pickup',
    created: 'Today, 09:20',
    createdAt: new Date(Date.now() - 3600000 * 3).toISOString(),
    courier: 'Tunis Express Local',
    timeline: [
      { status: 'Order Placed', time: '09:20', note: 'Order created with Cash on Delivery inspection rights', completed: true },
      { status: 'Processing', time: '09:45', note: 'Seller Atlas Tech confirmed stock and packaged items', completed: true },
      { status: 'Ready for pickup', time: '10:30', note: 'Courier assigned: Tunis Express Local', completed: true },
      { status: 'In transit', time: 'Pending', note: 'Courier will dispatch for local delivery', completed: false },
      { status: 'Delivered', time: 'Pending', note: 'Cash to be collected upon parcel inspection', completed: false },
    ]
  },
  {
    id: 'MC-1047',
    buyer: 'Youssef Trabelsi',
    phone: '+216 22 456 789',
    city: 'Ariana',
    address: 'Cité Ennasr 2, Ariana',
    seller: 'Maison & Co',
    items: 1,
    products: [
      { id: 3, name: 'Handcrafted Ceramic Lamp', price: 129.000, qty: 1, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=600&q=80', selectedVariant: 'Terracotta Green' },
    ],
    total: 129.000,
    subtotal: 129.000,
    payment: 'Cash on delivery · Pay upon inspection',
    deliveryMethod: 'Express dispatch (24–48h)',
    status: 'In transit',
    created: 'Today, 08:45',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    courier: 'Rapid Delivery TN',
    timeline: [
      { status: 'Order Placed', time: '08:45', note: 'Order placed by Youssef Trabelsi', completed: true },
      { status: 'Processing', time: '09:00', note: 'Maison & Co inspected item condition', completed: true },
      { status: 'Ready for pickup', time: '09:30', note: 'Courier Rapid Delivery picked up parcel', completed: true },
      { status: 'In transit', time: '10:15', note: 'Out for delivery to Ennasr 2, Ariana', completed: true },
      { status: 'Delivered', time: 'Pending', note: 'Customer will inspect before paying 129.000 TND', completed: false },
    ]
  },
  {
    id: 'MC-1046',
    buyer: 'Sarra Gharbi',
    phone: '+216 55 789 012',
    city: 'Sousse',
    address: 'Kantaoui, Sousse',
    seller: 'Urban Steps',
    items: 3,
    products: [
      { id: 4, name: 'Tunisian Handwoven Leather Shoes', price: 180.000, qty: 1, image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=600&q=80', selectedVariant: 'Size 40' },
      { id: 5, name: 'Artisan Cotton Socks Pack', price: 46.500, qty: 1, image: 'https://images.unsplash.com/photo-1582966772680-860e372bb558?auto=format&fit=crop&w=600&q=80', selectedVariant: 'Olive Green' },
      { id: 6, name: 'Handmade Leather Belt', price: 50.000, qty: 1, image: 'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=600&q=80', selectedVariant: 'Brown' },
    ],
    total: 276.500,
    subtotal: 276.500,
    payment: 'Cash on delivery · Pay upon inspection',
    deliveryMethod: 'Standard courier (seller confirmed)',
    status: 'Delivered',
    created: 'Yesterday, 16:10',
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    courier: 'Coastal Express',
    timeline: [
      { status: 'Order Placed', time: '16:10', note: 'Order created', completed: true },
      { status: 'Processing', time: '16:30', note: 'Item packaged', completed: true },
      { status: 'Ready for pickup', time: '17:00', note: 'Collected by courier', completed: true },
      { status: 'In transit', time: 'Yesterday', note: 'Arrived at Sousse depot', completed: true },
      { status: 'Delivered', time: 'Yesterday', note: 'Delivered & inspected by Sarra Gharbi', completed: true },
    ]
  }
]

export const ORDER_STATUS_STEPS = ['Processing', 'Ready for pickup', 'In transit', 'Delivered']

export function useDemoOrders() {
  const [orders, setOrders] = useState(() => readJson(DEMO_OPERATIONS_STORAGE_KEY, seedDemoOrders))

  useEffect(() => {
    writeJson(DEMO_OPERATIONS_STORAGE_KEY, orders)
  }, [orders])

  useEffect(() => {
    const sync = event => {
      if (event.key === DEMO_OPERATIONS_STORAGE_KEY && event.newValue) {
        try { setOrders(JSON.parse(event.newValue)) } catch {}
      }
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])

  const updateOrder = (id, patch) => setOrders(current => {
    const next = current.map(order => order.id === id ? { ...order, ...patch, updatedAt: new Date().toISOString() } : order)
    writeJson(DEMO_OPERATIONS_STORAGE_KEY, next)
    return next
  })

  const advanceOrderStatus = (id) => {
    let advancedStatus = null
    setOrders(current => {
      const next = current.map(order => {
        if (order.id !== id) return order
        if (order.status === 'Cancelled' || order.status === 'Delivered') return order
        const currentIndex = ORDER_STATUS_STEPS.indexOf(order.status)
        const nextIndex = Math.min(ORDER_STATUS_STEPS.length - 1, currentIndex + 1)
        const nextStatus = ORDER_STATUS_STEPS[nextIndex]
        advancedStatus = nextStatus

        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        const updatedTimeline = (order.timeline || []).map(item => {
          if (item.status === nextStatus) {
            return { ...item, completed: true, time: nowTime, note: `${nextStatus} confirmed by delivery network` }
          }
          return item
        })

        return {
          ...order,
          status: nextStatus,
          timeline: updatedTimeline,
          updatedAt: new Date().toISOString()
        }
      })
      writeJson(DEMO_OPERATIONS_STORAGE_KEY, next)
      return next
    })
    return advancedStatus
  }

  const cancelOrder = (id, reason = 'Cancelled by buyer') => {
    setOrders(current => {
      const next = current.map(order => {
        if (order.id !== id) return order
        const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        return {
          ...order,
          status: 'Cancelled',
          cancelReason: reason,
          timeline: [
            ...(order.timeline || []),
            { status: 'Cancelled', time: nowTime, note: reason, completed: true }
          ],
          updatedAt: new Date().toISOString()
        }
      })
      writeJson(DEMO_OPERATIONS_STORAGE_KEY, next)
      return next
    })
  }

  const createOrders = payloads => {
    const createdAt = new Date().toISOString()
    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    const created = payloads.map((payload, index) => {
      const randomIdSuffix = Math.floor(1000 + Math.random() * 9000)
      const orderId = `MC-${randomIdSuffix}${payloads.length > 1 ? `-${index + 1}` : ''}`
      return {
        ...payload,
        id: orderId,
        status: 'Processing',
        courier: payload.courier || 'Tunis Local Courier (Aramex / Yalidine)',
        created: 'Just now',
        createdAt,
        timeline: [
          { status: 'Order Placed', time: nowTime, note: 'Order placed with Cash on Delivery inspection guarantee', completed: true },
          { status: 'Processing', time: 'In progress', note: `Seller ${payload.seller} confirmed order and is packing items`, completed: true },
          { status: 'Ready for pickup', time: 'Pending', note: 'Courier collection scheduled', completed: false },
          { status: 'In transit', time: 'Pending', note: 'Package en route to ' + (payload.city || 'destination'), completed: false },
          { status: 'Delivered', time: 'Pending', note: 'Inspect parcel upon arrival before cash payment', completed: false }
        ]
      }
    })
    const next = [...created, ...orders]
    writeJson(DEMO_OPERATIONS_STORAGE_KEY, next)
    setOrders(next)
    return created
  }

  const deleteOrder = id => {
    setOrders(current => {
      const next = current.filter(o => o.id !== id)
      writeJson(DEMO_OPERATIONS_STORAGE_KEY, next)
      return next
    })
  }

  const reset = () => {
    writeJson(DEMO_OPERATIONS_STORAGE_KEY, seedDemoOrders)
    setOrders(seedDemoOrders)
  }

  return { orders, updateOrder, advanceOrderStatus, cancelOrder, createOrders, deleteOrder, reset }
}

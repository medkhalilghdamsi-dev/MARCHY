import { useEffect, useState } from 'react'
import { readJson, writeJson } from '../utils/marketplace'

export const DEMO_OPERATIONS_STORAGE_KEY = 'marchy-demo-operations-v1'
export const seedDemoOrders = [
  { id: 'MC-1048', buyer: 'Amira Ben Salem', city: 'Tunis', seller: 'Atlas Tech Tunis', items: 2, total: 489.900, payment: 'Cash on delivery', status: 'Ready for pickup', created: 'Today, 09:20', courier: 'Tunis Express' },
  { id: 'MC-1047', buyer: 'Youssef Trabelsi', city: 'Ariana', seller: 'Medina Home Studio', items: 1, total: 129.000, payment: 'Cash on delivery', status: 'In transit', created: 'Today, 08:45', courier: 'Rapid Delivery' },
  { id: 'MC-1046', buyer: 'Sarra Gharbi', city: 'Sousse', seller: 'Northstar Market', items: 3, total: 276.500, payment: 'Online payment · demo', status: 'Delivered', created: 'Yesterday, 16:10', courier: 'Coastal Express' },
  { id: 'MC-1045', buyer: 'Malek Karray', city: 'Sfax', seller: 'Atlas Tech Tunis', items: 1, total: 899.000, payment: 'Cash on delivery', status: 'Processing', created: 'Yesterday, 13:32', courier: 'Unassigned' },
  { id: 'MC-1044', buyer: 'Nour Jaziri', city: 'Nabeul', seller: 'Medina Home Studio', items: 2, total: 84.000, payment: 'Cash on delivery', status: 'Cancelled', created: 'Yesterday, 11:05', courier: 'Unassigned' },
]
export function useDemoOrders() {
  const [orders, setOrders] = useState(() => readJson(DEMO_OPERATIONS_STORAGE_KEY, seedDemoOrders))
  useEffect(() => writeJson(DEMO_OPERATIONS_STORAGE_KEY, orders), [orders])
  useEffect(() => {
    const sync = event => {
      if (event.key === DEMO_OPERATIONS_STORAGE_KEY && event.newValue) {
        try { setOrders(JSON.parse(event.newValue)) } catch {}
      }
    }
    window.addEventListener('storage', sync)
    return () => window.removeEventListener('storage', sync)
  }, [])
  const updateOrder = (id, patch) => setOrders(current => current.map(order => order.id === id ? { ...order, ...patch, updatedAt: new Date().toISOString() } : order))
  return { orders, updateOrder, reset: () => setOrders(seedDemoOrders) }
}

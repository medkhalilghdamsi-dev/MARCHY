export function createDemoOrders(sellers, products, sellerForProduct) {
  const firstSeller = sellers[0]
  const secondSeller = sellers[1] || sellers[0]
  const firstProduct = products.find(product => sellerForProduct(product).slug === firstSeller.slug) || products[0]
  const secondProduct = products.find(product => sellerForProduct(product).slug === secondSeller.slug) || products[1] || products[0]
  const thirdProduct = products.find(product => sellerForProduct(product).slug === firstSeller.slug && product.id !== firstProduct.id) || firstProduct
  return [
    {
      id: 'MCH-DEMO-1042', customer: 'Amira Ben Salem', city: 'Tunis', createdAt: '2026-10-28',
      status: 'preparing', sellerSlug: firstSeller.slug, sellerName: firstSeller.name,
      items: [{ id: firstProduct.id, name: firstProduct.name, quantity: 1, price: firstProduct.price }],
      deliveryMethod: 'MARCHY delivery partner · demo', trackingReference: 'Not assigned',
      paymentStatus: 'Not collected · demo only', deliveryAddress: 'Tunis · sample address'
    },
    {
      id: 'MCH-DEMO-1038', customer: 'Youssef Trabelsi', city: 'Ariana', createdAt: '2026-10-25',
      status: 'shipped', sellerSlug: secondSeller.slug, sellerName: secondSeller.name,
      items: [{ id: secondProduct.id, name: secondProduct.name, quantity: 1, price: secondProduct.price }],
      deliveryMethod: 'MARCHY delivery partner · demo', trackingReference: 'Demo reference only',
      paymentStatus: 'Not collected · demo only', deliveryAddress: 'Ariana · sample address'
    },
    {
      id: 'MCH-DEMO-1031', customer: 'Meriem Gharbi', city: 'Sousse', createdAt: '2026-10-20',
      status: 'delivered', sellerSlug: firstSeller.slug, sellerName: firstSeller.name,
      items: [{ id: thirdProduct.id, name: thirdProduct.name, quantity: 2, price: thirdProduct.price }],
      deliveryMethod: 'Customer collection', trackingReference: 'Not applicable',
      paymentStatus: 'Not collected · demo only', deliveryAddress: 'Sousse · sample address'
    }
  ]
}

export const orderStatusLabels = {
  pending: 'New order', confirmed: 'Confirmed', preparing: 'Preparing',
  ready: 'Ready for dispatch', shipped: 'Shipped', delivered: 'Delivered',
  cancelled: 'Cancelled', return_requested: 'Return requested',
  returned: 'Returned', refund_issued: 'Refund marked as issued'
}

export const orderStatusSteps = ['confirmed', 'preparing', 'ready', 'shipped', 'delivered']

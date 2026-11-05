import { useState } from 'react'
import { MarketplaceService } from '../../services/marketplaceService'
import { money } from '../../utils/marketplace'
import { AlertTriangle, Check, Minus, Plus, RefreshCw, Sparkles } from 'lucide-react'
import { useToast } from '../../providers/ToastProvider'

export function SellerInventoryManager({ sellerSlug }) {
  const toast = useToast()
  const [inventory, setInventory] = useState(() => MarketplaceService.getInventory(sellerSlug))

  const handleUpdateStock = (productId, delta) => {
    setInventory(curr => {
      return curr.map(item => {
        if (item.productId === productId) {
          const nextStock = Math.max(0, item.stock + delta)
          MarketplaceService.updateStock(sellerSlug, productId, nextStock)
          return {
            ...item,
            stock: nextStock,
            status: nextStock > 5 ? 'In Stock' : nextStock > 0 ? 'Low Stock' : 'Out of Stock'
          }
        }
        return item
      })
    })
    toast('Live inventory updated and synced with buyer marketplace', { type: 'success' })
  }

  const handleSetStockDirect = (productId, value) => {
    const nextStock = Math.max(0, Number(value) || 0)
    setInventory(curr => {
      return curr.map(item => {
        if (item.productId === productId) {
          MarketplaceService.updateStock(sellerSlug, productId, nextStock)
          return {
            ...item,
            stock: nextStock,
            status: nextStock > 5 ? 'In Stock' : nextStock > 0 ? 'Low Stock' : 'Out of Stock'
          }
        }
        return item
      })
    })
  }

  return (
    <section className="seller-inventory-section" aria-label="Inventory management">
      <div className="seller-dashboard-products-heading">
        <div>
          <b>Live Inventory & Stock Controller</b>
          <small>Changes immediately reflect on buyer availability and trigger low-stock alerts.</small>
        </div>
        <span className="seller-dashboard-status">{inventory.length} SKUs TRACKED</span>
      </div>

      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product / SKU</th>
              <th>Category</th>
              <th>Price</th>
              <th>Current Stock</th>
              <th>Status</th>
              <th>Quick Adjust</th>
            </tr>
          </thead>
          <tbody>
            {inventory.length === 0 ? (
              <tr>
                <td colSpan="6" className="inventory-empty-cell">
                  No active listings found for this storefront. Publish a product to track inventory.
                </td>
              </tr>
            ) : (
              inventory.map(item => (
                <tr key={item.productId} className={item.stock <= 3 ? 'is-low-stock-row' : ''}>
                  <td className="inventory-product-cell">
                    <img
                      src={item.image}
                      alt={item.name}
                      onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }}
                    />
                    <div>
                      <b>{item.name}</b>
                      <small>SKU: MRCH-{item.productId}</small>
                    </div>
                  </td>
                  <td>{item.category}</td>
                  <td><strong>{money(item.price)}</strong></td>
                  <td>
                    <div className="inventory-stock-input-wrap">
                      <input
                        type="number"
                        min="0"
                        className="inventory-stock-input"
                        value={item.stock}
                        onChange={e => handleSetStockDirect(item.productId, e.target.value)}
                        aria-label={`Stock for ${item.name}`}
                      />
                      <span>units</span>
                    </div>
                  </td>
                  <td>
                    <span className={`inventory-status-pill ${item.stock === 0 ? 'is-out' : item.stock <= 5 ? 'is-low' : 'is-good'}`}>
                      {item.stock === 0 ? 'Out of Stock' : item.stock <= 5 ? '⚠️ Low Stock' : '✓ In Stock'}
                    </span>
                  </td>
                  <td>
                    <div className="inventory-quick-btns">
                      <button
                        type="button"
                        className="inv-btn"
                        onClick={() => handleUpdateStock(item.productId, -1)}
                        disabled={item.stock <= 0}
                        title="Decrement stock by 1"
                      >
                        <Minus size={13} />
                      </button>
                      <button
                        type="button"
                        className="inv-btn"
                        onClick={() => handleUpdateStock(item.productId, 1)}
                        title="Increment stock by 1"
                      >
                        <Plus size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

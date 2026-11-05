import { useState, useMemo } from 'react'
import { money } from '../../utils/marketplace'
import { useToast } from '../../providers/ToastProvider'

export function SellerAnalytics({ seller, sellerProducts, sellerOrders }) {
  const [period, setPeriod] = useState('30d')
  const [hoveredPoint, setHoveredPoint] = useState(null)
  const toast = useToast()

  const dataSets = {
    '7d': {
      revenue: 1240.500,
      prevRevenue: 1080.000,
      orders: 14,
      prevOrders: 11,
      visits: 420,
      conversion: 3.3,
      points: [
        { label: 'Mon', value: 140, orders: 2 },
        { label: 'Tue', value: 210, orders: 3 },
        { label: 'Wed', value: 95, orders: 1 },
        { label: 'Thu', value: 320, orders: 4 },
        { label: 'Fri', value: 180, orders: 2 },
        { label: 'Sat', value: 230, orders: 3 },
        { label: 'Sun', value: 65, orders: 1 },
      ]
    },
    '30d': {
      revenue: 4890.750,
      prevRevenue: 4210.000,
      orders: 48,
      prevOrders: 41,
      visits: 1680,
      conversion: 2.8,
      points: [
        { label: 'Week 1', value: 980, orders: 10 },
        { label: 'Week 2', value: 1350, orders: 14 },
        { label: 'Week 3', value: 1120, orders: 11 },
        { label: 'Week 4', value: 1440, orders: 13 },
      ]
    },
    '90d': {
      revenue: 14200.000,
      prevRevenue: 12100.000,
      orders: 142,
      prevOrders: 120,
      visits: 5120,
      conversion: 2.7,
      points: [
        { label: 'Month 1', value: 4100, orders: 42 },
        { label: 'Month 2', value: 4750, orders: 48 },
        { label: 'Month 3', value: 5350, orders: 52 },
      ]
    },
    '1y': {
      revenue: 52800.000,
      prevRevenue: 41000.000,
      orders: 512,
      prevOrders: 405,
      visits: 19800,
      conversion: 2.6,
      points: [
        { label: 'Q1', value: 11200, orders: 110 },
        { label: 'Q2', value: 12800, orders: 124 },
        { label: 'Q3', value: 13900, orders: 135 },
        { label: 'Q4', value: 14900, orders: 143 },
      ]
    }
  }

  const current = dataSets[period] || dataSets['30d']
  const revGrowth = Math.round(((current.revenue - current.prevRevenue) / current.prevRevenue) * 100)
  const ordGrowth = Math.round(((current.orders - current.prevOrders) / current.prevOrders) * 100)
  const aov = current.revenue / current.orders

  // SVG Chart calculation
  const maxVal = Math.max(...current.points.map(p => p.value)) * 1.15
  const chartWidth = 560
  const chartHeight = 180
  const paddingX = 40
  const paddingY = 25
  const availableW = chartWidth - paddingX * 2
  const availableH = chartHeight - paddingY * 2

  const coords = current.points.map((p, i) => {
    const x = paddingX + (i / Math.max(1, current.points.length - 1)) * availableW
    const y = chartHeight - paddingY - (p.value / maxVal) * availableH
    return { x, y, ...p }
  })

  const linePath = coords.reduce((acc, pt, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '')
  const areaPath = coords.length
    ? `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${chartHeight - paddingY} L ${coords[0].x.toFixed(1)} ${chartHeight - paddingY} Z`
    : ''

  const citiesData = [
    { city: 'Tunis', percent: 44, amount: current.revenue * 0.44 },
    { city: 'Sousse', percent: 22, amount: current.revenue * 0.22 },
    { city: 'Sfax', percent: 18, amount: current.revenue * 0.18 },
    { city: 'Ariana', percent: 10, amount: current.revenue * 0.10 },
    { city: 'Other', percent: 6, amount: current.revenue * 0.06 },
  ]

  const topProducts = useMemo(() => {
    return sellerProducts.slice(0, 5).map((p, idx) => ({
      ...p,
      unitsSold: [28, 19, 14, 9, 6][idx] || 4,
      revenueGenerated: (p.price * ([28, 19, 14, 9, 6][idx] || 4)),
      inStock: p.stock !== 'Out of stock'
    }))
  }, [sellerProducts])

  function exportReport() {
    toast(`Analytics report for ${seller.name} (${period}) generated successfully`, { type: 'success' })
  }

  return (
    <div className="seller-analytics-space">
      <div className="analytics-header">
        <div>
          <h3>Storefront Performance & Analytics</h3>
          <p className="muted">Track orders, gross revenue and customer distribution across Tunisia.</p>
        </div>
        <div className="analytics-controls">
          <div className="period-pills" role="group" aria-label="Select date range">
            {[['7d', '7 Days'], ['30d', '30 Days'], ['90d', '90 Days'], ['1y', 'Year']].map(([id, label]) => (
              <button
                key={id}
                type="button"
                className={period === id ? 'is-active' : ''}
                aria-pressed={period === id}
                onClick={() => { setPeriod(id); setHoveredPoint(null) }}
              >
                {label}
              </button>
            ))}
          </div>
          <button type="button" className="outline-btn analytics-export-btn" onClick={exportReport}>
            ↓ Export CSV
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="analytics-kpi-grid">
        <article className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">GROSS REVENUE</span>
            <span className={`kpi-badge ${revGrowth >= 0 ? 'is-up' : 'is-down'}`}>
              {revGrowth >= 0 ? '↑ +' : '↓ '}{revGrowth}%
            </span>
          </div>
          <b className="kpi-value">{money(current.revenue)}</b>
          <small className="kpi-sub">vs. {money(current.prevRevenue)} previous period</small>
        </article>

        <article className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">TOTAL ORDERS</span>
            <span className={`kpi-badge ${ordGrowth >= 0 ? 'is-up' : 'is-down'}`}>
              {ordGrowth >= 0 ? '↑ +' : '↓ '}{ordGrowth}%
            </span>
          </div>
          <b className="kpi-value">{current.orders}</b>
          <small className="kpi-sub">Avg. {money(aov)} per order</small>
        </article>

        <article className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">STOREFRONT VISITS</span>
            <span className="kpi-badge is-neutral">Demo traffic</span>
          </div>
          <b className="kpi-value">{current.visits.toLocaleString()}</b>
          <small className="kpi-sub">{current.conversion}% conversion rate</small>
        </article>

        <article className="kpi-card">
          <div className="kpi-header">
            <span className="kpi-title">FULFILMENT RATE</span>
            <span className="kpi-badge is-up">98.5%</span>
          </div>
          <b className="kpi-value">On Schedule</b>
          <small className="kpi-sub">{sellerOrders.length} active demo orders</small>
        </article>
      </div>

      {/* Interactive Revenue Chart */}
      <div className="analytics-chart-panel card">
        <div className="chart-panel-header">
          <div>
            <span className="eyebrow">SALES TREND</span>
            <h4>Revenue Evolution ({period})</h4>
          </div>
          {hoveredPoint && (
            <div className="chart-tooltip-preview" aria-live="polite">
              <b>{hoveredPoint.label}:</b> {money(hoveredPoint.value)} ({hoveredPoint.orders} orders)
            </div>
          )}
        </div>

        <div className="svg-chart-container">
          <svg
            viewBox={`0 0 ${chartWidth} ${chartHeight}`}
            className="analytics-svg-chart"
            aria-label="Revenue evolution chart"
            role="img"
          >
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="var(--forest)" stopOpacity="0.28" />
                <stop offset="100%" stopColor="var(--forest)" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Horizontal Gridlines */}
            {[0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = chartHeight - paddingY - ratio * availableH
              return (
                <g key={ratio} className="chart-gridline">
                  <line x1={paddingX} y1={y} x2={chartWidth - paddingX} y2={y} stroke="var(--line)" strokeDasharray="3 3" />
                  <text x={paddingX - 6} y={y + 3} textAnchor="end" fontSize="9" fill="var(--muted)">
                    {Math.round((maxVal * ratio) / 10) * 10}
                  </text>
                </g>
              )
            })}

            {/* Fill Area & Stroke Line */}
            {areaPath && <path d={areaPath} fill="url(#chartGradient)" />}
            {linePath && <path d={linePath} fill="none" stroke="var(--forest)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />}

            {/* Data Points */}
            {coords.map((pt, i) => (
              <g key={i} className="chart-point-group">
                <circle
                  cx={pt.x}
                  cy={pt.y}
                  r={hoveredPoint?.label === pt.label ? 6 : 4}
                  fill="var(--surface)"
                  stroke="var(--forest)"
                  strokeWidth="2.5"
                  onMouseEnter={() => setHoveredPoint(pt)}
                  onMouseLeave={() => setHoveredPoint(null)}
                  style={{ cursor: 'pointer', transition: 'r 0.15s ease' }}
                />
                <text x={pt.x} y={chartHeight - 6} textAnchor="middle" fontSize="9" fill="var(--muted)">
                  {pt.label}
                </text>
              </g>
            ))}
          </svg>
        </div>
      </div>

      {/* Two columns: Top Products + Regional Distribution */}
      <div className="analytics-details-grid">
        {/* Top Selling Products */}
        <div className="analytics-subpanel card">
          <div className="subpanel-header">
            <span className="eyebrow">TOP PERFORMERS</span>
            <h4>Best-Selling Products</h4>
          </div>
          <div className="analytics-products-table">
            <div className="table-row table-head">
              <span>Product</span>
              <span className="text-right">Units</span>
              <span className="text-right">Revenue</span>
            </div>
            {topProducts.map(p => (
              <div className="table-row" key={p.id}>
                <div className="product-mini-meta">
                  <img src={p.image} alt="" onError={e => { e.currentTarget.onerror = null; e.currentTarget.src = '/product-placeholder.svg' }} />
                  <div>
                    <b>{p.name}</b>
                    <small>{p.category} · {money(p.price)}</small>
                  </div>
                </div>
                <span className="text-right">{p.unitsSold}</span>
                <strong className="text-right">{money(p.revenueGenerated)}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* Customer Geographic Distribution */}
        <div className="analytics-subpanel card">
          <div className="subpanel-header">
            <span className="eyebrow">DEMOGRAPHICS</span>
            <h4>Orders by Tunisian Region</h4>
          </div>
          <div className="geo-distribution-list">
            {citiesData.map(c => (
              <div className="geo-row" key={c.city}>
                <div className="geo-label">
                  <span>{c.city}</span>
                  <small>{money(c.amount)} ({c.percent}%)</small>
                </div>
                <div className="geo-bar-track">
                  <div className="geo-bar-fill" style={{ width: `${c.percent}%` }} />
                </div>
              </div>
            ))}
          </div>
          <div className="analytics-note">
            <span>ⓘ</span>
            <small>Performance statistics calculated from sample store transactions and buyer interactions on this device.</small>
          </div>
        </div>
      </div>
    </div>
  )
}

